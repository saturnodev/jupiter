import { Component, input, output, signal } from '@angular/core';
import { SourceService } from '../../../core/services/source.service';
import type { Source } from '../../../core/models/source.model';

@Component({
  selector: 'app-source-upload',
  standalone: true,
  template: `
    <div class="p-4 flex flex-col">
      @if (!conversationId()) {
        <p class="text-[10px] text-gray-500 text-center">Selecciona una conversación</p>
      } @else {
        <div
          class="border-2 border-dashed border-glass-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-synth-cyan/50 hover:bg-synth-cyan/5 transition-all cursor-pointer group"
          [class.opacity-50]="uploading()"
          [class.pointer-events-none]="uploading()"
          (click)="fileInput.click()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          role="button"
          tabindex="0"
          (keydown.enter)="fileInput.click()"
          (keydown.space)="fileInput.click()"
        >
          <div class="size-10 rounded-full bg-glass-border flex items-center justify-center text-gray-400 group-hover:text-synth-cyan">
            @if (uploading()) {
              <span class="material-symbols-outlined animate-spin">progress_activity</span>
            } @else {
              <span class="material-symbols-outlined">upload_file</span>
            }
          </div>
          <div class="text-center">
            <p class="text-xs font-bold text-gray-200 uppercase">{{ uploading() ? 'Subiendo...' : 'Añadir fuente' }}</p>
            <p class="text-[10px] text-gray-500 mt-1">PDF, DOCX, TXT, MD, Excel, PPT</p>
          </div>
        </div>
        <div class="flex gap-2 mt-3">
          <input
            #fileInput
            type="file"
            multiple
            accept=".pdf,.txt,.md,.docx,.xlsx,.xls,.pptx,.ppt"
            class="hidden"
            (change)="onFileSelect($event)"
          />
          <button
            type="button"
            (click)="folderInput.click(); $event.stopPropagation()"
            [disabled]="uploading()"
            class="text-[10px] text-synth-cyan hover:underline disabled:opacity-50"
          >
            Subir carpeta
          </button>
          <input
            #folderInput
            type="file"
            webkitdirectory
            directory
            multiple
            class="hidden"
            (change)="onFolderSelect($event)"
          />
        </div>
        @if (error()) {
          <p class="text-[10px] text-red-400 mt-2">{{ error() }}</p>
        }
      }
    </div>
  `,
})
export class SourceUploadComponent {
  conversationId = input<string | null>(null);
  sourcesUploaded = output<Source[]>();

  uploading = signal(false);
  error = signal<string | null>(null);

  constructor(private sourceService: SourceService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const id = this.conversationId();
    if (!id || this.uploading()) return;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.upload(Array.from(files));
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.upload(Array.from(files));
      input.value = '';
    }
  }

  onFolderSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.uploadFolder(Array.from(files));
      input.value = '';
    }
  }

  upload(files: File[]): void {
    const id = this.conversationId();
    if (!id) return;
    this.uploading.set(true);
    this.error.set(null);
    this.sourceService.uploadFiles(id, files).subscribe({
      next: (sources) => {
        this.uploading.set(false);
        this.sourceService.loadSources(id);
        this.sourcesUploaded.emit(sources);
      },
      error: (err) => {
        this.uploading.set(false);
        this.error.set(err?.error?.detail || err?.message || 'Error al subir');
      },
    });
  }

  uploadFolder(files: File[]): void {
    const id = this.conversationId();
    if (!id) return;
    this.uploading.set(true);
    this.error.set(null);
    this.sourceService.uploadFolder(id, files).subscribe({
      next: (sources) => {
        this.uploading.set(false);
        this.sourceService.loadSources(id);
        this.sourcesUploaded.emit(sources);
      },
      error: (err) => {
        this.uploading.set(false);
        this.error.set(err?.error?.detail || err?.message || 'Error al subir carpeta');
      },
    });
  }
}
