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
        const currentTitleElements = document.querySelectorAll(
          ".current-title, .current-caption"
        );
        const currentTitleBigElements =
          document.querySelectorAll(".current-title-big");

        // Animation thường cho title và caption
        gsap.to(currentTitleElements, {
          autoAlpha: 0,
          y: -20,
          ease: "power2.out",
          duration: 0.3,
        });

        // Animation ẩn cho title-big (từng char xoay xuống dưới)
        if (currentTitleBigElements.length > 0) {
          currentTitleBigElements.forEach((titleBig) => {
            const chars = titleBig.querySelectorAll(".char");
            if (chars.length > 0) {
              gsap.to(chars, {
                "will-change": "opacity, transform",
                transformOrigin: "50% 0%",
                opacity: 0,
                rotationX: 90, // Xoay xuống
                z: -200,
                ease: "power2.in",
                duration: 0.3,
                stagger: 0.02,
              });
            } else {
              gsap.to(titleBig, {
                rotationX: 90,
                autoAlpha: 0,
                transformOrigin: "50% 0%",
                ease: "power2.in",
                duration: 0.4,
              });
            }
          });
        }

        // 2. Sau khi content ẩn xong, hiện content mới
        setTimeout(() => {
          const swiper = this;
          const nextSlide = swiper.slides[swiper.activeIndex];
          const nextTitle = nextSlide.getAttribute("data-title");
          const nextCaption = nextSlide.getAttribute("data-caption");
          const nextTitleBig = nextSlide.getAttribute("data-title-big");

          const captionsContainer = document.querySelector(".slider-captions");
          if (captionsContainer) {
            let contentHTML = "";

            // Thêm title nếu có
            if (nextTitle) {
              contentHTML += `<h3 class='current-title mb-2'>${nextTitle}</h3>`;
            }

            // Thêm caption nếu có
            if (nextCaption) {
              contentHTML += `<p class='current-caption mb-0'>${nextCaption}</p>`;
            }

            captionsContainer.innerHTML = contentHTML;
          }

          // Cập nhật title-big cho caption-image
          const captionImageContainer =
            document.querySelector(".caption-image");
          if (captionImageContainer) {
            if (nextTitleBig) {
              captionImageContainer.innerHTML = `<h2 class='current-title-big mb-0'>${nextTitleBig}</h2>`;

              // Split text thành từng ký tự
              const titleBigElement =
                captionImageContainer.querySelector(".current-title-big");
              if (titleBigElement && typeof SplitText !== "undefined") {
                const split = new SplitText(titleBigElement, {
                  type: "chars",
                  charsClass: "char",
                });

                // Set perspective cho parent và từng char
                gsap.set(titleBigElement, { perspective: 1000 });
                split.chars.forEach((char) =>
                  gsap.set(char.parentNode, { perspective: 1000 })
                );

                // Hiệu ứng xoay 3D từ dưới lên giống fx19Titles
                gsap.fromTo(
                  split.chars,
                  {
                    "will-change": "opacity, transform",
                    transformOrigin: "50% 0%",
                    opacity: 0,
                    rotationX: -90,
                    z: -200,
                  },
                  {
                    ease: "power1",
                    opacity: 1,
                    stagger: 0.05,
                    rotationX: 0,
                    z: 0,
                    duration: 0.6,
                    delay: 0.3,
                  }
                );
              } else {
                // Fallback nếu không có SplitText
                gsap.fromTo(
                  titleBigElement,
                  {
                    rotationX: -90,
                    autoAlpha: 0,
                    transformOrigin: "50% 0%",
                  },
                  {
                    rotationX: 0,
                    autoAlpha: 1,
                    transformOrigin: "50% 0%",
                    ease: "power1",
                    duration: 0.6,
                    delay: 0.3,
                  }
                );
              }
            } else {
              captionImageContainer.innerHTML = "";
            }
          }

          // 3. Animate content mới vào
          const newTitleElements = document.querySelectorAll(
            ".current-title, .current-caption"
          );
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
              delay: 0.1,
              stagger: 0.1,
            }
          );
        }, 200); // Content mới xuất hiện sau 200ms
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

  // Initialize content cho slide đầu tiên
  const initialSlide = sliderImages.slides[sliderImages.activeIndex];
  const initialTitle = initialSlide.getAttribute("data-title");
  const initialCaption = initialSlide.getAttribute("data-caption");
  const initialTitleBig = initialSlide.getAttribute("data-title-big");

  const captionsContainer = document.querySelector(".slider-captions");
  if (captionsContainer) {
    let initialContentHTML = "";

    // Thêm title nếu có
    if (initialTitle) {
      initialContentHTML += `<h3 class='current-title mb-2'>${initialTitle}</h3>`;
    }

    // Thêm caption nếu có
    if (initialCaption) {
      initialContentHTML += `<p class='current-caption mb-0'>${initialCaption}</p>`;
    }

    captionsContainer.innerHTML = initialContentHTML;
  }

  // Initialize title-big cho caption-image
  const captionImageContainer = document.querySelector(".caption-image");
  if (captionImageContainer) {
    if (initialTitleBig) {
      captionImageContainer.innerHTML = `<h2 class='current-title-big mb-0'>${initialTitleBig}</h2>`;

      // Split text thành từng ký tự cho initial slide
      const titleBigElement =
        captionImageContainer.querySelector(".current-title-big");
      if (titleBigElement && typeof SplitText !== "undefined") {
        const split = new SplitText(titleBigElement, {
          type: "chars",
          charsClass: "char",
        });

        // Set perspective cho parent và từng char
        gsap.set(titleBigElement, { perspective: 1000 });
        split.chars.forEach((char) =>
          gsap.set(char.parentNode, { perspective: 1000 })
        );

        // Hiệu ứng xoay 3D từ dưới lên giống fx19Titles cho slide đầu tiên
        gsap.fromTo(
          split.chars,
          {
            "will-change": "opacity, transform",
            transformOrigin: "50% 0%",
            opacity: 0,
            rotationX: -90,
            z: -200,
          },
          {
            ease: "power1",
            opacity: 1,
            stagger: 0.05,
            rotationX: 0,
            z: 0,
            duration: 0.8,
            delay: 0.5,
          }
        );
      } else {
        // Fallback nếu không có SplitText
        gsap.fromTo(
          titleBigElement,
          {
            rotationX: -90,
            autoAlpha: 0,
            transformOrigin: "50% 0%",
          },
          {
            rotationX: 0,
            autoAlpha: 1,
            transformOrigin: "50% 0%",
            ease: "power1",
            duration: 0.8,
            delay: 0.5,
          }
        );
      }
    } else {
      captionImageContainer.innerHTML = "";
    }
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
