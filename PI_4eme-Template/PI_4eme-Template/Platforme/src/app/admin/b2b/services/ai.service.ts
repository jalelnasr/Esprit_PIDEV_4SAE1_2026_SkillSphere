import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AIMatchScore {
  score: number;
  level: string;
  recommendation: string;
  details: {
    candidateSkills: string;
    candidateExperience: number;
    missionSkills: string;
    missionExperience: number;
    proposedRate: number;
    missionBudget: number;
  };
}

export interface AIRecommendation {
  score: string;
  level: string;
  recommendation: string;
}

export interface AIHealthCheck {
  status: string;
  message: string;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = 'http://localhost:8083/api/b2b/ai';

  constructor(private http: HttpClient) {}

  /**
   * Calculer le score de matching entre un candidat et une mission
   */
  calculateMatchScore(
    candidateSkills: string,
    candidateExperience: number,
    missionSkills: string,
    missionExperience: number,
    proposedRate: number,
    missionBudget: number
  ): Observable<AIMatchScore> {
    const params = {
      candidateSkills,
      candidateExperience: candidateExperience.toString(),
      missionSkills,
      missionExperience: missionExperience.toString(),
      proposedRate: proposedRate.toString(),
      missionBudget: missionBudget.toString()
    };

    return this.http.get<AIMatchScore>(`${this.apiUrl}/match-score`, { params });
  }

  /**
   * Obtenir une recommandation basée sur un score
   */
  getRecommendation(score: number): Observable<AIRecommendation> {
    return this.http.get<AIRecommendation>(`${this.apiUrl}/recommendation/${score}`);
  }

  /**
   * Vérifier que le module IA est opérationnel
   */
  healthCheck(): Observable<AIHealthCheck> {
    return this.http.get<AIHealthCheck>(`${this.apiUrl}/health`);
  }

  /**
   * Obtenir le texte de recommandation basé sur le score (version locale)
   */
  getRecommendationText(score: number): string {
    if (score >= 80) {
      return '🌟 Candidat hautement recommandé ! Profil parfaitement aligné avec la mission.';
    } else if (score >= 60) {
      return '✅ Bon candidat. Profil compatible avec quelques ajustements possibles.';
    } else if (score >= 40) {
      return '⚠️ Candidat acceptable. Vérifier les compétences clés avant validation.';
    } else {
      return '❌ Compatibilité faible. Candidat peu adapté à cette mission.';
    }
  }

  /**
   * Obtenir le niveau basé sur le score
   */
  getScoreLevel(score: number): string {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'BON';
    if (score >= 40) return 'MOYEN';
    return 'FAIBLE';
  }
}
