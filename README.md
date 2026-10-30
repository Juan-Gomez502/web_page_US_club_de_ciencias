# web_page_US_club_de_ciencias
Un repositorio para resolver la historia de usuario de: Yo turista necesito información del estado de los ríos para visitarlos.   

## Ubicación de los ríos en Google Maps

Cada tarjeta incluye un enlace a Google Maps. Mientras no haya coordenadas, el enlace busca el río y su localidad. Cuando se conozca el punto exacto, agregá `coordenadas` al objeto del río en `rios.json`:

```json
"coordenadas": {
  "lat": -31.24,
  "lng": -64.46
}
```

El enlace usará esas coordenadas si son válidas; no hace falta una API key.
