export class BackgroundManager {
  constructor(bg_color, bg_height, bg_width) {
    this.background = document.createElement("div");
    this.background.classList.add("my-background");
    if (bg_color) this.background.style.backgroundColor = bg_color;
    if (bg_height) this.background.style.height = bg_height;
    if (bg_width) this.background.style.width = bg_width;
    this.background.id = "Mybackgroud";
    let container = document.getElementById("container");
    container.appendChild(this.background);
  }

  getElement() {
    return this.background;
  }

  addChild(childElement) {
    this.background.appendChild(childElement);
  }

  getBounds() {
    return this.background.getBoundingClientRect();
  }
}
