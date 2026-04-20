import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompetitionApiService } from '../../services/competition-api.service';
import { Competition, Participant, CreateCompetitionRequest } from '../../models/competition.model';
import { StreamManagerComponent } from '../../components/stream-manager/stream-manager.component';
import { MapPickerComponent, MapLocation } from '../../../../shared/components/map-picker/map-picker.component';

@Component({
  selector: 'app-competition-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, StreamManagerComponent, MapPickerComponent],
  templateUrl: './competition-manage.component.html',
  styleUrls: ['./competition-manage.component.css']
})
export class CompetitionManageComponent implements OnInit {
  competition: Competition | null = null;
  participants: Participant[] = [];
  loading = false;
  error: string | null = null;

  editMode = false;
  editForm: FormGroup;

  showScoreModal = false;
  selectedParticipant: Participant | null = null;
  scoreForm: FormGroup;

  // Stream modal
  showStreamModal = false;

  // Map location
  selectedLat: number | undefined = undefined;
  selectedLng: number | undefined = undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private competitionService: CompetitionApiService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      maxParticipants: [0, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      streamUrl: [''], // Pour les événements ONLINE
      locationName: [''], // Pour les événements PHYSICAL
      locationAddress: [''],
      latitude: [null],
      longitude: [null]
    });

    // ✅ score + rank
    this.scoreForm = this.fb.group({
      score: [0, [Validators.required, Validators.min(0)]],
      rank: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadCompetition(id);
      this.loadParticipants(id);
    }
  }

  loadCompetition(id: number) {
    this.loading = true;
    this.error = null;

    this.competitionService.getCompetitionById(id).subscribe({
      next: (data) => {
        this.competition = data;
        this.editForm.patchValue({
          title: data.title,
          description: data.description,
          status: data.status,
          maxParticipants: data.maxParticipants,
          startDate: this.formatDateForInput(data.startDate),
          endDate: this.formatDateForInput(data.endDate),
          locationName: data.locationName || '',
          locationAddress: data.locationAddress || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null
        });
        
        // Set selected location for map picker
        if (data.latitude && data.longitude) {
          this.selectedLat = data.latitude;
          this.selectedLng = data.longitude;
        }
        
        this.loading = false;
        
        // Charger le stream si événement ONLINE
        if (this.isOnlineEvent()) {
          this.loadStream(id);
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadStream(competitionId: number) {
    this.competitionService.getStream(competitionId).subscribe({
      next: (stream) => {
        this.editForm.patchValue({
          streamUrl: stream.streamUrl
        });
      },
      error: () => {
        // Pas de stream configuré
      }
    });
  }

  loadParticipants(id: number) {
    this.competitionService.getParticipants(id).subscribe({
      next: (data) => {
        this.participants = data ?? [];
      },
      error: (err) => console.error('Erreur chargement participants', err)
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode && this.competition) {
      this.editForm.patchValue({
        title: this.competition.title,
        description: this.competition.description,
        status: this.competition.status,
        maxParticipants: this.competition.maxParticipants,
        startDate: this.formatDateForInput(this.competition.startDate),
        endDate: this.formatDateForInput(this.competition.endDate),
        locationName: this.competition.locationName || '',
        locationAddress: this.competition.locationAddress || '',
        latitude: this.competition.latitude || null,
        longitude: this.competition.longitude || null
      });
      
      // Set selected location for map picker
      if (this.competition.latitude && this.competition.longitude) {
        this.selectedLat = this.competition.latitude;
        this.selectedLng = this.competition.longitude;
      }
    }
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  saveChanges() {
    if (!this.competition || this.editForm.invalid) return;

    const formValue = this.editForm.getRawValue();
    
    // ✅ Construire la requête avec TOUS les champs requis
    const request: Partial<CreateCompetitionRequest> = {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      maxParticipants: formValue.maxParticipants,
      startDate: formValue.startDate ? new Date(formValue.startDate).toISOString().slice(0, 19) : undefined,
      endDate: formValue.endDate ? new Date(formValue.endDate).toISOString().slice(0, 19) : undefined,
      // ✅ IMPORTANT: Garder les champs existants (requis par la DB)
      type: this.competition.type || 'ONLINE',
      participationType: this.competition.participationType || 'INDIVIDUAL',
      numberOfTeams: this.competition.numberOfTeams || undefined,
      participantsPerTeam: this.competition.participantsPerTeam || undefined,
      minTeamSize: this.competition.minTeamSize || undefined,
      maxTeamSize: this.competition.maxTeamSize || undefined,
      // ✅ Location fields for PHYSICAL events
      locationName: formValue.locationName || undefined,
      locationAddress: formValue.locationAddress || undefined,
      latitude: formValue.latitude || undefined,
      longitude: formValue.longitude || undefined
    };

    console.log('📤 Envoi des données:', JSON.stringify(request, null, 2));

    this.competitionService
      .updateCompetition(this.competition.competitionId, request)
      .subscribe({
        next: (updated) => {
          this.competition = updated;
          this.editMode = false;
          
          // Si ONLINE et streamUrl fourni, créer/mettre à jour le stream
          if (this.isOnlineEvent() && formValue.streamUrl) {
            this.competitionService.createOrUpdateStream(
              this.competition.competitionId,
              formValue.streamUrl,
              `Stream - ${this.competition.title}`,
              undefined
            ).subscribe({
              next: () => {
                alert('✅ Modifications et stream enregistrés');
              },
              error: (err) => {
                console.error('❌ Erreur stream:', err);
                alert('✅ Modifications enregistrées (erreur stream)');
              }
            });
          } else {
            alert('✅ Modifications enregistrées');
          }
        },
        error: (err) => {
          console.error('❌ Erreur complète:', err);
          console.error('❌ Status:', err.status);
          console.error('❌ Message:', err.message);
          console.error('❌ Error body:', err.error);
          alert('❌ Erreur lors de la sauvegarde. Vérifiez la console backend.');
        }
      });
  }

  updateStatus(status: string) {
    if (!this.competition) return;
    
    console.log('🔄 Mise à jour statut:', status);
    console.log('📋 Competition ID:', this.competition.competitionId);
    
    if (!confirm(`Changer le statut à ${status} ?`)) return;

    this.competitionService.updateCompetitionStatus(this.competition.competitionId, status).subscribe({
      next: (updated) => {
        console.log('✅ Statut mis à jour:', updated);
        this.competition = updated;
        this.loadCompetition(this.competition.competitionId); // Recharger pour avoir les données à jour
        alert('✅ Statut mis à jour');
      },
      error: (err) => {
        console.error('❌ Erreur mise à jour statut:', err);
        alert('❌ Erreur lors de la mise à jour du statut');
      }
    });
  }

  deleteCompetition() {
    if (!this.competition) return;
    if (!confirm('⚠️ Supprimer cette compétition ? (irréversible)')) return;

    this.competitionService.deleteCompetition(this.competition.competitionId).subscribe({
      next: () => {
        alert('✅ Compétition supprimée');
        this.router.navigate(['/competitions']);
      },
      error: (err) => {
        alert('❌ Erreur lors de la suppression');
        console.error(err);
      }
    });
  }

  openScoreModal(participant: Participant) {
    this.selectedParticipant = participant;

    this.scoreForm.patchValue({
      score: participant.score ?? 0,
      rank: participant.rank ?? 1
    });

    this.showScoreModal = true;
  }

  closeScoreModal() {
    this.showScoreModal = false;
    this.selectedParticipant = null;
    this.scoreForm.reset({ score: 0, rank: 1 });
  }

  updateScore() {
    if (!this.selectedParticipant || this.scoreForm.invalid) return;

    const score = Number(this.scoreForm.value.score);
    const rank = Number(this.scoreForm.value.rank);

    // ✅ IMPORTANT: backend attend registrationId (pas userId)
    const registrationId = this.selectedParticipant.registrationId;

    this.competitionService.updateParticipantScore(registrationId, score, rank).subscribe({
      next: (updated) => {
        const i = this.participants.findIndex(p => p.registrationId === updated.registrationId);
        if (i !== -1) this.participants[i] = { ...this.participants[i], ...updated };

        this.closeScoreModal();
        alert('✅ Score/Rang mis à jour');
      },
      error: (err) => {
        alert('❌ Erreur mise à jour score/rang');
        console.error(err);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      OPEN: 'badge-success',
      CLOSED: 'badge-danger',
      IN_PROGRESS: 'badge-warning',
      COMPLETED: 'badge-info',
      CANCELLED: 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  openStreamModal() {
    this.showStreamModal = true;
  }

  closeStreamModal() {
    this.showStreamModal = false;
  }

  isOnlineEvent(): boolean {
    return this.competition?.type === 'ONLINE';
  }

  isPhysicalEvent(): boolean {
    return this.competition?.type === 'PHYSICAL';
  }

  onLocationSelected(location: MapLocation): void {
    if (location.lat && location.lng) {
      this.editForm.patchValue({
        latitude: location.lat,
        longitude: location.lng
      });
      this.selectedLat = location.lat;
      this.selectedLng = location.lng;
    } else {
      this.editForm.patchValue({ latitude: undefined, longitude: undefined });
      this.selectedLat = undefined;
      this.selectedLng = undefined;
    }
  }
}