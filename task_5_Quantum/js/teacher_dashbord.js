let menuBtn = document.getElementById("menu-btn");
const navBar = document.querySelector(".nav-bar");
let navLinks = document.querySelector(".nav-links");
let hamburger = document.querySelector(".hamburger");
let navItems = document.querySelectorAll(".nav-links .nav-item");
let alerts = document.querySelector(".alert-icon");
let announcements = document.querySelector(".announcement-icon");
let alertBox = document.querySelector(".alerts-box");
let announcementBox = document.querySelector(".announcements-box");

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
  }, 200);
}

menuBtn.addEventListener("mouseenter", showMenu);
menuBtn.addEventListener("mouseleave", hideMenu);

navLinks.addEventListener("mouseenter", showMenu);
navLinks.addEventListener("mouseleave", hideMenu);

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
  }, 200);
}

alerts.addEventListener("mouseenter", showAlerts);
alerts.addEventListener("mouseleave", hideAlerts);

if (alertBox) {
  alertBox.addEventListener("mouseenter", showAlerts);
  alertBox.addEventListener("mouseleave", hideAlerts);
}

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
  }, 200);
}

announcements.addEventListener("mouseenter", showAnnouncements);
announcements.addEventListener("mouseleave", hideAnnouncements);

if (announcementBox) {
  announcementBox.addEventListener("mouseenter", showAnnouncements);
  announcementBox.addEventListener("mouseleave", hideAnnouncements);
}

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

