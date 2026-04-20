import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Community Feed 👥</h1>
      <div class="posts">
        <div class="post" *ngFor="let post of posts">
          <div class="post-header">
            <span class="author">{{ post.author }}</span>
            <span class="time">{{ post.time }}</span>
          </div>
          <p>{{ post.content }}</p>
          <div class="post-actions">
            <button>👍 Like</button>
            <button>💬 Comment</button>
            <button>↗️ Share</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; max-width: 600px; margin: 0 auto; }
    h1 { font-size: 32px; color: #333; margin-bottom: 2rem; }
    .posts { display: flex; flex-direction: column; gap: 1.5rem; }
    .post { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .post-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
    .author { font-weight: 600; color: #333; }
    .time { font-size: 12px; color: #999; }
    p { margin: 0 0 1rem 0; color: #666; line-height: 1.6; }
    .post-actions { display: flex; gap: 1rem; }
    button { background: none; border: none; cursor: pointer; color: #667eea; font-size: 13px; font-weight: 600; }
  `]
})
export class FeedComponent {
  posts = [
    { author: 'John Doe', time: '2 hours ago', content: 'Just completed my Angular certification! Excited to apply these skills in my next project.' },
    { author: 'Jane Smith', time: '4 hours ago', content: 'Anyone interested in a study group for the Python exam next week?' }
  ];
}
