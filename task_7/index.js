function createBackgroundAndChild() {
  let Mybackgroud = document.createElement("div");
  Mybackgroud.classList.add("my-background");
  Mybackgroud.id = "Mybackgroud";
  document.body.appendChild(Mybackgroud);

  let child = document.createElement("div");
  child.classList.add("bg-child");
  child.id = "Bgchild";
  Mybackgroud.appendChild(child);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  child.addEventListener("pointerdown", (event) => {
    isDragging = true;
    offsetX = event.clientX - child.offsetLeft;
    offsetY = event.clientY - child.offsetTop;
    console.log(event.clientX, event.clientY);
    child.setPointerCapture(event.pointerId);
  });

  child.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    let x = event.clientX - offsetX;
    let y = event.clientY - offsetY;

    const bgRect = Mybackgroud.getBoundingClientRect();
    x = Math.max(0, Math.min(x, bgRect.width - child.offsetWidth));
    y = Math.max(0, Math.min(y, bgRect.height - child.offsetHeight));

    child.style.left = x + "px";
    child.style.top = y + "px";
  });

  child.addEventListener("pointerup", (event) => {
    isDragging = false;
    child.releasePointerCapture(event.pointerId);
  });
}

window.onload = createBackgroundAndChild;
