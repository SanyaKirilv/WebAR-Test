// Инициализация карты
const map = L.map('map').setView([55.7558, 37.6176], 10); // Центрируем на Москве
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let destinationMarker = null;
let targetLocation = null;
const distanceDisplay = document.getElementById("distance");

// Загрузка данных о локациях
fetch('locations.json')
  .then(response => response.json())
  .then(data => {
    const select = document.getElementById('locationSelect');
    data.forEach(location => {
      const option = document.createElement('option');
      option.value = JSON.stringify(location);
      option.text = location.name;
      select.appendChild(option);
    });
  });

// Обработчик выбора локации
document.getElementById('locationSelect').addEventListener('change', (event) => {
  targetLocation = JSON.parse(event.target.value);
  if (targetLocation) {
    setDestination(targetLocation);
  }
});

// Установка цели на карте и в AR
function setDestination(location) {
  if (destinationMarker) map.removeLayer(destinationMarker);
  destinationMarker = L.marker([location.latitude, location.longitude]).addTo(map)
    .bindPopup(`<b>${location.name}</b>`).openPopup();
  map.setView([location.latitude, location.longitude], 14);

  const arMarker = document.getElementById('ar-marker');
  arMarker.setAttribute('gps-entity-place', `latitude: ${location.latitude}; longitude: ${location.longitude}`);
  arMarker.setAttribute('text', `value: ${location.name}; align: center;`);

  updateDistance();
}

// Обновление расстояния до цели
function updateDistance() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(position => {
      if (targetLocation) {
        const distance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          targetLocation.latitude,
          targetLocation.longitude
        );
        distanceDisplay.innerText = `Расстояние до ${targetLocation.name}: ${distance.toFixed(2)} метров`;
      }
    });
  }
}

// Расчет расстояния между двумя точками (формула Гаверсина)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Радиус Земли в метрах
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Возвращает расстояние в метрах
}