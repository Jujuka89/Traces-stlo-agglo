/* ==========================================
SAINT-LÔ AGGLO EN VTT
Carte interactive
========================================== */

/* Création de la carte */

const map = L.map('map').setView(
[49.115, -1.090],
11
);

/* Fond de carte OpenStreetMap */

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
attribution:
'© OpenStreetMap contributors'
}
).addTo(map);

/* ==========================================
PARCOURS GPX
========================================== */

/*
Quibou → Dangy

Le fichier doit être placé dans :

gpx/Quibou_Dangy_22kms.gpx
*/

const parcoursQuibou = new L.GPX(
'gpx/Quibou_Dangy_22kms.gpx',
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

/* Une fois le GPX chargé */

parcoursQuibou.on(
'loaded',
function(e) {

const gpx = e.target;

/*
   Zoom automatique sur le parcours
*/

map.fitBounds(
  gpx.getBounds(),
  {
    padding: [30, 30]
  }
);


/*
   Fenêtre d'information
*/

gpx.bindPopup(`
  <strong>🚵 Quibou → Dangy</strong>
  <br><br>
  🔴 À découvrir
  <br>
  📏 22 km
  <br>
  🚵 Parcours VTT
  <br><br>

  <a href="gpx/Quibou_Dangy_22kms.gpx"
     download>
     📥 Télécharger le GPX
  </a>
`);

}
);

/* Ajout du parcours à la carte */

parcoursQuibou.addTo(map);

/* ==========================================
BOUTON "VOIR LE PARCOURS"
========================================== */

function centrerParcours(nom) {

if (nom === 'Quibou') {

map.fitBounds(
  parcoursQuibou.getBounds(),
  {
    padding: [30, 30]
  }
);

parcoursQuibou.openPopup();

}

}