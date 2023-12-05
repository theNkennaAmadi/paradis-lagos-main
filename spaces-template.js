const rImg = [...document.querySelectorAll("[r-img]")];

rImg.forEach((img) => {
  gsap.fromTo(
    img,
    {
      clipPath: "polygon(0% 100%, 0% 100%, 100% 100%, 100% 100%)",
      duration: 1,
      ease: "expo.inOut",
    },
    {
      clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)",
      duration: 3,
      ease: "expo.inOut",
      scrollTrigger: {
        trigger: img,
        start: "top bottom",
        end: "top 30%",
        scrub: false,
        markers: false,
      },
    }
  );
});
