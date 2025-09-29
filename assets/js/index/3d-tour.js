import { preloadImages } from "../../libs/utils.js";
("use strict");
$ = jQuery;

function paronomaImage() {
  const images = [
    "./assets/images/360-tour/frame_000.jpg",
    "./assets/images/360-tour/frame_001.jpg",
    "./assets/images/360-tour/frame_002.jpg"
  ];
  let currentIndex = 0;

  // scene
  const scene = new THREE.Scene();

  // camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0.1);

  // renderer
  const canvas = document.getElementById("paronama-tour");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // sphere
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  const textureLoader = new THREE.TextureLoader();
  let material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(images[currentIndex])
  });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enablePan = false;

  // Zoom functionality with mouse wheel
  window.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const zoomSpeed = 0.05;
      const minFov = 30;
      const maxFov = 100;

      let newFov = camera.fov + event.deltaY * zoomSpeed;
      newFov = Math.max(minFov, Math.min(maxFov, newFov));

      camera.fov = newFov;
      camera.updateProjectionMatrix();
    },
    { passive: false }
  );

  // button prev/next
  const prevBtn = document.querySelector(".paronama-tour .prev");
  const nextBtn = document.querySelector(".paronama-tour .next");

  function updateButtons() {
    if (currentIndex === 0) {
      prevBtn.disabled = true;
      prevBtn.classList.add("disabled");
    } else {
      prevBtn.disabled = false;
      prevBtn.classList.remove("disabled");
    }

    if (currentIndex === images.length - 1) {
      nextBtn.disabled = true;
      nextBtn.classList.add("disabled");
    } else {
      nextBtn.disabled = false;
      nextBtn.classList.remove("disabled");
    }
  }

  // change image
  function changeImage(index) {
    currentIndex = Math.max(0, Math.min(index, images.length - 1));
    const newTexture = textureLoader.load(images[currentIndex]);
    material.map.dispose();
    material.map = newTexture;
    updateButtons();
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) changeImage(currentIndex - 1);
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < images.length - 1) changeImage(currentIndex + 1);
  });

  updateButtons(); // init button

  // render loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const btnHideHeader = $(".paronama-tour .control-hide");
  btnHideHeader.on("click", function () {
    btnHideHeader.toggleClass("active");
    $("#header").toggleClass("hide-header");
  });
}

const init = () => {
  gsap.registerPlugin(ScrollTrigger);
  paronomaImage();
};
preloadImages("img").then(() => {
  // Once images are preloaded, remove the 'loading' indicator/class from the body

  init();
});

// loadpage
let isLinkClicked = false;
$("a").on("click", function (e) {
  // Nếu liên kết dẫn đến trang khác (không phải hash link hoặc javascript void)
  if (this.href && !this.href.match(/^#/) && !this.href.match(/^javascript:/)) {
    isLinkClicked = true;
    console.log("1");
  }
});

$(window).on("beforeunload", function () {
  if (!isLinkClicked) {
    $(window).scrollTop(0);
  }
  isLinkClicked = false;
});
