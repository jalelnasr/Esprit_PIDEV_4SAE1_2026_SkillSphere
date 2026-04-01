import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompetitionApiService } from '../../services/competition-api.service';
import { CreateCompetitionRequest } from '../../models/competition.model';
import { LocationPickerComponent, SelectedLocation } from '../../../../shared/components/location-picker/location-picker.component';

@Component({
  selector: 'app-competition-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LocationPickerComponent],
  templateUrl: './competition-create.component.html',
  styleUrls: ['./competition-create.component.css']
})
export class CompetitionCreateComponent {
  competitionForm: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;

  // ✅ dates: no past
  minDate = new Date().toISOString().slice(0, 16);
  dateError: string | null = null;

  // ✅ backend enums (keep only if backend supports)
  competitionTypes = [
    { value: 'ONLINE', label: '💻 En ligne' },
    { value: 'PHYSICAL', label: '🏢 Présentiel' }
  ];

  participationTypes = [
    { value: 'INDIVIDUAL', label: '👤 Individuel' },
    { value: 'TEAM', label: '👥 Groupe' }
  ];

  statusOptions = [
    { value: 'OPEN', label: '✅ Ouvert' },
    { value: 'CLOSED', label: '🔒 Fermé' }
  ];

  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionApiService,
    private router: Router
  ) {
    this.competitionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['ONLINE', Validators.required],
      participationType: ['INDIVIDUAL', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],

      // INDIV: editable, TEAM: auto calculated
      maxParticipants: [20, [Validators.required, Validators.min(1)]],

      status: ['OPEN', Validators.required],

      // TEAM fields
      numberOfTeams: [{ value: null, disabled: true }, []],
      participantsPerTeam: [{ value: null, disabled: true }, []],

      // LOCATION fields (PHYSICAL only)
      locationName: [''],
      locationAddress: [''],
      latitude: [null],
      longitude: [null]
    });

    this.setupParticipationTypeBehavior();
    this.setupDateValidation();
    this.checkAuthentication();
  }

  // ------------ auth check (optional, guards already protect) ------------
  private checkAuthentication() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

    if (!token) {
      this.error = '❌ Vous devez être connecté pour créer un événement';
    } else if (role !== 'FORMATEUR') {
      this.error = '❌ Seuls les FORMATEURS peuvent créer des événements';
    }
  }

  // ------------ ParticipationType: TEAM => enable fields + auto-calc maxParticipants ------------
  private setupParticipationTypeBehavior() {
    const participationTypeCtrl = this.competitionForm.get('participationType');
    const numberOfTeamsCtrl = this.competitionForm.get('numberOfTeams');
    const participantsPerTeamCtrl = this.competitionForm.get('participantsPerTeam');
    const maxParticipantsCtrl = this.competitionForm.get('maxParticipants');

    // when switch type
    participationTypeCtrl?.valueChanges.subscribe((value) => {
      if (value === 'TEAM') {
        numberOfTeamsCtrl?.enable();
        participantsPerTeamCtrl?.enable();

        // ✅ required in TEAM
        numberOfTeamsCtrl?.setValidators([Validators.required, Validators.min(1)]);
        participantsPerTeamCtrl?.setValidators([Validators.required, Validators.min(1)]);
        numberOfTeamsCtrl?.updateValueAndValidity();
        participantsPerTeamCtrl?.updateValueAndValidity();

        // ✅ auto-calc total, disable input
        maxParticipantsCtrl?.disable();

        // default values
        if (!numberOfTeamsCtrl?.value) numberOfTeamsCtrl?.setValue(5);
        if (!participantsPerTeamCtrl?.value) participantsPerTeamCtrl?.setValue(4);

        this.recalcMaxParticipants();
      } else {
        // INDIVIDUAL
        numberOfTeamsCtrl?.disable();
        participantsPerTeamCtrl?.disable();

        numberOfTeamsCtrl?.clearValidators();
        participantsPerTeamCtrl?.clearValidators();
        numberOfTeamsCtrl?.updateValueAndValidity();
        participantsPerTeamCtrl?.updateValueAndValidity();

        // allow edit
        maxParticipantsCtrl?.enable();

        // optional cleanup
        numberOfTeamsCtrl?.setValue(null);
        participantsPerTeamCtrl?.setValue(null);
      }
    });

    // recalc when values change
    numberOfTeamsCtrl?.valueChanges.subscribe(() => this.recalcMaxParticipants());
    participantsPerTeamCtrl?.valueChanges.subscribe(() => this.recalcMaxParticipants());

    // initial state
    if (participationTypeCtrl?.value === 'TEAM') {
      maxParticipantsCtrl?.disable();
      this.recalcMaxParticipants();
    }
  }

  private recalcMaxParticipants() {
    const type = this.competitionForm.get('participationType')?.value;
    if (type !== 'TEAM') return;

    const t = Number(this.competitionForm.get('numberOfTeams')?.value || 0);
    const p = Number(this.competitionForm.get('participantsPerTeam')?.value || 0);

    if (t > 0 && p > 0) {
      // maxParticipants is disabled => must use setValue safely
      this.competitionForm.get('maxParticipants')?.setValue(t * p, { emitEvent: false });
    } else {
      this.competitionForm.get('maxParticipants')?.setValue(0, { emitEvent: false });
    }
  }

  // ------------ dates validation (no past + end > start) ------------
  private setupDateValidation() {
    this.competitionForm.valueChanges.subscribe(() => {
      this.dateError = null;

      const s = this.competitionForm.get('startDate')?.value;
      const e = this.competitionForm.get('endDate')?.value;

      if (!s || !e) return;

      const start = new Date(s);
      const end = new Date(e);
      const now = new Date();

      if (start < now) {
        this.dateError = 'La date de début ne peut pas être dans le passé';
        return;
      }
      if (end <= start) {
        this.dateError = 'La date de fin doit être supérieure à la date de début';
        return;
      }
    });
  }

  onSubmit() {
    if (this.competitionForm.invalid) {
      this.markFormGroupTouched(this.competitionForm);
      return;
    }
    if (this.dateError) {
      this.error = `❌ ${this.dateError}`;
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.competitionForm.getRawValue();

    const request: CreateCompetitionRequest = {
      title: formValue.title,
      description: formValue.description,
      type: formValue.type,
      participationType: formValue.participationType,
      // ✅ Ajouter les secondes au format de date
      startDate: formValue.startDate ? formValue.startDate + ':00' : undefined,
      endDate: formValue.endDate ? formValue.endDate + ':00' : undefined,
      maxParticipants: formValue.maxParticipants,
      status: formValue.status
    };

    // TEAM extra fields
    if (formValue.participationType === 'TEAM') {
      request.numberOfTeams = formValue.numberOfTeams;
      request.participantsPerTeam = formValue.participantsPerTeam;
      request.maxParticipants = (Number(formValue.numberOfTeams) || 0) * (Number(formValue.participantsPerTeam) || 0);
    }

    // LOCATION fields (PHYSICAL only)
    if (formValue.type === 'PHYSICAL') {
      request.locationName = formValue.locationName;
      request.locationAddress = formValue.locationAddress;
      request.latitude = formValue.latitude ? Number(formValue.latitude) : null;
      request.longitude = formValue.longitude ? Number(formValue.longitude) : null;
    }

    this.competitionService.createCompetition(request).subscribe({
      next: (competition) => {
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/competitions', competition.competitionId]);
        }, 800);
      },
      error: (err) => {
        console.error('Erreur complète:', err);

        if (err.status === 401) {
          this.error = '❌ Non autorisé : connectez-vous avec un compte FORMATEUR';
        } else if (err.status === 403) {
          this.error = '❌ Accès refusé : Seuls les FORMATEURS peuvent créer';
        } else if (err.status === 0) {
          this.error = '❌ Erreur de connexion : Vérifiez que le backend est démarré';
        } else {
          this.error = `❌ Erreur lors de la création : ${err.error?.message || err.message || 'Erreur inconnue'}`;
        }

        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.competitionForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.competitionForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['min']) return `Valeur minimale: ${field.errors['min'].min}`;
    }
    return '';
  }

  cancel() {
    this.router.navigate(['/competitions']);
  }

  onLocationSelected(loc: SelectedLocation) {
    if (loc.latitude && loc.longitude) {
      this.competitionForm.patchValue({
        locationName: loc.locationName,
        locationAddress: loc.locationAddress,
        latitude: loc.latitude,
        longitude: loc.longitude
      });
    } else {
      this.competitionForm.patchValue({
        locationName: '', locationAddress: '', latitude: null, longitude: null
      });
    }
  }
}