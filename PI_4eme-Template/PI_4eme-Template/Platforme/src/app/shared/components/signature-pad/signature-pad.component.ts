import { Component, EventEmitter, Output, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signature-modal-overlay" (click)="onCancel()">
      <div class="signature-modal-content" (click)="$event.stopPropagation()">
        <div class="signature-modal-header">
          <h2>✍️ Signer le Contrat</h2>
          <button class="close-btn" (click)="onCancel()">✕</button>
        </div>

        <div class="signature-modal-body">
          <div class="signature-instructions">
            <p>📝 Dessinez votre signature avec la souris ou le doigt dans la zone ci-dessous:</p>
          </div>

          <div class="signature-container">
            <canvas 
              #signatureCanvas
              width="600" 
              height="200"
              (mousedown)="startDrawing($event)"
              (mousemove)="draw($event)"
              (mouseup)="stopDrawing()"
              (mouseleave)="stopDrawing()"
              (touchstart)="startDrawing($event)"
              (touchmove)="draw($event)"
              (touchend)="stopDrawing()">
            </canvas>
            <div class="signature-line"></div>
          </div>

          <div class="signature-actions">
            <button class="btn btn-secondary" (click)="clearSignature()">
              🗑️ Effacer
            </button>
          </div>
        </div>

        <div class="signature-modal-footer">
          <button class="btn btn-secondary" (click)="onCancel()">
            Annuler
          </button>
          <button class="btn btn-primary" (click)="confirmSignature()">
            ✅ Confirmer la signature
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signature-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 20px;
      backdrop-filter: blur(4px);
    }

    .signature-modal-content {
      background: var(--card-bg, #fff);
      border-radius: 20px;
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    :root.dark-mode .signature-modal-content {
      background: #1e293b;
    }

    .signature-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid rgba(148,163,184,0.16);
    }

    .signature-modal-header h2 {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    :root.dark-mode .signature-modal-header h2 {
      color: #f8fafc;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(148,163,184,0.12);
      color: #64748b;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(239,68,68,0.14);
      color: #b91c1c;
    }

    .signature-modal-body {
      padding: 24px;
    }

    .signature-instructions {
      text-align: center;
      margin-bottom: 20px;
      padding: 12px;
      background: rgba(99,102,241,0.08);
      border-radius: 12px;
    }

    .signature-instructions p {
      margin: 0;
      color: #475569;
      font-size: 14px;
      font-weight: 600;
    }

    :root.dark-mode .signature-instructions p {
      color: #94a3b8;
    }

    .signature-container {
      position: relative;
      margin-bottom: 20px;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      background: #fff;
      overflow: hidden;
    }

    :root.dark-mode .signature-container {
      background: rgba(15,23,42,0.4);
      border-color: rgba(148,163,184,0.16);
    }

    canvas {
      display: block;
      width: 100%;
      height: 200px;
      cursor: crosshair;
      touch-action: none;
    }

    .signature-line {
      position: absolute;
      bottom: 40px;
      left: 20px;
      right: 20px;
      height: 1px;
      background: rgba(148,163,184,0.3);
      pointer-events: none;
    }

    .signature-line::before {
      content: '✍️ Signez ici';
      position: absolute;
      left: 0;
      bottom: 5px;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
    }

    .signature-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .signature-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid rgba(148,163,184,0.16);
    }

    .btn {
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background: rgba(148,163,184,0.12);
      color: #475569;
      border: 1px solid rgba(148,163,184,0.24);
    }

    .btn-secondary:hover {
      background: rgba(148,163,184,0.2);
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(99,102,241,0.24);
    }

    @media (max-width: 640px) {
      canvas {
        height: 150px;
      }
    }
  `]
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureConfirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;
  private isDrawing = false;

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      this.context = ctx;
      this.context.strokeStyle = '#000';
      this.context.lineWidth = 2;
      this.context.lineCap = 'round';
      this.context.lineJoin = 'round';
    }
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    const pos = this.getMousePos(event);
    this.context.beginPath();
    this.context.moveTo(pos.x, pos.y);
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    
    event.preventDefault();
    const pos = this.getMousePos(event);
    this.context.lineTo(pos.x, pos.y);
    this.context.stroke();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  getMousePos(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    
    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    } else {
      const touch = event.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  }

  clearSignature() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  confirmSignature() {
    if (this.isSignatureEmpty()) {
      alert('Veuillez dessiner votre signature avant de confirmer');
      return;
    }

    const signatureData = this.canvas.toDataURL('image/png');
    this.signatureConfirmed.emit(signatureData);
  }

  isSignatureEmpty(): boolean {
    const pixelBuffer = new Uint32Array(
      this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer
    );
    return !pixelBuffer.some(color => color !== 0);
  }

  onCancel() {
    this.cancelled.emit();
  }
}
