```javascript
console.log("SCRIPT CHARGÉ");

const map = L.map("map").setView([49.115, -1.090], 11);

console.log("LEAFLET :", typeof L);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 19
}).addTo(map);

console.log("CARTE CRÉÉE");

const gpx = new L.GPX(
  "gpx/Quibou_Dangy_22kms.gpx",
  {
    async: true,

    polyline_options: {
      color: "#e53935",
      weight: 5,
      opacity: 0.9
    },

    markers: {
      startIcon: null,
      endIcon: null,
      shadowUrl: null
    }
  }
);

gpx.on("loaded", function (e) {

  console.log("GPX CHARGÉ");

  const parcours = e.target;

  map.fitBounds(parcours.getBounds(), {
    padding: [30, 30]
  });

  parcours.bindPopup(`
    <strong>🚵 Quibou → Dangy</strong>
    <br><br>
    🔴 À découvrir
    <br>
    📏 22 km
    <br>
    🚵 Parcours VTT
    <br><br>
    <a href="gpx/Quibou_Dangy_22kms.gpx" download>
      📥 Télécharger le GPX
    </a>
  `);
});

gpx.on("error", function (e) {
  console.error("ERREUR GPX :", e);
});

gpx.addTo(map);

setTimeout(() => {
  map.invalidateSize();
}, 500);
```
