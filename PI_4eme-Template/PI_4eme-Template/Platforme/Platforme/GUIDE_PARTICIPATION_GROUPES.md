# Guide: Participation Individuelle et en Groupe

## 🎯 Fonctionnalités à Implémenter

### 1. Participation Individuelle
- ✅ Vérifier que la compétition n'a pas atteint le max de participants
- ✅ Afficher le nombre de places restantes
- ✅ Désactiver le bouton "S'inscrire" si complet

### 2. Participation en Groupe
- ✅ Le formateur définit: nombre de groupes + participants par groupe
- ✅ L'apprenant voit les groupes disponibles
- ✅ L'apprenant peut rejoindre un groupe non complet
- ✅ Affichage des membres de chaque groupe

---

## 📊 Modifications Backend (IntelliJ)

### Étape 1: Modifier l'Entité Competition

Ajoutez ces champs dans `Competition.java`:

```java
// Type de participation
@Column(name = "participation_type")
@Enumerated(EnumType.STRING)
private ParticipationType participationType; // INDIVIDUAL ou TEAM

// Pour les compétitions en équipe
@Column(name = "number_of_teams")
private Integer numberOfTeams;

@Column(name = "participants_per_team")
private Integer participantsPerTeam;

public enum ParticipationType {
    INDIVIDUAL, TEAM
}
```

### Étape 2: Créer l'Entité Team

Créez `Team.java`:

```java
@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;
    
    @Column(nullable = false)
    private String teamName;
    
    @ManyToOne
    @JoinColumn(name = "competition_id")
    private Competition competition;
    
    @Column(name = "max_members")
    private Integer maxMembers;
    
    @Column(name = "current_members")
    private Integer currentMembers = 0;
    
    // Getters/Setters
}
```

### Étape 3: Créer l'Entité TeamMember

Créez `TeamMember.java`:

```java
@Entity
@Table(name = "team_members")
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
    
    // Getters/Setters
}
```

---

## 🔧 Endpoints Backend à Créer

### CompetitionController

```java
// Obtenir les détails avec places disponibles
@GetMapping("/{id}/availability")
public ResponseEntity<CompetitionAvailability> getAvailability(@PathVariable Long id) {
    // Retourne: places restantes, groupes disponibles, etc.
}

// Obtenir les groupes d'une compétition
@GetMapping("/{id}/teams")
public ResponseEntity<List<TeamDTO>> getTeams(@PathVariable Long id) {
    // Retourne la liste des groupes avec leurs membres
}

// Rejoindre un groupe
@PostMapping("/teams/{teamId}/join")
public ResponseEntity<TeamMember> joinTeam(
    @PathVariable Long teamId,
    @RequestHeader("Authorization") String token
) {
    // Ajoute l'utilisateur au groupe
}

// Quitter un groupe
@DeleteMapping("/teams/{teamId}/leave")
public ResponseEntity<Void> leaveTeam(
    @PathVariable Long teamId,
    @RequestHeader("Authorization") String token
) {
    // Retire l'utilisateur du groupe
}
```

---

Continuez dans le fichier suivant...

## 🎨 Frontend Angular - Modifications

### 1. Mettre à Jour le Modèle Competition

Fichier: `src/app/features/competitions/models/competition.model.ts`

```typescript
export interface Competition {
  competitionId: number;
  title: string;
  description: string;
  type: 'ONLINE' | 'PHYSICAL';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants?: number; // Nombre actuel
  status: 'OPEN' | 'CLOSED';
  
  // NOUVEAU: Pour les groupes
  participationType: 'INDIVIDUAL' | 'TEAM';
  numberOfTeams?: number;
  participantsPerTeam?: number;
}

export interface Team {
  teamId: number;
  teamName: string;
  competitionId: number;
  maxMembers: number;
  currentMembers: number;
  members: TeamMember[];
  isFull: boolean;
}

export interface TeamMember {
  id: number;
  userId: number;
  userName: string;
  joinedAt: string;
}

export interface CompetitionAvailability {
  competitionId: number;
  isOpen: boolean;
  hasPlaces: boolean;
  placesRemaining: number;
  participationType: 'INDIVIDUAL' | 'TEAM';
  teams?: Team[];
}
```

### 2. Mettre à Jour le Service API

Fichier: `src/app/features/competitions/services/competition-api.service.ts`

Ajoutez ces méthodes:

```typescript
// Vérifier la disponibilité
getAvailability(competitionId: number): Observable<CompetitionAvailability> {
  return this.http.get<CompetitionAvailability>(
    `${this.baseUrl}/competitions/${competitionId}/availability`
  );
}

// Obtenir les groupes
getTeams(competitionId: number): Observable<Team[]> {
  return this.http.get<Team[]>(
    `${this.baseUrl}/competitions/${competitionId}/teams`
  );
}

// Rejoindre un groupe
joinTeam(teamId: number): Observable<TeamMember> {
  return this.http.post<TeamMember>(
    `${this.baseUrl}/competitions/teams/${teamId}/join`,
    {}
  );
}

// Quitter un groupe
leaveTeam(teamId: number): Observable<void> {
  return this.http.delete<void>(
    `${this.baseUrl}/competitions/teams/${teamId}/leave`
  );
}
```

---

Continuez...


## 🎨 Utilisation du Composant Team Selection

### Dans competition-detail.component.ts

