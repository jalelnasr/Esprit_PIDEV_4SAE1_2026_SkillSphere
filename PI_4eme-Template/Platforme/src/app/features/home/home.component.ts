import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthModalComponent } from '../../shared/components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AuthModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isDarkMode = false;
  showAuthModal = false;
  authModalMode: 'login' | 'register' = 'login';
  
  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }
  features = [
    {
      icon: '📚',
      title: 'Complete Courses',
      description: 'Access 1000+ professional courses covering all in-demand skills and fields'
    },
    {
      icon: '🏆',
      title: 'Recognized Certifications',
      description: 'Earn verifiable certificates accepted by employers worldwide'
    },
    {
      icon: '👥',
      title: 'Active Community',
      description: 'Connect with 500K+ learners from around the globe'
    },
    {
      icon: '⏱️',
      title: 'Flexible Learning',
      description: 'Learn at your own pace, 24/7, on desktop, tablet or mobile'
    },
    {
      icon: '🎮',
      title: 'Gamification Features',
      description: 'Earn points, unlock badges, and climb the global leaderboard'
    },
    {
      icon: '💼',
      title: 'B2B Solutions',
      description: 'Train your teams with our enterprise-grade solutions'
    }
  ];

  stats = [
    { value: '500K+', label: 'Active Learners' },
    { value: '1000+', label: 'Quality Courses' },
    { value: '95%', label: 'Client Satisfaction' },
    { value: '150+', label: 'Certifications' }
  ];

  testimonials = [
    {
      name: 'Sarah Ahmed',
      role: 'Web Developer - Tunisia',
      text: 'SkillSphere completely transformed my career. The courses are practical and engaging, and I landed a job within 3 months of completing my certification.',
      avatar: '👩‍💻'
    },
    {
      name: 'Mohamed Ben Ali',
      role: 'Data Scientist - Morocco',
      text: 'The best training platform available. The instructors are excellent and support is always there. I highly recommend it to anyone serious about learning!',
      avatar: '👨‍💻'
    },
    {
      name: 'Fatima Hassan',
      role: 'Product Manager - Algeria',
      text: 'Exceptional value for money. I completed 5 courses and significantly improved my skills. Highly recommended for professionals!',
      avatar: '👩‍💼'
    }
  ];

  scrollToSection(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  openAuthModal(mode: 'login' | 'register') {
    this.authModalMode = mode;
    this.showAuthModal = true;
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }
}
