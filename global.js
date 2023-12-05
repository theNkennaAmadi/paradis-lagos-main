/**
 * Global Menu
 */

const dayOptions = {
  timeZone: "Africa/Lagos",
  weekday: "long",
};

const daysAbbr = ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"];
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function to12HourFormat(timeStr) {
  // Convert "HH:MM:SS" to a Date object.
  // We use a placeholder date because we only care about the time.
  const date = new Date(`1970-01-01T${timeStr}Z`);

  // Extract hour, minute, and AM/PM.
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12';

  return `${hours}${ampm}`;
}

function addTimeStrings(time1, time2) {
  const [hours1, minutes1, seconds1] = time1.split(":").map(Number);
  const [hours2, minutes2, seconds2] = time2.split(":").map(Number);

  let totalSeconds = seconds1 + seconds2;
  let totalMinutes = minutes1 + minutes2;
  let totalHours = hours1 + hours2;

  if (totalSeconds >= 60) {
    totalMinutes += Math.floor(totalSeconds / 60);
    totalSeconds %= 60;
  }

  if (totalMinutes >= 60) {
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes %= 60;
  }

  // Optional: If you want the hours to wrap around after 24, uncomment the next line
  // totalHours %= 24;

  return `${String(totalHours).padStart(2, "0")}:${String(
    totalMinutes
  ).padStart(2, "0")}:${String(totalSeconds).padStart(2, "0")}`;
}

