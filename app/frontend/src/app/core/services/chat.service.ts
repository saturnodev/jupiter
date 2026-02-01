import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl } from '../utils/api-url';
import type { ChatResponse } from '../models/chat-response.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly baseUrl = (id: string) => `${getApiUrl()}/conversations/${id}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(conversationId: string, content: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.baseUrl(conversationId)}/`, { message: content });
  }

  sendMessageStream(conversationId: string, content: string): Observable<string> {
    return new Observable((subscriber) => {
      const url = `${this.baseUrl(conversationId)}/stream`;
      let receivedAny = false;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.text();
            subscriber.error(new Error(err || `HTTP ${res.status}`));
            return;
          }
          const reader = res.body?.getReader();
          if (!reader) {
            subscriber.complete();
            return;
          }
          const decoder = new TextDecoder();
          let buffer = '';
          let dataLines: string[] = [];
          const emitEvent = (): void => {
            if (dataLines.length > 0) {
              receivedAny = true;
              subscriber.next(dataLines.join('\n'));
              dataLines = [];
            }
          };
          const process = (): void => {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  emitEvent();
                  subscriber.complete();
                  return;
                }
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                  if (line === '') {
                    emitEvent();
                  } else if (line.startsWith('data: ')) {
                    dataLines.push(line.slice(6));
                  }
                }
                process();
              })
              .catch((err) => {
                emitEvent();
                if (receivedAny) {
                  subscriber.complete();
                } else {
                  subscriber.error(err);
                }
              });
          };
          process();
        })
        .catch((err) => subscriber.error(err));
    });
  }
}
