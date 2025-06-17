class BackgroundManager {
  constructor(bg_color, bg_height, bg_width) {
    this.background = document.createElement("div");
    this.background.classList.add("my-background");
    if (bg_color) this.background.style.backgroundColor = bg_color;
    if (bg_height) this.background.style.height = bg_height;
    if (bg_width) this.background.style.width = bg_width;
    this.background.id = "Mybackgroud";
    document.body.appendChild(this.background);
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

class DraggableChild {
  constructor(parentElement, child_color, child_height, child_width) {
    this.child = document.createElement("div");
    this.child.classList.add("bg-child");
    this.child.id = "Bgchild";
    if (child_color) this.child.style.backgroundColor = child_color;
    if (child_height) this.child.style.backgroundColor = child_height;
    if (child_width) this.child.style.backgroundColor = child_width;
    this.parentElement = parentElement;
    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;

    this.child.addEventListener("pointerdown", (event) => {
      this.dragging = true;
      this.offsetX = event.clientX - this.child.offsetLeft;
      this.offsetY = event.clientY - this.child.offsetTop;
      this.child.setPointerCapture(event.pointerId);
    });

    this.child.addEventListener("pointermove", (event) => {
      if (!this.dragging) return;

      let x = event.clientX - this.offsetX;
      let y = event.clientY - this.offsetY;

      const bounds = this.parentElement.getBoundingClientRect();
      x = Math.max(0, Math.min(x, bounds.width - this.child.offsetWidth));
      y = Math.max(0, Math.min(y, bounds.height - this.child.offsetHeight));

      this.child.style.left = `${x}px`;
      this.child.style.top = `${y}px`;
    });

    this.child.addEventListener("pointerup", (event) => {
      this.dragging = false;
      this.child.releasePointerCapture(event.pointerId);
    });

    window.addEventListener("resize", () => {
      const bounds = this.parentElement.getBoundingClientRect();
      let x = this.child.offsetLeft;
      let y = this.child.offsetTop;

      x = Math.max(0, Math.min(x, bounds.width - this.child.offsetWidth));
      y = Math.max(0, Math.min(y, bounds.height - this.child.offsetHeight));

      this.child.style.left = `${x}px`;
      this.child.style.top = `${y}px`;
    });

    parentElement.appendChild(this.child);
  }
  getElement() {
    return this.child;
  }
}

window.onload = () => {
  const bgManager = new BackgroundManager(
    (bg_color = "#03A9F4"),
    (bg_height = "50vh")
  );
  new DraggableChild(bgManager.getElement(), "#c1770a");

  const bgManager2 = new BackgroundManager(
    (bg_color = "#FF9800"),
    (bg_height = "50vh")
  );
  new DraggableChild(bgManager2.getElement(), "#008dcd");

  const bgManager3 = new BackgroundManager(
    (bg_color = "#009688"),
    (bg_height = "50vh")
  );
  new DraggableChild(bgManager3.getElement(), "#384483");

  const bgManager4 = new BackgroundManager(
    (bg_color = "#3F51B5"),
    (bg_height = "50vh")
  );
  new DraggableChild(bgManager4.getElement(), "#28bfb1");
};
