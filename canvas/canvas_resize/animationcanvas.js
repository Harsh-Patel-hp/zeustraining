let canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let c = canvas.getContext("2d");

// let x = Math.random() * canvas.width;
// let y = Math.random() * canvas.height;
// let dy = 10;
// let dx = 10;
// let radius = 30;
// function animate() {
//   requestAnimationFrame(animate);
//   c.clearRect(0, 0, canvas.width, canvas.height);
//   c.beginPath();
//   c.arc(x, y, radius, 0, Math.PI * 2, false);
//   c.strokeStyle = "black";
//   c.stroke();

//   if (x + radius > canvas.width || x - radius < 0) {
//     dx = -dx;
//   }

//   if (y + radius > canvas.height || y - radius < 0) {
//     dy = -dy;
//   }

//   y += dy;
//   x += dx;
// }

// animate();

class Circle {
  constructor(x, y, dx, dy, radius, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
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
    this.draw();
  }
}

//single circle

// let circle = new Circle(200, 200, 3, 3, 30, "red");

// function animate() {
//   requestAnimationFrame(animate);
//   c.clearRect(0, 0, canvas.width, canvas.height);
//   circle.update();
// }

// animate();

// multiple circles
let circleArray = [];

for (let i = 0; i < 100; i++) {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
  let dx = Math.random() * 10 - 5;
  let dy = Math.random() * 10 - 5;
  let radius = 30;
  let color = makeRandomColor();
  circleArray.push(new Circle(x, y, dx, dy, radius, color));
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
