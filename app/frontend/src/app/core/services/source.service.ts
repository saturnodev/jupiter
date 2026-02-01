import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Source } from '../models/source.model';

@Injectable({ providedIn: 'root' })
export class SourceService {
  private readonly baseUrl = (id: string) => `${environment.apiUrl}/conversations/${id}/sources`;

  private _sources = signal<Source[]>([]);
  private _loading = signal(false);

  sources = this._sources;
  loading = this._loading;

  constructor(private http: HttpClient) {}

  loadSources(conversationId: string): void {
    this._loading.set(true);
    this.http
      .get<Source[]>(this.baseUrl(conversationId))
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

  uploadFiles(conversationId: string, files: File[]): Observable<Source[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return this.http.post<Source[]>(`${this.baseUrl(conversationId)}/upload`, formData);
  }

  uploadFolder(conversationId: string, files: File[]): Observable<Source[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return this.http.post<Source[]>(`${this.baseUrl(conversationId)}/upload-folder`, formData);
  }

  getSources(conversationId: string): Observable<Source[]> {
    return this.http.get<Source[]>(this.baseUrl(conversationId));
  }

  deleteSource(conversationId: string, sourceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(conversationId)}/${sourceId}`);
  }
}
