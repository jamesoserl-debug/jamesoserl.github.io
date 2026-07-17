/* ─────────────────────────────────────────────────────────
   SERVICE WORKER — Turni PS
   Tiene una copia locale dell'app per farla funzionare offline.

   ⚠️ IMPORTANTE PER GLI AGGIORNAMENTI:
   ogni volta che modifichi index.html (o gli altri file),
   cambia il numero qui sotto (es. v1 → v2). Questo dice al
   telefono "c'e una versione nuova, scaricala" ed evita che
   resti bloccato sulla vecchia copia in cache.
   ───────────────────────────────────────────────────────── */

const CACHE = 'turni-ps-v36';

// File che compongono l'app, salvati per l'uso offline.
// Percorsi relativi (./) così funzionano nella sottocartella GitHub.
const FILE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './mod_106.pdf',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'
];

// Installazione: scarica e salva i file in cache
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(FILE);
    })
  );
  self.skipWaiting();  // attiva subito la nuova versione
});

// Attivazione: cancella le cache vecchie (versioni precedenti)
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (chiavi) {
      return Promise.all(
        chiavi.filter(function (k) { return k !== CACHE; })
              .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Richieste: prima prova la rete, se non c'e usa la copia in cache.
// Cosi quando sei online vedi sempre l'ultima versione pubblicata,
// e quando sei offline l'app continua a funzionare.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (risposta) {
        const copia = risposta.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(e.request, copia);
        });
        return risposta;
      })
      .catch(function () {
        return caches.match(e.request).then(function (c) {
          return c || caches.match('./index.html');
        });
      })
  );
});
