import '../scss/styles.scss'
import 'leaflet.markercluster'

function hasClass(element, cls) {
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

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

function showReportForm() {
  const modal = document.querySelector(".modalReport");
  const overlay = document.querySelector(".overlay");
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function reportMessage(message, reason, lat, lng) {
  return fetch('/send-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken' : getCookie('csrftoken')
    },
    body: JSON.stringify({message, reason, lat, lng})
  }).catch(error => console.error('Error:', error));
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
        var marker = L.marker([lat, lng]);
        var popup = L.DomUtil.create('div', 'window');
        popup.innerHTML = "<div class='popup-container'><img src='https://www.svgrepo.com/show/430432/line-flag.svg' class='report-icon' width=20/><p>" + message + "</p></div>";
        popup.addEventListener('click', function(event){
          var popupContentElement = event.target.closest('.leaflet-popup-content');
          var popupContent = popupContentElement ? popupContentElement.innerHTML : '';
          var parser = new DOMParser();
          var doc = parser.parseFromString(popupContent, "text/html");
          var messageText = doc.querySelector('.popup-container p').textContent;
          document.getElementById("reportMessage").innerHTML = messageText;
          console.log(messageText);
          const form = document.getElementById("report");
          form.dataset.lat = lat;
          form.dataset.lng = lng;
          showReportForm();
          console.log('popup clicked');
        }); 
        marker.bindPopup(popup);
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
        let marker = L.marker([cursor.value.lat, cursor.value.lng]);
        var popup = L.DomUtil.create('div', 'window');
        popup.innerHTML = "<div class='popup-container'><img src='https://www.svgrepo.com/show/430432/line-flag.svg' class='report-icon' width=20/><p>" + cursor.value.message + "</p></div>";
        popup.addEventListener('click', function(event){
          var popupContentElement = event.target.closest('.leaflet-popup-content');
          var popupContent = popupContentElement ? popupContentElement.innerHTML : '';
          var parser = new DOMParser();
          var doc = parser.parseFromString(popupContent, "text/html");
          var messageText = doc.querySelector('.popup-container p').textContent;
          document.getElementById("reportMessage").innerHTML = messageText;
          console.log(messageText);
          const form = document.getElementById("report");
          form.dataset.lat = cursor.value.lat;
          form.dataset.lng = cursor.value.lng;
          showReportForm();
          console.log('popup clicked');
        }); 
        marker.bindPopup(popup);
        markers.addLayer(marker);
        cursor.continue();
    }
  };
}

function initMap(db) { 
  loadMessages(db); 
  const modal = document.querySelector(".modalReport");
  const overlay = document.querySelector(".overlay");
  const closeModalBtn = document.querySelector(".btn-close");
  closeModalBtn.addEventListener("click", function(event) {
      modal.classList.add("hidden");
      overlay.classList.add("hidden");
  });
  document.getElementById("reportSubmit").addEventListener("click", function(event) {
    event.preventDefault();
    const reason = document.getElementById('reportReason').value;
    console.log("Reporting message for reason:", reason);
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    var messageText = document.getElementById("reportMessage").innerHTML;
    const form = document.getElementById("report");
    const lat = form.dataset.lat;
    const lng = form.dataset.lng;
    reportMessage(messageText, reason, lat, lng);
  });
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
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      if (!containsKeyword) {
        storeLocalMessageToRemote(db);
        storeMessageLocal(lat, lng, message, db);
        var marker = L.marker([lat, lng])
        .bindPopup(message);
        var popup = L.DomUtil.create('div', 'window');
        popup.innerHTML = "<div class='popup-container'><img src='https://www.svgrepo.com/show/430432/line-flag.svg' class='report-icon' width=20/><p>" + message + "</p></div>";
        popup.addEventListener('click', function(event){
          var popupContentElement = event.target.closest('.leaflet-popup-content');
          var popupContent = popupContentElement ? popupContentElement.innerHTML : '';
          var parser = new DOMParser();
          var doc = parser.parseFromString(popupContent, "text/html");
          var messageText = doc.querySelector('.popup-container p').textContent;
          document.getElementById("reportMessage").innerHTML = messageText;
          console.log(messageText);
          const form = document.getElementById("report");
          form.dataset.lat = lat;
          form.dataset.lng = lng;
          showReportForm();
          console.log('popup clicked');
        }); 
        marker.bindPopup(popup);
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