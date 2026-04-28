import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ActivityEntry {
  id: number;
  timestamp: Date;
  user: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'ASSIGN' | 'LOGIN' | 'EXPORT' | 'STATUS_CHANGE';
  entity: string;
  entityId?: number;
  description: string;
  details?: string;
  icon: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private nextId = 1;
  private activities: ActivityEntry[] = [];
  private activities$ = new BehaviorSubject<ActivityEntry[]>([]);

  getActivities(): Observable<ActivityEntry[]> {
    return this.activities$.asObservable();
  }

  getAll(): ActivityEntry[] {
    return [...this.activities];
  }

  log(entry: Omit<ActivityEntry, 'id' | 'timestamp'>) {
    const newEntry: ActivityEntry = {
      ...entry,
      id: this.nextId++,
      timestamp: new Date()
    };
    this.activities.unshift(newEntry);
    // Keep max 500 entries
    if (this.activities.length > 500) this.activities = this.activities.slice(0, 500);
    this.activities$.next([...this.activities]);
  }

  // Convenience methods
  logCreate(user: string, role: string, entity: string, entityId: number, description: string) {
    this.log({ user, userRole: role, action: 'CREATE', entity, entityId, description, icon: '➕', severity: 'success' });
  }

  logUpdate(user: string, role: string, entity: string, entityId: number, description: string) {
    this.log({ user, userRole: role, action: 'UPDATE', entity, entityId, description, icon: '✏️', severity: 'info' });
  }

  logDelete(user: string, role: string, entity: string, entityId: number, description: string) {
    this.log({ user, userRole: role, action: 'DELETE', entity, entityId, description, icon: '🗑️', severity: 'danger' });
  }

  logImport(user: string, role: string, description: string, details?: string) {
    this.log({ user, userRole: role, action: 'IMPORT', entity: 'Employee', description, details, icon: '📥', severity: 'info' });
  }

  logAssign(user: string, role: string, description: string) {
    this.log({ user, userRole: role, action: 'ASSIGN', entity: 'Assignment', description, icon: '📋', severity: 'success' });
  }

  logStatusChange(user: string, role: string, entity: string, entityId: number, description: string) {
    this.log({ user, userRole: role, action: 'STATUS_CHANGE', entity, entityId, description, icon: '🔄', severity: 'warning' });
  }

  logLogin(user: string, role: string) {
    this.log({ user, userRole: role, action: 'LOGIN', entity: 'Session', description: `${user} logged in as ${role}`, icon: '🔐', severity: 'info' });
  }

  logExport(user: string, role: string, entity: string, description: string) {
    this.log({ user, userRole: role, action: 'EXPORT', entity, description, icon: '📤', severity: 'info' });
  }

  // Get filtered
  getByEntity(entity: string): ActivityEntry[] {
    return this.activities.filter(a => a.entity === entity);
  }

  getByUser(user: string): ActivityEntry[] {
    return this.activities.filter(a => a.user === user);
  }

  getByAction(action: string): ActivityEntry[] {
    return this.activities.filter(a => a.action === action);
  }

  getRecent(count: number = 20): ActivityEntry[] {
    return this.activities.slice(0, count);
  }

  clear() {
    this.activities = [];
    this.activities$.next([]);
  }
}
