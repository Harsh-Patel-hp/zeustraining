let menuBtn = document.getElementById("menu-btn");
let navLinks = document.querySelector(".nav-links");
let hamburger = document.querySelector(".hamburger");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("show");
  hamburger.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("show");
    hamburger.classList.remove("active");
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-bar")) {
    navLinks.classList.remove("show");
    hamburger.classList.remove("active");
  }
});
