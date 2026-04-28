import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { B2bMissionService } from '../services/mission.service';
import { B2bCompanyService } from '../services/company.service';
import { Mission, MissionRequest, Company } from '../models/b2b.models';

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mission-form.component.html',
  styleUrls: ['./mission-form.component.css']
})
export class MissionFormComponent implements OnInit {
  isEdit = false;
  missionId: number = 0;
  companies: Company[] = [];
  newSkill = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;

  form: MissionRequest = {
    companyId: 0,
    title: '',
    description: '',
    duration: '',
    budget: 0,
    requiredSkills: []
  };

  constructor(
    private missionService: B2bMissionService,
    private companyService: B2bCompanyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.missionId = +id;
      this.loadMission();
    }
  }

  loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (data) => {
        this.companies = data;
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }

  loadMission(): void {
    this.loading = true;
    this.missionService.getById(this.missionId).subscribe({
      next: (mission) => {
        this.form = {
          companyId: mission.companyId,
          title: mission.title,
          description: mission.description,
          duration: mission.duration,
          budget: mission.budget,
          requiredSkills: this.parseSkills(mission.requiredSkills)
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la mission';
        console.error('Error loading mission:', err);
        this.loading = false;
      }
    });
  }

  addSkill(): void {
    const skill = this.newSkill.trim();
    if (skill && !this.form.requiredSkills.includes(skill)) {
      this.form.requiredSkills.push(skill);
      this.newSkill = '';
    }
  }

  removeSkill(index: number): void {
    this.form.requiredSkills.splice(index, 1);
  }

  onSubmit(): void {
    if (!this.isValid()) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const request = this.isEdit
      ? this.missionService.update(this.missionId, this.form)
      : this.missionService.create(this.form);

    request.subscribe({
      next: () => {
        this.success = this.isEdit ? 'Mission mise à jour avec succès' : 'Mission créée avec succès';
        setTimeout(() => {
          this.router.navigate(['/admin/b2b/missions']);
        }, 1500);
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'enregistrement de la mission';
        console.error('Error saving mission:', err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/b2b/missions']);
  }

  isValid(): boolean {
    return this.form.companyId > 0 &&
           this.form.title.trim() !== '' &&
           this.form.description.trim() !== '' &&
           this.form.duration.trim() !== '' &&
           this.form.budget > 0;
  }

  parseSkills(skills: string[] | string): string[] {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
  }
}
