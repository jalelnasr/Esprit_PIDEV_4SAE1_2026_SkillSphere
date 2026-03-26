import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events-browse',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Browse Events 🎪</h1>
      <div class="events-grid">
        <div class="event-card" *ngFor="let event of events">
          <div class="event-header">
            <h3>{{ event.title }}</h3>
            <span class="event-type">{{ event.type }}</span>
          </div>
          <p>{{ event.date }} - {{ event.location }}</p>
          <p class="event-desc">{{ event.description }}</p>
          <button class="event-btn">Register</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    h1 { font-size: 32px; color: #333; margin-bottom: 2rem; }
    .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .event-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .event-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
    h3 { margin: 0; color: #333; }
    .event-type { background: #667eea; color: white; padding: 0.3rem 0.75rem; border-radius: 6px; font-size: 11px; font-weight: 600; }
    p { margin: 0.5rem 0; color: #666; font-size: 13px; }
    .event-desc { margin: 1rem 0; color: #999; }
    .event-btn { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
  `]
})
export class EventsBrowseComponent {
  events = [
    { title: 'Web Development Bootcamp', type: 'Bootcamp', date: 'Feb 20, 2024', location: 'Online', description: 'Intensive 4-week bootcamp' },
    { title: 'AI/ML Conference', type: 'Conference', date: 'Mar 5, 2024', location: 'New York', description: 'Latest trends in AI and Machine Learning' }
  ];
}
