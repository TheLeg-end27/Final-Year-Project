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
          db.createObjectStore('new-messages', { autoIncrement: true });
      };
  });
}

function storeMessage(lat, lng, message) {
  return fetch('/store-message', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') 
    },
    body: JSON.stringify({ lat, lng, message })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(json => {
        throw {status: response.status, message: json.error || "Server responded with an error!"};
      });
    }
    return response.json();
  });
}

function storeLocalMessageToRemote(db) {
  let transaction = db.transaction(['new-messages'], 'readwrite');
  let objectStore = transaction.objectStore('new-messages');
  let request = objectStore.openCursor();

  request.onerror = function(event) {
    console.error("Error fetching messages from DB: ", event.target.error);
  };

  request.onsuccess = function(event) {
    let cursor = event.target.result;
    let containsKeyword = false;
    if (cursor) {
      storeMessage(cursor.value.lat, cursor.value.lng, cursor.value.message).then(data => {
      }).catch(error => {
        console.error('Error:', error.message);
        if (error.status === 422) {
          if (!containsKeyword) {
            alert("Your message contains inappropriate content.");
          }
          containsKeyword = true;
        }
      });
      cursor.continue();
    }
    objectStore.clear();
  };
}

function storeMessageLocal(lat, lng, message,  db) {
  let transaction = db.transaction(['new-messages'], 'readwrite');
  let objectStore = transaction.objectStore('new-messages');
  let request = objectStore.add({ lat, lng, message });

  request.onerror = function(event) {
      console.error("Error adding message to DB: ", event.target.error);
  };

  request.onsuccess = function(event) {
      console.log("Message added to DB successfully");
  };
}
function loadMessages(db) {
  fetch('/get-messages')
  .then(response => response.json())
  .then(messages => {
    markers.clearLayers();
    let transaction = db.transaction(['messages'], 'readwrite');
    let objectStore = transaction.objectStore('messages');
    objectStore.clear();
    messages.forEach(msg => { 
        let lat = msg.latitude;
        let lng = msg.longitude;
        let message = msg.message;
        objectStore.add({lat, lng, message});
        var marker = L.marker([lat, lng]).bindPopup(msg.message);
        markers.addLayer(marker);
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
  loadMessages(db);
  container.off('click').on('click', function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    let message = prompt("Enter your message for this location:", "");
    var containsKeyword = false;
    if (message) {
      storeMessage(e.latlng.lat, e.latlng.lng, message).then(data => {
      }).catch(error => {
        console.error('Error:', error.message);
        if (error.status === 422) {
          containsKeyword = true;
          alert("Your message contains inappropriate content.");
        }
      });
      if (!containsKeyword) {
        storeLocalMessageToRemote(db);
        storeMessageLocal(e.latlng.lat, e.latlng.lng, message, db);
        var marker = L.marker([e.latlng.lat, e.latlng.lng])
        .bindPopup(message);
        markers.addLayer(marker);
        }
      }
  });
}

openDatabase().then(db => {
  loadMessagesLocal(db);
  initMap(db);
}).catch(error => {
  console.error("Failed to open DB: ", error);
});