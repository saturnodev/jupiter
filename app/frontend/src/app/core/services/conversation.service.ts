import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { getApiUrl } from '../utils/api-url';
import type { Conversation } from '../models/conversation.model';
import type { ConversationDetail } from '../models/conversation-detail.model';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly baseUrl = `${getApiUrl()}/conversations`;
  private readonly baseUrlSlash = `${getApiUrl()}/conversations/`;

  private _conversations = signal<Conversation[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _creating = signal(false);

  conversations = computed(() => ({
    items: this._conversations(),
    loading: this._loading(),
    error: this._error(),
  }));

  creating = this._creating;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  loadConversations(): void {
    this._loading.set(true);
    this._error.set(null);
    this.http
      .get<Conversation[]>(this.baseUrlSlash)
      .pipe(
        tap((list) => {
          this._conversations.set(
            [...list].sort(
              (a, b) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )
          );
          this._loading.set(false);
        }),
        catchError((err) => {
          this._error.set(err?.message || 'Error al cargar conversaciones');
          this._loading.set(false);
          return of([]);
        })
      )
      .subscribe();
  }

  createAndNavigate(): void {
    this._creating.set(true);
    this.http
      .post<Conversation>(this.baseUrlSlash, {})
      .pipe(
        tap((conv) => {
          this._conversations.update((list) => [conv, ...list]);
          this._creating.set(false);
          this.router.navigate(['/conversations', conv.id]);
        }),
        catchError((err) => {
          this._creating.set(false);
          this._error.set(err?.message || 'Error al crear conversación');
          return of();
        })
      )
      .subscribe();
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.baseUrlSlash);
  }

  createConversation(): Observable<Conversation> {
    return this.http.post<Conversation>(this.baseUrlSlash, {});
  }

  getConversation(id: string): Observable<ConversationDetail> {
    return this.http.get<ConversationDetail>(`${this.baseUrl}/${id}`);
  }

  deleteConversation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
