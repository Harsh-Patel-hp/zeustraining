export class DraggableChild {
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

  automove(num = 100) {
    let x = this.child.offsetWidth;
    let y = this.child.offsetHeight;
    let toptouch = false;
    let floortouch = false;
    setInterval(() => {
      setTimeout(() => {
        const bounds = this.parentElement.getBoundingClientRect();
        console.log(bounds, y);
        // x = Math.max(0, Math.min(x, bounds.width - this.child.offsetWidth));
        // y = Math.max(0, Math.min(y, bounds.height - this.child.offsetHeight));

        if (y == bounds.height - this.child.offsetHeight) {
          floortouch = true;
          toptouch = false;
          console.log("floor");
        }

        if (y == 0) {
          toptouch = true;
          floortouch = false;
          console.log("top");
        }

        if (toptouch) {
          y++;
          this.child.style.top = `${y}px`;
        } else if (floortouch) {
          console.log("floortouch");
          y--;
          x += 50;
          this.child.style.left = `${x}px`;
          this.child.style.top = `${y}px`;
        } else {
          y++;
          this.child.style.top = `${y}px`;
        }
      }, 500);
    }, num);
  }
}
