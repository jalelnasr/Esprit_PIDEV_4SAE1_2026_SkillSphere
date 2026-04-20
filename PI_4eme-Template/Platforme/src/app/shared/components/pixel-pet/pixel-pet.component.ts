import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pixel-pet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pet"
         [style.left.px]="x"
         [class.sleeping]="sitting"
         [style.transform]="petTransform"
         (click)="onPetClick($event)"
         title="Meow!">
      🐈
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 64px;
      left: 0;
      width: 100%;
      height: 48px;
      pointer-events: none;
      z-index: 99999;
    }
    .pet {
      position: absolute;
      top: 4px;
      font-size: 28px;
      pointer-events: all;
      cursor: pointer;
      user-select: none;
      line-height: 1;
      transition: transform 0.4s ease;
    }
    .pet:hover { filter: drop-shadow(0 0 6px #0F9B8E); }
  `]
})
export class PixelPetComponent implements OnInit, OnDestroy {
  x = 100;
  direction: 'left' | 'right' = 'right';
  sitting = false;
  private speed = 0.5;
  private moveInterval?: ReturnType<typeof setInterval>;
  private sitInterval?: ReturnType<typeof setInterval>;

  get petTransform(): string {
    const flip = this.direction === 'left' ? -1 : 1;
    return this.sitting
      ? `scaleX(${flip}) rotate(90deg)`
      : `scaleX(${flip})`;
  }

  ngOnInit(): void {
    this.x = Math.random() * (window.innerWidth - 60);

    this.moveInterval = setInterval(() => {
      if (this.sitting) { return; }
      this.x += this.direction === 'right' ? this.speed : -this.speed;
      if (this.x > window.innerWidth - 50) { this.direction = 'left'; }
      else if (this.x < 0) { this.direction = 'right'; }
    }, 16);

    this.sitInterval = setInterval(() => {
      this.sitting = true;
      setTimeout(() => { this.sitting = false; }, 5000);
    }, 15000);
  }

  ngOnDestroy(): void {
    clearInterval(this.moveInterval);
    clearInterval(this.sitInterval);
  }

  onPetClick(event: MouseEvent): void {
    event.stopPropagation();
    this.sitting = false;
    this.direction = event.clientX > this.x ? 'left' : 'right';
    const prev = this.speed;
    this.speed = 4;
    setTimeout(() => { this.speed = prev; }, 1500);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.x > window.innerWidth - 50) { this.x = window.innerWidth - 60; }
  }
}