async function fetchCourseData() {
  try {
    const response = await fetch("./data/cardData.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const cardData = await response.json();
    generateCourseCards(cardData);
  } catch (error) {
    console.error("Error loading the JSON data:", error);
  }
}

function generateCourseCards(cardData) {
  const coursesGrid = document.getElementById("courses-grid");

  cardData.forEach((course) => {
    const courseCard = document.createElement("div");
    courseCard.classList.add("course-card");

    let expiredBadge = "";
    if (course.isExpired) {
      expiredBadge = '<div class="expired-badge">EXPIRED</div>';
    }

    const courseContent = `
      ${expiredBadge}
      ${
        expiredBadge
          ? `
        <div class="star-gray-icon">
        <img src="./assets/icons/favourite.svg" alt="" />
      </div>
      </div>`
          : `<div class="star-icon">
        <img src="./assets/icons/favourite.svg" alt="" />
      </div>`
      }
      
      <div class="course-content">
        <div class="image-and-info">
          <div class="course-image">
            <img src="${course.img}" alt="" />
          </div>
          <div class="course-info">
            <div class="course-header">
              <div class="course-title">${course.topic}</div>
              <div class="sub-grade">
                <div class="subject">${course.subject}</div>
                <div class="sub-line"></div>
                <div class="grade">
                  Grade ${course.grade}<span class="add-grade">${
      course.grade_plus
    }</span>
                </div>
              </div>
              <div class="unit-lessons-topic">
                <div class="count">${course.units || "N/A"}</div>
                <div class="text">Units</div>
                <div class="count">${course.lessons || "N/A"}</div>
                <div class="text">Lessons</div>
                <div class="count">${course.topics || "N/A"}</div>
                <div class="text">Topics</div>
              </div>
            </div>
            <div class="course-class">
              <div class="class-selection">
                <select name="class-name" ${
                  course.teacher_class ? "" : `class="no-class-option"`
                }  id="class-name">
                  <option value="B" >${
                    course.teacher_class || "No Classes"
                  }</option>
                </select>
              </div>
              <div class="class-info">
              ${
                course.no_of_students
                  ? `
                  <div class="student-count">${course.no_of_students} Students</div>
              `
                  : ""
              }
              ${
                course.date_of_class
                  ? `
               <div class="sub-line"></div>
                <div class="class-duration">${course.date_of_class}</div>
              `
                  : ""
              }
            </div>
            </div>
          </div>
        </div>
        <div class="course-line"></div>
        <div class="course-actions">
          ${
            course.preview
              ? '<img src="./assets/icons/preview.svg" alt="" />'
              : '<img src="./assets/icons/preview.svg" class="low-opacity" alt="" />'
          }
          ${
            course.manage_course
              ? '<img src="./assets/icons/manage course.svg" alt="" />'
              : '<img src="./assets/icons/manage course.svg" class="low-opacity" alt="" />'
          }
          ${
            course.grade_submission
              ? '<img src="./assets/icons/grade submissions.svg" alt="" />'
              : '<img src="./assets/icons/grade submissions.svg" class="low-opacity" alt="" />'
          }
          ${
            course.reports
              ? '<img src="./assets/icons/reports.svg" alt="" />'
              : '<img src="./assets/icons/reports.svg" class="low-opacity" alt="" />'
          }
        </div>
      </div>
    `;

    courseCard.innerHTML = courseContent;

    coursesGrid.appendChild(courseCard);
  });
}

async function fetchAlertData() {
  try {
    const response = await fetch("./data/alertData.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const alertData = await response.json();

    generateAlerts(alertData);
  } catch (error) {
    console.error("Error loading the JSON data:", error);
  }
}

function generateAlerts(alertData) {
  const alertsBox = document.getElementById("alerts-box");

  alertData.forEach((alert) => {
    const alertElement = document.createElement("div");
    alertElement.classList.add("alert-ele");

    let alertClass = alert.read ? "alert-white-ele" : "";
    const Extractcourse = alert.course.split(":")[0] || "";
    const ExtractcourseName =
      alert.course.split(":")[1] || "No course assigned";
    const alertContent = `
      <div class="alert-text-and-icon">
        <div class="alert-text">${alert.msg}</div>
        <div class="alert-icon">
          <img src="${
            alert.read
              ? "./assets/icons/correct.png"
              : "./assets/icons/minus.png"
          }" alt="" class="minus-icon" />
        </div>
      </div>

      ${
        alert.course
          ? `<div class="alert-info">${Extractcourse}:<span class="alert-info-course">${ExtractcourseName}</span></div>`
          : ""
      }

      <div class="alert-time">${alert.timestamp}</div>
    `;

    alertElement.innerHTML = alertContent;

    if (alertClass) {
      alertElement.classList.add(alertClass);
    }

    alertsBox.appendChild(alertElement);

    alertsBox
      .appendChild(document.createElement("div"))
      .classList.add("notification-line");
  });

  const showAllButton = document.createElement("div");
  showAllButton.classList.add("show-all");
  showAllButton.textContent = "Show All";
  alertsBox.appendChild(showAllButton);
}

async function fetchAnnouncementData() {
  try {
    const response = await fetch("./data/announcementData.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const announcementData = await response.json();
    generateAnnouncements(announcementData);
  } catch (error) {
    console.error("Error loading the JSON data:", error);
  }
}

function generateAnnouncements(announcementData) {
  const announcementsBox = document.getElementById("announcements-box");

  announcementData.forEach((announcement) => {
    const announcementElement = document.createElement("div");
    announcementElement.classList.add("announcement-ele");

    let announcementClass = announcement.read ? "announcement-white-ele" : "";

    const announcementContent = `
      <div class="announcement-title-and-icon">
        <div class="announcement-title">
          ${
            announcement.announcementBy_prefix
          } <span class="announcement-title-name">${
      announcement.announcementBy_Name
    }</span>
        </div>
        <div class="alert-icon">
          <img src="${
            announcement.read
              ? "./assets/icons/correct.png"
              : "./assets/icons/minus.png"
          }" alt="" class="minus-icon" />
        </div>
      </div>

      <div class="announcement-text">${announcement.msg}</div>
      
      ${
        announcement.course_name
          ? `<div class="announcement-course-info">${announcement.course_name}</div>`
          : ""
      }
      
      <div class="announcement-info-and-time">
        ${
          announcement.files
            ? `
          <div class="announcement-info">
            <img src="./assets/icons/attach.png" alt="" class="attach-icon" />
            <span class="announcement-info-text">${announcement.files}</span>
          </div>
        `
            : ""
        }
        <div class="announcement-time">${announcement.timestamp}</div>
      </div>
    `;

    announcementElement.innerHTML = announcementContent;

    if (announcementClass) {
      announcementElement.classList.add(announcementClass);
    }

    announcementsBox.appendChild(announcementElement);

    announcementsBox
      .appendChild(document.createElement("div"))
      .classList.add("notification-line");
  });

  const showAllButton = document.createElement("div");
  showAllButton.classList.add("show-all");
  showAllButton.textContent = "Show All";

  const createNewButton = document.createElement("div");
  createNewButton.classList.add("create-new");
  createNewButton.textContent = "Create New";

  const showAllAndCreateNewDiv = document.createElement("div");
  showAllAndCreateNewDiv.classList.add("show-all-and-create-new");
  showAllAndCreateNewDiv.appendChild(showAllButton);
  showAllAndCreateNewDiv
    .appendChild(document.createElement("div"))
    .classList.add("line-of-announcement");
  showAllAndCreateNewDiv.appendChild(createNewButton);

  announcementsBox.appendChild(showAllAndCreateNewDiv);
}

function loadDataFromJson() {
  fetchCourseData();
  fetchAlertData();
  fetchAnnouncementData();
}
window.onload = loadDataFromJson;
