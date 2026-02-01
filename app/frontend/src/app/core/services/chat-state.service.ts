import { Injectable, signal, computed } from '@angular/core';
import type { ConversationDetail } from '../models/conversation-detail.model';
import type { Message } from '../models/message.model';
import type { ChatSourceRef } from '../models/chat-response.model';
import type { ConversationService } from './conversation.service';
import type { ChatService } from './chat.service';

export interface DisplayMessage extends Message {
  sources?: ChatSourceRef[];
}

@Injectable()
export class ChatStateService {
  private _messages = signal<DisplayMessage[]>([]);
  private _streaming = signal(false);

  displayMessages = computed(() => this._messages());
  streaming = this._streaming;

  loadConversation(id: string, convService: ConversationService): void {
    convService.getConversation(id).subscribe({
      next: (detail: ConversationDetail) => {
        this._messages.set(
          (detail.messages || []).map((m) => ({
            ...m,
            sources: undefined,
          }))
        );
      },
      error: () => {
        this._messages.set([]);
      },
    });
  }

  clear(): void {
    this._messages.set([]);
    this._streaming.set(false);
  }

  sendStream(
    conversationId: string,
    content: string,
    chatService: ChatService,
  ): void {
    this._messages.update((list) => [
      ...list,
      { id: 'temp-user', role: 'user', content, created_at: new Date().toISOString() } as DisplayMessage,
    ]);
    this._streaming.set(true);

    const streamingMsg: DisplayMessage = {
      id: 'streaming',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };
    this._messages.update((list) => [...list, streamingMsg]);

    chatService.sendMessageStream(conversationId, content).subscribe({
      next: (chunk) => {
        this._messages.update((list) => {
          const idx = list.findIndex((m) => m.id === 'streaming');
          if (idx >= 0) {
            const copy = [...list];
            copy[idx] = { ...copy[idx], content: copy[idx].content + chunk };
            return copy;
          }
          return list;
        });
      },
      error: (err) => {
        this._messages.update((list) => {
          const idx = list.findIndex((m) => m.id === 'streaming');
          if (idx >= 0) {
            const copy = [...list];
            copy[idx] = {
              ...copy[idx],
              content: copy[idx].content || `Error: ${err?.message || 'Error de conexión'}`,
            };
            return copy;
          }
          return list;
        });
        this._streaming.set(false);
      },
      complete: () => {
        this._streaming.set(false);
      },
    });
  }
}
