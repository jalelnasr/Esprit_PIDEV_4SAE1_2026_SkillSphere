import {
  Component, Output, EventEmitter, OnDestroy, AfterViewInit,
  PLATFORM_ID, Inject, Input
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  locationName: string;
  locationAddress: string;
}

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="location-picker">
      <div class="picker-header">
        <span class="picker-icon">🗺️</span>
        <div>
          <h4>Cliquez sur la carte pour choisir la localisation</h4>
          <p>L'adresse sera récupérée automatiquement via OpenStreetMap</p>
        </div>
      </div>

      <div id="location-picker-map" class="picker-map"></div>

      <div *ngIf="loading" class="picker-loading">
        ⏳ Récupération de l'adresse...
      </div>

      <div *ngIf="selected" class="picker-result">
        <div class="result-icon">✅</div>
        <div class="result-info">
          <strong>📍 {{ selected.locationName }}</strong>
          <span>{{ selected.locationAddress }}</span>
          <small>Lat: {{ selected.latitude | number:'1.4-6' }} | Lng: {{ selected.longitude | number:'1.4-6' }}</small>
        </div>
        <button class="btn-clear" (click)="clearSelection()">✕</button>
      </div>

      <div *ngIf="!selected && !loading" class="picker-hint">
        👆 Cliquez sur la carte pour sélectionner l'emplacement de votre événement
      </div>
    </div>
  `,
  styles: [`
    .location-picker { display: flex; flex-direction: column; gap: 1rem; }

    .picker-header {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.75rem 1rem; background: rgba(79,70,229,0.1);
      border-radius: 8px; border-left: 4px solid #4f46e5;
    }
    .picker-icon { font-size: 2rem; }
    .picker-header h4 { margin: 0; font-size: 0.95rem; color: var(--text-primary, #111); }
    .picker-header p { margin: 0; font-size: 0.8rem; color: var(--text-secondary, #666); }

    .picker-map {
      width: 100%; height: 350px; border-radius: 12px;
      border: 2px solid #e5e7eb; cursor: crosshair;
      transition: border-color 0.2s;
    }
    .picker-map:hover { border-color: #4f46e5; }

    .picker-loading {
      text-align: center; padding: 0.75rem;
      background: #fef3c7; border-radius: 8px; color: #92400e;
    }

    .picker-result {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem; background: #d1fae5;
      border-radius: 8px; border: 1px solid #10b981;
    }
    .result-icon { font-size: 1.5rem; }
    .result-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .result-info strong { color: #065f46; font-size: 0.95rem; }
    .result-info span { color: #047857; font-size: 0.85rem; }
    .result-info small { color: #6b7280; font-size: 0.75rem; }

    .btn-clear {
      background: #ef4444; color: white; border: none;
      border-radius: 50%; width: 28px; height: 28px;
      cursor: pointer; font-size: 0.8rem; flex-shrink: 0;
    }

    .picker-hint {
      text-align: center; padding: 0.75rem;
      background: var(--bg-secondary, #f9fafb);
      border-radius: 8px; color: var(--text-secondary, #6b7280);
      font-size: 0.9rem; border: 1px dashed #d1d5db;
    }
  `]
})
export class LocationPickerComponent implements AfterViewInit, OnDestroy {
  @Input() initialLat: number = 33.8869;
  @Input() initialLng: number = 9.5375;
  @Output() locationSelected = new EventEmitter<SelectedLocation>();

  selected: SelectedLocation | null = null;
  loading = false;

  private map: any = null;
  private marker: any = null;
  private L: any = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => this.initMap(), 200);
    }
  }

  private async initMap() {
    try {
      this.L = await import('leaflet');
      this.fixIcons();

      this.map = this.L.map('location-picker-map').setView(
        [this.initialLat, this.initialLng], 7
      );

      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(this.map);

      // Click handler
      this.map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        this.onMapClick(lat, lng);
      });

    } catch (e) {
      console.error('Map init error:', e);
    }
  }

  private onMapClick(lat: number, lng: number) {
    // Place marker
    if (this.marker) this.marker.remove();
    this.marker = this.L.marker([lat, lng], {
      icon: this.L.divIcon({
        html: `<div style="background:#4f46e5;color:white;border-radius:50%;width:36px;height:36px;
               display:flex;align-items:center;justify-content:center;font-size:18px;
               border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
        className: '', iconSize: [36, 36], iconAnchor: [18, 18]
      })
    }).addTo(this.map);

    // Reverse geocoding via Nominatim (OpenStreetMap API externe)
    this.loading = true;
    this.selected = null;

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    this.http.get<any>(url, {
      headers: { 'Accept-Language': 'fr' }
    }).subscribe({
      next: (data) => {
        this.loading = false;
        const addr = data.address || {};

        const locationName = addr.amenity || addr.building || addr.road ||
                             addr.neighbourhood || addr.suburb || addr.city || 'Lieu sélectionné';

        const parts = [
          addr.road, addr.suburb, addr.city || addr.town || addr.village,
          addr.postcode, addr.country
        ].filter(Boolean);

        const locationAddress = parts.join(', ') || data.display_name || '';

        this.selected = { latitude: lat, longitude: lng, locationName, locationAddress };

        // Update marker popup
        this.marker.bindPopup(`
          <b>📍 ${locationName}</b><br>
          <small>${locationAddress}</small>
        `).openPopup();

        this.locationSelected.emit(this.selected);
      },
      error: () => {
        this.loading = false;
        // Fallback sans adresse
        this.selected = {
          latitude: lat, longitude: lng,
          locationName: 'Lieu sélectionné',
          locationAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        };
        this.locationSelected.emit(this.selected);
      }
    });
  }

  clearSelection() {
    this.selected = null;
    if (this.marker) { this.marker.remove(); this.marker = null; }
    this.locationSelected.emit({ latitude: 0, longitude: 0, locationName: '', locationAddress: '' });
  }

  private fixIcons() {
    if (!this.L) return;
    delete (this.L.Icon.Default.prototype as any)._getIconUrl;
    this.L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }

  ngOnDestroy() {
    if (this.map) { this.map.remove(); this.map = null; }
  }
}
