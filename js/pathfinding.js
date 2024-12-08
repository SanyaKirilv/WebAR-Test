import PF from 'pathfinding';

export function findPath(start, target, container) {
    const grid = new PF.Grid(20, 20); // Пример сетки
    const finder = new PF.AStarFinder();

    const path = finder.findPath(
        Math.round(start.x), Math.round(start.z),
        Math.round(target.x), Math.round(target.z),
        grid
    );

    path.forEach(([x, z]) => {
        const box = document.createElement('a-box');
        box.setAttribute('position', `${x} 0.05 ${z}`);
        box.setAttribute('depth', 0.2);
        box.setAttribute('height', 0.1);
        box.setAttribute('width', 0.2);
        box.setAttribute('color', '#FFC107');
        container.appendChild(box);
    });
}
