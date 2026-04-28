// ============================================================================
// B2B MODULE - ALL MODELS / INTERFACES
// ============================================================================

// ---- Company ----
export interface Company {
  id: number;
  name: string;
  email: string;
  siret: string;
  sector: string;
  address: string;
  phone: string;
  creditsRemaining: number;
  createdBy: number;
  createdAt: string;
  employeeCount: number;
}

export interface CompanyRequest {
  name: string;
  email: string;
  siret: string;
  sector: string;
  address: string;
  phone: string;
  createdBy: number;
}

// ---- Employee ----
export interface Employee {
  id: number;
  companyId: number;
  companyName: string;
  department: string;
  position: string;
  managerId: number | null;
  hireDate: string;
}

export interface EmployeeRequest {
  id: number;
  companyId: number;
  department: string;
  position: string;
  managerId?: number | null;
}

// ---- Pack ----
export interface Pack {
  id: number;
  name: string;
  description: string;
  formationsCount: number;
  price: number;
  isActive: boolean;
}

export interface PackRequest {
  name: string;
  description: string;
  formationsCount: number;
  price: number;
  isActive: boolean;
}

// ---- Pack Purchase ----
export interface PackPurchase {
  id: number;
  companyId: number;
  companyName: string;
  packId: number;
  packName: string;
  totalAmount: number;
  purchaseDate: string;
}

export interface PackPurchaseRequest {
  companyId: number;
  packId: number;
}

// ---- Assignment ----
export type AssignmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Assignment {
  id: number;
  companyId: number;
  employeeId: number;
  packId: number;
  packName: string;
  courseName: string;
  deadline: string;
  status: AssignmentStatus;
  progressPercent: number;
}

export interface AssignmentRequest {
  companyId: number;
  employeeId: number;
  packId: number;
  courseName: string;
  deadline: string;
}

// ---- Progress ----
export interface Progress {
  assignmentId: number;
  progressPercent: number;
  passed: boolean;
}

// ---- Job Offer ----
export type JobOfferStatus = 'OPEN' | 'CLOSED' | 'FILLED';

export interface JobOffer {
  id: number;
  companyId: number;
  companyName: string;
  title: string;
  description: string;
  contractType: string;
  location: string;
  requiredSkills: string[];
  status: JobOfferStatus;
  postedAt: string;
  applicationCount: number;
}

export interface JobOfferRequest {
  companyId: number;
  title: string;
  description: string;
  contractType: string;
  location: string;
  requiredSkills: string[];
}

// ---- Candidate ----
export interface Candidate {
  id: number;
  title: string;
  skills: string[];
  experienceYears: number;
  resumeUrl: string;
  isLookingForJob: boolean;
}

export interface CandidateRequest {
  id: number;
  title: string;
  skills: string[];
  experienceYears: number;
  resumeUrl?: string; // Made optional
  isLookingForJob: boolean;
}

// ---- Application (Candidature) ----
export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: number;
  jobOfferId: number;
  jobOfferTitle: string;
  candidateId: number;
  candidateTitle: string;
  candidateEmail?: string; // Email du candidat pour les notifications
  matchScore: number;
  status: ApplicationStatus;
  appliedAt: string;
  companyName?: string; // Nom de l'entreprise pour les notifications
}

export interface ApplicationRequest {
  jobOfferId: number;
  candidateId: number;
}

// ---- Mission (Freelance) ----
export type MissionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Mission {
  id: number;
  companyId: number;
  companyName: string;
  title: string;
  description: string;
  durationWeeks: number;  // Changed from duration: string
  dailyRate: number;      // Changed from budget: number
  requiredSkills: string; // Changed from string[] to string (comma-separated)
  status: MissionStatus;
  applicationCount: number;
}

export interface MissionRequest {
  companyId: number;
  title: string;
  description: string;
  durationWeeks: number;  // Changed from duration: string
  dailyRate: number;      // Changed from budget: number
  requiredSkills: string; // Changed from string[] to string
}

export interface MissionApplyRequest {
  missionId: number;
  candidateId: number;
  proposedRate: number;
}

export type MissionApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface MissionApplication {
  id: number;
  missionId: number;
  missionTitle?: string;  // Added for frontend display
  candidateId: number;
  candidateTitle: string;
  proposedRate: number;
  status: MissionApplicationStatus;
  appliedAt: string;
  matchingScore?: number;  // Score de matching AI (0-100)
  matchingRecommendation?: string;  // Recommandation textuelle
}

// ---- Contract ----
export type ContractStatus = 'PENDING' | 'DRAFT' | 'SIGNED' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED';

export interface Contract {
  id: number;
  contractNumber: string;
  missionId: number;
  missionTitle: string;
  candidateId: number;
  freelancerName: string;
  companyId: number;
  companyName: string;
  amount: number;
  startDate: string;
  endDate: string;
  contractUrl: string;
  status: ContractStatus;
  signedAt: string | null;
  signatureData?: string; // Base64 encoded signature
}

export interface ContractRequest {
  missionId: number;
  candidateId: number;
  companyId: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
}
