#!/usr/bin/env python3
"""
Convertit tous les fichiers .gpx d'un dossier en fichiers JSON prêts à l'emploi
pour l'application "Challenge Saint-Lô Agglo", + un index.json récapitulatif.

Usage :
    python3 gpx_to_json.py /chemin/vers/dossier_gpx /chemin/vers/dossier_sortie

Placez ensuite le contenu du dossier de sortie dans /traces/ sur votre hébergement,
à côté de index.html.
"""

import base64
import json
import math
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"gpx": "http://www.topografix.com/GPX/1/1"}


def parse_gpx(path: Path):
    tree = ET.parse(path)
    root = tree.getroot()

    # Certains GPX n'ont pas exactement ce namespace : on le détecte au besoin
    ns = NS
    if not root.tag.startswith("{http://www.topografix.com/GPX/1/1}"):
        m = re.match(r"\{(.+)\}", root.tag)
        if m:
            ns = {"gpx": m.group(1)}

    name_el = root.find(".//gpx:trk/gpx:name", ns)
    trk_name = name_el.text.strip() if name_el is not None and name_el.text else path.stem

    coords = []
    eles = []
    for trkpt in root.findall(".//gpx:trkpt", ns):
        lat = float(trkpt.get("lat"))
        lon = float(trkpt.get("lon"))
        ele_el = trkpt.find("gpx:ele", ns)
        ele = float(ele_el.text) if ele_el is not None and ele_el.text else 0.0
        coords.append([round(lat, 5), round(lon, 5)])
        eles.append(round(ele, 1))

    if len(coords) < 2:
        raise ValueError(f"{path.name} : pas assez de points GPS trouvés.")

    # Distance cumulée (Haversine) en km
    dist_km = [0.0]
    gain = 0.0
    loss = 0.0
    for i in range(1, len(coords)):
        d = haversine_km(coords[i - 1], coords[i])
        dist_km.append(round(dist_km[-1] + d, 3))
        delta_e = eles[i] - eles[i - 1]
        if delta_e > 0:
            gain += delta_e
        else:
            loss += -delta_e

    stats = {
        "distance_km": round(dist_km[-1], 2),
        "gain_m": round(gain),
        "loss_m": round(loss),
        "min_ele": round(min(eles)),
        "max_ele": round(max(eles)),
    }

    gpx_bytes = path.read_bytes()
    gpx_b64 = base64.b64encode(gpx_bytes).decode("ascii")

    trace_id = slugify(trk_name)

    return {
        "id": trace_id,
        "name": trk_name,
        "coords": coords,
        "dist_km": dist_km,
        "eles": eles,
        "stats": stats,
        "gpxBase64": gpx_b64,
        "gpxFilename": path.name,
    }


def haversine_km(a, b):
    lat1, lon1 = a
    lat2, lon2 = b
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    h = (math.sin(dphi / 2) ** 2
         + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(h))


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "_", text).strip("_")
    return text or "trace"


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    src_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    gpx_files = sorted(src_dir.glob("*.gpx"))
    if not gpx_files:
        print(f"Aucun fichier .gpx trouvé dans {src_dir}")
        sys.exit(1)

    # Nettoyage : on repart d'un dossier de sortie vide pour ne garder
    # que les traces correspondant aux .gpx actuellement présents.
    # (index.json est régénéré juste après, donc on ne touche pas
    # aux fichiers qui ne sont pas de notre ressort si jamais il y en a)
    for old_json in out_dir.glob("*.json"):
        if old_json.name != "index.json":
            old_json.unlink()
            print(f"🗑️  Supprimé (source .gpx absente) : {old_json.name}")

    index = []
    for gpx_path in gpx_files:
        try:
            trace = parse_gpx(gpx_path)
        except Exception as e:
            print(f"⚠️  Ignoré {gpx_path.name} : {e}")
            continue

        out_path = out_dir / f"{trace['id']}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(trace, f, ensure_ascii=False)

        index.append({
            "id": trace["id"],
            "name": trace["name"],
            "subtitle": "",  # à compléter à la main si besoin
            "distance_km": trace["stats"]["distance_km"],
        })
        print(f"✅ {gpx_path.name} → {out_path.name}  ({trace['stats']['distance_km']} km)")

    with open(out_dir / "index.json", "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    print(f"\n{len(index)} parcours écrits dans {out_dir}/ (+ index.json)")


if __name__ == "__main__":
    main()
