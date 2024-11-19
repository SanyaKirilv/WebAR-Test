document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("ar-container");

    try {
        // Инициализация MindAR
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: container,
            imageTargetSrc: "./targets.mind", // Укажите путь к файлу таргета
        });

        const { renderer, scene, camera } = mindarThree;

        // Настройка сцены
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        // Добавление куба
        const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);

        const anchor = mindarThree.addAnchor(0);
        anchor.group.add(box);

        // Логирование событий
        anchor.onTargetFound = () => {
            console.log("Таргет найден");
        };

        anchor.onTargetLost = () => {
            console.log("Таргет потерян");
        };

        // Анимация
        const animate = () => {
            box.rotation.y += 0.01;
            renderer.render(scene, camera);
        };
        renderer.setAnimationLoop(animate);

        // Старт AR
        await mindarThree.start();
        console.log("MindAR запущен");
    } catch (error) {
        console.error("Ошибка запуска AR:", error);

        // Если камера недоступна, проверяем доступные устройства
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Ваше устройство не поддерживает доступ к камере.");
        }
    }
});
