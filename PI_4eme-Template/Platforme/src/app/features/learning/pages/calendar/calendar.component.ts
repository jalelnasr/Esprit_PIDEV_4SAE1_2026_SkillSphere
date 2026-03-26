import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MeetService, CalendarEvent } from '@core/services/meet.service';
import { AuthService } from '@core/services/auth.service';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarDay {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  viewMode: ViewMode = 'month';
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  events: CalendarEvent[] = [];
  selectedDayEvents: CalendarEvent[] = [];
  selectedDate: Date | null = null;
  loading = false;
  isFormateur = false;

  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  get monthLabel(): string {
    return this.currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  get weekLabel(): string {
    const start = this.getWeekStart(this.currentDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  get dayLabel(): string {
    return this.currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  constructor(private meetService: MeetService, private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isFormateur = role === 'FORMATEUR' || role === 'ADMIN';
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    const month = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}`;
    this.meetService.getCalendar(month).subscribe({
      next: events => {
        this.events = events;
        this.buildCalendar();
        this.loading = false;
      },
      error: () => {
        this.events = [];
        this.buildCalendar();
        this.loading = false;
      }
    });
  }

  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    this.calendarDays = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      this.calendarDays.push({ date, dayNum: daysInPrevMonth - i, isCurrentMonth: false, isToday: false, events: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayEvents = this.events.filter(e => new Date(e.start).toDateString() === date.toDateString());
      this.calendarDays.push({
        date, dayNum: d, isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents
      });
    }

    const remaining = 42 - this.calendarDays.length;
    for (let d = 1; d <= remaining; d++) {
      this.calendarDays.push({ date: new Date(year, month + 1, d), dayNum: d, isCurrentMonth: false, isToday: false, events: [] });
    }
  }

  getWeekDays(): CalendarDay[] {
    const start = this.getWeekStart(this.currentDate);
    const days: CalendarDay[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dayEvents = this.events.filter(e => new Date(e.start).toDateString() === date.toDateString());
      days.push({ date, dayNum: date.getDate(), isCurrentMonth: true, isToday: date.toDateString() === today.toDateString(), events: dayEvents });
    }
    return days;
  }

  getDayEvents(): CalendarEvent[] {
    return this.events.filter(e => new Date(e.start).toDateString() === this.currentDate.toDateString());
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  }

  prev(): void {
    if (this.viewMode === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.loadEvents();
    } else if (this.viewMode === 'week') {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
  }

  next(): void {
    if (this.viewMode === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.loadEvents();
    } else if (this.viewMode === 'week') {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    }
  }

  goToday(): void {
    this.currentDate = new Date();
    if (this.viewMode === 'month') this.loadEvents();
  }

  selectDay(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    this.selectedDate = day.date;
    this.selectedDayEvents = day.events;
  }

  setView(mode: ViewMode): void {
    this.viewMode = mode;
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatEventTime(event: CalendarEvent): string {
    return `${this.formatTime(event.start)} – ${this.formatTime(event.end)}`;
  }

  joinMeet(event: CalendarEvent): void {
    if (event.meetLink) {
      if (event.meetId) this.meetService.recordJoin(event.meetId).subscribe();
      window.open(event.meetLink, '_blank');
    }
  }

  getHours(): number[] {
    return Array.from({ length: 24 }, (_, i) => i);
  }

  getEventsForHour(events: CalendarEvent[], hour: number): CalendarEvent[] {
    return events.filter(e => new Date(e.start).getHours() === hour);
  }
}
