global.Response = function (body, init) {
    return {
      body: body,
      status: (init && init.status) || 200,
      json: () => Promise.resolve(body),

    };
};

global.Request = function(url, options) {
    return {
      url,
      method: (options && options.method) || 'GET',
      headers: (options && options.headers) || {},
    };
};

class MockFetchEvent extends Event {
    constructor(type, { request, respondWith }) {
        super(type);
        this.request = request;
        this.respondWith = respondWith || jest.fn();
    }
}

global.FetchEvent = MockFetchEvent;

beforeEach(() => {
    global.caches = {
        open: jest.fn().mockResolvedValue({
        }),
        delete: jest.fn().mockResolvedValue(true),
        keys: jest.fn().mockResolvedValue(['old-cache', 'current-cache']),
    };
});

  
global.fetch = jest.fn();
beforeEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
    value: {
        register: jest.fn().mockResolvedValue({
            scope: '/mock-scope',
        }),
    },
    writable: true,
    });
});
  
beforeEach(() => {
    global.caches = {
        open: jest.fn().mockResolvedValue({
            put: jest.fn().mockResolvedValue(undefined),
            match: jest.fn().mockResolvedValue(new Response('mock response')),
        }),
    };
});
  
it('should register the service worker', async () => {
    await navigator.serviceWorker.register('{% static "myapp/service-worker.js" %}', { scope: '/static/myapp/' });
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('{% static "myapp/service-worker.js" %}', { scope: '/static/myapp/' });
});
 
it('should cache files during service worker installation', async () => {
    const event = new Event('install');
    self.dispatchEvent(event);
    await event.waitUntil;
    expect(caches.open).toHaveBeenCalledWith('your-cache-name');
});
 
it('should clear old caches during service worker activation', async () => {
    const event = new Event('activate');
    self.dispatchEvent(event);
 
    await event.waitUntil;
 
    expect(caches.delete).toHaveBeenCalledWith('old-cache');
    expect(caches.delete).not.toHaveBeenCalledWith('current-cache');
});

it('should respond with cached data on fetch', async () => {
    const cachedResponse = new Response('Cached response');
    const networkResponse = new Response('Network response');
    caches.open.mockResolvedValue({
    match: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(cachedResponse)
    });
    global.fetch.mockResolvedValueOnce(networkResponse);

    const event = {
        request: new Request('/test'),
        respondWith: jest.fn(),
        waitUntil: jest.fn(),
    };
    self.dispatchEvent(new FetchEvent('fetch', event));
 
    await event.respondWith.mock.calls[0][0];
    expect(caches.open).toHaveBeenCalledWith('current-cache');
    expect(event.respondWith).toHaveBeenCalledWith(networkResponse);

    await event.respondWith.mock.calls[1][0];
    expect(global.fetch).toHaveBeenCalledWith(event.request);
});
 
 