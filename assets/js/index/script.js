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

function slider() {
  if ($("section.slider").length < 1) return;

  document.querySelectorAll("section.slider").forEach((section) => {
    let interleaveOffset = 0.9;
    let isTransitioning = false;

    const sliderImages = new Swiper(section.querySelector(".slider-image"), {
      slidesPerView: 1,
      watchSlidesProgress: true,
      speed: 1000,
      loop: false,
      allowTouchMove: false,
      navigation: {
        nextEl: section.querySelector(".swiper-button-next"),
        prevEl: section.querySelector(".swiper-button-prev")
      },
      pagination: {
        el: section.querySelector(".slider-paginations"),
        type: "fraction"
      },
      on: {
        slideChangeTransitionStart: function () {
          if (isTransitioning) return;
          isTransitioning = true;

          // 1. Ẩn content hiện tại
          const currentTitleElements = section.querySelectorAll(
            ".current-title, .current-caption"
          );
          const currentTitleBigElements =
            section.querySelectorAll(".current-title-big");

          gsap.to(currentTitleElements, {
            autoAlpha: 0,
            y: -20,
            ease: "power2.out",
            duration: 0.3
          });

          if (currentTitleBigElements.length > 0) {
            currentTitleBigElements.forEach((titleBig) => {
              const chars = titleBig.querySelectorAll(".char");
              if (chars.length > 0) {
                gsap.to(chars, {
                  rotateX: 90,
                  opacity: 0,
                  transformOrigin: "50% 0%",
                  ease: "power2.in",
                  duration: 0.5,
                  stagger: { each: 0.02, from: "start" }
                });
              } else {
                gsap.to(titleBig, {
                  rotateX: 90,
                  opacity: 0,
                  transformOrigin: "50% 0%",
                  ease: "power2.in",
                  duration: 0.5
                });
              }
            });
          }

          // 2. Sau khi ẩn xong, hiện content mới
          setTimeout(() => {
            const swiper = this;
            const nextSlide = swiper.slides[swiper.activeIndex];
            const nextTitle = nextSlide.getAttribute("data-title");
            const nextCaption = nextSlide.getAttribute("data-caption");
            const nextTitleBig = nextSlide.getAttribute("data-title-big");

            const captionsContainer = section.querySelector(".slider-captions");
            if (captionsContainer) {
              let contentHTML = "";
              if (nextTitle) {
                contentHTML += `<h3 class='current-title mb-2'>${nextTitle}</h3>`;
              }
              if (nextCaption) {
                contentHTML += `<p class='current-caption mb-0'>${nextCaption}</p>`;
              }
              captionsContainer.innerHTML = contentHTML;
            }

            const captionImageContainer =
              section.querySelector(".caption-image");
            if (captionImageContainer) {
              if (nextTitleBig) {
                captionImageContainer.innerHTML = `<h2 class='current-title-big mb-0'>${nextTitleBig}</h2>`;
                const titleBigElement =
                  captionImageContainer.querySelector(".current-title-big");

                if (titleBigElement && typeof SplitText !== "undefined") {
                  const split = new SplitText(titleBigElement, {
                    type: "chars",
                    charsClass: "char"
                  });

                  gsap.set(titleBigElement, {
                    perspective: 1000,
                    transformStyle: "preserve-3d"
                  });

                  split.chars.forEach((char) => {
                    gsap.set(char, {
                      display: "inline-block",
                      transformStyle: "preserve-3d",
                      transformOrigin: "50% 100%"
                    });
                  });

                  gsap.fromTo(
                    split.chars,
                    { rotateX: -90, opacity: 0 },
                    {
                      rotateX: 0,
                      opacity: 1,
                      ease: "power2.out",
                      duration: 0.6,
                      delay: 0.1,
                      stagger: { each: 0.03, from: "start" }
                    }
                  );
                } else {
                  gsap.fromTo(
                    titleBigElement,
                    { rotateX: -90, opacity: 0, transformOrigin: "50% 100%" },
                    {
                      rotateX: 0,
                      opacity: 1,
                      ease: "power2.out",
                      duration: 0.6,
                      delay: 0.1
                    }
                  );
                }
              } else {
                captionImageContainer.innerHTML = "";
              }
            }

            // 3. Animate title và caption mới vào
            const newTitleElements = section.querySelectorAll(
              ".current-title, .current-caption"
            );
            gsap.fromTo(
              newTitleElements,
              { autoAlpha: 0, y: 20 },
              {
                autoAlpha: 1,
                y: 0,
                ease: "power2.out",
                duration: 0.4,
                delay: 0.1,
                stagger: 0.1
              }
            );
          }, 250);
        },

        slideChangeTransitionEnd: function () {
          isTransitioning = false;
        },

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
        }
      }
    });

    // Init content cho slide đầu tiên
    const initialSlide = sliderImages.slides[sliderImages.activeIndex];
    const initialTitle = initialSlide.getAttribute("data-title");
    const initialCaption = initialSlide.getAttribute("data-caption");
    const initialTitleBig = initialSlide.getAttribute("data-title-big");

    const captionsContainer = section.querySelector(".slider-captions");
    if (captionsContainer) {
      let initialContentHTML = "";
      if (initialTitle) {
        initialContentHTML += `<h3 class='current-title mb-2'>${initialTitle}</h3>`;
      }
      if (initialCaption) {
        initialContentHTML += `<p class='current-caption mb-0'>${initialCaption}</p>`;
      }
      captionsContainer.innerHTML = initialContentHTML;
    }

    const captionImageContainer = section.querySelector(".caption-image");
    if (captionImageContainer && initialTitleBig) {
      captionImageContainer.innerHTML = `<h2 class='current-title-big mb-0'>${initialTitleBig}</h2>`;
      const titleBigElement =
        captionImageContainer.querySelector(".current-title-big");

      if (titleBigElement && typeof SplitText !== "undefined") {
        const split = new SplitText(titleBigElement, {
          type: "chars",
          charsClass: "char"
        });

        gsap.set(titleBigElement, {
          perspective: 1000,
          transformStyle: "preserve-3d"
        });

        split.chars.forEach((char) => {
          gsap.set(char, {
            display: "inline-block",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 100%"
          });
        });

        gsap.fromTo(
          split.chars,
          { rotateX: -90, opacity: 0 },
          {
            rotateX: 0,
            opacity: 1,
            ease: "power2.out",
            duration: 0.8,
            delay: 0.5,
            stagger: { each: 0.03, from: "start" }
          }
        );
      }
    }
  });
}

