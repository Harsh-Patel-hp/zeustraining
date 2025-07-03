// // Assuming you have the generateSampleData function in main.js as you've shown
// export function generateSampleData(rows) {
//   const data = [];
//   const columns = ["Name", "Age", "City", "Salary", "Department", "Experience"];

//   for (let i = 0; i < rows; i++) {
//     const row = {};
//     columns.forEach((col, index) => {
//       switch (index) {
//         case 0:
//           row[col] = `Person ${i + 1}`;
//           break;
//         case 1:
//           row[col] = Math.floor(Math.random() * 50) + 20;
//           break;
//         case 2:
//           row[col] = ["New York", "London", "Tokyo", "Paris", "Berlin"][
//             Math.floor(Math.random() * 5)
//           ];
//           break;
//         case 3:
//           row[col] = Math.floor(Math.random() * 100000) + 30000;
//           break;
//         case 4:
//           row[col] = ["IT", "Sales", "Marketing", "HR", "Finance"][
//             Math.floor(Math.random() * 5)
//           ];
//           break;
//         case 5:
//           row[col] = Math.floor(Math.random() * 15) + 1;
//           break;
//       }
//     });
//     data.push(row);
//   }
//   return data;
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const gridContainer = document.getElementById("grid_container");
//   let currentRow = 0;
//   const rowsPerCanvas = 50; // Number of rows per canvas

//   function createCanvas(rows) {
//     const data = generateSampleData(rows);
//     const canvasWrapper = document.createElement("div");
//     canvasWrapper.classList.add("canvas-wrapper");

//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     // Set canvas size (arbitrary, you can adjust based on your UI design)
//     canvas.width = 800;
//     canvas.height = 600;

//     // Add the canvas to the wrapper and then to the container
//     canvasWrapper.appendChild(canvas);
//     gridContainer.appendChild(canvasWrapper);

//     // Draw data on the canvas
//     drawDataOnCanvas(ctx, data);
//   }

//   function drawDataOnCanvas(ctx, data) {
//     const rowHeight = 30; // Adjust row height depending on your design
//     const columnWidth = 120; // Adjust column width depending on your design
//     const header = [
//       "Name",
//       "Age",
//       "City",
//       "Salary",
//       "Department",
//       "Experience",
//     ];

//     // Draw headers
//     ctx.font = "16px Arial";
//     header.forEach((col, index) => {
//       ctx.fillText(col, index * columnWidth, 20);
//     });

//     // Draw rows
//     data.forEach((row, rowIndex) => {
//       header.forEach((col, colIndex) => {
//         ctx.fillText(
//           row[col],
//           colIndex * columnWidth,
//           (rowIndex + 1) * rowHeight
//         );
//       });
//     });
//   }

//   // Load initial data when the page loads
//   createCanvas(rowsPerCanvas);

//   // Handle scroll to load more data
//   gridContainer.addEventListener("scroll", () => {
//     if (
//       gridContainer.scrollTop + gridContainer.clientHeight >=
//       gridContainer.scrollHeight
//     ) {
//       // User reached the bottom, load more data
//       createCanvas(rowsPerCanvas);
//     }
//   });
// });

// //Create Main Grid for rows-columns
export class Grid {
  constructor(
    wrapper,
    rowsPerCanvas,
    colsPerCanvas,
    maxRows,
    maxCols,
    dataset
  ) {
    this.wrapper = wrapper;
    this.rowsPerCanvas = rowsPerCanvas;
    this.colsPerCanvas = colsPerCanvas;
    this.maxRows = maxRows;
    this.maxCols = maxCols;
    this.dataset = dataset || [];
    this.cellWidth = 80;
    this.cellHeight = 25;

    this.canvases = {}; // Stores created canvas elements by position
    this.canvasData = {}; // Optional, not used in virtual approach

    this.editor = document.getElementById("cell-editor");
    this.resizer = document.getElementById("resizer");

    // Scroll-based rendering
    window.addEventListener("scroll", () => this.renderCanvases());
    window.addEventListener("click", (e) => this.handleClick(e));
    this.editor.addEventListener("blur", () => this.handleEditorBlur());

    this.isResizing = false;
    this.initResize();

    // this.loadData(this.dataset);
    // if (this.dataset.length > 0) {
    this.renderCanvases();
    // }
  }

