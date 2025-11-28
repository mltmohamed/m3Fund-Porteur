import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #map class="map-element"></div>
      <div class="location-info" *ngIf="selectedLocation">
        <h4>Position sélectionnée :</h4>
        <p>Pays: {{ selectedLocation.country }}</p>
        <p>Ville: {{ selectedLocation.town }}</p>
        <p *ngIf="selectedLocation.region">Région: {{ selectedLocation.region }}</p>
        <p *ngIf="selectedLocation.street">Adresse: {{ selectedLocation.street }}</p>
        <p>Longitude: {{ selectedLocation.longitude }}</p>
        <p>Latitude: {{ selectedLocation.latitude }}</p>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      width: 100%;
      height: 250px;
      position: relative;
      margin-bottom: 20px;
      border: 1px solid #ddd;
    }
    
    .map-element {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .location-info {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: white;
      padding: 8px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      max-width: 250px;
      font-size: 12px;
    }
    
    .location-info h4 {
      margin: 0 0 5px 0;
      font-size: 14px;
    }
    
    .location-info p {
      margin: 2px 0;
    }
    
    /* Fix for Leaflet icons */
    .leaflet-marker-icon {
      background: transparent;
    }
    
    .leaflet-container {
      font-family: inherit;
    }
  `]
})
export class MapPickerComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapContainer!: ElementRef;
  @Input() initialLocation: { longitude: number; latitude: number } = { longitude: -8.0, latitude: 12.6 }; // Mali par défaut
  @Output() locationSelected = new EventEmitter<any>();
  
  private map!: L.Map;
  private marker!: L.Marker;
  selectedLocation: any = null;

  ngOnInit() {
    console.log('MapPickerComponent initialized');
  }

  ngAfterViewInit() {
    console.log('MapPickerComponent view initialized');
    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  private updateLocation(longitude: number, latitude: number): void {
    // In a real application, you would use a geocoding service to get the actual address
    // For now, we'll just store the coordinates
    this.selectedLocation = {
      country: 'Mali',
      town: 'Bamako',
      region: 'District de Bamako',
      street: '',
      longitude: longitude,
      latitude: latitude
    };
    
    // Emit the location data to the parent component
    this.locationSelected.emit(this.selectedLocation);
  }

  private initMap(): void {
    console.log('Initializing map with container:', this.mapContainer);
    if (!this.mapContainer) {
      console.error('Map container not found');
      return;
    }
    
    try {
      // Fix Leaflet marker icons
      this.fixLeafletIcons();
      
      // Create the map
      this.map = L.map(this.mapContainer.nativeElement).setView(
        [this.initialLocation.latitude, this.initialLocation.longitude], 
        13
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      // Create a marker
      this.marker = L.marker([this.initialLocation.latitude, this.initialLocation.longitude], {
        draggable: true
      }).addTo(this.map);

      // Update position when marker is dragged
      this.marker.on('dragend', (event: any) => {
        const position = this.marker.getLatLng();
        this.updateLocation(position.lng, position.lat);
      });

      // Update position when map is clicked
      this.map.on('click', (event: any) => {
        const latlng = event.latlng;
        this.marker.setLatLng(latlng);
        this.updateLocation(latlng.lng, latlng.lat);
      });

      // Initialize location data
      this.updateLocation(this.initialLocation.longitude, this.initialLocation.latitude);
      
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private fixLeafletIcons(): void {
    // Fix Leaflet marker icons by providing correct paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });
  }
}