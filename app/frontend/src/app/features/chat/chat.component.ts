import { Component, input, OnInit, effect, signal, computed, inject, NgZone } from '@angular/core';
import { ChatMessagesComponent } from './chat-messages/chat-messages.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { ConversationService } from '../../core/services/conversation.service';
import { ChatService } from '../../core/services/chat.service';
import type { Message } from '../../core/models/message.model';
import type { ChatSourceRef } from '../../core/models/chat-response.model';
import type { ConversationDetail } from '../../core/models/conversation-detail.model';

interface DisplayMessage extends Message {
  sources?: ChatSourceRef[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ChatMessagesComponent, ChatInputComponent],
  template: `
    <div class="flex flex-col flex-1 overflow-hidden">
      @if (!conversationId()) {
        <div class="flex-1 flex items-center justify-center p-8">
          <p class="text-gray-500 text-center">
            Selecciona una conversación o crea una nueva para comenzar.
          </p>
        </div>
      } @else {
        <app-chat-messages [messages]="displayMessages()" />
        @if (streaming()) {
          <div class="px-8 pb-2 flex items-center gap-2 text-synth-cyan text-sm">
            <span class="inline-block w-2 h-2 rounded-full bg-synth-cyan animate-pulse"></span>
            Escribiendo...
          </div>
        }
        <app-chat-input
          [disabled]="streaming()"
          (messageSent)="onSend($event)"
        />
      }
    </div>
  `,
})
export class ChatComponent implements OnInit {
  conversationId = input<string | null>(null);

  private convService = inject(ConversationService);
  private chatService = inject(ChatService);
  private ngZone = inject(NgZone);

  private _messages = signal<DisplayMessage[]>([]);
  private _streaming = signal(false);

  displayMessages = computed(() => this._messages());
  streaming = this._streaming;

  constructor() {
    effect(() => {
      const id = this.conversationId();
      if (id) {
        this.loadConversation(id);
      } else {
        this._messages.set([]);
        this._streaming.set(false);
      }
    });
  }

  ngOnInit(): void {}

  loadConversation(id: string): void {
    this.convService.getConversation(id).subscribe({
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

  onSend(content: string): void {
    const id = this.conversationId();
    if (!id) return;

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

    this.chatService.sendMessageStream(id, content).subscribe({
      next: (chunk) => {
        this.ngZone.run(() => {
          this._messages.update((list) => {
            const idx = list.findIndex((m) => m.id === 'streaming');
            if (idx >= 0) {
              const copy = [...list];
              copy[idx] = { ...copy[idx], content: copy[idx].content + chunk };
              return copy;
            }
            return list;
          });
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
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
        });
      },
      complete: () => {
        this.ngZone.run(() => this._streaming.set(false));
      },
    });
  }
}
