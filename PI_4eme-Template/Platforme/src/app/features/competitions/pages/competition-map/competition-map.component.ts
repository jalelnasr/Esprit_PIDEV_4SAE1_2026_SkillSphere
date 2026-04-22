import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CompetitionApiService } from '../../services/competition-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Competition } from '../../models/competition.model';
import * as L from 'leaflet';

// Fix Leaflet default marker icons
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

@Component({
  selector: 'app-competition-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="map-page">
      <div class="map-header">
        <button class="btn-back" routerLink="/competitions">← Retour</button>
        <h1>🗺️ Carte des Événements</h1>
        <div class="legend">
          <span class="legend-item">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" height="20"> Mes événements
          </span>
          <span class="legend-item">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png" height="20"> Autres événements
          </span>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Chargement de la carte...</p>
      </div>

      <div *ngIf="!loading && physicalCompetitions.length === 0" class="no-events-message">
        <div style="text-align: center; padding: 3rem; color: white;">
          <h2 style="font-size: 2rem; margin-bottom: 1rem;">📍 Aucun événement sur la carte</h2>
          <p style="font-size: 1.1rem; opacity: 0.8;">Il n'y a actuellement aucun événement PHYSICAL avec une localisation définie.</p>
        </div>
      </div>

      <div id="competition-map" class="map-container"></div>

      <div class="map-stats" *ngIf="!loading">
        <span>📍 {{ physicalCompetitions.length }} événements sur la carte</span>
        <span>🔴 {{ myRegisteredCount }} inscrits</span>
        <span>🔵 {{ physicalCompetitions.length - myRegisteredCount }} disponibles</span>
      </div>
    </div>
  `,
  styles: [`
    .map-page {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #0f0f1a;
    }
    .map-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .map-header h1 {
      margin: 0;
      font-size: 1.4rem;
      flex: 1;
    }
    .btn-back {
      padding: 8px 16px;
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-back:hover { background: rgba(255,255,255,0.2); }
    .legend {
      display: flex;
      gap: 16px;
      font-size: 0.85rem;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .map-container {
      flex: 1;
      z-index: 1;
    }
    .loading-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      z-index: 1000;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .map-stats {
      display: flex;
      gap: 24px;
      padding: 12px 24px;
      background: #1a1a2e;
      color: rgba(255,255,255,0.7);
      font-size: 0.9rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
  `]
})
export class CompetitionMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  loading = true;
  physicalCompetitions: Competition[] = [];
  myRegisteredIds: Set<number> = new Set();
  myRegisteredCount = 0;
  isLoggedIn = false;

  constructor(
    private competitionService: CompetitionApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🗺️ [MAP] CompetitionMapComponent initialized');
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      console.log('🗺️ [MAP] User logged in:', this.isLoggedIn);
    });
  }

  ngAfterViewInit(): void {
    console.log('🗺️ [MAP] AfterViewInit - Initializing map');
    // ✅ Timeout pour laisser le DOM se charger complètement
    setTimeout(() => {
      this.initMap();
      this.loadData();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    console.log('🗺️ [MAP] initMap() called');
    
    try {
      this.map = L.map('competition-map', {
        center: [36.8065, 10.1815] as L.LatLngTuple, // Tunis par défaut
        zoom: 7
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);
      
      console.log('✅ [MAP] Map initialized successfully');
    } catch (error) {
      console.error('❌ [MAP] Error initializing map:', error);
    }
  }

  private loadData(): void {
    console.log('🗺️ [MAP] Chargement des données de la carte...');
    console.log('🗺️ [MAP] Utilisateur connecté:', this.isLoggedIn);
    
    // Charger toutes les compétitions avec localisation
    this.competitionService.getAllCompetitions().subscribe({
      next: (competitions) => {
        console.log('📊 [MAP] Compétitions reçues:', competitions.length);
        console.log('📊 [MAP] Détails compétitions:', competitions);
        
        this.physicalCompetitions = competitions.filter(
          c => c.type === 'PHYSICAL' && c.latitude && c.longitude
        );
        
        console.log('📍 [MAP] Événements PHYSICAL avec localisation:', this.physicalCompetitions.length);
        console.log('📍 [MAP] Détails événements PHYSICAL:', this.physicalCompetitions);

        // Charger mes participations si connecté
        if (this.isLoggedIn) {
          this.competitionService.getMyParticipations().subscribe({
            next: (myComps) => {
              this.myRegisteredIds = new Set(myComps.map(c => c.competitionId));
              this.myRegisteredCount = this.physicalCompetitions.filter(
                c => this.myRegisteredIds.has(c.competitionId)
              ).length;
              console.log('✅ [MAP] Inscrit à', this.myRegisteredCount, 'événements');
              console.log('✅ [MAP] IDs inscrits:', Array.from(this.myRegisteredIds));
              this.addMarkers();
              this.loading = false;
            },
            error: (err) => {
              console.log('⚠️ [MAP] Erreur chargement participations:', err);
              this.addMarkers();
              this.loading = false;
            }
          });
        } else {
          console.log('👤 [MAP] Utilisateur non connecté');
          this.addMarkers();
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('❌ [MAP] Erreur chargement compétitions:', err);
        this.loading = false;
      }
    });
  }

  private addMarkers(): void {
    const bounds: L.LatLngTuple[] = [];

    console.log('🎯 [MAP] Ajout de', this.physicalCompetitions.length, 'markers');

    if (this.physicalCompetitions.length === 0) {
      console.warn('⚠️ [MAP] Aucun événement PHYSICAL à afficher sur la carte');
      return;
    }

    this.physicalCompetitions.forEach(competition => {
      const lat = competition.latitude!;
      const lng = competition.longitude!;
      const isRegistered = this.myRegisteredIds.has(competition.competitionId);

      console.log(`📍 [MAP] ${competition.title}: [${lat}, ${lng}] - ${isRegistered ? '🔴 Rouge (inscrit)' : '🔵 Bleu (disponible)'}`);

      const icon = isRegistered ? redIcon : blueIcon;

      const marker = L.marker([lat, lng] as L.LatLngTuple, { icon }).addTo(this.map);

      // ✅ All events are clickable — detail page handles access control
      const registeredBadge = isRegistered
        ? `<span style="padding:2px 8px; border-radius:12px; font-size:0.75rem; background:#d4edda; color:#155724; margin-left:4px;">✅ Inscrit</span>`
        : `<span style="padding:2px 8px; border-radius:12px; font-size:0.75rem; background:#fff3cd; color:#856404; margin-left:4px;">📋 S'inscrire</span>`;

      const popupContent = `
        <div style="min-width:200px; font-family:sans-serif;">
          <h3 style="margin:0 0 8px; color:#333; font-size:1rem;">${competition.title}</h3>
          <p style="margin:0 0 4px; color:#666; font-size:0.85rem;">
            📅 ${new Date(competition.startDate).toLocaleDateString('fr-FR')}
          </p>
          ${competition.locationName ? `<p style="margin:0 0 4px; color:#666; font-size:0.85rem;">📍 ${competition.locationName}</p>` : ''}
          <p style="margin:0 0 8px;">
            <span style="padding:2px 8px; border-radius:12px; font-size:0.75rem; background:${competition.status === 'OPEN' ? '#d4edda' : '#f8d7da'}; color:${competition.status === 'OPEN' ? '#155724' : '#721c24'}">
              ${competition.status}
            </span>
            ${registeredBadge}
          </p>
          <button onclick="window.location.href='/competitions/${competition.competitionId}'"
            style="width:100%; padding:8px; background:#667eea; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem;">
            Voir les détails →
          </button>
        </div>
      `;
      marker.bindPopup(popupContent, { maxWidth: 250 });
      marker.on('click', () => {
        marker.openPopup();
      });

      bounds.push([lat, lng] as L.LatLngTuple);
    });

    // Ajuster la vue pour voir tous les markers
    if (bounds.length > 0) {
      console.log('🎯 [MAP] Ajustement de la vue pour', bounds.length, 'markers');
      this.map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      console.log('⚠️ [MAP] Aucun marker à afficher');
    }
  }
}
