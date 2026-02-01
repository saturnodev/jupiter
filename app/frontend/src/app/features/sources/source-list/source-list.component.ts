import { Component, input, OnInit, effect } from '@angular/core';
import { SourceService } from '../../../core/services/source.service';
import type { Source } from '../../../core/models/source.model';

@Component({
  selector: 'app-source-list',
  standalone: true,
  template: `
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="p-4 flex items-center justify-between shrink-0 border-b border-glass-border">
        <h3 class="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">Source Library</h3>
        <span class="bg-synth-cyan/20 text-synth-cyan text-[10px] px-2 py-0.5 rounded font-bold border border-synth-cyan/30">
          {{ sources().length }} FILES
        </span>
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-3 py-4">
        @if (!conversationId()) {
          <p class="text-[10px] text-gray-500">Selecciona una conversación</p>
        } @else if (loading()) {
          <p class="text-sm text-gray-500">Cargando fuentes...</p>
        } @else if (sources().length === 0) {
          <p class="text-[10px] text-gray-500">Sin fuentes anexadas</p>
        } @else {
          @for (src of sources(); track src.id) {
            <div class="p-3 rounded-lg border border-glass-border bg-white/5 flex items-start gap-3 group hover:border-synth-cyan/30 transition-all">
              <span class="material-symbols-outlined text-synth-cyan mt-0.5 shrink-0" [attr.data-icon]="getIcon(src)">
                {{ getIcon(src) }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-200 truncate">{{ src.filename }}</p>
                <div class="flex items-center gap-2 mt-1.5">
                  <span class="size-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                  <span class="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Indexed</span>
                </div>
              </div>
              <button
                type="button"
                (click)="deleteSource(src.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-synth-cyan rounded"
                aria-label="Eliminar"
              >
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          }
        }
      </div>
      <div class="p-4 border-t border-glass-border bg-background-dark/40 shrink-0">
        <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <span>Storage Used</span>
          <span class="text-synth-cyan">-</span>
        </div>
        <div class="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
          <div class="w-0 h-full bg-synth-cyan"></div>
        </div>
      </div>
    </div>
  `,
})
export class SourceListComponent implements OnInit {
  conversationId = input<string | null>(null);

  sources = this.sourceService.sources;
  loading = this.sourceService.loading;

  constructor(private sourceService: SourceService) {
    effect(() => {
      const id = this.conversationId();
      if (id) {
        this.sourceService.loadSources(id);
      } else {
        this.sourceService.clearSources();
      }
    });
  }

  ngOnInit(): void {}

  getIcon(src: Source): string {
    const ext = src.filename.split('.').pop()?.toLowerCase() ?? '';
    if (['pdf'].includes(ext)) return 'picture_as_pdf';
    if (['docx', 'doc'].includes(ext)) return 'description';
    if (['xlsx', 'xls'].includes(ext)) return 'table_chart';
    if (['pptx', 'ppt'].includes(ext)) return 'slideshow';
    return 'description';
  }

  deleteSource(sourceId: string): void {
    const id = this.conversationId();
    if (!id) return;
    this.sourceService.deleteSource(id, sourceId).subscribe({
      next: () => {
        this.sourceService.loadSources(id);
      },
      error: () => {
        this.sourceService.loadSources(id);
      },
    });
  }
}
