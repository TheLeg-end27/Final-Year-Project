function openDatabase() {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open('MapMessagesDB', 1);

      request.onerror = function(event) {
          reject("Database error: " + event.target.errorCode);
      };

      request.onsuccess = function(event) {
          resolve(event.target.result);
      };

      request.onupgradeneeded = function(event) {
          let db = event.target.result;
          db.createObjectStore('messages', { autoIncrement: true });
      };
  });
}

function storeMessage(lat, lng, message,  db) {
  let transaction = db.transaction(['messages'], 'readwrite');
  let objectStore = transaction.objectStore('messages');
  let request = objectStore.add({ lat, lng, message });

  request.onerror = function(event) {
      console.error("Error adding message to DB: ", event.target.error);
  };

  request.onsuccess = function(event) {
      console.log("Message added to DB successfully");
  };
}

function loadMessages(db) {
  let transaction = db.transaction(['messages']);
  let objectStore = transaction.objectStore('messages');
  let request = objectStore.openCursor();

  request.onerror = function(event) {
      console.error("Error fetching messages from DB: ", event.target.error);
  };

  request.onsuccess = function(event) {
      let cursor = event.target.result;
      if (cursor) {
          let marker = L.marker([cursor.value.lat, cursor.value.lng]).addTo(container);
          marker.bindPopup(cursor.value.message);
          cursor.continue();
      }
  };
}

function initMap(db) {
  container.on('click', function(e) {
    let message = prompt("Enter your message for this location:", "");
    if (message) {
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(container)
        .bindPopup(message);
        storeMessage(e.latlng.lat, e.latlng.lng, message, db);
    }
  });
}


openDatabase().then(db => {
  loadMessages(db);
  initMap(db);
}).catch(error => {
  console.error("Failed to open DB: ", error);
});
//const container = L.map('map', {
//  center: L.latLng(40.416775, -3.703790),
//  zoom: 5,
//});
//var ml = MapLibreGL({

//}).addTo(container);
//ml.getMaplibreMap().addSource('data', {
//  type: 'vector',
//  url: "../static/surrey-latest.osm.pbf"
//});
//const vectorLayer = vectorTileLayer("../static/surrey-latest.osm.pbf", { 
//  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//}).addTo(container); 
//var mb = L.TileLayer.mbTiles('../static/output.mbtiles').addTo(container); //Data taken from MapTiler (non-commercial use only!)
//L.vectorGrid.protobuf("../static/surrey-latest.osm.pbf", {
//  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//}).addTo(container);
//L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //maxZoom: 19,
  //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//}).addTo(container);
