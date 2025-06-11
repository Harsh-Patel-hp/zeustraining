let menuBtn = document.getElementById("menu-btn");
const navBar = document.querySelector(".nav-bar");
let navLinks = document.querySelector(".nav-links");
let hamburger = document.querySelector(".hamburger");
let navItems = document.querySelectorAll(".nav-links .nav-item");
let alerts = document.querySelector(".alert-icon");
let announcements = document.querySelector(".announcement-icon");
let alertBox = document.querySelector(".alerts-box");
let announcementBox = document.querySelector(".announcements-box");

menuBtn.addEventListener("mouseover", () => {
  navLinks.classList.toggle("show");
  hamburger.classList.toggle("white-icon");
});

menuBtn.addEventListener("mouseout", () => {
  navLinks.classList.remove("show");
  hamburger.classList.remove("white-icon");
});

alerts.addEventListener("mouseover", () => {
  alertBox.classList.toggle("alert-box-show");
  alerts.classList.toggle("white-icon");
  let alertCount = alerts.querySelector(".alert-count");
  if (alertCount) {
    alertCount.classList.toggle("count-hide");
  }
});

alerts.addEventListener("mouseout", () => {
  alertBox.classList.remove("alert-box-show");
  alerts.classList.remove("white-icon");
  let alertCount = alerts.querySelector(".alert-count");
  if (alertCount) {
    alertCount.classList.remove("count-hide");
  }
});

announcements.addEventListener("mouseover", () => {
  announcementBox.classList.toggle("announcement-box-show");
  let announcementCount = announcements.querySelector(".announcement-count");
  if (announcementCount) {
    announcementCount.classList.toggle("count-hide");
  }
  announcements.classList.toggle("white-icon");
});

announcements.addEventListener("mouseout", () => {
  announcementBox.classList.remove("announcement-box-show");
  let announcementCount = announcements.querySelector(".announcement-count");
  if (announcementCount) {
    announcementCount.classList.remove("count-hide");
  }
  announcements.classList.remove("white-icon");
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
