let canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let c = canvas.getContext("2d");
class Circle {
  constructor(x, y, dx, dy, radius, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
  }
  animate() {
    // requestAnimationFrame(this.animate.bind(this));
    requestAnimationFrame(() => this.animate());
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.strokeStyle = "black";
    c.stroke();

    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.dx = -this.dx;
    }

    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.dy = -this.dy;
    }

    this.y += this.dy;
    this.x += this.dx;
  }
}

let x = Math.random() * canvas.width;
let y = Math.random() * canvas.height;
let circle = new Circle(x, y, 10, 10, 30, "red");
circle.animate();
