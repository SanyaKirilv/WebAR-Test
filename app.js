// API-ключ Mapbox
const MAPBOX_API_KEY = 'pk.eyJ1Ijoic2FzaGFraXJpbHYiLCJhIjoiY20ybTBsNGtnMGduMzJrc2Y2bGt0NjV0MSJ9.X2O9EyRNKBlB6B3b7Rfx2g';

// Инициализация списка локаций
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

let targetLocation = null;

// Обработчик выбора локации
document.getElementById('locationSelect').addEventListener('change', (event) => {
  targetLocation = JSON.parse(event.target.value);
  if (targetLocation) {
    calculateRoute(targetLocation);
  }
});

// Получение текущей локации и прокладка маршрута
function calculateRoute(destination) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const startCoords = [position.coords.longitude, position.coords.latitude];
      const endCoords = [destination.longitude, destination.latitude];

      // Запрос маршрута к API Mapbox
      fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${startCoords.join(',')};${endCoords.join(',')}?steps=true&access_token=${MAPBOX_API_KEY}`)
        .then(response => response.json())
        .then(data => {
          const steps = data.routes[0].legs[0].steps;
          plotRouteInAR(steps);
        })
        .catch(error => console.error('Ошибка запроса маршрута:', error));
    });
  } else {
    alert("Геолокация не поддерживается вашим браузером");
  }
}

// Отображение маршрута в AR
function plotRouteInAR(steps) {
  const scene = document.querySelector('a-scene');

  // Удаление предыдущих маркеров маршрута
  document.querySelectorAll('.ar-step').forEach(el => el.remove());

  // Отображение каждой точки маршрута как маркера
  steps.forEach((step, index) => {
    const { maneuver } = step;
    const marker = document.createElement('a-entity');

    marker.setAttribute('gps-entity-place', `latitude: ${maneuver.location[1]}; longitude: ${maneuver.location[0]}`);
    marker.setAttribute('text', `value: Step ${index + 1}; align: center;`);
    marker.setAttribute('scale', '5 5 5');
    marker.classList.add('ar-step');

    scene.appendChild(marker);
  });
}