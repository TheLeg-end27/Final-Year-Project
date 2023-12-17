self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('map-cache').then(function(cache) {
            return cache.addAll([
                '/',
                '/hello-world',
                '/map',
                '/static/myapp/egham'
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