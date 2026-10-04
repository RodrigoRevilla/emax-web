# e.Max Web

Landing + (futuro) panel de admin para e.Max Learning Institute.

## Correr
```bash
npm install
npm start        # ng serve -> http://localhost:4200
```

## Estructura
- `src/app/core/`     modelo + ContentService (fuente del contenido, HTTP-ready)
- `src/app/shared/`   directiva appReveal (fade-in por IntersectionObserver)
- `src/app/features/landing/`  landing + 11 secciones (una por componente)
- `src/app/features/admin/`    panel (fase 2, lazy)
- `public/assets/`    imágenes y video

El contenido vive en `ContentService`. Para hacerlo editable, descomentar
`load()` y conectar `GET /api/v1/content` (backend Go).
