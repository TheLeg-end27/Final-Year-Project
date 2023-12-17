self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('map-cache').then(function(cache) {
            return cache.addAll([
                '/',
                '/hello-world',
                '/map'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.url.endsWith('.png')) {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                caches.match(event.request).then(function(response) {
                    return response || fetch(event.request);
                })
                return fetch(event.request).then(function(networkResponse) {
                    caches.open('map-cache').then(function(cache) {
                        cache.put(event.request, networkResponse.clone());
                    });
                    return networkResponse;
                });
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
});
