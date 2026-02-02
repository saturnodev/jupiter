import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

/**
 * Vista Welcome responsiva desde cero.
 * Layout: grid de 2 filas (main 1fr + footer auto). Main centra un bloque hero (planeta + título + botón).
 * Look & feel: synth, Júpiter, neon, mismo estilo que antes.
 */
@Component({
  selector: 'app-welcome-view',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="welcome-page" [class.welcome-transition-active]="transitioning">
      <!-- Overlay de transición: planeta Júpiter que se expande -->
      <div class="welcome-transition-overlay" aria-hidden="true">
        <div class="welcome-transition-planet"></div>
      </div>

      <!-- Capas decorativas (no afectan layout) -->
      <div class="welcome-bg welcome-starfield" aria-hidden="true"></div>
      <div class="welcome-bg welcome-grid" aria-hidden="true"></div>
      <div class="welcome-bg welcome-scanline" aria-hidden="true"></div>

      <!-- Área principal: una fila que ocupa el espacio disponible -->
      <main class="welcome-main">
        <div class="welcome-hero">
          <div class="welcome-planet-wrap">
            <div class="welcome-planet-aura"></div>
            <div class="welcome-planet-rings"></div>
            <div class="welcome-planet"></div>
          </div>
          <h1 class="welcome-title">JUPITER</h1>
          <p class="welcome-subtitle">Neural Retrieval Augmented Generation</p>
          <a routerLink="/conversations" class="welcome-btn" (click)="goToConversations($event)">
            <span class="material-symbols-outlined" aria-hidden="true">chat</span>
            Ir a conversaciones
          </a>
        </div>
      </main>

      <!-- Footer: altura automática -->
      <footer class="welcome-foot">
        <div class="welcome-foot-left">
          <span class="welcome-foot-dot"></span>
          <span class="welcome-foot-status">Operational</span>
          <span class="welcome-foot-sep"></span>
          <span class="welcome-foot-mono">Ollama</span>
        </div>
        <div class="welcome-foot-right">
          <div class="welcome-foot-bars">
            <span class="welcome-foot-bar"></span>
            <span class="welcome-foot-bar"></span>
            <span class="welcome-foot-bar"></span>
            <span class="welcome-foot-bar welcome-foot-bar-dim"></span>
          </div>
          <span class="welcome-foot-version">v0.1.0</span>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      /* Contenedor: grid de 2 filas, altura mínima viewport */
      .welcome-page {
        display: grid;
        grid-template-rows: 1fr auto;
        min-height: 100vh;
        min-height: 100dvh;
        width: 100%;
        position: relative;
        font-family: 'Space Grotesk', sans-serif;
      }

      /* Fondos absolutos, detrás del contenido */
      .welcome-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }

      .welcome-starfield {
        background-image: radial-gradient(white 1px, transparent 1px);
        background-size: 50px 50px;
        opacity: 0.1;
      }

      .welcome-grid {
        top: auto;
        height: 30vh;
        max-height: 200px;
        background-image:
          linear-gradient(rgba(111, 6, 249, 0.2) 1px, transparent 1px),
          linear-gradient(90deg, rgba(111, 6, 249, 0.2) 1px, transparent 1px);
        background-size: 60px 60px;
        transform: perspective(500px) rotateX(60deg);
        transform-origin: bottom;
      }

      .welcome-scanline {
        background:
          linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
          linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 255, 255, 0.06));
        background-size: 100% 4px, 4px 100%;
        opacity: 0.1;
        z-index: 1;
      }

      /* Main: ocupa la primera fila, centra el hero */
      .welcome-main {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        min-height: 0;
      }

      /* Hero: bloque vertical centrado (planeta, título, botón) */
      .welcome-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        width: 100%;
        max-width: 400px;
      }

      /* Contenedor del planeta: cuadrado responsivo con vmin */
      .welcome-planet-wrap {
        position: relative;
        width: 40vmin;
        height: 40vmin;
        max-width: 280px;
        max-height: 280px;
        min-width: 120px;
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      @keyframes planet-glow {
        0%, 100% { opacity: 0.8; filter: blur(30px); }
        50% { opacity: 1; filter: blur(35px); }
      }

      @keyframes rings-pulse {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }

      @keyframes aurora-flow {
        0%, 100% {
          opacity: 0.85;
          filter: blur(8px);
          transform: translateX(-50%) translateY(-4%) scale(1);
        }
        25% {
          opacity: 1;
          filter: blur(12px);
          transform: translateX(calc(-50% + 3%)) translateY(2%) scale(1.03);
        }
        50% {
          opacity: 0.9;
          filter: blur(10px);
          transform: translateX(calc(-50% - 2%)) translateY(4%) scale(1.05);
        }
        75% {
          opacity: 1;
          filter: blur(14px);
          transform: translateX(calc(-50% + 2%)) translateY(0%) scale(1.02);
        }
      }

      .welcome-planet {
        width: 60%;
        height: 60%;
        border-radius: 50%;
        background: linear-gradient(
          180deg,
          #7000ff 0%,
          #ff00ff 20%,
          #00ffff 40%,
          #7000ff 60%,
          #ff00ff 80%,
          #00ffff 100%
        );
        position: relative;
        z-index: 3;
        box-shadow: 0 0 80px rgba(111, 6, 249, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.8);
      }

      /* Aurora boreal polo norte */
      .welcome-planet::before {
        content: '';
        position: absolute;
        top: -5%;
        left: 50%;
        transform: translateX(-50%);
        width: 140%;
        height: 45%;
        border-radius: 50% 50% 50% 50% / 60% 60% 0 0;
        background: linear-gradient(
          180deg,
          transparent 0%,
          rgba(0, 255, 136, 0.25) 15%,
          rgba(0, 255, 255, 0.4) 35%,
          rgba(191, 0, 255, 0.3) 55%,
          transparent 85%
        );
        filter: blur(10px);
        pointer-events: none;
        animation: aurora-flow 8s ease-in-out infinite;
      }

      /* Aurora boreal polo sur */
      .welcome-planet::after {
        content: '';
        position: absolute;
        bottom: -5%;
        left: 50%;
        transform: translateX(-50%);
        width: 140%;
        height: 45%;
        border-radius: 50% 50% 50% 50% / 0 0 60% 60%;
        background: linear-gradient(
          0deg,
          transparent 0%,
          rgba(0, 255, 136, 0.25) 15%,
          rgba(0, 255, 255, 0.4) 35%,
          rgba(255, 0, 200, 0.3) 55%,
          transparent 85%
        );
        filter: blur(10px);
        pointer-events: none;
        animation: aurora-flow 8s ease-in-out infinite 1.2s;
      }

      .welcome-planet-rings {
        position: absolute;
        width: 110%;
        height: 24%;
        border: 3px solid rgba(0, 255, 255, 0.3);
        border-radius: 50%;
        transform: rotateX(75deg);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
        z-index: 2;
        animation: rings-pulse 3s ease-in-out infinite;
      }

      .welcome-planet-aura {
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
        animation: planet-glow 4s ease-in-out infinite;
      }

      .welcome-title {
        margin: 0.5em 0 0;
        font-size: clamp(1.5rem, 6vmin, 3rem);
        font-weight: 900;
        font-style: italic;
        letter-spacing: -0.05em;
        line-height: 1;
        text-transform: uppercase;
        background: linear-gradient(180deg, #fff 20%, #ff00ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 12px rgba(255, 0, 255, 0.8));
      }

      .welcome-subtitle {
        margin: 0.25em 0 1em;
        font-size: clamp(0.5rem, 1.8vmin, 0.75rem);
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #00ffff;
        opacity: 0.9;
      }

      .welcome-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        font-size: clamp(0.8rem, 2vmin, 1rem);
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-decoration: none;
        color: #0d0221;
        background: linear-gradient(135deg, #00ffff 0%, #7000ff 100%);
        border: 2px solid rgba(0, 255, 255, 0.5);
        border-radius: 12px;
        box-shadow: 0 0 24px rgba(0, 255, 255, 0.4);
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .welcome-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 32px rgba(0, 255, 255, 0.6);
      }

      .welcome-btn .material-symbols-outlined {
        font-size: 1.25em;
      }

      /* Footer: segunda fila del grid */
      .welcome-foot {
        position: relative;
        z-index: 2;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: linear-gradient(to top, rgba(13, 2, 33, 0.95), transparent);
      }

      @media (min-width: 480px) {
        .welcome-foot {
          padding: 1rem 1.5rem;
        }
      }

      .welcome-foot-left,
      .welcome-foot-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .welcome-foot-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 8px #22c55e;
      }

      .welcome-foot-status {
        font-size: 0.65rem;
        font-family: ui-monospace, monospace;
        color: #22c55e;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .welcome-foot-sep {
        width: 1px;
        height: 14px;
        background: #33214a;
      }

      .welcome-foot-mono {
        font-size: 0.6rem;
        font-family: ui-monospace, monospace;
        color: #6b7280;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .welcome-foot-bars {
        display: flex;
        gap: 4px;
      }

      .welcome-foot-bar {
        width: 4px;
        height: 10px;
        background: #00ffff;
        box-shadow: 0 0 4px #00ffff;
      }

      .welcome-foot-bar-dim {
        background: rgba(0, 255, 255, 0.3);
        box-shadow: none;
      }

      .welcome-foot-version {
        font-size: 0.6rem;
        font-family: ui-monospace, monospace;
        color: #9ca3af;
        letter-spacing: 0.08em;
      }

      /* Overlay de transición: mismo icono Júpiter que se expande */
      .welcome-transition-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0d0221;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease-out;
      }

      .welcome-page.welcome-transition-active .welcome-transition-overlay {
        pointer-events: auto;
        opacity: 1;
      }

      .welcome-transition-planet {
        width: 80vmin;
        height: 80vmin;
        max-width: 280px;
        max-height: 280px;
        border-radius: 50%;
        background: linear-gradient(
          180deg,
          #7000ff 0%,
          #ff00ff 20%,
          #00ffff 40%,
          #7000ff 60%,
          #ff00ff 80%,
          #00ffff 100%
        );
        box-shadow: 0 0 80px rgba(111, 6, 249, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.8);
        transform: scale(0);
        transition: transform 0.7s cubic-bezier(0.33, 1, 0.68, 1);
      }

      .welcome-page.welcome-transition-active .welcome-transition-planet {
        transform: scale(4.5);
      }
    `,
  ],
})
export class WelcomeViewComponent {
  transitioning = false;

  constructor(private router: Router) {}

  goToConversations(event: Event): void {
    event.preventDefault();
    this.transitioning = true;
    setTimeout(() => {
      this.router.navigate(['/conversations']);
    }, 700);
  }
}
