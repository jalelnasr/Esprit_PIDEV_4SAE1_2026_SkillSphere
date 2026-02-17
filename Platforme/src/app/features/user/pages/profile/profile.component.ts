import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user = {
    name: 'Ahmed Ben Mohamed',
    email: 'ahmed@skillsphere.com',
    phone: '+216 23 456 789',
    location: 'Tunis, Tunisia',
    bio: 'Passionate about learning and professional development',
    avatar: 'https://via.placeholder.com/120?text=AM',
    joinDate: 'January 2023',
    courses: 12,
    certificates: 5,
    xp: 2450
  };

  constructor(private fb: FormBuilder, private location: Location) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.profileForm = this.fb.group({
      name: [this.user.name, [Validators.required, Validators.minLength(3)]],
      email: [this.user.email, [Validators.required, Validators.email]],
      phone: [this.user.phone],
      location: [this.user.location],
      bio: [this.user.bio, Validators.maxLength(500)]
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      Object.assign(this.user, this.profileForm.value);
      alert('Profile updated successfully!');
    }
  }

  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.user.avatar = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
