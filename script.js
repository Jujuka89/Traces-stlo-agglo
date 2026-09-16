```javascript
/* ==========================================
   SAINT-LÔ AGGLO EN VTT
   Carte interactive + validations individuelles
   ========================================== */


/* ==========================================
   CONFIGURATION DES PARCOURS
   ========================================== */

const parcours = [
  {
    id: 'quibou-dangy',
    nom: 'Quibou → Dangy',
    commune: 'Quibou',
    distance: '22 km',
    fichier: 'gpx/Quibou_Dangy_22kms.gpx',
    fiche: 'traces/trace.html?id=quibou-dangy'
  }

  /*
  Les prochains parcours seront ajoutés ici :

  {
    id: 'canisy',
    nom: 'Canisy',
    commune: 'Canisy',
    distance: '18 km',
    fichier: 'gpx/Canisy.gpx',
    fiche: 'traces/trace.html?id=canisy'
  },

  {
    id: 'saint-lo',
    nom: 'Saint-Lô',
    commune: 'Saint-Lô',
    distance: '25 km',
    fichier: 'gpx/Saint-Lo.gpx',
    fiche: 'traces/trace.html?id=saint-lo'
  }
  */
];


/* ==========================================
   CARTE
   ========================================== */

const map = L.map('map').setView(
  [49.115, -1.090],
  11
);


/* Fond OpenStreetMap */

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution:
      '&copy; OpenStreetMap contributors'
  }
).addTo(map);


/* ==========================================
   VARIABLES
   ========================================== */

const couchesParcours = {};
const validationsUtilisateur = {};

let currentUser = null;


/* ==========================================
   FIREBASE
   ========================================== */

/*
   Firebase sera initialisé ici.

   Pour l'instant, le script fonctionne
   également sans Firebase afin de pouvoir
   tester la carte.
*/

let firebaseDisponible = false;


/* ==========================================
   CRÉATION D'UN PARCOURS
   ========================================== */

function chargerParcours(parcoursData) {

  const gpx = new L.GPX(
    parcoursData.fichier,
    {
      async: true,

      polyline_options: {
        color: '#e53935',
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


  /* ----------------------------------------
     GPX chargé
     ---------------------------------------- */

  gpx.on(
    'loaded',
    function(e) {

      const couche = e.target;

      couchesParcours[parcoursData.id] = couche;


      /* --------------------------------------
         Popup
         -------------------------------------- */

      couche.bindPopup(`
        <div style="min-width:190px">

          <strong>🚵 ${parcoursData.nom}</strong>

          <br><br>

          <span class="statut-parcours"
                data-statut="${parcoursData.id}">
            🔴 À
```
