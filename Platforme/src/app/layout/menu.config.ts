export type BackendRole = 'APPRENANT' | 'FORMATEUR' | 'RH_ENTREPRISE' | 'ADMIN';

export interface SubItem {
  label: string;
  route: string;
  roles?: BackendRole[];
}

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string | null;
  roles: BackendRole[];
  subItems?: SubItem[];
}

export const ALL_MENU_ITEMS: MenuItem[] = [
  { icon: '🏠', label: 'Home', route: '/dashboard', badge: null, roles: ['APPRENANT', 'FORMATEUR', 'RH_ENTREPRISE'] },

  {
    icon: '📚',
    label: 'Learning',
    route: '/learning',
    roles: ['APPRENANT', 'FORMATEUR'],
    subItems: [
      { label: 'Browse Courses', route: '/learning/browse' },
      { label: 'My Courses', route: '/learning/my-courses' },
      { label: 'Wishlist', route: '/learning/wishlist' }
    ]
  },

  {
    icon: '📝',
    label: 'Evaluations',
    route: '/formateur/evaluations',
    roles: ['FORMATEUR', 'APPRENANT'],
    subItems: [
      { label: 'Browse Evaluations', route: '/apprenant/evaluations/quizzes', roles: ['APPRENANT'] },
      { label: 'List Evaluations', route: '/formateur/evaluations', roles: ['FORMATEUR'] },
      { label: 'Add Evaluation', route: '/formateur/evaluations/create', roles: ['FORMATEUR'] }
    ]
  },

  {
    icon: '🎓',
    label: 'Certification',
    route: '/certification',
    roles: ['APPRENANT', 'FORMATEUR'],
    subItems: [
      { label: 'Exams', route: '/certification/exams', roles: ['APPRENANT', 'FORMATEUR'] },
      { label: 'My Certificates', route: '/certification/certificates', roles: ['APPRENANT'] },
      { label: 'Certificate Requests', route: '/certification/requests', roles: ['FORMATEUR'] }
    ]
  },

  {
    icon: '🏢',
    label: 'Corporate',
    route: '/corporate',
    roles: ['RH_ENTREPRISE'],
    subItems: [
      { label: 'Dashboard', route: '/corporate/dashboard' },
      { label: 'Team Management', route: '/corporate/teams' }
    ]
  },

  {
    icon: '🎮',
    label: 'Gamification',
    route: '/gamification',
    roles: ['APPRENANT', 'FORMATEUR'],
    subItems: [
      { label: 'Labs', route: '/gamification/labs' },
      { label: 'Leaderboard', route: '/gamification/leaderboard' }
    ]
  },

  {
    icon: '👥',
    label: 'Community',
    route: '/community',
    roles: ['APPRENANT', 'FORMATEUR', 'RH_ENTREPRISE'],
    subItems: [
      { label: 'Feed', route: '/community/feed' },
      { label: 'Q&A', route: '/community/qa' },
      { label: 'Groups', route: '/community/groups' }
    ]
  },

  {
    icon: '🎪',
    label: 'Events',
    route: '/events',
    roles: ['APPRENANT', 'FORMATEUR', 'RH_ENTREPRISE'],
    subItems: [
      { label: 'Browse Events', route: '/events/browse' },
      { label: 'My Events', route: '/events/my-events' }
    ]
  }
];
