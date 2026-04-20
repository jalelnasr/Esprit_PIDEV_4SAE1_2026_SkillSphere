import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, AfterViewInit, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface CompetitionLocation {
  competitionId: number;
  title: string;
  locationName: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  status: string;
  type: string;
  startDate: string;
  isMyParticipation?: boolean;
}

@Component({
  selector: 'app-competition-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper">
      <div [id]="mapId" class="map-container"></div>
      <!-- Légende -->
      <div class="map-legend" *ngIf="locations.length > 0">
        <div class="legend-item">
          <span class="legend-dot blue"></span>
          <span>Mes participations</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot red"></span>
          <span>Autres événements</span>
        </div>
      </div>
      <div *ngIf="locations.length === 0" class="no-locations">
        <span>🗺️ Aucun événement présentiel avec localisation disponible</span>
      </div>
    </div>
  `,
  styles: [`
    .map-wrapper { position: relative; width: 100%; }
    .map-container { width: 100%; height: 400px; border-radius: 12px; z-index: 1; }
    .no-locations {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.6); color: white; padding: 1rem 2rem;
      border-radius: 8px; text-align: center; pointer-events: none;
    }
    .map-legend {
      position: absolute; bottom: 24px; left: 12px; z-index: 1000;
      background: white; border-radius: 8px; padding: 8px 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      display: flex; flex-direction: column; gap: 6px;
    }
    .legend-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; font-weight: 600; color: #333;
    }
    .legend-dot {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      flex-shrink: 0;
    }
    .legend-dot.blue { background: #3b82f6; }
    .legend-dot.red { background: #ef4444; }
  `]
})
export class CompetitionMapComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() locations: CompetitionLocation[] = [];
  @Input() singleLocation: CompetitionLocation | null = null;
  @Input() mapId: string = 'competition-map';

  private map: any = null;
  private markers: any[] = [];
  private isBrowser: boolean;
  private L: any = null;
  private viewInitialized = false;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Expose navigate function globally for Leaflet popups
    (window as any).__mapNavigate = (id: number) => {
      this.ngZone.run(() => this.router.navigate(['/competitions', id]));
    };
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.viewInitialized = true;
    if (this.isBrowser) {
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.viewInitialized && this.isBrowser && this.map) {
      this.updateMarkers();
    }
  }

  private async initMap() {
    if (!this.isBrowser) return;
    try {
      this.L = await import('leaflet');
      this.fixLeafletIcons();

      const container = document.getElementById(this.mapId);
      if (!container) return;

      // Default center: Tunisia
      const center: [number, number] = [33.8869, 9.5375];
      const zoom = this.singleLocation ? 14 : 6;

      this.map = this.L.map(this.mapId, { zoomControl: true }).setView(center, zoom);

      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(this.map);

      this.updateMarkers();
    } catch (e) {
      console.error('Leaflet init error:', e);
    }
  }

  private fixLeafletIcons() {
    if (!this.L) return;
    delete (this.L.Icon.Default.prototype as any)._getIconUrl;
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }

  private updateMarkers() {
    if (!this.map || !this.L) return;

    // Clear existing markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    if (this.singleLocation) {
      this.addMarker(this.singleLocation);
      this.map.setView([this.singleLocation.latitude, this.singleLocation.longitude], 14);
    } else {
      const locs = this.locations.filter(l => l.latitude && l.longitude);
      locs.forEach(loc => this.addMarker(loc));

      if (locs.length > 0) {
        const group = this.L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.2));
      }
    }
  }

  private addMarker(loc: CompetitionLocation) {
    if (!this.map || !this.L) return;

    // Bleu = ma participation, Rouge = autre événement
    const color = loc.isMyParticipation ? '#3b82f6' : '#ef4444';
    const emoji = loc.isMyParticipation ? '⭐' : '🏆';

    const icon = this.L.divIcon({
      html: `<div style="
        background:${color}; color:white; border-radius:50%; width:36px; height:36px;
        display:flex; align-items:center; justify-content:center; font-size:18px;
        border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.35);
        cursor:pointer;">${emoji}</div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = this.L.marker([loc.latitude, loc.longitude], { icon })
      .addTo(this.map)
      .bindPopup(`
        <div style="min-width:200px; font-family:sans-serif;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="width:12px;height:12px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;"></span>
            <h4 style="margin:0; color:#1e293b;">${loc.title}</h4>
          </div>
          <p style="margin:4px 0;"><b>📍</b> ${loc.locationName || ''}</p>
          <p style="margin:4px 0; font-size:12px; color:#666;">${loc.locationAddress || ''}</p>
          <p style="margin:4px 0;"><b>Status:</b> <span style="color:${this.getStatusColor(loc.status)}">${loc.status}</span></p>
          ${loc.isMyParticipation ? '<p style="color:#3b82f6;font-weight:bold;">⭐ Vous participez à cet événement</p>' : ''}
          <button onclick="window.__mapNavigate(${loc.competitionId})"
            style="margin-top:8px; padding:6px 12px; background:${color}; color:white; border:none; border-radius:6px; cursor:pointer; width:100%; font-weight:600;">
            Voir les détails →
          </button>
        </div>
      `);

    marker.on('popupopen', () => {
      const btn = document.getElementById(`nav-btn-${loc.competitionId}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.router.navigate(['/competitions', loc.competitionId]);
        });
      }
    });

    this.markers.push(marker);
  }

  private getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'OPEN': '#10b981', 'CLOSED': '#ef4444',
      'IN_PROGRESS': '#f59e0b', 'COMPLETED': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    delete (window as any).__mapNavigate;
  }
}
