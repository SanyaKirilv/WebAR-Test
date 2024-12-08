import { generateNavMesh } from './navmesh.js';
import { findPath } from './pathfinding.js';
import { initializeMiniMap, updateMiniMap } from './minimap.js';

document.addEventListener('DOMContentLoaded', () => {
    const targetSelect = document.getElementById('target-select');
    const buildRouteButton = document.getElementById('build-route');
    const pathContainer = document.getElementById('path-container');
    const markers = {};
    let currentPosition = { x: 0, z: 0 };

    // Загрузка маркеров и целей
    Promise.all([
        fetch('assets/markers.json').then(res => res.json()),
        fetch('assets/targets.json').then(res => res.json()),
        fetch('assets/navmesh.json').then(res => res.json())
    ]).then(([markerData, targetData, navMeshData]) => {
        setupMarkers(markerData.Objects, markers);
        populateTargets(targetData.Objects, targetSelect);
        generateNavMesh(navMeshData, pathContainer);
        initializeMiniMap(navMeshData);
    });

    // Обработка событий
    buildRouteButton.addEventListener('click', () => {
        const targetValue = targetSelect.value;
        if (!targetValue) return;

        const targetCoords = JSON.parse(targetValue);
        findPath(currentPosition, targetCoords, pathContainer);
        updateMiniMap(currentPosition, targetCoords);
    });

    function setupMarkers(markerList, markerDict) {
        markerList.forEach(marker => {
            const markerEl = document.getElementById(marker.Name);
            markerDict[marker.Name] = marker;

            if (markerEl) {
                markerEl.addEventListener('markerFound', () => calibratePosition(marker));
            }
        });
    }

    function calibratePosition(marker) {
        currentPosition = {
            x: marker.Position.x,
            z: marker.Position.z
        };
        console.log(`Calibrated to marker: ${marker.Name} at position ${JSON.stringify(currentPosition)}`);
    }

    function populateTargets(targetList, selectElement) {
        targetList.forEach(target => {
            const option = document.createElement('option');
            option.value = JSON.stringify(target.Position);
            option.textContent = target.Name;
            selectElement.appendChild(option);
        });
    }
});
