let menuBtn = document.getElementById("menu-btn");
const navBar = document.querySelector(".nav-bar");
let navLinks = document.querySelector(".nav-links");
let hamburger = document.querySelector(".hamburger");
let navItems = document.querySelectorAll(".nav-links .nav-item");
let alerts = document.querySelector(".alert-icon");
let announcements = document.querySelector(".announcement-icon");
let alertBox = document.querySelector(".alerts-box");
let announcementBox = document.querySelector(".announcements-box");

// Menu button hover functionality
let menuTimeout;

function showMenu() {
  clearTimeout(menuTimeout);
  navLinks.classList.add("show");
  hamburger.classList.add("white-icon");
}

function hideMenu() {
  menuTimeout = setTimeout(() => {
    navLinks.classList.remove("show");
    hamburger.classList.remove("white-icon");
  }, 200); // 200ms delay before hiding
}

menuBtn.addEventListener("mouseenter", showMenu);
menuBtn.addEventListener("mouseleave", hideMenu);

// Also add hover events to the nav-links themselves
navLinks.addEventListener("mouseenter", showMenu);
navLinks.addEventListener("mouseleave", hideMenu);

// Alerts hover functionality
let alertTimeout;

function showAlerts() {
  clearTimeout(alertTimeout);
  alertBox.classList.add("alert-box-show");
  alerts.classList.add("white-icon");
  let alertCount = alerts.querySelector(".alert-count");
  if (alertCount) {
    alertCount.classList.add("count-hide");
  }
}

function hideAlerts() {
  alertTimeout = setTimeout(() => {
    alertBox.classList.remove("alert-box-show");
    alerts.classList.remove("white-icon");
    let alertCount = alerts.querySelector(".alert-count");
    if (alertCount) {
      alertCount.classList.remove("count-hide");
    }
  }, 200); // 200ms delay before hiding
}

alerts.addEventListener("mouseenter", showAlerts);
alerts.addEventListener("mouseleave", hideAlerts);

// Also add hover events to the alert box itself
if (alertBox) {
  alertBox.addEventListener("mouseenter", showAlerts);
  alertBox.addEventListener("mouseleave", hideAlerts);
}

// Announcements hover functionality
let announcementTimeout;

function showAnnouncements() {
  clearTimeout(announcementTimeout);
  announcementBox.classList.add("announcement-box-show");
  announcements.classList.add("white-icon");
  let announcementCount = announcements.querySelector(".announcement-count");
  if (announcementCount) {
    announcementCount.classList.add("count-hide");
  }
}

function hideAnnouncements() {
  announcementTimeout = setTimeout(() => {
    announcementBox.classList.remove("announcement-box-show");
    announcements.classList.remove("white-icon");
    let announcementCount = announcements.querySelector(".announcement-count");
    if (announcementCount) {
      announcementCount.classList.remove("count-hide");
    }
  }, 200); // 200ms delay before hiding
}

announcements.addEventListener("mouseenter", showAnnouncements);
announcements.addEventListener("mouseleave", hideAnnouncements);

// Also add hover events to the announcement box itself
if (announcementBox) {
  announcementBox.addEventListener("mouseenter", showAnnouncements);
  announcementBox.addEventListener("mouseleave", hideAnnouncements);
}

// Navigation items click functionality
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

// Courses and Classes functionality
const courses = document.getElementById("courses");
const classes = document.getElementById("classes");

function removeActive() {
  if (courses) courses.classList.remove("courses-active");
  if (classes) classes.classList.remove("classes-active");
}

if (courses) {
  courses.addEventListener("click", function () {
    removeActive();
    courses.classList.add("courses-active");
  });
}

if (classes) {
  classes.addEventListener("click", function () {
    removeActive();
    classes.classList.add("classes-active");
  });
}