```typescript
import { TeamSelectionComponent } from '../../components/team-selection/team-selection.component';

export class CompetitionDetailComponent implements OnInit {
  competition: Competition | null = null;
  availability: CompetitionAvailability | null = null;
  teams: Team[] = [];
  currentUserId: number | null = null;
  userTeamId: number | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadCompetition(id);
    this.loadAvailability(id);
    this.currentUserId = this.authService.getCurrentUser()?.userId || null;
  }

  loadAvailability(competitionId: number): void {
    this.competitionService.getAvailability(competitionId).subscribe({
      next: (data) => {
        this.availability = data;
        if (data.participationType === 'TEAM') {
          this.loadTeams(competitionId);
        }
      }
    });
  }

  loadTeams(competitionId: number): void {
    this.competitionService.getTeams(competitionId).subscribe({
      next: (teams) => {
        this.teams = teams;
        // Trouver le groupe de l'utilisateur
        const userTeam = teams.find(t => 
          t.members.some(m => m.userId === this.currentUserId)
        );
        this.userTeamId = userTeam?.teamId || null;
      }
    });
  }

  onJoinTeam(teamId: number): void {
    this.competitionService.joinTeam(teamId).subscribe({
      next: () => {
        this.toastService.success('Vous avez rejoint le groupe!');
        this.loadTeams(this.competition!.competitionId);
      },
      error: () => {
        this.toastService.error('Erreur lors de l\'inscription au groupe');
      }
    });
  }

  onLeaveTeam(teamId: number): void {
    this.competitionService.leaveTeam(teamId).subscribe({
      next: () => {
        this.toastService.success('Vous avez quitté le groupe');
        this.loadTeams(this.competition!.competitionId);
      },
      error: () => {
        this.toastService.error('Erreur lors de la sortie du groupe');
      }
    });
  }
}
```

### Dans competition-detail.component.html

```html
<div class="competition-detail">
  <!-- Info de la compétition -->
  <div class="competition-header">
    <h1>{{ competition?.title }}</h1>
    <p>{{ competition?.description }}</p>
  </div>

  <!-- Participation Individuelle -->
  <div *ngIf="competition?.participationType === 'INDIVIDUAL'" class="participation-section">
    <h3>Participation Individuelle</h3>
    
    <div class="availability-info">
      <span class="places-remaining">
        {{ availability?.placesRemaining }} places restantes
      </span>
    </div>

    <button *ngIf="availability?.hasPlaces" 
            class="btn-register"
            (click)="registerIndividual()">
      S'inscrire
    </button>

    <div *ngIf="!availability?.hasPlaces" class="alert-full">
      ⚠️ Cette compétition est complète
    </div>
  </div>

  <!-- Participation en Groupe -->
  <div *ngIf="competition?.participationType === 'TEAM'" class="participation-section">
    <h3>Participation en Groupe</h3>
    
    <app-team-selection
      [teams]="teams"
      [currentUserId]="currentUserId"
      [userTeamId]="userTeamId"
      (joinTeam)="onJoinTeam($event)"
      (leaveTeam)="onLeaveTeam($event)">
    </app-team-selection>
  </div>
</div>
```

---

## 📝 Formulaire de Création (FORMATEUR)

### Dans competition-create.component.html

Ajoutez ces champs:

```html
<form [formGroup]="competitionForm" (ngSubmit)="onSubmit()">
  <!-- Champs existants... -->

  <!-- Type de Participation -->
  <div class="form-group">
    <label>Type de Participation</label>
    <select formControlName="participationType" (change)="onParticipationTypeChange()">
      <option value="INDIVIDUAL">Individuelle</option>
      <option value="TEAM">En Groupe</option>
    </select>
  </div>

  <!-- Si Individuelle -->
  <div *ngIf="participationType.value === 'INDIVIDUAL'" class="form-group">
    <label>Nombre Maximum de Participants</label>
    <input type="number" formControlName="maxParticipants" min="1">
  </div>

  <!-- Si en Groupe -->
  <div *ngIf="participationType.value === 'TEAM'">
    <div class="form-group">
      <label>Nombre de Groupes</label>
      <input type="number" formControlName="numberOfTeams" min="1">
    </div>

    <div class="form-group">
      <label>Participants par Groupe</label>
      <input type="number" formControlName="participantsPerTeam" min="1">
    </div>
  </div>

  <button type="submit">Créer la Compétition</button>
</form>
```

---

## ✅ Résumé des Fonctionnalités

### Pour l'APPRENANT:
1. ✅ Voir si une compétition a des places disponibles
2. ✅ S'inscrire individuellement si places disponibles
3. ✅ Voir tous les groupes disponibles (cartes visuelles)
4. ✅ Voir les membres de chaque groupe
5. ✅ Rejoindre un groupe non complet
6. ✅ Quitter son groupe
7. ✅ Ne peut rejoindre qu'un seul groupe

### Pour le FORMATEUR:
1. ✅ Choisir le type de participation (Individuelle/Groupe)
2. ✅ Définir le nombre de groupes
3. ✅ Définir le nombre de participants par groupe
4. ✅ Les groupes sont créés automatiquement

---

## 🎯 Prochaines Étapes

1. **Backend (IntelliJ):**
   - Modifier `Competition.java` (ajouter les champs)
   - Créer `Team.java` et `TeamMember.java`
   - Créer les endpoints dans `CompetitionController`
   - Créer `TeamService` pour la logique métier

2. **Frontend (Ici):**
   - Mettre à jour `competition.model.ts`
   - Mettre à jour `competition-api.service.ts`
   - Intégrer `TeamSelectionComponent` dans `competition-detail`
   - Mettre à jour le formulaire de création

3. **Tests:**
   - Créer une compétition en groupe
   - Vérifier que les groupes sont créés
   - Tester l'inscription à un groupe
   - Vérifier les limites (groupe complet, déjà inscrit)

Voulez-vous que je vous aide avec une partie spécifique?
