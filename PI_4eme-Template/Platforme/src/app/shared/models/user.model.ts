export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  company?: string;
  bio?: string;
  socialLinks?: SocialLink[];
  createdAt: Date;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  CORPORATE_HR = 'CORPORATE_HR',
  RECRUITER = 'RECRUITER'
}

export interface UserProfile extends User {
  completedCourses: number;
  currentCourses: number;
  certifications: number;
  totalXP: number;
  reputation: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}
