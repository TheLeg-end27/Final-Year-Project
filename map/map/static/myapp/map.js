function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

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

function storeMessage(lat, lng, message) {
  fetch('/store-message', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') 
    },
    body: JSON.stringify({ lat, lng, message })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
}

function storeMessageLocal(lat, lng, message,  db) {
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
function loadMessages() {
  fetch('/get-messages')
  .then(response => response.json())
  .then(messages => {
      messages.forEach(msg => { 
          L.marker([msg.latitude, msg.longitude]).addTo(map)
           .bindPopup(msg.message);
      });
  })
  .catch(error => console.error('Error:', error));
}
function loadMessagesLocal(db) {
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
  loadMessages();
  container.on('click', function(e) {
    let message = prompt("Enter your message for this location:", "");
    if (message) {
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(container)
        .bindPopup(message);
        storeMessageLocal(e.latlng.lat, e.latlng.lng, message, db);
        storeMessage(e.latlng.lat, e.latlng.lng, message);
    }
  });
}

openDatabase().then(db => {
  loadMessagesLocal(db);
  initMap(db);
}).catch(error => {
  console.error("Failed to open DB: ", error);
});