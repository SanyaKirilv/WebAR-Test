let markersData = [];
let targetsData = [];
let navmeshData = null;

let userPosition = { x: 0, y: 0, z: 0 };
let userNode = null;
let selectedTarget = null;
let route = [];

window.addEventListener('load', () => {
    Promise.all([
        fetch('./markers.json').then(r => r.json()),
        fetch('./targets.json').then(r => r.json()),
        fetch('./navmesh.json').then(r => r.json())
    ]).then(([markersJson, targetsJson, navmeshJson]) => {
        markersData = markersJson.Objects;
        targetsData = targetsJson.Objects;
        navmeshData = navmeshJson;

        initTargetDropdown();
        drawMinimap();
        initTargetsEntities();
        initMarkerEvents();
    }).catch(err => console.error('Ошибка загрузки данных:', err));
});

function initTargetDropdown() {
    const select = document.getElementById('target-select');
    // Очистим опции (кроме первой "Выберите цель")
    while (select.options.length > 1) {
        select.remove(1);
    }
    targetsData.forEach((t, idx) => {
        const opt = document.createElement('option');
        opt.value = idx; // индекс цели
        opt.textContent = t.Name;
        select.appendChild(opt);
    });

    select.addEventListener('change', () => {
        const val = select.value;
        if (val !== "") {
            const targetObj = targetsData[val];
            onSelectTarget(targetObj);
        } else {
            selectedTarget = null;
            route = [];
            drawMinimap();
            clearRouteInScene();
        }
    });
}

function drawMinimap() {
    const canvas = document.getElementById('minimap');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,200,200);

    const allX = targetsData.map(t => t.Position.x)
        .concat(markersData.map(m => m.Position.x))
        .concat(navmeshData.vertices.map(v => v.x))
        .concat([userPosition.x]);

    const allZ = targetsData.map(t => t.Position.z)
        .concat(markersData.map(m => m.Position.z))
        .concat(navmeshData.vertices.map(v => v.z))
        .concat([userPosition.z]);

    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minZ = Math.min(...allZ);
    const maxZ = Math.max(...allZ);

    function mapX(x) {
        if (maxX === minX) return 100;
        return ((x - minX) / (maxX - minX)) * 200;
    }

    function mapZ(z) {
        if (maxZ === minZ) return 100;
        return ((z - minZ) / (maxZ - minZ)) * 200;
    }

    // Цели
    ctx.fillStyle = 'blue';
    targetsData.forEach(t => {
        const px = mapX(t.Position.x);
        const pz = mapZ(t.Position.z);
        ctx.fillRect(px-2, pz-2, 4,4);
    });

    // Позиция пользователя
    ctx.fillStyle = 'red';
    const ux = mapX(userPosition.x);
    const uz = mapZ(userPosition.z);
    ctx.fillRect(ux-3, uz-3, 6,6);

    // Маршрут
    if (route && route.length > 0) {
        ctx.strokeStyle = 'green';
        ctx.beginPath();
        route.forEach((pt, i) => {
            const x = mapX(pt.x);
            const z = mapZ(pt.z);
            if (i === 0) ctx.moveTo(x,z);
            else ctx.lineTo(x,z);
        });
        ctx.stroke();
    }
}

function initTargetsEntities() {
    const container = document.getElementById('targets-container');
    targetsData.forEach(t => {
        const el = document.createElement('a-entity');
        el.setAttribute('position', `${t.Position.x} ${t.Position.y} ${t.Position.z}`);
        el.setAttribute('geometry', 'primitive: sphere; radius:0.5');
        el.setAttribute('material', 'color: yellow; opacity:0.7');
        el.setAttribute('id', `target-${t.Name}`);
        const text = document.createElement('a-entity');
        text.setAttribute('text', `value:${t.Name}; align:center; color:#000; width:10`);
        text.setAttribute('position', '0 1 0');
        el.appendChild(text);
        container.appendChild(el);
    });
}

function initMarkerEvents() {
    const markerTech7 = document.getElementById('marker-tech7');
    markerTech7.addEventListener('markerFound', () => {
        const mObj = markersData.find(m => m.Name === 'tech_7');
        if (mObj) {
            userPosition = { x: mObj.Position.x, y: mObj.Position.y, z: mObj.Position.z };
            updateUserPosition();
        }
    });
}

function updateUserPosition() {
    userNode = findClosestVertex(userPosition, navmeshData.vertices);
    drawMinimap();
}

