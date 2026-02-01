import { Component, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { ConversationService } from '../../../core/services/conversation.service';
import type { Conversation } from '../../../core/models/conversation.model';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="flex flex-col h-full">
      <div class="p-4">
        <button
          (click)="createConversation()"
          [disabled]="creating()"
          class="w-full h-11 flex items-center justify-center gap-2 bg-transparent border-2 border-synth-magenta text-synth-magenta font-bold rounded-lg hover:bg-synth-magenta/10 transition-all shadow-[0_0_15px_rgba(255,0,255,0.2)] group disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-synth-cyan"
        >
          <span class="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
          {{ creating() ? 'Creando...' : 'Nueva conversación' }}
        </button>
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
        <p class="text-[10px] text-gray-500 font-bold tracking-[0.2em] px-2 mb-3 uppercase">Sesiones archivadas</p>
        @if (conversations().loading) {
          <p class="text-sm text-gray-500 px-3">Cargando...</p>
        } @else if (conversations().error) {
          <p class="text-sm text-red-400 px-3">{{ conversations().error }}</p>
        } @else if (conversations().items.length === 0) {
          <p class="text-xs text-gray-500 px-3 py-2">Crea tu primera conversación</p>
        } @else {
          @for (conv of conversations().items; track conv.id) {
            <div
              [ngClass]="{
                'bg-synth-purple/10 border-synth-purple/30': currentId() === conv.id,
                'border-transparent': currentId() !== conv.id
              }"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 border transition-colors group cursor-pointer text-left focus-within:outline focus-within:outline-2 focus-within:outline-synth-cyan"
            >
              <button
                type="button"
                (click)="selectConversation(conv.id)"
                class="flex items-center gap-3 flex-1 min-w-0"
              >
                <span class="material-symbols-outlined text-sm text-gray-400 group-hover:text-synth-cyan shrink-0">description</span>
                <span class="text-sm text-gray-400 group-hover:text-gray-200 truncate flex-1 min-w-0">{{ conv.title }}</span>
              </button>
              <button
                type="button"
                (click)="deleteConversation(conv.id); $event.stopPropagation()"
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-synth-cyan rounded shrink-0"
                aria-label="Eliminar conversación"
              >
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          }
        }
      </div>
      <div class="p-4 border-t border-glass-border">
        <div class="flex items-center gap-3 text-gray-500 hover:text-white transition-colors cursor-pointer text-xs font-bold uppercase tracking-widest">
          <span class="material-symbols-outlined text-lg">settings</span>
          Preferencias
        </div>
      </div>
    </div>
  `,
})
export class ConversationListComponent implements OnInit {
  currentId = input<string | null>(null);
  creating = this.convService.creating;

  conversations = this.convService.conversations;

  constructor(
    private convService: ConversationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.convService.loadConversations();
  }

  createConversation(): void {
    this.convService.createAndNavigate();
  }

  selectConversation(id: string): void {
    this.router.navigate(['/conversations', id]);
  }

  deleteConversation(id: string): void {
    this.convService.deleteConversation(id).subscribe({
      next: () => {
        this.convService.loadConversations();
        if (this.currentId() === id) {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.convService.loadConversations();
      },
    });
  }
}
