import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Input() currentImageUrl?: string;
  @Output() imageUploaded = new EventEmitter<string>();

  uploading = false;
  dragOver = false;
  previewUrl?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.previewUrl = this.currentImageUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.uploadFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  uploadFile(file: File): void {
    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Seuls les fichiers image sont acceptés');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Upload vers le backend
    this.uploading = true;
    const formData = new FormData();
    formData.append('file', file);

    // Utiliser le bon endpoint (/api/uploads)
    const uploadUrl = 'http://localhost:8080/formation-service/api/uploads/image';
    
    this.http.post<{ url: string }>(uploadUrl, formData).subscribe({
      next: (response) => {
        this.uploading = false;
        const fullUrl = `http://localhost:8080/formation-service${response.url}`;
        this.imageUploaded.emit(fullUrl);
        console.log('✅ Image uploaded:', fullUrl);
      },
      error: (err) => {
        console.error('❌ Upload error:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.error);
        this.uploading = false;
        
        let errorMsg = 'Erreur lors de l\'upload';
        if (err.status === 0) {
          errorMsg = 'Impossible de contacter le serveur. Vérifiez que Formation Service est démarré.';
        } else if (err.error?.error) {
          errorMsg = err.error.error;
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        alert(errorMsg);
      }
    });
  }

  removeImage(): void {
    this.previewUrl = undefined;
    this.imageUploaded.emit('');
  }
}
