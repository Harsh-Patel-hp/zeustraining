interface CourseData {
    img: string;
    topic: string;
    subject: string;
    grade: string;
    grade_plus: string;
    units: number | null;
    lessons: number | null;
    topics: number | null;
    teacher_class: string;
    no_of_students: number | null;
    date_of_class: string | null;
    is_favourite: boolean;
    isExpired: boolean;
    preview: boolean;
    manage_course: boolean;
    grade_submission: boolean;
    reports: boolean;
  }
  
  interface AlertData {
    msg: string;
    read: boolean;
    timestamp: string;
    course: string;
  }
  
  interface AnnouncementData {
    announcementBy_prefix: string;
    announcementBy_Name: string;
    msg: string;
    files: string;
    course_name: string;
    read: boolean;
    timestamp: string;
  }
  
  const menuBtn = document.getElementById("menu-btn") as HTMLElement;
  const navBar = document.querySelector(".nav-bar") as HTMLElement;
  const navLinks = document.querySelector(".nav-links") as HTMLElement;
  const hamburger = document.querySelector(".hamburger") as HTMLElement;
  const navItems = document.querySelectorAll(".nav-links .nav-item") as NodeListOf<HTMLElement>;
  const alerts = document.querySelector(".alert-icon") as HTMLElement;
  const announcements = document.querySelector(".announcement-icon") as HTMLElement;
  const alertBox = document.querySelector(".alerts-box") as HTMLElement;
  const announcementBox = document.querySelector(".announcements-box") as HTMLElement;
  
  let menuTimeout:number;
  
  function showMenu(): void {
    clearTimeout(menuTimeout);
    navLinks.classList.add("show");
    hamburger.classList.add("white-icon");
  }
  
  function hideMenu(): void {
    menuTimeout = setTimeout(() => {
      navLinks.classList.remove("show");
      hamburger.classList.remove("white-icon");
    }, 200);
  }
  
  menuBtn.addEventListener("mouseenter", showMenu);
  menuBtn.addEventListener("mouseleave", hideMenu);
  
  navLinks.addEventListener("mouseenter", showMenu);
  navLinks.addEventListener("mouseleave", hideMenu);
  
  let alertTimeout: number;
  
  function showAlerts(): void {
    clearTimeout(alertTimeout);
    alertBox.classList.add("alert-box-show");
    alerts.classList.add("white-icon");
    const alertCount = alerts.querySelector(".alert-count") as HTMLElement | null;
    if (alertCount) {
      alertCount.classList.add("count-hide");
    }
  }
  
  function hideAlerts(): void {
    alertTimeout = setTimeout(() => {
      alertBox.classList.remove("alert-box-show");
      alerts.classList.remove("white-icon");
      const alertCount = alerts.querySelector(".alert-count") as HTMLElement | null;
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
  
  let announcementTimeout: number;
  
  function showAnnouncements(): void {
    clearTimeout(announcementTimeout);
    announcementBox.classList.add("announcement-box-show");
    announcements.classList.add("white-icon");
    const announcementCount = announcements.querySelector(".announcement-count") as HTMLElement | null;
    if (announcementCount) {
      announcementCount.classList.add("count-hide");
    }
  }
  
  function hideAnnouncements(): void {
    announcementTimeout = setTimeout(() => {
      announcementBox.classList.remove("announcement-box-show");
      announcements.classList.remove("white-icon");
      const announcementCount = announcements.querySelector(".announcement-count") as HTMLElement | null;
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
  
  navItems.forEach((link: HTMLElement) => {
    link.addEventListener("click", () => {
      navItems.forEach((item: HTMLElement) => item.classList.remove("active"));
      link.classList.add("active");
      const arrow_btn = link.querySelector(".arrow") as HTMLElement | null;
      const subLinks = link.querySelector(".sub-links") as HTMLElement | null;
      if (subLinks) {
        subLinks.classList.toggle("sub-links-show");
      }
  
      if (arrow_btn) {
        arrow_btn.classList.toggle("arrow-roate");
      }
    });
  });
  
  const courses = document.getElementById("courses") as HTMLElement | null;
  const classes = document.getElementById("classes") as HTMLElement | null;
  
  function removeActive(): void {
    if (courses) courses.classList.remove("courses-active");
    if (classes) classes.classList.remove("classes-active");
  }
  
  if (courses) {
    courses.addEventListener("click", function (): void {
      removeActive();
      courses.classList.add("courses-active");
    });
  }
  
  if (classes) {
    classes.addEventListener("click", function (): void {
      removeActive();
      classes.classList.add("classes-active");
    });
  }
  
  async function fetchCourseData(): Promise<void> {
    try {
      const response: Response = await fetch("./data/cardData.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const cardData: CourseData[] = await response.json();
      generateCourseCards(cardData);
    } catch (error) {
      console.error("Error loading the JSON data:", error);
    }
  }
  
  function generateCourseCards(cardData: CourseData[]): void {
    const coursesGrid = document.getElementById("courses-grid") as HTMLElement;
  
    cardData.forEach((course: CourseData) => {
      const courseCard: HTMLDivElement = document.createElement("div");
      courseCard.classList.add("course-card");
  
      let expiredBadge: string = "";
      if (course.isExpired) {
        expiredBadge = '<div class="expired-badge">EXPIRED</div>';
      }
  
      const courseContent: string = `
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
                  ${course.units ? ` <div class="count">${course.units}</div>
                  <div class="text">Units</div>` : ""}
                  ${course.lessons?` <div class="count">${course.lessons}</div>
                  <div class="text">Lessons</div>`:""}
                 ${course.topics?`<div class="count">${course.topics}</div>
                  <div class="text">Topics</div>`:""}
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
  
  async function fetchAlertData(): Promise<void> {
    try {
      const response: Response = await fetch("./data/alertData.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const alertData: AlertData[] = await response.json();
      generateAlerts(alertData);
    } catch (error) {
      console.error("Error loading the JSON data:", error);
    }
  }
  
  function generateAlerts(alertData: AlertData[]): void {
    const alertsBox = document.getElementById("alerts-box") as HTMLElement;
  
    alertData.forEach((alert: AlertData) => {
      const alertElement: HTMLDivElement = document.createElement("div");
      alertElement.classList.add("alert-ele");
  
      const alertClass: string = alert.read ? "alert-white-ele" : "";
      const Extractcourse: string = alert.course.split(":")[0] || "";
      const ExtractcourseName: string =
        alert.course.split(":")[1] || "No course assigned";
      
      const alertContent: string = `
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
  
      const notificationLine: HTMLDivElement = document.createElement("div");
      notificationLine.classList.add("notification-line");
      alertsBox.appendChild(notificationLine);
    });
  
    const showAllButton: HTMLDivElement = document.createElement("div");
    showAllButton.classList.add("show-all");
    showAllButton.textContent = "Show All";
    alertsBox.appendChild(showAllButton);
  }
  
  async function fetchAnnouncementData(): Promise<void> {
    try {
      const response: Response = await fetch("./data/announcementData.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const announcementData: AnnouncementData[] = await response.json();
      generateAnnouncements(announcementData);
    } catch (error) {
      console.error("Error loading the JSON data:", error);
    }
  }
  
  function generateAnnouncements(announcementData: AnnouncementData[]): void {
    const announcementsBox = document.getElementById("announcements-box") as HTMLElement;
  
    announcementData.forEach((announcement: AnnouncementData) => {
      const announcementElement: HTMLDivElement = document.createElement("div");
      announcementElement.classList.add("announcement-ele");
  
      const announcementClass: string = announcement.read ? "announcement-white-ele" : "";
  
      const announcementContent: string = `
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
  
      const notificationLine: HTMLDivElement = document.createElement("div");
      notificationLine.classList.add("notification-line");
      announcementsBox.appendChild(notificationLine);
    });
  
    const showAllButton: HTMLDivElement = document.createElement("div");
    showAllButton.classList.add("show-all");
    showAllButton.textContent = "Show All";
  
    const createNewButton: HTMLDivElement = document.createElement("div");
    createNewButton.classList.add("create-new");
    createNewButton.textContent = "Create New";
  
    const showAllAndCreateNewDiv: HTMLDivElement = document.createElement("div");
    showAllAndCreateNewDiv.classList.add("show-all-and-create-new");
    showAllAndCreateNewDiv.appendChild(showAllButton);
    
    const lineOfAnnouncement: HTMLDivElement = document.createElement("div");
    lineOfAnnouncement.classList.add("line-of-announcement");
    showAllAndCreateNewDiv.appendChild(lineOfAnnouncement);
    showAllAndCreateNewDiv.appendChild(createNewButton);
  
    announcementsBox.appendChild(showAllAndCreateNewDiv);
  }
  
  function loadDataFromJson(): void {
    fetchCourseData();
    fetchAlertData();
    fetchAnnouncementData();
  }
  
  window.onload = loadDataFromJson;