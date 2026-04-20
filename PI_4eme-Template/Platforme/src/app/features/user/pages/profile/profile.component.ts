import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '@core/services';

type Role = 'ADMIN' | 'FORMATEUR' | 'APPRENANT' | 'RH_ENTREPRISE';

interface UserResponse {
  idUser: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  phone?: string | null;
  adresse?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;

  // UI user object (keeps your design working)
  user = {
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: 'Passionate about learning and professional development',
    avatar: '', // Will be set dynamically with initials
    joinDate: '',
    courses: 0,
    certificates: 0,
    xp: 0
  };

  private me: UserResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private http: HttpClient,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadMe();
  }

  initializeForm() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // UI only
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]], // read-only
      phone: [''],
      location: [''], // maps to adresse
      bio: ['', Validators.maxLength(500)] // UI only
    });
  }

  // ✅ GET /users/me
  loadMe(): void {
    this.loading = true;

    this.http.get<UserResponse>(`${environment.apiUrl}/users/me`).subscribe({
      next: (u) => {
        this.me = u;

        // map backend -> UI
        const fullName = `${u.prenom ?? ''} ${u.nom ?? ''}`.trim();

        this.user.name = fullName || 'User';
        this.user.email = u.email ?? '';
        this.user.phone = u.phone ?? '';
        this.user.location = u.adresse ?? '';

        // initial avatar letters (no external URL)
        const initials = this.getInitials(u.prenom, u.nom);
        this.user.avatar = initials; // Store initials only, CSS will handle display

        // joinDate from createdAt
        this.user.joinDate = u.createdAt ? u.createdAt.slice(0, 10) : '';

        // patch form
        this.profileForm.patchValue({
          name: this.user.name,
          email: this.user.email,
          phone: this.user.phone,
          location: this.user.location,
          bio: this.user.bio
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load profile');
      }
    });
  }

  // ✅ PUT /users/me (only nom/prenom/phone/adresse)
  onSubmit() {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      this.toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    const { name, phone, location, bio } = this.profileForm.getRawValue();
    const { prenom, nom } = this.splitName(name);

    this.http.put<UserResponse>(`${environment.apiUrl}/users/me`, {
      nom,
      prenom,
      phone,
      adresse: location
    }).subscribe({
      next: (u) => {
        this.me = u;

        // refresh UI
        this.user.name = `${u.prenom ?? ''} ${u.nom ?? ''}`.trim();
        this.user.phone = u.phone ?? '';
        this.user.location = u.adresse ?? '';
        this.user.bio = bio ?? this.user.bio;

        const initials = this.getInitials(u.prenom, u.nom);
        // keep uploaded avatar if user changed it manually
        if (!this.user.avatar.startsWith('data:')) {
          this.user.avatar = initials; // Store initials only
        }

        this.toast.success('Profile updated successfully!');

        // ✅ redirect after save
        this.router.navigate(['/dashboard']); // or ['/dashboard']
      },
      error: (e) => {
        this.toast.error(e?.error?.message ?? 'Update failed');
      }
    });
  }

  onAvatarChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.user.avatar = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  goBack(): void {
    this.location.back();
  }

  // ---------------- helpers ----------------
  private splitName(fullName: string): { prenom: string; nom: string } {
    const clean = (fullName ?? '').trim().replace(/\s+/g, ' ');
    if (!clean) return { prenom: '', nom: '' };

    const parts = clean.split(' ');
    if (parts.length === 1) return { prenom: parts[0], nom: parts[0] };

    const prenom = parts[0];
    const nom = parts.slice(1).join(' ');
    return { prenom, nom };
  }

  private getInitials(prenom?: string | null, nom?: string | null): string {
    const p = (prenom ?? '').trim();
    const n = (nom ?? '').trim();
    const a = p ? p.charAt(0).toUpperCase() : 'U';
    const b = n ? n.charAt(0).toUpperCase() : '';
    return (a + b).trim();
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field?.touched) return '';
    
    if (field.hasError('required')) return 'Ce champ est obligatoire';
    if (field.hasError('email')) return 'Email invalide';
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength')?.requiredLength ?? 0;
      return `Minimum ${minLength} caractères requis`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength')?.requiredLength ?? 0;
      return `Maximum ${maxLength} caractères autorisés`;
    }
    return '';
  }
}