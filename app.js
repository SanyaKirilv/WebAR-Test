document.addEventListener("DOMContentLoaded", async () => {
  // Настройка контейнера и MindAR
  const container = document.getElementById("ar-container");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: container,
      imageTargetSrc: "targets.mind", // Укажите путь к файлу таргета
  });

  const { renderer, scene, camera } = mindarThree;

  // Добавляем свет в сцену
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // Добавляем 3D-объект
  const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);

  // Добавляем объект к якорю
  const anchor = mindarThree.addAnchor(0); // Привязываем объект к первому таргету
  anchor.group.add(box);

  // Обработка событий таргета
  anchor.onTargetFound = () => {
      console.log("Target found");
  };

  anchor.onTargetLost = () => {
      console.log("Target lost");
  };

  // Анимация объекта
  const animate = () => {
      box.rotation.y += 0.01; // Вращение объекта
      renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(animate);

  // Старт AR
  await mindarThree.start();
  console.log("MindAR started");
});