function onSelectTarget(targetObj) {
    selectedTarget = targetObj;
    if (userNode !== null) {
        const targetNode = findClosestVertex(targetObj.Position, navmeshData.vertices);
        const graph = buildGraphFromMesh(navmeshData.vertices, navmeshData.indices);
        const pathIds = aStar(graph, userNode, targetNode);

        route = pathIds.map(id => {
            const v = navmeshData.vertices[id];
            return { x: v.x, y: v.y, z: v.z };
        });

        drawMinimap();
        drawRouteInScene(route);
    }
}

function clearRouteInScene() {
    const pathContainer = document.getElementById('path-container');
    pathContainer.innerHTML = '';
}

function drawRouteInScene(routePoints) {
    const pathContainer = document.getElementById('path-container');
    pathContainer.innerHTML = '';
    if (!routePoints || routePoints.length < 2) return;

    for (let i=0; i<routePoints.length-1; i++) {
        const p1 = routePoints[i];
        const p2 = routePoints[i+1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const mid = { x: (p1.x+p2.x)/2, y:(p1.y+p2.y)/2, z:(p1.z+p2.z)/2 };
        const cylinder = document.createElement('a-entity');
        cylinder.setAttribute('geometry', `primitive: cylinder; height: ${dist}; radius:0.1`);
        cylinder.setAttribute('material', 'color: green; opacity:0.8');
        const rotation = calcRotation(dx, dy, dz);
        cylinder.setAttribute('position', `${mid.x} ${mid.y} ${mid.z}`);
        cylinder.setAttribute('rotation', `${rotation.x} ${rotation.y} ${rotation.z}`);
        pathContainer.appendChild(cylinder);
    }
}

function calcRotation(dx, dy, dz) {
    const length = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const pitch = Math.asin(dy / length) * (180/Math.PI);
    const yaw = Math.atan2(dx, dz) * (180/Math.PI);
    return {x:pitch, y:yaw, z:0};
}

function findClosestVertex(pos, vertices) {
    let closestIndex = -1;
    let minDist = Infinity;
    vertices.forEach((v,i) => {
        const dx = v.x - pos.x;
        const dz = v.z - pos.z;
        const d = Math.sqrt(dx*dx + dz*dz);
        if (d < minDist) {
            minDist = d;
            closestIndex = i;
        }
    });
    return closestIndex;
}

function buildGraphFromMesh(vertices, indices) {
    const adj = new Map();
    for (let i = 0; i < vertices.length; i++) {
        adj.set(i, []);
    }

    for (let i = 0; i < indices.length; i+=3) {
        const i0 = indices[i];
        const i1 = indices[i+1];
        const i2 = indices[i+2];

        addEdge(adj, i0, i1);
        addEdge(adj, i1, i2);
        addEdge(adj, i2, i0);
    }

    return { 
        vertices: vertices,
        adj: adj
    };
}

function addEdge(adj, a, b) {
    const arrA = adj.get(a);
    const arrB = adj.get(b);
    if (!arrA.includes(b)) arrA.push(b);
    if (!arrB.includes(a)) arrB.push(a);
}

function heuristic(a, b, vertices) {
    const A = vertices[a];
    const B = vertices[b];
    const dx = A.x - B.x;
    const dz = A.z - B.z;
    return Math.sqrt(dx*dx + dz*dz);
}

function aStar(graph, start, goal) {
    const openSet = [start];
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    for (let i = 0; i < graph.vertices.length; i++) {
        gScore[i] = Infinity;
        fScore[i] = Infinity;
    }

    gScore[start] = 0;
    fScore[start] = heuristic(start, goal, graph.vertices);

    while (openSet.length > 0) {
        let current = openSet.reduce((acc,cur)=> fScore[cur]<fScore[acc]?cur:acc, openSet[0]);
        if (current === goal) {
            return reconstructPath(cameFrom, current);
        }
        openSet.splice(openSet.indexOf(current),1);
        const neighbors = graph.adj.get(current);
        neighbors.forEach(neighbor => {
            const tentative_g = gScore[current] + heuristic(current, neighbor, graph.vertices);
            if (tentative_g < gScore[neighbor]) {
                cameFrom[neighbor] = current;
                gScore[neighbor] = tentative_g;
                fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, goal, graph.vertices);
                if (!openSet.includes(neighbor)) openSet.push(neighbor);
            }
        });
    }

    return [];
}

function reconstructPath(cameFrom, current) {
    const totalPath = [current];
    while (cameFrom[current] !== undefined) {
        current = cameFrom[current];
        totalPath.unshift(current);
    }
    return totalPath;
}
