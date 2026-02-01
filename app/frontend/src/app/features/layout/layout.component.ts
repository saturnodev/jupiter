import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConversationListComponent } from '../conversations/conversation-list/conversation-list.component';
import { ChatComponent } from '../chat/chat.component';
import { SourceListComponent } from '../sources/source-list/source-list.component';
import { SourceUploadComponent } from '../sources/source-upload/source-upload.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    ConversationListComponent,
    ChatComponent,
    SourceListComponent,
    SourceUploadComponent,
  ],
  template: `
    <div class="h-screen flex flex-col text-white font-display">
      <header class="h-16 flex items-center justify-between px-6 border-b border-glass-border bg-background-dark/90 backdrop-blur-md z-50 shrink-0">
        <div class="flex items-center gap-4">
          <div class="size-8 text-synth-cyan">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor" />
            </svg>
          </div>
          <h1 class="text-2xl font-black tracking-tighter neon-text-magenta italic uppercase">
            JUPITER<span class="text-synth-cyan neon-text-cyan">_CORE</span>
          </h1>
        </div>
        <div class="flex items-center gap-6 border-r border-glass-border pr-6">
          <div class="flex flex-col items-end">
            <span class="text-[9px] text-synth-cyan font-bold tracking-widest uppercase">System Health</span>
            <div class="flex gap-4 mt-0.5">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] text-gray-400">OLLAMA</span>
                <div class="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div class="w-3/4 h-full bg-synth-cyan shadow-[0_0_8px_#00ffff]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="flex flex-1 overflow-hidden">
        <aside class="w-64 glass-panel border-r flex flex-col z-40 shrink-0">
          <app-conversation-list [currentId]="conversationId() ?? null" />
        </aside>
        <main class="flex-1 relative flex flex-col bg-background-dark overflow-hidden">
          <div class="jupiter-perspective opacity-20 lg:opacity-30 absolute inset-0">
            <div class="jupiter-aura"></div>
            <div class="jupiter-planet"></div>
          </div>
          <app-chat [conversationId]="conversationId() ?? null" class="relative z-10 flex flex-col flex-1" />
        </main>
        <aside class="w-80 glass-panel border-l flex flex-col z-40 shrink-0">
          <app-source-upload [conversationId]="conversationId() ?? null" />
          <app-source-list [conversationId]="conversationId() ?? null" />
        </aside>
      </div>
    </div>
  `,
  styles: [],
})
export class LayoutComponent {
  private route = inject(ActivatedRoute);
  private paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  conversationId = computed(() => this.paramMap()?.get('id') ?? null);
}
