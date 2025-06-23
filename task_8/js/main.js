import { Grid } from "./grid/Grid.js";
import { sampleData } from "./data/generatedData.js";
window.onload = loadwindow();

function loadwindow() {
  const canvas = document.getElementById("excel-grid");

  const grid = new Grid(canvas, 50, 50);

  grid.loadData(sampleData);
}
