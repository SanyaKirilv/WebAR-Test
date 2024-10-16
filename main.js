import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

let scene, camera, renderer, reticle, controller;
let model = null;
let hitTestSource = null;
let hitTestSourceRequested = false;

if (navigator.xr) {
    init();
    animate();
} else {
    console.error('WebXR is not supported on this device or browser.');
}

function init() {
    // Создание сцены
    scene = new THREE.Scene();

    // Камера
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Включение AR-сессии
    navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'] })
        .then(session => {
            renderer.xr.setSession(session);
        })
        .catch(err => {
            console.error('Error initializing AR session:', err);
        });

    // Контроллер для взаимодействия
    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    // Загрузка 3D модели
    const loader = new GLTFLoader();
    loader.load('src/apple.glb', function (gltf) {
        model = gltf.scene;
        model.visible = false; // По умолчанию модель скрыта
        scene.add(model);
    });

    // Reticle для определения плоскости
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x0fff00 });
    reticle = new THREE.Mesh(geometry, material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onSelect() {
    if (reticle.visible && model) {
        model.position.setFromMatrixPosition(reticle.matrix);
        model.visible = true; // Показываем модель при выборе места
    }
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
    if (frame) {
        const session = renderer.xr.getSession();

        if (!hitTestSourceRequested) {
            session.requestReferenceSpace('viewer').then(referenceSpace => {
                session.requestHitTestSource({ space: referenceSpace }).then(source => {
                    hitTestSource = source;
                });
            });

            session.addEventListener('end', () => {
                hitTestSourceRequested = false;
                hitTestSource = null;
            });

            hitTestSourceRequested = true;
        }

        if (hitTestSource) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];

                const pose = hit.getPose(referenceSpace);
                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            } else {
                reticle.visible = false;
            }
        }
    }

    renderer.render(scene, camera);
}