export type BackendRole = 'APPRENANT' | 'FORMATEUR' | 'RH_ENTREPRISE' | 'ADMIN';

export interface BackendUser {
  idUser: number;
  nom: string;     // backend: nom
  prenom: string;  // backend: prenom
  email: string;
  role: BackendRole;
  phone?: string | null;
  adresse?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  phone?: string | null;
  adresse?: string | null;
}

/**
 * MUST match your Spring Boot AuthResponse:
 * token, idUser, nom, prenom, email, role
 */
export interface AuthResponse {
  token: string;
  jwt?: string;
  idUser?: number;
  userId?: number;
  nom: string;
  prenom: string;
  email: string;
  role: BackendRole;
}