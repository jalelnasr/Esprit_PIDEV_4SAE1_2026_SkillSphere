import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats = [
    {
      icon: '👥',
      title: 'Total Users',
      value: '12,543',
      change: '+5.2%',
      color: 'primary'
    },
    {
      icon: '📚',
      title: 'Active Courses',
      value: '543',
      change: '+2.1%',
      color: 'success'
    },
    {
      icon: '📊',
      title: 'Revenue',
      value: '$45,230',
      change: '+8.5%',
      color: 'warning'
    },
    {
      icon: '🎓',
      title: 'Certifications',
      value: '2,341',
      change: '+12.3%',
      color: 'info'
    }
  ];

  recentActivities = [
    { action: 'New user registered', user: 'Sarah Ahmed', time: '5 minutes ago', icon: '👤' },
    { action: 'Course completed', user: 'Mohamed Ali', time: '12 minutes ago', icon: '✅' },
    { action: 'Payment received', user: 'Fatima Hassan', time: '1 hour ago', icon: '💳' },
    { action: 'Support ticket opened', user: 'Ibrahim Hassan', time: '2 hours ago', icon: '🎫' },
    { action: 'New course published', user: 'System Admin', time: '3 hours ago', icon: '📝' }
  ];

  topCourses = [
    { name: 'Web Development Masterclass', students: 2543, rating: 4.8 },
    { name: 'Data Science Fundamentals', students: 1891, rating: 4.7 },
    { name: 'UI/UX Design Advanced', students: 1654, rating: 4.9 },
    { name: 'Cloud Computing Basics', students: 1432, rating: 4.6 },
    { name: 'AI & Machine Learning Pro', students: 1203, rating: 4.8 }
  ];

  ngOnInit() {
    // Load dashboard data
  }

  getStatColor(colorClass: string): string {
    const colors: any = {
      'primary': '#0891b2',
      'success': '#10b981',
      'warning': '#f59e0b',
      'info': '#06b6d4'
    };
    return colors[colorClass] || colors['primary'];
  }
}
