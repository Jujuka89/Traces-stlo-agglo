```javascript
/* ==========================================
   SAINT-LÔ AGGLO EN VTT
   Carte principale
   ========================================== */


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
   PARCOURS
   ========================================== */

const parcours = {

  'quibou-dangy': {

    id: 'quibou-dangy',

    nom: 'Quibou → Dangy',

    commune: 'Quibou',

    distance: '22 km',

    fichier:
      'gpx/Quibou_Dangy_22kms.gpx',

    fiche:
      'traces/trace.html?id=quibou-dangy'

  }

};


/* ==========================================
   STOCKAGE DES TRACES
   ========================================== */

const couchesParcours = {};


/* ==========================================
   CHARGEMENT QUIBOU → DANGY
   ========================================== */

function chargerParcours(data) {

  console.log(
    'Chargement du GPX :',
    data.fichier
  );


  const gpx = new L.GPX(
    data.fichier,
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
    function(event) {

      const couche =
        event.target;


      console.log(
        'GPX chargé avec succès :',
        data.nom
      );


      couchesParcours[data.id] =
        couche;


      /* Zoom automatique */

      map.fitBounds(
        couche.getBounds(),
        {
          padding: [30, 30]
        }
      );


      /* Popup */

      couche.bindPopup(`
        <div style="min-width:190px">

          <strong>
            🚵 ${data.nom}
          </strong>

          <br><br>

          <span>
            🔴 À découvrir
          </span>

          <br>

          📏 ${data.distance}

          <br>

          🚵 Parcours VTT

          <br><br>

          <a
            href="${data.fichier}"
            download
          >
            📥 Télécharger le GPX
          </a>

          <br><br>

          <button
            onclick="ouvrirParcours('${data.id}')"
            style="
              border:0;
              background:#2f6b3c;
              color:white;
              padding:8px 12px;
              border-radius:8px;
              cursor:pointer;
            "
          >
            Voir la fiche
          </button>

        </div>
      `);


      /* Clic sur la trace */

      couche.on(
        'click',
        function() {

          couche.openPopup();

        }
      );

    }
  );


  /* ----------------------------------------
     Erreur
     ---------------------------------------- */

  gpx.on(
    'error',
    function(error) {

      console.error(
        'ERREUR GPX :',
        data.fichier,
        error
      );

    }
  );


  /* Ajout à la carte */

  gpx.addTo(map);

}


/* ==========================================
   CHARGER TOUS LES PARCOURS
   ========================================== */

Object.values(parcours).forEach(
  chargerParcours
);


/* ==========================================
   OUVRIR UNE FICHE
   ========================================== */

function ouvrirParcours(id) {

  const data =
    parcours[id];


  if (!data) {

    console.error(
      'Parcours introuvable :',
      id
    );

    return;

  }


  window.location.href =
    data.fiche;

}


window.ouvrirParcours =
  ouvrirParcours;


/* ==========================================
   ANCIENNE FONCTION
   Compatible avec l'ancien bouton
   ========================================== */

function centrerParcours(nom) {

  const data =
    Object.values(parcours).find(
      parcours =>
        parcours.commune === nom
    );


  if (!data) {

    console.error(
      'Commune introuvable :',
      nom
    );

    return;

  }


  const couche =
    couchesParcours[data.id];


  if (!couche) {

    console.log(
      'Le GPX n'est pas encore chargé.'
    );

    return;

  }


  map.fitBounds(
    couche.getBounds(),
    {
      padding: [30, 30]
    }
  );


  couche.openPopup();

}


window.centrerParcours =
  centrerParcours;


/* ==========================================
   REDIMENSIONNEMENT
   ========================================== */

window.addEventListener(
  'resize',
  function() {

    map.invalidateSize();

  }
);


/* ==========================================
   FIN
   ========================================== */

console.log(
  'Saint-Lô Agglo en VTT - carte initialisée'
);
```
