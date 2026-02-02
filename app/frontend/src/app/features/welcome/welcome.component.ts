import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="welcome-root">
      <div class="starfield"></div>
      <div class="perspective-grid"></div>
      <div class="scanline"></div>

      <div class="content-wrapper">
        <div class="jupiter-container">
          <div class="jupiter-aura"></div>
          <div class="jupiter-rings"></div>
          <div class="jupiter-planet"></div>
        </div>

        <div class="text-center mb-4">
          <h1 class="neon-title leading-none">JUPITER</h1>
          <p class="subtitle text-synth-cyan tracking-[0.2em] sm:tracking-[0.4em] font-bold text-[9px] sm:text-xs mt-1 sm:mt-2 opacity-80 uppercase">
            Neural Retrieval Augmented Generation
          </p>
        </div>

        <a
          routerLink="/conversations"
          class="btn-app"
        >
          <span class="material-symbols-outlined text-xl sm:text-2xl">chat</span>
          Ir a conversaciones
        </a>
      </div>

      <footer class="welcome-footer">
        <div class="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="status-dot"></span>
            <span class="status-text">Operational</span>
          </div>
          <div class="footer-divider hidden sm:block"></div>
          <span class="footer-mono sm:inline hidden">Ollama</span>
        </div>
        <div class="flex items-center gap-3 sm:gap-6">
          <div class="grid-bars">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar bar-dim"></div>
          </div>
          <span class="footer-mono version">v0.1.0</span>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 0;
        min-height: 0;
        width: 100%;
      }

      .welcome-root {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1 1 0;
        min-height: 0;
        width: 100%;
        overflow: hidden;
        font-family: 'Space Grotesk', sans-serif;
      }

      .starfield {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(white 1px, transparent 1px);
        background-size: 50px 50px;
        opacity: 0.1;
        z-index: 0;
      }

      .perspective-grid {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: min(30vh, 200px);
        background-image:
          linear-gradient(rgba(111, 6, 249, 0.2) 1px, transparent 1px),
          linear-gradient(90deg, rgba(111, 6, 249, 0.2) 1px, transparent 1px);
        background-size: 60px 60px;
        transform: perspective(500px) rotateX(60deg);
        transform-origin: bottom;
        z-index: 0;
      }

      .scanline {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
          linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
          linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 255, 255, 0.06));
        background-size: 100% 4px, 4px 100%;
        pointer-events: none;
        z-index: 100;
        opacity: 0.1;
      }

      .content-wrapper {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 72rem;
        padding: clamp(0.5rem, 2vw, 1.5rem) clamp(0.5rem, 2vw, 1rem);
        flex-shrink: 0;
      }

      .jupiter-container {
        position: relative;
        width: clamp(140px, 45vmin, 320px);
        height: clamp(140px, 45vmin, 320px);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: clamp(0.25rem, 1vw, 0.75rem);
        flex-shrink: 0;
      }

      .jupiter-planet {
        width: 60%;
        height: 60%;
        border-radius: 50%;
        background: linear-gradient(
          to bottom,
          #7000ff 0%,
          #ff00ff 20%,
          #00ffff 40%,
          #7000ff 60%,
          #ff00ff 80%,
          #00ffff 100%
        );
        position: relative;
        box-shadow:
          0 0 80px rgba(111, 6, 249, 0.5),
          inset 0 0 40px rgba(0, 0, 0, 0.8);
        z-index: 10;
      }

      .jupiter-planet::after {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          transparent 0%,
          transparent 8%,
          rgba(0, 0, 0, 0.3) 8%,
          rgba(0, 0, 0, 0.3) 10%
        );
        border-radius: 50%;
        pointer-events: none;
      }

      .jupiter-rings {
        position: absolute;
        width: 110%;
        height: 24%;
        border: 3px solid rgba(0, 255, 255, 0.3);
        border-radius: 50%;
        transform: rotateX(75deg);
        box-shadow:
          0 0 20px rgba(0, 255, 255, 0.4),
          inset 0 0 15px rgba(255, 0, 255, 0.4);
        z-index: 5;
      }

      .jupiter-aura {
        position: absolute;
        width: 90%;
        height: 90%;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(255, 0, 255, 0.2) 0%,
          rgba(0, 255, 255, 0.1) 50%,
          transparent 70%
        );
        filter: blur(30px);
        z-index: 1;
      }

      .neon-title {
        font-size: clamp(1.75rem, 8vw, 4rem);
        font-weight: 900;
        letter-spacing: -0.05em;
        font-style: italic;
        background: linear-gradient(to bottom, #fff 20%, #ff00ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 15px rgba(255, 0, 255, 0.8));
        text-transform: uppercase;
        line-height: 1;
      }

      .btn-app {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        font-size: clamp(0.875rem, 2.5vw, 1rem);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #0d0221;
        background: linear-gradient(135deg, #00ffff 0%, #7000ff 100%);
        border: 2px solid rgba(0, 255, 255, 0.5);
        border-radius: 0.75rem;
        text-decoration: none;
        box-shadow: 0 0 25px rgba(0, 255, 255, 0.4);
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .btn-app:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 35px rgba(0, 255, 255, 0.6);
      }

      .welcome-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 0.75rem 1rem 1rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        z-index: 20;
        background: linear-gradient(to top, rgba(13, 2, 33, 0.95), transparent);
      }

      @media (min-width: 640px) {
        .welcome-footer {
          padding: 0 2rem 2rem;
        }
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 10px #22c55e;
      }

      .status-text {
        font-size: 10px;
        font-family: ui-monospace, monospace;
        color: #22c55e;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        font-weight: 700;
      }

      .footer-divider {
        width: 1px;
        height: 1rem;
        background: #33214a;
      }

      .footer-mono {
        font-size: 10px;
        font-family: ui-monospace, monospace;
        color: #6b7280;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .footer-mono.version {
        color: #9ca3af;
      }

      .grid-label {
        font-size: 8px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 2px;
      }

      .grid-bars {
        display: flex;
        gap: 4px;
      }

      .grid-bars .bar {
        width: 4px;
        height: 12px;
        background: #00ffff;
        box-shadow: 0 0 5px #00ffff;
      }

      .grid-bars .bar-dim {
        background: rgba(0, 255, 255, 0.3);
        box-shadow: none;
      }
    `,
  ],
})
export class WelcomeComponent {}