const timeOptions = {
  timeZone: "Africa/Lagos",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

//const currentDateInNigeria = new Date().toLocaleString("en-NG", options);
const currentDayInNigeria = new Date().toLocaleString("en-NG", dayOptions);
const currentTimeInNigeria = new Date().toLocaleString("en-NG", timeOptions);

//console.log("Day:", currentDayInNigeria);
//console.log("Time:", currentTimeInNigeria);

let dateTimeString;
const runTime = (item, currDay, option) => {
  if (option === "open") {
    dateTimeString = item.fieldData[`${currDay.toLowerCase()}-opening-time`];
  } else if (option === "closed") {
    // console.log(item.fieldData);
    dateTimeString = item.fieldData[`${currDay.toLowerCase()}-closing-time`];
  }
  let date = new Date(dateTimeString);

  let hours = String(date.getHours()).padStart(2, "0");
  let minutes = String(date.getMinutes()).padStart(2, "0");
  let seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

const fetchSchedule = async () => {
  const response = await fetch("https://paradis.vercel.app/api/v1/schedule");
  return await response.json();
};

const restOpeningTimes = [];
const restClosingTimes = [];
const prevRestClosingTimes = [];
let restStatus;
const desc = document.querySelector("#event-desc");

const displayItems = async () => {
  const { data } = await fetchSchedule();
  //console.log(data);
  const items = await data.items;
  let currDayIndex = days.indexOf(currentDayInNigeria);
  let prevDayInNigeria = days[currDayIndex - 1];
  //console.log(items);
  items.forEach((item) => {
    restOpeningTimes.push(runTime(item, currentDayInNigeria, "open"));
    restClosingTimes.push(runTime(item, currentDayInNigeria, "closed"));
    prevRestClosingTimes.push(runTime(item, prevDayInNigeria, "closed"));
  });

  //console.log(restOpeningTimes, restClosingTimes, prevRestClosingTimes);
  const minOpenTime = restOpeningTimes.sort()[0];
  const calcClosing = (time) => {
    const afterMidnight = time.filter((time) => time < "12:00:00").sort();
    const beforeMidnight = time.filter((time) => time >= "12:00:00").sort();
    return afterMidnight[0] || beforeMidnight[beforeMidnight.length - 1];
  };

  const maxClosingTime = calcClosing(restClosingTimes);
  const prevClosingTime = calcClosing(prevRestClosingTimes);

  //console.log(prevClosingTime);
  //console.log(currentTimeInNigeria);
  // console.log(data);
  //console.log(currentTimeInNigeria > minOpenTime);

  if (currentTimeInNigeria >= "00:00:00" && currentTimeInNigeria < "12:00:00") {
    if (prevClosingTime < "06:00:00") {
      if (currentTimeInNigeria < prevClosingTime) {
        restStatus = "open";
      } else {
        restStatus = "closed";
      }
    } else if (currentTimeInNigeria < minOpenTime) {
      restStatus = "closed";
    }
  } else {
    if (currentTimeInNigeria >= minOpenTime) {
      if (maxClosingTime < "06:00:00") {
        restStatus = "open";
      } else {
        if (currentTimeInNigeria < maxClosingTime) {
          restStatus = "open";
        } else {
          restStatus = "closed";
        }
      }
    } else {
      restStatus = "closed";
    }
  }

  //console.log(restStatus);
  const navIndicator = document.querySelector(".nav-open-indicator");
  const navOpenTime = `${
    daysAbbr[days.indexOf(currentDayInNigeria)]
  } ${to12HourFormat(minOpenTime)}-${to12HourFormat(maxClosingTime)}   `;
  if (restStatus === "closed") {
    navIndicator.textContent = "CLOSED";
    gsap.set(navIndicator, { backgroundColor: "#491413" });
    if (desc) {
      //desc.textContent = `Currently Closed`;
    }
  }
  document.querySelector(".nav-open-time").textContent = navOpenTime;
  gsap.to(".nav-opening-info", { visibility: "visible" });
};

displayItems();

/**
 * Interactions
 */

window.addEventListener("DOMContentLoaded", () => {
  gsap.from(".page-wrapper", { autoAlpha: 0, duration: 0.1, ease: "linear" });
  const menuOpen = document.querySelector("[menu-open]");
  const menuClose = document.querySelector("[menu-close]");

  menuOpen.addEventListener("click", (e) => {
    e.stopPropagation();
    let tl = gsap.timeline();
    tl.to(".nav-menu", { opacity: 1 });
    tl.fromTo(
      ".page-wrapper",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "expo.inOut",
      },
      {
        clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
        duration: 1.5,
        ease: "expo.inOut",
      }
    );
  });

  menuClose.addEventListener("click", (e) => {
    e.stopPropagation();
    let tl = gsap.timeline();
    tl.fromTo(
      ".page-wrapper",
      {
        clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
        ease: "expo.inOut",
      },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "expo.inOut",
      }
    );
    tl.to(".nav-menu", { opacity: 0 });
  });

  const menuLinks = document.querySelectorAll("a.nav-menu-item");

  menuLinks.forEach((link) => {
    const tl = gsap.timeline({ paused: true });
    tl.set(link.querySelector(".nav-menu-item.is-overlay"), { opacity: 1 });
    tl.fromTo(
      link.querySelector(".nav-menu-item.is-overlay"),
      {
        clipPath: "polygon(0% 100%, 100% 100%, 0% 100%, 100% 100%)",
        duration: 1,
        ease: "expo.inOut",
      },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "expo.inOut",
      }
    );
    //.to(link.querySelector(".nav-icon"), { opacity: 1, duration: 0.7 }, "<0.2");
    link.addEventListener("mouseenter", () => {
      tl.play();
    });
    link.addEventListener("mouseleave", () => {
      tl.reverse();
    });
  });

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({
    autoSleep: 60,
    nullTargetWarn: false,
  });

  const wrapElements = (elems, wrapType, wrapClass) => {
    elems.forEach((char) => {
      const wrapEl = document.createElement(wrapType);
      wrapEl.classList = wrapClass;
      char.parentNode.appendChild(wrapEl);
      wrapEl.appendChild(char);
    });
  };

  const words = [...document.querySelectorAll(".word")];

  words.map((word) => {
    // create wrapper container
    var wrapper = document.createElement("span");
    wrapper.classList.add("char-wrap");
    // insert wrapper before el in the DOM tree
    word.parentNode.insertBefore(wrapper, word);
    // move el into wrapper
    wrapper.appendChild(word);
  });

  const imgContainer = [...document.querySelectorAll("[img-container]")];

  if (imgContainer.length !== 0) {
    imgContainer.forEach((container) => {
      let tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.8, ease: "power4" },
      });
      tl.to(container, { scale: 0.85 }).to(
        container.querySelector("[data-img]"),
        { scale: 1 },
        "<"
      );
      container.addEventListener("mouseenter", () => {
        tl.timeScale(1);
        tl.play();
      });
      container.addEventListener("mouseleave", () => {
        tl.timeScale(2);
        tl.reverse();
      });
    });
  }

  const fx5Titles = [...document.querySelectorAll("[data-effect5]")];
  const fx4Titles = [...document.querySelectorAll("[data-effect4]")];
  const fx11Titles = [...document.querySelectorAll("[data-effect11]")];
  const fx10Titles = [...document.querySelectorAll("[data-effect10]")];

  const barsSep = [...document.querySelectorAll(".av-img-wrapper")];

  if (fx10Titles.length !== 0) {
    //console.log("yes");
    fx10Titles.forEach((title) => {
      const chars = title.querySelectorAll(".char");
      if (chars.length !== 0) {
        gsap.fromTo(
          chars,
          {
            "will-change": "opacity",
            opacity: 0,
            filter: "blur(20px)",
          },
          {
            duration: 1,
            ease: "power4.inOut",
            opacity: 1,
            filter: "blur(0px)",
            stagger: { each: 0.03, from: "start" },
          }
        );
      }
    });
  }

  if (fx5Titles.length !== 0) {
    fx5Titles.forEach((title) => {
      const chars = title.querySelectorAll(".char");
      if (chars.length !== 0) {
        gsap.fromTo(
          chars,
          {
            "will-change": "opacity, transform",
            opacity: 0,
            xPercent: () => gsap.utils.random(-200, 200),
            yPercent: () => gsap.utils.random(-150, 150),
          },
          {
            ease: "power1.inOut",
            opacity: 1,
            xPercent: 0,
            yPercent: 0,
            stagger: { each: 0.05, grid: "auto", from: "random" },
            scrollTrigger: {
              trigger: title,
              start: "center bottom+=10%",
              end: "bottom center",
              scrub: 0.9,
            },
          }
        );
      }
    });
  }

  if (fx11Titles.length !== 0) {
    fx11Titles.forEach((title) => {
      const chars = title.querySelectorAll(".char");
      if (chars.length !== 0) {
        wrapElements(chars, "span", "char-wrap");
        gsap.fromTo(
          chars,
          {
            "will-change": "transform",
            transformOrigin: "0% 50%",
            xPercent: 105,
          },
          {
            duration: 1,
            ease: "expo",
            xPercent: 0,
            stagger: title.getAttribute("data-speed"),
            scrollTrigger: {
              trigger: title,
              start: "top bottom",
              end: "top top+=10%",
              toggleActions: "play resume resume reset",
            },
          }
        );
      }
    });
  }

  if (fx4Titles.length !== 0) {
    fx4Titles.forEach((title) => {
      const words = title.querySelectorAll(".word");
      if (words.length !== 0) {
        for (const word of words) {
          const chars = word.querySelectorAll(".char");

          gsap.fromTo(
            chars,
            {
              "will-change": "opacity, transform",
              x: (position, _, arr) => 150 * (position - arr.length / 2),
            },
            {
              ease: "power1.inOut",
              x: 0,
              stagger: {
                grid: "auto",
                from: "center",
              },
              scrollTrigger: {
                trigger: word,
                start: "center bottom+=30%",
                end: "top top+=35%",
                scrub: true,
              },
            }
          );
        }
      }
    });
  }

  if (barsSep.length !== 0) {
    barsSep.forEach((bar) => {
      gsap.fromTo(
        bar,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 0% 0%, 100% 0%)",
          ease: "expo.inOut",
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: bar,
            start: "top bottom",
            end: "bottom center",
            scrub: true,
          },
        }
      );
    });
  }

  const bText = [...document.querySelectorAll("[data-effect-text]")];
  bText.forEach((text) => {
    //gsap.fromTo(text.querySelectorAll(".word"), { y: "120%" }, { y: "0%" });
  });

  if (bText.length !== 0) {
    bText.forEach((title) => {
      const chars = title.querySelectorAll(".word");
      wrapElements(chars, "span", "char-wrap");
      const links = title.querySelectorAll("a");

      gsap.fromTo(
        links,
        { borderWidth: "0px" },
        {
          borderWidth: "1px",
          duration: 1,
          delay: 1,
          scrollTrigger: {
            trigger: title,
            start: "top 90%",
            end: "top center",
            toggleActions: "play resume resume reset",
            //markers: true
          },
        }
      );

      gsap.fromTo(
        chars,
        {
          "will-change": "transform",
          transformOrigin: "0% 50%",
          yPercent: 120,
        },
        {
          duration: 2,
          ease: "expo",
          yPercent: 0,
          //stagger: title.getAttribute("data-speed"),
          scrollTrigger: {
            trigger: title,
            start: "top 90%",
            end: "top center",
            toggleActions: "play resume resume reset",
            //markers: true
          },
        }
      );
    });
  }

  if (document.querySelector(".menu-icon")) {
    let menuIcons = [...document.querySelectorAll(".menu-icon")];
    menuIcons.forEach((icon) => {
      let tl = gsap.timeline({ paused: true });
      tl.to(icon.querySelector(".menu-icon-front"), { opacity: 0 });
      tl.to(icon.querySelector(".menu-icon-back"), { opacity: 1 }, "<");
      tl.to(icon.querySelector(".menu-icon-heading"), { opacity: 0 }, "<");
      icon.addEventListener("mouseenter", () => {
        tl.timeScale(1);
        tl.play();
      });
      icon.addEventListener("mouseleave", () => {
        tl.timeScale(2);
        tl.reverse();
      });
    });
  }
});
