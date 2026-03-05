import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Global Leaderboard 🏆</h1>
      <div class="leaderboard">
        <div class="leaderboard-header">
          <span class="rank">Rank</span>
          <span class="name">Name</span>
          <span class="xp">XP Points</span>
          <span class="badges">Badges</span>
        </div>
        <div class="leaderboard-row" *ngFor="let user of leaderboard; let i = index" [class.top-3]="i < 3">
          <span class="rank">{{ i + 1 }}</span>
          <span class="name">{{ user.name }}</span>
          <span class="xp">{{ user.xp }}</span>
          <span class="badges">{{ user.badges }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    h1 { font-size: 32px; color: #333; margin-bottom: 2rem; }
    .leaderboard { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; }
    .leaderboard-header { display: grid; grid-template-columns: 60px 1fr 120px 100px; padding: 1.5rem; background: #f8f9ff; font-weight: 600; color: #667eea; font-size: 13px; text-transform: uppercase; }
    .leaderboard-row { display: grid; grid-template-columns: 60px 1fr 120px 100px; padding: 1rem 1.5rem; border-top: 1px solid #e0e0e0; align-items: center; font-size: 14px; }
    .leaderboard-row.top-3 { background: rgba(100, 200, 255, 0.05); }
    .rank { font-weight: 600; color: #667eea; }
    .name { font-weight: 500; }
    .xp { color: #f39c12; font-weight: 600; }
    .badges { text-align: right; }
  `]
})
export class LeaderboardComponent {
  leaderboard = [
    { name: 'John Doe', xp: 5000, badges: 12 },
    { name: 'Jane Smith', xp: 4800, badges: 10 },
    { name: 'Mike Johnson', xp: 4600, badges: 9 },
    { name: 'Sarah Williams', xp: 4200, badges: 8 },
    { name: 'Tom Brown', xp: 3900, badges: 7 }
  ];
}
