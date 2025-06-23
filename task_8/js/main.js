import { Grid } from "./grid/Grid.js";
import { generateSampleData as sampleData } from "./data/generatedData.js";
window.onload = loadwindow();

function loadwindow() {
  const canvas = document.getElementById("excel-grid");

  const grid = new Grid(canvas, 100, 100);

  grid.loadData(sampleData(100));
}
