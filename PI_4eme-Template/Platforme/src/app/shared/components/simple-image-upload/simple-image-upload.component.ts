import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-image-upload.component.html',
  styleUrls: ['./simple-image-upload.component.css']
})
export class SimpleImageUploadComponent implements OnInit {
  @Input() currentImageUrl?: string;
  @Output() imageSelected = new EventEmitter<string>();

  dragOver = false;
  previewUrl?: string;

  ngOnInit(): void {
    this.previewUrl = this.currentImageUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
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

  handleFile(file: File): void {
    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Seuls les fichiers image sont acceptés');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    // Convertir en base64 pour stockage local
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      this.previewUrl = base64;
      this.imageSelected.emit(base64);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.previewUrl = undefined;
    this.imageSelected.emit('');
  }
}
