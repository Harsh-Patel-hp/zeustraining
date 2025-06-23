let canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let c = canvas.getContext("2d");

let mouse = {
  x: undefined,
  y: undefined,
};
let minmumRadius = 5;
class Circle {
  constructor(x, y, dx, dy, radius, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.minmumRadius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.strokeStyle = this.color;
    c.fillStyle = this.color;
    c.stroke();
    c.fill();
  }

  update() {
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.dx = -this.dx;
    }

    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.dy = -this.dy;
    }

    this.y += this.dy;
    this.x += this.dx;

    if (
      mouse.x - this.x < 150 &&
      mouse.x - this.x > -150 &&
      mouse.y - this.y < 150 &&
      mouse.y - this.y > -150
    ) {
      if (this.radius < 70) {
        this.radius += 2;
      }
    } else if (this.radius > this.minmumRadius) {
      this.radius -= 1;
    }
    this.draw();
  }
}

let circleArray = [];

function init() {
  circleArray = [];
  for (let i = 0; i < 800; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let dx = Math.random() * 10 - 5;
    let dy = Math.random() * 10 - 5;
    let radius = Math.random() * 30 + 1;
    let color = makeRandomColor();
    circleArray.push(new Circle(x, y, dx, dy, radius, color));
  }
}
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < circleArray.length; i++) {
    circleArray[i].update();
  }
}

animate();

function makeRandomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  );
}

window.addEventListener("pointermove", (event) => {
  //   console.log(event.clientX, event.clientY);
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  init();
});
