export function generateNavMesh(data, container) {
    const vertices = data.vertices.map(v => new THREE.Vector3(v.x, v.y, v.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);

    const navMeshEl = document.createElement('a-entity');
    navMeshEl.setObject3D('mesh', mesh);
    container.appendChild(navMeshEl);
}
