export function initializeMiniMap(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    canvas.id = 'minimap-canvas';
    document.getElementById('minimap').appendChild(canvas);

    const ctx = canvas.getContext('2d');
    data.vertices.forEach(v => {
        ctx.fillStyle = '#000';
        ctx.fillRect(v.x + 75, v.z + 75, 2, 2); // Пример отображения
    });
}

export function updateMiniMap(current, target) {
    const canvas = document.getElementById('minimap-canvas');
    const ctx = canvas.getContext('2d');

    // Очистка карты
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Текущая позиция
    ctx.fillStyle = 'green';
    ctx.fillRect(current.x + 75, current.z + 75, 5, 5);

    // Целевая позиция
    ctx.fillStyle = 'red';
    ctx.fillRect(target.x + 75, target.z + 75, 5, 5);
}
