self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('hello-world-cache').then(function(cache) {
            return cache.addAll([
                '/',
                '/helloWorld.html'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});