function header() {
  if ($("#header").length < 1) return;

  var mySwiper = new Swiper(".header-popup__background", {
    direction: "vertical",
    slidesPerView: 3,
    centeredSlides: true,
    loop: true,
    autoplay: false,
    pagination: false,
    navigation: false,
    allowTouchMove: false,
    simulateTouch: false,
    slideToClickedSlide: false,
    mousewheel: false,
    keyboard: false,
    preventClicks: true,
    preventClicksPropagation: true,
    watchOverflow: true,
    spaceBetween: 20,
    speed: 500,
    initialSlide: 0,
    on: {
      init: function () {
        $(".header-popup__background .swiper-slide").css(
          "pointer-events",
          "none"
        );
      }
    }
  });

  $(".header-popup__nav .nav-item").on("mouseenter", function () {
    var index = $(this).index();
    mySwiper.slideToLoop(index);

    $(".header-popup__nav .nav-item").removeClass("active");
    $(this).addClass("active");
  });

  // toggle popup menu
  const btnMenu = $(".btn-header__menu");
  const headerPopup = $(".header-popup");
  btnMenu.on("click", function () {
    btnMenu.toggleClass("open");
    headerPopup.toggleClass("open");

    if (headerPopup.hasClass("open")) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const $header = $("#header, .cta-calling");

      if (window.scrollY === 0) {
        $header.removeClass("scroll-down scrolling");
      } else {
        $header.addClass("scrolling");

        if (self.direction === 1) {
          $header.addClass("scroll-down");
        } else {
          $header.removeClass("scroll-down");
        }
      }
    }
  });
}
function initParallaxImages() {
  // Chọn tất cả các phần tử có class parallax-picture
  const parallaxImages = document.querySelectorAll(".parallax-picture img");

  parallaxImages.forEach((img) => {
    gsap.to(img, {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: img.parentElement,
        start: "top 70%",
        end: "bottom top",
        scrub: true
        // markers: true,
      }
    });
  });
}
function placeTextAnimation() {
  if (!document.querySelector(".place-text")) return;

  const lines = gsap.utils.toArray(".place-text__line");

  lines.forEach((line, index) => {
    const isOdd = (index + 1) % 2 !== 0;
    const startX = isOdd ? "50%" : "-50%";
    const endX = isOdd ? "-10%" : "10%";

    gsap.set(line, { x: startX });

    gsap.to(line, {
      x: endX,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".place-text",
        start: "top bottom",
        end: "bottom 30%",
        scrub: 1
        // markers: true,
      }
    });
  });
}

function pageGallery() {
  if ($(".section-gallery").length < 1) return;

  var swiper = new Swiper(".gallery-swiper", {
    direction: "vertical",
    slidesPerView: "auto",
    spaceBetween: 30,
    loop: true,
    speed: 800,
    centeredSlides: true,
    mousewheel: {
      releaseOnEdges: false,
      sensitivity: 1
    },
    on: {
      slideChangeTransitionStart: function () {
        // Animate OUT cho tất cả text trong slide cũ
        this.slides.forEach((slide, index) => {
          if (index !== this.activeIndex) {
            let title = slide.querySelector(".text");
            if (title) {
              gsap.to(title, {
                rotateX: 90,
                opacity: 0,
                transformOrigin: "50% 0%",
                ease: "power2.in",
                duration: 0.5,
                delay: 0.5
              });
            }
          }
        });

        // Animate IN cho slide mới
        let activeSlide = this.slides[this.activeIndex];
        let activeTitle = activeSlide.querySelector(".text");
        if (activeTitle) {
          gsap.fromTo(
            activeTitle,
            { rotateX: -90, opacity: 0, transformOrigin: "50% 100%" },
            {
              rotateX: 0,
              opacity: 1,
              transformOrigin: "50% 100%",
              ease: "power2.out",
              duration: 0.7,
              delay: 0.5
            }
          );
        }
      }
    }
  });
}

const init = () => {
  gsap.registerPlugin(ScrollTrigger);
  slider();
  header();
  initParallaxImages();
  placeTextAnimation();
  pageGallery();
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
