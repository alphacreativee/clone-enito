import { preloadImages } from "../../libs/utils.js";
("use strict");
$ = jQuery;
// setup lenis
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
// end lenis
function slider() {
  if (!document.querySelector(".slider-image")) return;

  let interleaveOffset = 0.9;
  let isTransitioning = false; // Flag để control transition

  const sliderImages = new Swiper(".slider-image", {
    slidesPerView: 1,
    watchSlidesProgress: true,
    speed: 1000,
    loop: false,
    allowTouchMove: true, // Cho phép swipe
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    allowTouchMove: false,
    pagination: {
      el: ".slider-paginations",
      type: "fraction",
    },
    on: {
      // Trước khi slide bắt đầu chuyển
      slideChangeTransitionStart: function () {
        if (isTransitioning) return;
        isTransitioning = true;

        // 1. Ẩn content hiện tại ngay lập tức
        const currentTitleElements =
          document.querySelectorAll(".current-title");
        gsap.to(currentTitleElements, {
          autoAlpha: 0,
          y: -20,
          ease: "power2.out",
          duration: 0.3,
        });

        // 2. Sau khi content ẩn xong, hiện content mới
        setTimeout(() => {
          const swiper = this;
          const nextSlide = swiper.slides[swiper.activeIndex];
          const nextTitle = nextSlide.getAttribute("data-caption");

          const captionsContainer = document.querySelector(".slider-captions");
          if (captionsContainer && nextTitle) {
            captionsContainer.innerHTML = `<p class='current-title mb-0'>${nextTitle}</p>`;
          }

          // 3. Animate content mới vào
          const newTitleElements = document.querySelectorAll(".current-title");
          gsap.fromTo(
            newTitleElements,
            {
              autoAlpha: 0,
              y: 20,
            },
            {
              autoAlpha: 1,
              y: 0,
              ease: "power2.out",
              duration: 0.4,
              delay: 0.1, // Delay nhẹ để tạo hiệu ứng mượt
            }
          );
        }, 200); // Content mới xuất hiện sau 200ms (trước khi hình chuyển xong)
      },

      // Khi slide chuyển xong
      slideChangeTransitionEnd: function () {
        isTransitioning = false;
      },

      // Parallax effect cho hình ảnh (giữ nguyên)
      progress(swiper) {
        swiper.slides.forEach((slide) => {
          const slideProgress = slide.progress || 0;
          const innerOffset = swiper.width * interleaveOffset;
          const innerTranslate = slideProgress * innerOffset;

          if (!isNaN(innerTranslate)) {
            const slideInner = slide.querySelector(".parallax-img");
            if (slideInner) {
              slideInner.style.transform = `translate3d(${innerTranslate}px, 0, 0)`;
            }
          }
        });
      },

      touchStart(swiper) {
        swiper.slides.forEach((slide) => {
          slide.style.transition = "";
        });
      },

      setTransition(swiper, speed) {
        const easing = "cubic-bezier(0.25, 0.1, 0.25, 1)";
        swiper.slides.forEach((slide) => {
          slide.style.transition = `${speed}ms ${easing}`;
          const slideInner = slide.querySelector(".parallax-img");
          if (slideInner) {
            slideInner.style.transition = `${speed}ms ${easing}`;
          }
        });
      },
    },
  });

  const initialSlide = sliderImages.slides[sliderImages.activeIndex];
  const currentTitle = initialSlide.getAttribute("data-caption");

  const captionsContainer = document.querySelector(".slider-captions");
  if (captionsContainer && currentTitle) {
    captionsContainer.innerHTML = `<p class='current-title mb-0'>${currentTitle}</p>`;
  }
}
const init = () => {
  gsap.registerPlugin(ScrollTrigger);
  slider();
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
