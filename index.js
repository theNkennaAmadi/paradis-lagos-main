const fetchEvents = async () => {
  const response = await fetch("https://paradis.vercel.app/api/v1/events");
  return await response.json();
};

const eventTitle = document.querySelector("#event-title");
const eventVideo = document.querySelector("#event-video");
const eventsBlock = document.querySelector(".whats-happening-block");
const eventsDesc = document.querySelector("#event-desc");
console.log(eventTitle);

const displayEvents = async () => {
  const { data } = await fetchEvents();
  const events = await data;
  console.log(events);
  console.log(data);
  if (events && events.length > 0) {
    const now = new Date().toLocaleString("en-NG");
    const eventsNow = events.find((event) => {
      const startTime = new Date(event.items[0].start.dateTime).toLocaleString(
        "en-NG"
      );
      const endTime = new Date(event.items[0].end.dateTime).toLocaleString(
        "en-NG"
      );
      //console.log({ now: now, startTime: startTime, endTime: endTime });
      return startTime <= now && endTime >= now;
    });
    //console.log(eventsNow);
    if (eventsNow === undefined) {
      //console.log("No events happening now");
      //console.log(events.items[0]);
      eventsDesc.textContent = `What's happening later today at Paradis: `;
      eventTitle.textContent = events[0].items[0]?.summary;
      eventVideo.src = events[0].videoURL;
      //gsap.to(eventsBlock, { opacity: 0 });
    } else {
      console.log(eventsNow);
      eventTitle.textContent = eventsNow.items[0].summary;
      eventVideo.src = eventsNow.videoURL;
    }
  } else {
    eventsDesc.textContent = ``;
    eventTitle.textContent = ``;
    console.log("No events");
    //gsap.to(eventsBlock, { opacity: 0 });
  }
};
displayEvents();

/*
 * Home Intro Animation
 */
gsap.fromTo(
  ".social-block > *",
  { y: "100%" },
  { y: "0%", duration: 1, ease: "expo.inOut" }
);

let tlAboutIntro = gsap.timeline({
  scrollTrigger: {
    trigger: ".section.full-w",
    pin: true,
    scrub: true,
    start: () => "top top",
    end: () => "+=100%",
    markers: false,
    onEnter: () => {
      gsap.to(".nav", { y: "0%", duration: 0.6, ease: "expo.inOut" });
      //document.querySelector(".nav-wrapper").classList.add("home");
    },
    onEnterBack: () => {
      gsap.to(".nav", { y: "0%", duration: 0.6, ease: "expo.inOut" });
      // document.querySelector(".nav-wrapper").classList.add("home");
    },
    onLeave: () => {
      gsap.to(".nav", { y: "-110%", duration: 0.6, ease: "expo.inOut" });
      //document.querySelector(".nav-wrapper").classList.remove("home");
    },
  },
  //invalidateOnRefresh: true,
});

tlAboutIntro.to(".home-hero-wrapper .word", { y: "100%" });
tlAboutIntro.fromTo(".social-block > *", { y: "0%" }, { y: "100%" }, "<");
tlAboutIntro.to(".section-bg", { width: "100%", height: "100%", y: "0%" }, "<");

const pImg = [...document.querySelectorAll(".p-img")];

pImg.forEach((img) => {
  gsap.to(img, {
    y: "-15%",
    ease: "none",
    scrollTrigger: {
      trigger: img.parentElement,
      start: "top 90%",
      end: "bottom top",
      scrub: true,
    },
  });
});

let tlScrollIndicator = gsap.timeline({ repeat: -1 });
tlScrollIndicator.to(".scroll-indicator-inner", {
  y: "110%",
  ease: "expo.inOut",
  duration: 4,
  delay: 0.1,
});

let tlMarble = gsap.timeline({ repeat: -1 });

tlMarble.to(".marble-img", { rotate: 360, ease: "linear", duration: 15 });
