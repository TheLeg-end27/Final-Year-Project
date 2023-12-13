import "@maptiler/leaflet-maptilersdk";

const container = L.map('map', {
  center: L.latLng(0, 0),
  zoom: 5,
});
const mtLayer = new L.MaptilerLayer({
  apiKey: "4W7hbfVzmdhfQlQP7vJX",
}).addTo(container); 

