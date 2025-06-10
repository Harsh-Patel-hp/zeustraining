let menuBtn = document.getElementById("menu-btn");
let navLinks = document.querySelector(".nav-links");
let hamburger = document.querySelector(".hamburger");
let navItems = document.querySelectorAll(".nav-links a");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("show");
  hamburger.classList.toggle("active");
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navItems.forEach((item) => item.classList.remove("active"));

    link.classList.add("active");

    navLinks.classList.remove("show");
    hamburger.classList.remove("active");
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

// Close the menu if the user clicks outside the navbar
document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-bar")) {
    navLinks.classList.remove("show");
    hamburger.classList.remove("active");
  }
});
