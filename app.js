document.addEventListener("DOMContentLoaded", async () => {
  // Настройка сцены и камеры
  const container = document.getElementById("ar-container");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: container,
      imageTargetSrc: "targets.mind", // Замените на ваш файл с таргетом
  });

  const { renderer, scene, camera } = mindarThree;

  // Добавляем свет
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // Добавляем 3D-объект (например, куб)
  const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);

  // Добавляем объект к якорю
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(box);

  // Логика закрепления объекта
  let isImageLost = false;
  anchor.onTargetLost = () => {
      console.log("Image lost");
      isImageLost = true;
  };

  anchor.onTargetFound = () => {
      console.log("Image found");
      isImageLost = false;
  };

  const animate = () => {
      if (!isImageLost) {
          box.rotation.y += 0.01; // Анимация вращения
      }
      renderer.setAnimationLoop(animate);
  };

  // Запуск сцены
  await mindarThree.start();
  animate();
});
