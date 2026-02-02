import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, timeout } from 'rxjs';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { getApiUrl } from '../utils/api-url';
import type { Source } from '../models/source.model';

/** Timeout para subida + procesamiento (PDFs grandes pueden tardar varios minutos). */
const UPLOAD_TIMEOUT_MS = 600_000; // 10 min

@Injectable({ providedIn: 'root' })
export class SourceService {
  private readonly baseUrl = (id: string) => `${getApiUrl()}/conversations/${id}/sources`;

  private _sources = signal<Source[]>([]);
  private _loading = signal(false);

  sources = this._sources;
  loading = this._loading;

  constructor(private http: HttpClient) {}

  loadSources(conversationId: string): void {
    this._loading.set(true);
    this.http
      .get<Source[]>(`${this.baseUrl(conversationId)}/`)
      .pipe(
        tap((list) => {
          this._sources.set(list);
          this._loading.set(false);
        }),
        catchError(() => {
          this._sources.set([]);
          this._loading.set(false);
          return of([]);
        })
      )
      .subscribe();
  }

  clearSources(): void {
    this._sources.set([]);
    this._loading.set(false);
  }

  /**
   * Sube archivos y opcionalmente reporta % de avance de la subida (0-100).
   * Tras 100% el backend sigue procesando; la UI puede mostrar "Procesando...".
   */
  uploadFiles(
    conversationId: string,
    files: File[],
    onProgress?: (percent: number) => void
  ): Observable<Source[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return this.uploadWithProgress(
      this.http.post<Source[]>(`${this.baseUrl(conversationId)}/upload`, formData, {
        reportProgress: true,
        observe: 'events',
      }),
      onProgress
    );
  }

  uploadFolder(
    conversationId: string,
    files: File[],
    onProgress?: (percent: number) => void
  ): Observable<Source[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return this.uploadWithProgress(
      this.http.post<Source[]>(`${this.baseUrl(conversationId)}/upload-folder`, formData, {
        reportProgress: true,
        observe: 'events',
      }),
      onProgress
    );
  }

  private uploadWithProgress(
    request: Observable<HttpEvent<Source[]>>,
    onProgress?: (percent: number) => void
  ): Observable<Source[]> {
    return new Observable<Source[]>((subscriber) => {
      const sub = request.pipe(timeout(UPLOAD_TIMEOUT_MS)).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total && event.total > 0) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress?.(percent);
          } else if (event.type === HttpEventType.Response && event.body) {
            onProgress?.(100);
            subscriber.next(event.body);
            subscriber.complete();
          }
        },
        error: (err) => subscriber.error(err),
      });
      return () => sub.unsubscribe();
    });
  }

  getSources(conversationId: string): Observable<Source[]> {
    return this.http.get<Source[]>(this.baseUrl(conversationId));
  }

  deleteSource(conversationId: string, sourceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(conversationId)}/${sourceId}`);
  }
}
