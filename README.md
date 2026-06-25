# Angular Firebase Base

Plantilla base para que OpenClaw cree sitios Angular y los publique en Firebase Hosting con GitHub Actions.

## Stack

- Angular 22
- Node 24
- Firebase Hosting
- GitHub Actions

## Comandos

```bash
npm install
npm run start
npm run build:prod
npm run firebase:serve
npm run firebase:deploy
```

## Instanciar un sitio nuevo

```bash
cp -a ~/projects/openclaw-site-templates/angular-firebase-base ~/projects/openclaw-sites/my-site
cd ~/projects/openclaw-sites/my-site
npm install
npm run build:prod
```

Después ajusta:

- `package.json`: nombre del proyecto.
- `src/app/app.ts`: nombre y tagline del sitio.
- `.firebaserc`: copia `.firebaserc.example` y cambia el Firebase Project ID.

## GitHub Actions

El workflow `.github/workflows/firebase-hosting.yml` necesita estos secrets en el repo:

- `FIREBASE_PROJECT_ID`: ID del proyecto Firebase.
- `FIREBASE_SERVICE_ACCOUNT`: JSON completo de una service account con permiso para Firebase Hosting.

## Notas para automatización

- La salida de build queda en `dist/site/browser`.
- `firebase.json` ya incluye rewrite SPA hacia `index.html`.
- El workflow despliega al hacer push a `main` o al ejecutarlo manualmente.
