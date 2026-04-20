import { Component, OnInit, OnDestroy, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-picker-container">
      <div class="map-picker-hint">
        <span>🖱️ Cliquez sur la carte pour choisir la position</span>
        <span *ngIf="selectedLocation" class="selected-coords">
          📍 {{ selectedLocation.lat.toFixed(4) }}, {{ selectedLocation.lng.toFixed(4) }}
        </span>
      </div>
      <div [id]="mapId" class="map-picker"></div>
      <div *ngIf="selectedLocation" class="location-info">
        <span>✅ Position sélectionnée</span>
        <button type="button" class="btn-clear" (click)="clearLocation()">✖ Effacer</button>
      </div>
    </div>
  `,
  styles: [`
    .map-picker-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 8px;
    }
    .map-picker-hint {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8f9fa;
      font-size: 0.85rem;
      color: #666;
      border-bottom: 1px solid #ddd;
    }
    .selected-coords {
      color: #667eea;
      font-weight: 600;
    }
    .map-picker {
      height: 350px;
      width: 100%;
    }
    .location-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #d4edda;
      font-size: 0.85rem;
      color: #155724;
      border-top: 1px solid #c3e6cb;
    }
    .btn-clear {
      padding: 4px 10px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }
  `]
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  @Input() initialLat?: number;
  @Input() initialLng?: number;
  @Output() locationSelected = new EventEmitter<MapLocation>();

  mapId = `map-picker-${Math.random().toString(36).substr(2, 9)}`;
  private map!: L.Map;
  private marker?: L.Marker;
  selectedLocation: MapLocation | null = null;

  private markerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  ngAfterViewInit(): void {
    console.log('🗺️ [MapPicker] AfterViewInit called');
    setTimeout(() => {
      console.log('🗺️ [MapPicker] Timeout - initializing map');
      this.initMap();
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  private initMap(): void {
    console.log('🗺️ [MapPicker] initMap() called');
    console.log('🗺️ [MapPicker] mapId:', this.mapId);
    console.log('🗺️ [MapPicker] initialLat:', this.initialLat);
    console.log('🗺️ [MapPicker] initialLng:', this.initialLng);
    
    const mapElement = document.getElementById(this.mapId);
    if (!mapElement) {
      console.error('❌ [MapPicker] Map element not found:', this.mapId);
      return;
    }
    
    const lat = this.initialLat || 36.8065;
    const lng = this.initialLng || 10.1815;

    try {
      this.map = L.map(this.mapId, {
        center: [lat, lng] as L.LatLngTuple,
        zoom: this.initialLat ? 14 : 7
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      console.log('✅ [MapPicker] Map initialized successfully');

      // Si position initiale, placer le marker
      if (this.initialLat && this.initialLng) {
        this.placeMarker(this.initialLat, this.initialLng);
      }

      // Clic sur la carte pour choisir la position
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.placeMarker(e.latlng.lat, e.latlng.lng);
      });
    } catch (error) {
      console.error('❌ [MapPicker] Error initializing map:', error);
    }
  }

  private placeMarker(lat: number, lng: number): void {
    // Supprimer l'ancien marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Placer le nouveau marker
    this.marker = L.marker([lat, lng] as L.LatLngTuple, { icon: this.markerIcon, draggable: true })
      .addTo(this.map)
      .bindPopup('📍 Position sélectionnée')
      .openPopup();

    // Permettre de déplacer le marker
    this.marker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng();
      this.updateLocation(pos.lat, pos.lng);
    });

    this.updateLocation(lat, lng);
  }

  private updateLocation(lat: number, lng: number): void {
    this.selectedLocation = { lat, lng };
    this.locationSelected.emit(this.selectedLocation);
  }

  clearLocation(): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = undefined;
    }
    this.selectedLocation = null;
    this.locationSelected.emit({ lat: 0, lng: 0 });
  }
}
