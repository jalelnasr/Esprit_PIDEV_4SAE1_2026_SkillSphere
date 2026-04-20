import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Quote {
  text: string;
  author: string;
}

@Component({
  selector: 'app-quote-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quote-card" [class.fade-in]="visible">
      <div class="quote-header">
        <span class="quote-label">✨ Quote of the day</span>
        <button class="refresh-btn" (click)="nextQuote()" title="New quote">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>
      <blockquote class="quote-text" [class.fade]="fading">
        "{{ current.text }}"
      </blockquote>
      <p class="quote-author">— {{ current.author }}</p>
    </div>
  `,
  styles: [`
    .quote-card {
      background: linear-gradient(135deg, #0F9B8E20, #0F9B8E08);
      border: 1px solid rgba(15, 155, 142, 0.25);
      border-left: 4px solid #0F9B8E;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .quote-card.fade-in {
      opacity: 1;
      transform: translateY(0);
    }

    .quote-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .quote-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #0F9B8E;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .refresh-btn {
      background: none;
      border: none;
      color: #0F9B8E;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: transform 0.3s ease, background 0.2s;
    }
    .refresh-btn:hover {
      background: rgba(15, 155, 142, 0.1);
      transform: rotate(180deg);
    }

    :host .quote-text {
      font-size: 1rem;
      font-style: italic;
      color: var(--text-primary) !important;
      line-height: 1.6;
      margin: 0 0 0.5rem 0;
      transition: opacity 0.3s ease;
    }

    :host .quote-text.fade {
      opacity: 0;
    }

    :host .quote-author {
      font-size: 0.85rem;
      color: var(--text-primary) !important;
      opacity: 0.7;
      margin: 0;
      font-weight: 600;
    }

    @media (prefers-color-scheme: dark) {
      .quote-text { color: #e0e0e0; }
      .quote-author { color: #aaa; }
    }
  `]
})
export class QuoteCardComponent implements OnInit {
  visible = false;
  fading = false;
  currentIndex = 0;

  quotes: Quote[] = [
    { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
    { text: "Develop a passion for learning. If you do, you will never cease to grow.", author: "Anthony J. D'Angelo" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot" },
    { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "In learning you will teach, and in teaching you will learn.", author: "Phil Collins" },
    { text: "Education is the passport to the future.", author: "Malcolm X" },
    { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
    { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
    { text: "The more I learn, the more I realize how much I don't know.", author: "Albert Einstein" },
    { text: "Strive for progress, not perfection.", author: "Unknown" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "Knowledge is the eye of desire and can become the pilot of the soul.", author: "Will Durant" }
  ];

  get current(): Quote {
    return this.quotes[this.currentIndex];
  }

  ngOnInit(): void {
    // Pick quote based on day of year — same quote all day
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.currentIndex = dayOfYear % this.quotes.length;

    // Fade in after a short delay
    setTimeout(() => this.visible = true, 200);
  }

  nextQuote(): void {
    this.fading = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
      this.fading = false;
    }, 300);
  }
}
