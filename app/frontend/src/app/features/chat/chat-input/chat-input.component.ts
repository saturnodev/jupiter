import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-8 relative z-20 shrink-0">
      <div class="max-w-4xl mx-auto flex gap-4">
        <div class="flex-1 bg-background-dark/80 backdrop-blur-md border border-glass-border rounded-xl flex items-center px-4 focus-within:border-synth-cyan transition-all shadow-2xl">
          <span class="material-symbols-outlined text-gray-500 shrink-0">terminal</span>
          <input
            #inputEl
            [(ngModel)]="message"
            (keydown.enter)="onSubmit($event)"
            [disabled]="disabled()"
            type="text"
            placeholder="Pregunta sobre tus documentos..."
            class="w-full bg-transparent border-none focus:ring-0 text-white py-4 px-4 placeholder-gray-600 outline-none disabled:opacity-50"
          />
          <button
            type="button"
            class="text-gray-500 hover:text-synth-cyan transition-colors p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-synth-cyan rounded"
            aria-label="Micrófono"
          >
            <span class="material-symbols-outlined">mic</span>
          </button>
        </div>
        <button
          type="button"
          (click)="send()"
          [disabled]="disabled() || !message.trim()"
          class="size-14 bg-primary text-white rounded-xl shadow-[0_0_20px_rgba(111,6,249,0.5)] hover:scale-105 transition-transform flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-synth-cyan"
          aria-label="Enviar"
        >
          <span class="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  `,
})
export class ChatInputComponent {
  disabled = input(false);
  messageSent = output<string>();

  message = '';

  onSubmit(event: Event): void {
    const e = event as KeyboardEvent;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  send(): void {
    const text = this.message.trim();
    if (!text || this.disabled()) return;
    this.messageSent.emit(text);
    this.message = '';
  }
}
