export type UiRole = 'learner' | 'instructor' | 'enterprise' | 'admin';
export type BackendRole = 'APPRENANT' | 'FORMATEUR' | 'RH_ENTREPRISE' | 'ADMIN' | 'MANAGER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: BackendRole;

  phone?: string | null;
  adresse?: string | null;
  isActive?: boolean | null;
}

export interface BackendUser {
  idUser: number;

  // backend fields
  nom: string;
  prenom: string;
  email: string;
  role: BackendRole;

  phone?: string | null;
  adresse?: string | null;
  isActive?: boolean | null;
  createdAt?: string;
  companyId?: number;

  // frontend aliases (pour templates)
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  user: BackendUser;
  message: string;
}

export function uiRoleToBackend(role: UiRole): BackendRole {
  switch (role) {
    case 'learner': return 'APPRENANT';
    case 'instructor': return 'FORMATEUR';
    case 'enterprise': return 'RH_ENTREPRISE';
    case 'admin': return 'ADMIN';
    default: return 'APPRENANT';
  }
}

export function backendRoleToUi(role: BackendRole): UiRole {
  switch (role) {
    case 'APPRENANT': return 'learner';
    case 'FORMATEUR': return 'instructor';
    case 'RH_ENTREPRISE': return 'enterprise';
    case 'ADMIN': return 'admin';
    case 'MANAGER': return 'enterprise';
    default: return 'learner';
  }
}
