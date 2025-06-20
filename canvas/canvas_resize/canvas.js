let canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let c = canvas.getContext("2d");

c.fillStyle = "red";
c.fillRect(400, 100, 100, 100);
c.fillStyle = "blue";
c.fillRect(200, 300, 100, 100);
c.fillStyle = "green";
c.fillRect(600, 300, 100, 100);

//line
c.beginPath();
c.strokeStyle = "yellow";
c.moveTo(50, 300);
c.lineTo(300, 100);
c.stroke();
c.lineTo(400, 500);
c.stroke();

//arc
c.beginPath();
c.strokeStyle = "black";
c.arc(300, 300, 30, 0, Math.PI * 2, false);
c.stroke();

for (let i = 0; i < 10; i++) {
  let x = Math.random() * window.innerWidth;
  let y = Math.random() * window.innerHeight;
  c.beginPath();
  c.strokeStyle = makeRandomColor();
  c.arc(x, y, 30, 0, Math.PI * 2, false);
  c.stroke();
}

function makeRandomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  );
}
