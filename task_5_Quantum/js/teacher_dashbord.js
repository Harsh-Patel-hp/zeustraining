let menuBtn = document.getElementById("menu-btn");
const navBar = document.querySelector(".nav-bar");
let navLinks = document.querySelector(".nav-links");
let hamburger = document.querySelector(".hamburger");
let navItems = document.querySelectorAll(".nav-links .nav-item");
let hoverTimer;

menuBtn.addEventListener("mouseover", () => {
  navLinks.classList.toggle("show");
  hamburger.classList.toggle("white-icon");
});

menuBtn.addEventListener("mouseout", () => {
  navLinks.classList.remove("show");
  hamburger.classList.remove("white-icon");
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navItems.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    const arrow_btn = link.querySelector(".arrow");
    const subLinks = link.querySelector(".sub-links");
    if (subLinks) {
      subLinks.classList.toggle("sub-links-show");
    }

    if (arrow_btn) {
      arrow_btn.classList.toggle("arrow-roate");
    }
  });
});

const courses = document.getElementById("courses");
const classes = document.getElementById("classes");

function removeActive() {
  courses.classList.remove("courses-active");
  classes.classList.remove("classes-active");
}

courses.addEventListener("click", function () {
  removeActive();
  courses.classList.add("courses-active");
});

classes.addEventListener("click", function () {
  removeActive();
  classes.classList.add("classes-active");
});
