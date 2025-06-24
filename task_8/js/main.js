import { Grid } from "./grid/Grid.js";
import { generateSampleData as sampleData } from "./data/generatedData.js";
window.onload = loadwindow();

function loadwindow() {
  // const canvas = document.getElementById("excel-grid");
  // const grid = new Grid(canvas, 200, 200);
  const grid_container = document.getElementById("grid_container");
  const rowsPerCanvas = 50;
  const colsPerCanvas = 28;
  const columns = 500;
  const rows = 200;
  const grid = new Grid(
    grid_container,
    rowsPerCanvas,
    colsPerCanvas,
    columns,
    rows
  );

  grid.loadData(sampleData(200));
}
