import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MeetService, MeetResponse, CalendarEvent } from '@core/services/meet.service';
import { AuthService } from '@core/services/auth.service';

interface CalendarDay {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasMeet: boolean;
}

@Component({
  selector: 'app-meet-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="meet-sidebar">
      <!-- Mini Calendar -->
      <div class="sidebar-card">
        <div class="card-header">
          <span class="card-title">{{ isFormateur ? 'My calendar' : 'Upcoming meets' }}</span>
          <a routerLink="/learning/calendar" class="view-all-link">View full</a>
        </div>

        <div class="mini-calendar">
          <div class="cal-nav">
            <button class="cal-nav-btn" (click)="prevMonth()">‹</button>
            <span class="cal-month-label">{{ monthLabel }}</span>
            <button class="cal-nav-btn" (click)="nextMonth()">›</button>
          </div>

          <div class="cal-grid">
            <div class="cal-day-header" *ngFor="let d of dayHeaders">{{ d }}</div>
            <div
              *ngFor="let day of calendarDays"
              class="cal-day"
              [class.other-month]="!day.isCurrentMonth"
              [class.today]="day.isToday"
              [class.has-meet]="day.hasMeet"
              (click)="selectDay(day)">
              {{ day.dayNum }}
              <span class="dot" *ngIf="day.hasMeet && day.isCurrentMonth"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's / Upcoming Meets -->
      <div class="sidebar-card">
        <div class="card-header">
          <span class="card-title">{{ isFormateur ? 'Upcoming meets' : "Today's meets" }}</span>
        </div>

        <div class="meets-list" *ngIf="displayMeets.length > 0; else noMeets">
          <div class="meet-item" *ngFor="let meet of displayMeets">
            <span class="meet-dot" [style.background]="meet.status === 'LIVE' ? '#10B981' : '#3B82F6'"></span>
            <div class="meet-info">
              <span class="meet-title">{{ meet.title }}</span>
              <span class="meet-meta">
                {{ formatTime(meet.scheduledAt) }} — {{ meet.sessionCourseTitle }}
              </span>
              <span class="meet-enrolled" *ngIf="isFormateur">
                {{ meet.participantCount }} joined
              </span>
            </div>
            <div class="meet-actions">
              <!-- APPRENANT: Join button -->
              <a *ngIf="!isFormateur && meet.status !== 'ENDED' && meet.status !== 'CANCELLED'"
                 [href]="meet.meetLink" target="_blank"
                 class="btn-join"
                 (click)="onJoin(meet.id)">
                {{ meet.status === 'LIVE' ? 'Join' : formatTime(meet.scheduledAt) }}
              </a>
              <!-- FORMATEUR: Start / Edit -->
              <button *ngIf="isFormateur && meet.status === 'SCHEDULED'"
                      class="btn-start"
                      (click)="startMeet(meet)">Start</button>
              <a *ngIf="isFormateur && meet.status === 'LIVE'"
                 [href]="meet.meetLink" target="_blank"
                 class="btn-join">Live</a>
            </div>
          </div>
        </div>

        <ng-template #noMeets>
          <p class="no-meets">No meets scheduled</p>
        </ng-template>

        <!-- Formateur: quick schedule button -->
        <button *ngIf="isFormateur" class="btn-schedule-new" routerLink="/learning/instructor/sessions">
          + Schedule new meet
        </button>
      </div>
    </div>
  `,
  styles: [`
    .meet-sidebar { display: flex; flex-direction: column; gap: 1rem; width: 300px; min-width: 280px; }

    .sidebar-card {
      background: #1e2a2a;
      border-radius: 10px;
      padding: 1rem;
      color: #e0e0e0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .card-title { font-weight: 600; font-size: 0.95rem; color: #fff; }

    .view-all-link { font-size: 0.8rem; color: #0F9B8E; text-decoration: none; }
    .view-all-link:hover { text-decoration: underline; }

    /* Mini Calendar */
    .mini-calendar { font-size: 0.85rem; }

    .cal-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .cal-nav-btn {
      background: none;
      border: none;
      color: #aaa;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0 0.5rem;
    }
    .cal-nav-btn:hover { color: #0F9B8E; }

    .cal-month-label { font-weight: 600; color: #fff; font-size: 0.9rem; }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      text-align: center;
    }

    .cal-day-header { color: #888; font-size: 0.75rem; padding: 4px 0; }

    .cal-day {
      position: relative;
      padding: 5px 2px;
      border-radius: 6px;
      cursor: pointer;
      color: #ccc;
      font-size: 0.8rem;
      transition: background 0.2s;
    }
    .cal-day:hover { background: #2a3a3a; }
    .cal-day.other-month { color: #555; }
    .cal-day.today {
      background: #0F9B8E;
      color: #fff;
      font-weight: 700;
      border-radius: 50%;
    }
    .cal-day.has-meet { font-weight: 600; }

    .dot {
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #0F9B8E;
    }
    .cal-day.today .dot { background: #fff; }

    /* Meets list */
    .meets-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .meet-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .meet-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }

    .meet-info { flex: 1; min-width: 0; }

    .meet-title {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meet-meta {
      display: block;
      font-size: 0.75rem;
      color: #888;
      margin-top: 2px;
    }

    .meet-enrolled {
      display: block;
      font-size: 0.7rem;
      color: #0F9B8E;
      margin-top: 2px;
    }

    .meet-actions { flex-shrink: 0; }

    .btn-join {
      display: inline-block;
      padding: 0.3rem 0.75rem;
      background: #0F9B8E;
      color: #fff;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-join:hover { background: #0d8a7e; }

    .btn-start {
      padding: 0.3rem 0.75rem;
      background: #10B981;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-start:hover { background: #059669; }

    .no-meets { color: #666; font-size: 0.85rem; text-align: center; padding: 0.5rem 0; }

    .btn-schedule-new {
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.6rem;
      background: transparent;
      border: 1px dashed #0F9B8E;
      color: #0F9B8E;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-schedule-new:hover { background: rgba(15,155,142,0.1); }
  `]
})
export class MeetSidebarComponent implements OnInit {
  @Input() isFormateur = false;

  dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  calendarDays: CalendarDay[] = [];
  currentDate = new Date();
  displayMeets: MeetResponse[] = [];
  calendarEvents: CalendarEvent[] = [];

  get monthLabel(): string {
    return this.currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  constructor(private meetService: MeetService, private authService: AuthService) {}

  ngOnInit(): void {
    this.buildCalendar();
    this.loadMeets();
    this.loadCalendarEvents();
  }

  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    this.calendarDays = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        hasMeet: false
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      this.calendarDays.push({
        date,
        dayNum: d,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        hasMeet: false
      });
    }

    // Next month padding to fill 6 rows
    const remaining = 42 - this.calendarDays.length;
    for (let d = 1; d <= remaining; d++) {
      this.calendarDays.push({
        date: new Date(year, month + 1, d),
        dayNum: d,
        isCurrentMonth: false,
        isToday: false,
        hasMeet: false
      });
    }
  }

  loadMeets(): void {
    if (this.isFormateur) {
      this.meetService.getUpcomingMeets().subscribe({
        next: meets => this.displayMeets = meets,
        error: () => this.displayMeets = []
      });
    } else {
      this.meetService.getTodayMeets().subscribe({
        next: meets => this.displayMeets = meets,
        error: () => this.displayMeets = []
      });
    }
  }

  loadCalendarEvents(): void {
    const month = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}`;
    this.meetService.getCalendar(month).subscribe({
      next: events => {
        this.calendarEvents = events;
        this.markDaysWithMeets();
      },
      error: () => {}
    });
  }

  markDaysWithMeets(): void {
    const meetDates = new Set(
      this.calendarEvents.map(e => new Date(e.start).toDateString())
    );
    this.calendarDays.forEach(day => {
      day.hasMeet = meetDates.has(day.date.toDateString());
    });
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.buildCalendar();
    this.loadCalendarEvents();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.buildCalendar();
    this.loadCalendarEvents();
  }

  selectDay(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    // Filter meets for selected day
    const dayStr = day.date.toDateString();
    this.displayMeets = this.calendarEvents
      .filter(e => new Date(e.start).toDateString() === dayStr)
      .map(e => ({
        id: e.meetId ?? e.id,
        sessionId: e.sessionId,
        sessionCourseTitle: e.title,
        formateurId: 0,
        title: e.title,
        description: '',
        scheduledAt: e.start,
        durationMinutes: 60,
        meetToken: '',
        meetLink: e.meetLink ?? '',
        status: e.status as any,
        createdAt: '',
        participantCount: 0
      }));
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  onJoin(meetId: number): void {
    this.meetService.recordJoin(meetId).subscribe();
  }

  startMeet(meet: MeetResponse): void {
    this.meetService.updateMeetStatus(meet.id, 'LIVE').subscribe({
      next: () => {
        meet.status = 'LIVE';
        window.open(meet.meetLink, '_blank');
      }
    });
  }
}