  // Calculate which canvas blocks view
  getCanvasCoords() {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const startCol = Math.floor(
      scrollX / (this.colsPerCanvas * this.cellWidth)
    );
    const endCol = Math.floor(
      (scrollX + vw) / (this.colsPerCanvas * this.cellWidth)
    );

    const startRow = Math.floor(
      scrollY / (this.rowsPerCanvas * this.cellHeight)
    );
    const endRow = Math.floor(
      (scrollY + vh) / (this.rowsPerCanvas * this.cellHeight)
    );

    const coords = [];
    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        coords.push(`${x}_${y}`);
      }
    }
    console.log(":", coords);
    return coords;
  }

  // Create canvases only for visible blocks
  renderCanvases() {
    const visible = this.getCanvasCoords();
    visible.forEach((key) => {
      // Checking if canvas is already created at this coords.
      if (!this.canvases[key]) {
        const [x, y] = key.split("_").map(Number);
        this.createCanvas(x, y);
      }
    });
  }

  // Create a new canvas block on the grid at x and y coords
  createCanvas(xIndex, yIndex) {
    const canvas = document.createElement("canvas");
    canvas.width = this.colsPerCanvas * this.cellWidth;
    canvas.height = this.rowsPerCanvas * this.cellHeight;
    canvas.style.position = "absolute";
    canvas.style.left = `${xIndex * canvas.width}px`;
    canvas.style.top = `${yIndex * canvas.height}px`;
    // canvas.style.cursor = `grab`;

    this.wrapper.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    // const columnNames = this.dataset.length > 0 ? Object.keys(this.dataset[0]) : [];
    // console.log(columnNames)

    // Draw cells within a canvas block
    for (let r = 0; r < this.rowsPerCanvas; r++) {
      for (let c = 0; c < this.colsPerCanvas; c++) {
        const globalRow = yIndex * this.rowsPerCanvas + r;
        const globalCol = xIndex * this.colsPerCanvas + c;

        const x = c * this.cellWidth;
        const y = r * this.cellHeight;

        // Header cell (row 0 or column 0)
        if (globalRow === 0 || globalCol === 0) {
          ctx.fillStyle = "#e7e7e7";
          ctx.font =
            "11pt Aptos Narrow, Segoe UI, Calibri, Thonburi, Arial, Verdana, sans-serif, Mongolian Baiti, Microsoft Yi Baiti, Javanese Text";
          if (globalCol === 0) {
            ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
            ctx.textAlign = "right";
          } else {
            ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
            ctx.textAlign = "center";
          }
          ctx.fillStyle = "#5e5e5e";
          ctx.textBaseline = "middle";
          // ctx.style.cursor = "ew-resize";
          ctx.strokeStyle = "rgba(33, 62, 64, 0.1)";

          // Skip top border for header row
          if (globalRow !== 0) {
            ctx.beginPath();
            // ctx.lineWidth = 0.5;
            ctx.moveTo(x + 0.5, y + 0.5);
            ctx.lineTo(x + this.cellWidth + 0.5, y + 0.5);
            ctx.stroke();
          }

          if (globalCol !== 0) {
            // Left border
            ctx.beginPath();
            ctx.moveTo(x + 0.5, y + 0.5);
            ctx.lineTo(x + 0.5, y + this.cellHeight + 0.5);
            ctx.stroke();
          }
          // Right border
          ctx.beginPath();
          ctx.moveTo(x + this.cellWidth + 0.5, y + 0.5);
          ctx.lineTo(x + this.cellWidth + 0.5, y + this.cellHeight + 0.5);
          ctx.stroke();

          // Row0 header labels (A, B, C...)
          if (globalRow === 0 && globalCol > 0) {
            let index = globalCol;
            let label = "";
            while (index > 0) {
              label = String.fromCharCode(((index - 1) % 26) + 65) + label;
              index = Math.floor((index - 1) / 26);
            }
            ctx.fillText(
              label,
              x + this.cellWidth / 2,
              y + this.cellHeight / 2
            );
          }
          // Col0 header labels (1, 2, 3...)
          if (globalCol === 0 && globalRow > 0) {
            ctx.fillText(
              globalRow.toString(),
              x + this.cellWidth / 2,
              y + this.cellHeight / 2
            );
          }
        } else if (globalRow === 1) {
          const dataColIndex = globalCol - 1; // col 0 = row number header
          ctx.strokeStyle = "rgba(33, 62, 64, 0.1)";
          ctx.strokeRect(x + 0.4, y + 0.4, this.cellWidth, this.cellHeight);

          // if (columnNames[dataColIndex]) {
          //     ctx.fillStyle = "#000";
          //     ctx.font = "bold 14px Arial";
          //     ctx.textAlign = "left";
          //     ctx.textBaseline = "middle";
          //     ctx.fillText(String(columnNames[dataColIndex]).toUpperCase().slice(0, 8), x + 4, y + this.cellHeight / 2);
          // }
        } else {
          // Regular cell
          ctx.strokeStyle = "rgba(33, 62, 64, 0.1)";
          ctx.strokeRect(x + 0.5, y + 0.5, this.cellWidth, this.cellHeight);

          // const dataRowIndex = globalRow - 2;  // row 0 = header, 1 = column names
          // const dataColIndex = globalCol - 1;  // col 0 = row number header

          // if (this.dataset[dataRowIndex] && columnNames[dataColIndex]) {
          //     const cellValue = this.dataset[dataRowIndex][columnNames[dataColIndex]];
          //     // console.log(cellValue);
          //     if (cellValue !== undefined && cellValue !== null) {
          //         ctx.fillStyle = "#000";
          //         ctx.font = "14px Arial";
          //         ctx.textAlign = "left";
          //         ctx.textBaseline = "middle";
          //         ctx.fillText(String(cellValue).slice(0, 8), x + 4, y + this.cellHeight / 2);
          //     }
          // }
        }
      }
    }

    const key = `${xIndex}_${yIndex}`;
    this.canvases[key] = { canvas, ctx };
  }

  // Adding random data
  loadData(dataset) {
    this.dataset = dataset;
    this.renderCanvases(); // trigger initial render
  }

  // Handle clicking on a cell to activate the editor
  handleClick(e) {
    const x = e.pageX;
    const y = e.pageY;

    const globalCol = Math.floor(x / this.cellWidth);
    const globalRow = Math.floor(y / this.cellHeight);
    // console.log("gC: ", globalCol,"cW: ", this.cellWidth, "gR: ", globalRow, "cH:", this.cellHeight);
    if (globalRow === 0 || globalCol === 0) return;

    const xIndex = Math.floor(globalCol / this.colsPerCanvas);
    const yIndex = Math.floor(globalRow / this.rowsPerCanvas);
    const localCol = globalCol % this.colsPerCanvas;
    const localRow = globalRow % this.rowsPerCanvas;
    const key = `${xIndex}_${yIndex}`;

    this.editor.dataset.key = key;
    this.editor.dataset.localRow = localRow;
    this.editor.dataset.localCol = localCol;

    const dataRowIndex = globalRow - 2;
    const dataColIndex = globalCol - 1;
    const colName = Object.keys(this.dataset[0])[dataColIndex];
    const value = this.dataset[dataRowIndex]?.[colName] || "";

    this.editor.value = value;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    // Position editor precisely on the clicked cell
    this.editor.style.display = "block";
    this.editor.style.left = `${globalCol * this.cellWidth - scrollX}px`;
    this.editor.style.top = `${globalRow * this.cellHeight - scrollY}px`;
    this.editor.style.width = `${this.cellWidth}px`;
    this.editor.style.height = `${this.cellHeight}px`;
    this.editor.style.outline = `none`;
    this.editor.focus();
    // Position cell resizer
    this.resizer.style.display = "block";
    this.resizer.style.left = `${
      globalCol * this.cellWidth + this.cellWidth - 5 - scrollX
    }px`;
    this.resizer.style.top = `${
      globalRow * this.cellHeight + this.cellHeight - 5 - scrollY
    }px`;
  }

  // Save edited value to canvasData and rerender
  handleEditorBlur() {
    const key = this.editor.dataset.key;
    const row = Number(this.editor.dataset.localRow);
    const col = Number(this.editor.dataset.localCol);
    const val = this.editor.value;

    const [xIndex, yIndex] = key.split("_").map(Number);
    const globalRow = yIndex * this.rowsPerCanvas + row;
    const globalCol = xIndex * this.colsPerCanvas + col;

    const dataRowIndex = globalRow - 2;
    const dataColIndex = globalCol - 1;

    const columnNames = Object.keys(this.dataset[0]);
    const columnKey = columnNames[dataColIndex];
    if (this.dataset[dataRowIndex] && columnKey) {
      this.dataset[dataRowIndex][columnKey] = val;
    }

    this.editor.style.display = "none";
    this.resizer.style.display = "none";
    // Rerender the specific canvas block
    this.canvases[key].canvas.remove();
    delete this.canvases[key];
    this.createCanvas(xIndex, yIndex);
  }

  // Setup resizer interaction
  initResize() {
    let startX, startY;

    this.resizer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.isResizing = true;
      startX = e.pageX;
      startY = e.pageY;
    });
  }
}
