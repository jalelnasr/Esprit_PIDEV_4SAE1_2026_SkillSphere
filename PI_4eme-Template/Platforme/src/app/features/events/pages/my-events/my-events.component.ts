import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>My Events 🎟️</h1>
      <div class="my-events">
        <div class="event-item" *ngFor="let event of myEvents">
          <h3>{{ event.title }}</h3>
          <p>{{ event.date }} - {{ event.location }}</p>
          <button class="detail-btn">View Details</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    h1 { font-size: 32px; color: #333; margin-bottom: 2rem; }
    .my-events { display: flex; flex-direction: column; gap: 1rem; max-width: 600px; }
    .event-item { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    h3 { margin: 0 0 0.5rem 0; color: #333; }
    p { margin: 0.5rem 0; color: #666; font-size: 13px; }
    .detail-btn { background: #667eea; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; margin-top: 1rem; }
  `]
})
export class MyEventsComponent {
  myEvents = [
    { title: 'Angular Workshop', date: 'Feb 15, 2024', location: 'Online' },
    { title: 'Python Bootcamp', date: 'Mar 10, 2024', location: 'San Francisco' }
  ];
}
