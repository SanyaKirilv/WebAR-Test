document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("ar-container");

    try {
        // Инициализация MindAR
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: container,
            imageTargetSrc: "./targets.mind", // Путь к файлу с таргетом
        });

        const { renderer, scene, camera } = mindarThree;

        // Добавляем свет
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        // Создаем объект
        const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);

        // Привязываем объект к якорю
        const anchor = mindarThree.addAnchor(0);
        anchor.group.add(box);

        // Обработка событий таргета
        anchor.onTargetFound = () => {
            console.log("Target Found");
        };

        anchor.onTargetLost = () => {
            console.log("Target Lost");
        };

        // Анимация объекта
        const animate = () => {
            box.rotation.y += 0.01; // Вращение куба
            renderer.render(scene, camera);
        };

        renderer.setAnimationLoop(animate);

        // Запуск AR
        await mindarThree.start();
        console.log("AR запущен");
    } catch (error) {
        console.error("Ошибка запуска AR:", error);

        // Проверка наличия камеры
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Камера не поддерживается на этом устройстве.");
        } else {
            alert("Проблема с доступом к камере. Проверьте разрешения.");
        }
    }
});

navigator.mediaDevices.enumerateDevices().then((devices) => {
    console.log("Devices:", devices);
    if (devices.length === 0) {
        alert("Нет доступных камер.");
    }
});
