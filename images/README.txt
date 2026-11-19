# Afbeeldingen

Zet al je afbeeldingen in deze map en verwijs ernaar vanuit ../assets/js/data.js
met "images/bestandsnaam.jpg".


## 1. Thumbnails (window.THUMBNAILS)
Je eindresultaten. Voorbeeld van namen die nu gebruikt worden:
  altijdmartingta6.png
  btou2.png
  setup.png
  jordystormroy.png
  bronzetounreal.png
  solocc.png
Ontbreekt een bestand? Dan toont de site tijdelijk een voorbeeldafbeelding.


## 2. Creatorprofielfoto's (window.CREATORS en window.REVIEWS)
  altijdmartin.png
  jordystorm.jpg
  jcm.jpg
Zonder foto tonen de kaarten de initialen (bijv. "AL").


## 3. Voor/na-slider (window.BEFORE_AFTER)
Elk item heeft een "after" (je eindresultaat) en optioneel een "before"
(de originele video-still, dus het beeld zonder jouw bewerking).

  before: "images/before-gta6.jpg"     <- jouw eigen before-foto
  after:  "images/altijdmartingta6.png" <- je thumbnail

Laat je "before" leeg (""), dan gebruikt de site dezelfde afbeelding als
"after" met een onbewerkt-filter. Wil je het echte verschil laten zien,
zet dan een eigen before-foto in deze map en vul het pad in.
