import { Component, input } from '@angular/core';
import type { Message } from '../../../core/models/message.model';
import type { ChatSourceRef } from '../../../core/models/chat-response.model';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  template: `
    <div class="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
      @for (msg of messages(); track msg.id) {
        @if (msg.role === 'assistant') {
          <div class="flex items-start gap-4 max-w-4xl">
            <div class="size-10 rounded-lg bg-background-dark border border-synth-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-synth-cyan">smart_toy</span>
            </div>
            <div class="space-y-2">
              <div class="bg-gradient-to-br from-[#1a0b2e] to-background-dark border border-synth-cyan/30 p-5 rounded-2xl rounded-tl-none text-gray-200 leading-relaxed shadow-lg backdrop-blur-md">
                {{ msg.content }}
                @if (msg.sources && msg.sources.length > 0) {
                  <div class="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                    @for (src of msg.sources; track $index) {
                      <span class="citation-chip">Source [{{ $index + 1 }}]</span>
                    }
                  </div>
                }
              </div>
              <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">{{ formatDate(msg.created_at) }}</span>
            </div>
          </div>
        } @else {
          <div class="flex items-start gap-4 max-w-4xl ml-auto flex-row-reverse">
            <div class="size-10 rounded-lg bg-synth-magenta border border-synth-magenta shadow-[0_0_15px_rgba(255,0,255,0.4)] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-white">person</span>
            </div>
            <div class="space-y-2 flex flex-col items-end">
              <div class="bg-gradient-to-br from-synth-purple to-synth-magenta p-5 rounded-2xl rounded-tr-none text-white leading-relaxed shadow-xl">
                {{ msg.content }}
              </div>
              <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">{{ formatDate(msg.created_at) }}</span>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ChatMessagesComponent {
  messages = input<(Message & { sources?: ChatSourceRef[] })[]>([]);

  formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }
}
