class MapHandler {
    constructor(mapElementId, initialCoords, initialZoomLevel) {
        this.mapInstance = L.map(mapElementId).setView(initialCoords, initialZoomLevel);
        this.setupTileLayer();

        this.attendanceCounts = {
            online: 0,
            lecture: 0,
            Lab: 0,
        };

        this.markerRegistry = {};
        this.markerList = [];
        this.loggedEntries = [];

        this.initializeUIComponents();
        this.bindEventListeners();
    }

    setupTileLayer() {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Sample for new corales BSIT student'
        }).addTo(this.mapInstance);
    }

    initializeUIComponents() {
        this.buttonSC = document.getElementById('btn');
        this.buttonBA = document.getElementById('btn1');
        this.buttonLab = document.getElementById('btn2');
        this.buttonClear = document.getElementById('btnclear');
        this.displaySCCount = document.getElementById('logCount');
        this.displayBACount = document.getElementById('logCountBA');
        this.displayLabCount = document.getElementById('logCountCCS');
        this.logDisplayContainer = document.getElementById('logContainer');
    }

    bindEventListeners() {
        this.buttonSC.addEventListener('click', () => this.recordAttendance('SC'));
        this.buttonBA.addEventListener('click', () => this.recordAttendance('BA'));
        this.buttonLab.addEventListener('click', () => this.recordAttendance('Lab'));
        this.buttonClear.addEventListener('click', () => this.resetAttendanceLogs());
    }

    addMapMarker(latitude, longitude, label) {
        const marker = L.marker([latitude, longitude]).addTo(this.mapInstance);
        this.markerRegistry[label] = (this.markerRegistry[label] || 0) + 1;
        this.refreshMarkerPopup(marker, label);
        
        marker.on('click', () => {
            this.markerRegistry[label]++;
            this.refreshMarkerPopup(marker, label);
        });

        this.markerList.push(marker);
    }

    refreshMarkerPopup(marker, label) {
        const count = this.markerRegistry[label];
        marker.bindPopup(`${label}<br>Attendance logs: ${count}`).openPopup();
    }

    loadMarkers(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                data.forEach(entry => {
                    this.addMapMarker(entry.latitude, entry.longitude, entry.message);
                });
            })
            .catch(error => console.error("Error loading markers:", error));
    }

    resetAttendanceLogs() {
        Object.keys(this.attendanceCounts).forEach(key => {
            this.attendanceCounts[key] = 0;
        });

        this.loggedEntries = [];
        this.markerRegistry = {};
        
        this.markerList.forEach(marker => {
            const label = marker.getPopup().getContent().split('<br>')[0];
            this.markerRegistry[label] = 0;
            this.refreshMarkerPopup(marker, label);
        });

        this.updateLogCounts();
    }

    updateLogCounts() {
        this.displaySCCount.innerHTML = `SC Building Attendance: ${this.attendanceCounts.SC}`;
        this.displayBACount.innerHTML = `BA Building Attendance: ${this.attendanceCounts.BA}`;
        this.displayLabCount.innerHTML = `CCS Laboratory Attendance: ${this.attendanceCounts.Lab}`;
    }

    recordAttendance(building) {
        const coords = {
            SC: [8.360283,  124.867513],
            BA: [8.359219, 124.868583],
            Lab: [8.359667, 124.869179]
        };

        this.addMapMarker(...coords[building], `${building} building`);
        this.attendanceCounts[building]++; 
        this.updateLogCounts();
    }
}

const mapInstance = new MapHandler('map', [8.359735, 124.869206],18);
mapInstance.loadMarkers('applet-2.json');

document.addEventListener('DOMContentLoaded', () => {
    mapInstance.updateLogCounts();
    mapInstance.loadMarkers('applet-2.json');
});