import { Selection } from "./Selection.js";
import { Column } from "./Column.js";
import { Row } from "./Row.js";
import { Cell } from "./Cell.js";
import { EditCellCommand } from "./commands/EditCellCommand.js";
import { Utils } from "./utils.js";
import { CellRange } from "./CellRange.js";
export class Grid {
  constructor(
    grid_container,
    rowsPerCanvas,
    colsPerCanvas,
    columns = 500,
    rows = 100000
  ) {
    this.totalColumns = columns;

    this.totalRows = rows;

    this.visibleColumns = 30;

    this.visibleRows = 50;

    this.rowHeight = 25;
    this.zoomFactor = this.zoomLevel || 1;

    this.RowlabelWidth = 100;

    this.ColumnlabelHeight = 50;

    this.columnWidth = 100;

    this.scrollX = 0;

    this.scrollY = 0;

    this.columns = [];

    this.rows = [];

    this.selection = new Selection();

    this.commandHistory = [];

    this.historyPointer = -1;

    this.data = [];

    this.headers = [];
    this.grid_container = grid_container || "";
    this.virtual_class = document.getElementById("virtual_class") || "";

    this.rowsPerCanvas = rowsPerCanvas;
    this.colsPerCanvas = colsPerCanvas;
    this.canvases = {}; // Stores created canvas elements by position
    this.canvasData = {};
    this.init();
    this.setupEventListeners();
  }

  getCanvasCoords() {
    const scrollX = this.scrollX;
    const scrollY = this.scrollY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const startCol = Math.floor(
      scrollX / (this.colsPerCanvas * this.columnWidth)
    );
    const endCol = Math.floor(
      (scrollX + vw) / (this.colsPerCanvas * this.columnWidth)
    );

    const startRow = Math.floor(
      scrollY / (this.rowsPerCanvas * this.rowHeight)
    );
    const endRow = Math.floor(
      (scrollY + vh) / (this.rowsPerCanvas * this.rowHeight)
    );

    const coords = [];
    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        coords.push(`${x}_${y}`);
        // coords.push([x, y]);
      }
    }
    console.log(":", coords);
    return coords;
  }

  renderCanvases() {
    const visible = this.getCanvasCoords();
    visible.forEach((key) => {
      // Checking if canvas is already created at this coords.
      if (!this.canvases[key]) {
        const [x, y] = key.split("_").map(Number);
        this.createCanvas(x, y);
        // console.log(key[0], key[1]);
        // this.createCanvas(key[0], key[1]);
      }
    });
  }

  createCanvas(xIndex, yIndex) {
    console.log("xIndex", xIndex, "yIndex", yIndex);

    const canvas = document.createElement("canvas");
    canvas.width = this.colsPerCanvas * this.columnWidth;
    canvas.height = this.rowsPerCanvas * this.rowHeight;
    canvas.style.position = "absolute";
    canvas.style.left = `${xIndex * canvas.width}px`;
    canvas.style.top = `${yIndex * canvas.height}px`;
    // canvas.style.cursor = `grab`;

    this.grid_container.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const columnNames = this.data.length > 0 ? Object.keys(this.data[0]) : [];

    // Draw cells within a canvas block
    for (let r = 0; r < this.rowsPerCanvas; r++) {
      for (let c = 0; c < this.colsPerCanvas; c++) {
        const globalRow = yIndex * this.rowsPerCanvas + r;
        const globalCol = xIndex * this.colsPerCanvas + c;

        const x = c * this.columnWidth;
        const y = r * this.rowHeight;

        // Header cell (row 0 or column 0)
        if (globalRow === 0 || globalCol === 0) {
          ctx.fillStyle = "#e7e7e7";
          ctx.font =
            "11pt Aptos Narrow, Segoe UI, Calibri, Thonburi, Arial, Verdana, sans-serif, Mongolian Baiti, Microsoft Yi Baiti, Javanese Text";
          if (globalCol === 0) {
            ctx.fillRect(x, y, this.columnWidth, this.rowHeight);
            ctx.textAlign = "right";
          } else {
            ctx.fillRect(x, y, this.columnWidth, this.rowHeight);
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
            ctx.lineTo(x + this.columnWidth + 0.5, y + 0.5);
            ctx.stroke();
          }

          if (globalCol !== 0) {
            // Left border
            ctx.beginPath();
            ctx.moveTo(x + 0.5, y + 0.5);
            ctx.lineTo(x + 0.5, y + this.rowHeight + 0.5);
            ctx.stroke();
          }
          // Right border
          ctx.beginPath();
          ctx.moveTo(x + this.columnWidth + 0.5, y + 0.5);
          ctx.lineTo(x + this.columnWidth + 0.5, y + this.rowHeight + 0.5);
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
              x + this.columnWidth / 2,
              y + this.rowHeight / 2
            );
          }
          // Col0 header labels (1, 2, 3...)
          if (globalCol === 0 && globalRow > 0) {
            ctx.fillText(
              globalRow.toString(),
              x + this.columnWidth / 2,
              y + this.rowHeight / 2
            );
          }
        } else if (globalRow === 1) {
          const dataColIndex = globalCol - 1; // col 0 = row number header
          ctx.strokeStyle = "rgba(33, 62, 64, 0.1)";
          ctx.strokeRect(x + 0.4, y + 0.4, this.columnWidth, this.rowHeight);

          if (columnNames[dataColIndex]) {
            ctx.fillStyle = "#000";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(
              String(columnNames[dataColIndex]).toUpperCase().slice(0, 8),
              x + 4,
              y + this.rowHeight / 2
            );
          }
        } else {
          // Regular cell
          ctx.strokeStyle = "rgba(33, 62, 64, 0.1)";
          ctx.strokeRect(x + 0.5, y + 0.5, this.columnWidth, this.rowHeight);

          const dataRowIndex = globalRow - 2; // row 0 = header, 1 = column names
          const dataColIndex = globalCol - 1; // col 0 = row number header

          if (this.data[dataRowIndex] && columnNames[dataColIndex]) {
            const cellValue =
              this.data[dataRowIndex][columnNames[dataColIndex]];
            // console.log(cellValue);
            if (cellValue !== undefined && cellValue !== null) {
              ctx.fillStyle = "#000";
              ctx.font = "14px Arial";
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";
              ctx.fillText(
                String(cellValue).slice(0, 8),
                x + 4,
                y + this.rowHeight / 2
              );
            }
          }
        }
      }
    }

    const key = `${xIndex}_${yIndex}`;
    this.canvases[key] = { canvas, ctx };
  }

  init() {
    // Initialize columns
    for (let i = 0; i < this.totalColumns; i++) {
      const header =
        i < this.headers.length ? this.headers[i] : `Column ${i + 1}`;

      this.columns.push(new Column(i, header, this.columnWidth));
    }

    // Initialize rows with empty cells

    for (let i = 0; i < this.totalRows; i++) {
      const row = new Row(i, this.rowHeight);

      for (let j = 0; j < this.totalColumns; j++) {
        row.addCell(new Cell(i, j, "", this.columnWidth, this.rowHeight));
      }

      this.rows.push(row);
    }

    // this.resizeCanvas();
  }

  loadData(data) {
    this.data = data;
    // Populate the grid with data

    for (let i = 0; i < Math.min(data.length, this.totalRows); i++) {
      const item = data[i];

      let columnCount = 0;

      for (let field in item) {
        this.setCellValue(i, columnCount, item[field]);
        columnCount++;
        this.headers.push(field);
      }
    }
    this.renderCanvases();
    // this.draw();
  }

  setCellValue(rowIndex, colIndex, value) {
    const cell = this.getCell(rowIndex, colIndex);

    if (cell) {
      cell.setValue(value);
    }
  }

  // resizeCanvas() {
  //   const width = this.columns.reduce((sum, col) => sum + col.width, 0);

  //   const height = this.rows.reduce((sum, row) => sum + row.height, 0);

  //   this.canvas.width = width;

  //   this.canvas.height = height;

  //   this.draw();
  // }

  getCell(rowIndex, colIndex) {
    if (
      rowIndex >= 0 &&
      rowIndex < this.rows.length &&
      colIndex >= 0 &&
      colIndex < this.columns.length
    ) {
      return this.rows[rowIndex].getCell(colIndex);
    }

    return null;
  }

  // draw() {
  //   this.drawLabel();
  //   this.drawCell();
  // }

  // drawCell() {
  //   const labelWidth = this.RowlabelWidth; // Width for row labels
  //   const labelHeight = this.rowHeight; // Height for column labels

  //   let y = labelHeight;
  //   for (let r = 0; r < this.rows.length; r++) {
  //     const row = this.rows[r];

  //     let x = labelWidth;
  //     for (let c = 0; c < this.columns.length; c++) {
  //       const col = this.columns[c];
  //       const cell = row.getCell(c);

  //       this.ctx.fillStyle = this.getCellBackgroundColor(cell);
  //       this.ctx.fillRect(x, y, col.width, row.height);

  //       this.ctx.strokeStyle = "#ddd";
  //       this.ctx.strokeRect(x + 0.5, y + 0.5, col.width, row.height);

  //       this.ctx.fillStyle = "#000";
  //       this.ctx.font = "12px Arial";
  //       this.ctx.textAlign = "left";
  //       this.ctx.textBaseline = "middle";
  //       const text = cell ? cell.getDisplayValue() : "";
  //       this.ctx.fillText(text, x + 5, y + row.height / 2, col.width - 10);

  //       x += col.width;
  //     }

  //     y += row.height;
  //   }
  // }

  // drawLabel() {
  //   const labelWidth = this.RowlabelWidth; // Width for row labels
  //   const labelHeight = this.rowHeight; // Height for column labels

  //   // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  //   this.ctx.fillStyle = "#e0e0e0";
  //   this.ctx.fillRect(0, 0, labelWidth, labelHeight);
  //   this.ctx.strokeStyle = "#ccc";
  //   this.ctx.strokeRect(0 + 0.5, 0 + 0.5, labelWidth, labelHeight);
  //   let x = labelWidth;
  //   for (let c = 0; c < this.columns.length; c++) {
  //     const col = this.columns[c];
  //     const label = Utils.colIndexToName(c);

  //     this.ctx.fillStyle = "#f0f0f0";
  //     this.ctx.fillRect(x, 0, col.width, labelHeight);

  //     this.ctx.strokeStyle = "#ccc";
  //     this.ctx.strokeRect(x + 0.5, 0 + 0.5, col.width, labelHeight);

  //     this.ctx.fillStyle = "#000";
  //     this.ctx.font = "bold 12px Arial";
  //     this.ctx.textAlign = "center";
  //     this.ctx.textBaseline = "middle";
  //     this.ctx.fillText(label, x + col.width / 2, labelHeight / 2);

  //     x += col.width;
  //   }

  //   //Column label
  //   let y = labelHeight;
  //   for (let r = 0; r < this.rows.length; r++) {
  //     const row = this.rows[r];
  //     const label = (r + 1).toString();

  //     this.ctx.fillStyle = "#f0f0f0";
  //     this.ctx.fillRect(0, y, labelWidth, row.height);

  //     this.ctx.strokeStyle = "#ccc";
  //     this.ctx.strokeRect(0 + 0.5, y + 0.5, labelWidth, row.height);

  //     this.ctx.fillStyle = "#000";
  //     this.ctx.font = "bold 12px Arial";
  //     this.ctx.textAlign = "center";
  //     this.ctx.textBaseline = "middle";
  //     this.ctx.fillText(label, labelWidth / 2, y + row.height / 2);

  //     y += row.height;
  //   }
  // }

  getCellBackgroundColor(cell) {
    if (this.selection.activeCell === cell) {
      return "#d4e6f7";
    } else if (this.selection.isCellSelected(cell)) {
      return "#e6f2ff";
    }

    return "#fff";
  }

  // executeCommand(command) {
  //   // Clear redo history if we're not at the end

  //   if (this.historyPointer < this.commandHistory.length - 1) {
  //     this.commandHistory = this.commandHistory.slice(
  //       0,
  //       this.historyPointer + 1
  //     );
  //   }

  //   command.execute();

  //   this.commandHistory.push(command);

  //   this.historyPointer++;

  //   this.draw();
  // }

  // undo() {
  //   if (this.historyPointer >= 0) {
  //     const command = this.commandHistory[this.historyPointer];

  //     command.undo();

  //     this.historyPointer--;

  //     this.draw();

  //     return true;
  //   }

  //   return false;
  // }

  // redo() {
  //   if (this.historyPointer < this.commandHistory.length - 1) {
  //     this.historyPointer++;

  //     const command = this.commandHistory[this.historyPointer];

  //     command.execute();

  //     this.draw();

  //     return true;
  //   }

  //   return false;
  // }

  calculateStats(selectedCells) {
    const numericValues = selectedCells

      .map((cell) => parseFloat(cell.value))

      .filter((val) => !isNaN(val));

    if (numericValues.length === 0) return null;

    return {
      count: numericValues.length,

      min: Math.min(...numericValues),

      max: Math.max(...numericValues),

      sum: numericValues.reduce((a, b) => a + b, 0),

      avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
    };
  }

  setupEventListeners() {
    // Mouse events for selection and resizing

    let isDragging = false;

    let dragStartX = 0;

    let dragStartY = 0;

    let resizeColumnIndex = -1;

    let resizeRowIndex = -1;

    let initialColumnWidth = 0;

    let initialRowHeight = 0;

    let isResizing = false;

    this.grid_container.addEventListener("mousedown", (e) => {
      const rect = this.virtual_class.getBoundingClientRect();

      console.log("--------------");
      console.log("react.left", rect.left);
      console.log("react.top", rect.top);
      console.log("e.clientX", e.clientX);
      console.log("e.clientY", e.clientY);
      console.log("this.scrollX", this.scrollX);
      console.log("this.scrollY", this.scrollY);

      const x = e.clientX - rect.left + this.scrollX - this.RowlabelWidth;

      const y = e.clientY - rect.top + this.scrollY - this.ColumnlabelHeight;

      // // Check for column resize

      // resizeColumnIndex = this.getColumnAtPosition(x);

      // if (resizeColumnIndex !== -1) {
      //   const col = this.columns[resizeColumnIndex];

      //   if (
      //     Math.abs(x - (this.getColumnX(resizeColumnIndex) + col.width)) < 5
      //   ) {
      //     isResizing = true;

      //     initialColumnWidth = col.width;

      //     return;
      //   }
      // }

      // // Check for row resize

      // resizeRowIndex = this.getRowAtPosition(y);

      // if (resizeRowIndex !== -1) {
      //   const row = this.rows[resizeRowIndex];

      //   if (Math.abs(y - (this.getRowY(resizeRowIndex) + row.height)) < 5) {
      //     isResizing = true;

      //     initialRowHeight = row.height;

      //     return;
      //   }
      // }

      // Handle cell selection

      const cell = this.getCellAtPosition(x, y);

      if (cell) {
        this.selection.clear();

        this.selection.selectCell(cell);

        // this.draw();
        this.createCanvas;

        // this.updateStatsDisplay();
      }

      dragStartX = x;

      dragStartY = y;

      isDragging = true;
    });

    this.grid_container.addEventListener("mousemove", (e) => {
      const rect = this.grid_container.getBoundingClientRect();

      const x = e.clientX - rect.left + this.scrollX;

      const y = e.clientY - rect.top + this.scrollY;

      if (isResizing) {
        if (resizeColumnIndex !== -1) {
          const newWidth = Math.max(30, initialColumnWidth + (x - dragStartX));

          this.columns[resizeColumnIndex].width = newWidth;

          this.resizeCanvas();
        } else if (resizeRowIndex !== -1) {
          const newHeight = Math.max(20, initialRowHeight + (y - dragStartY));

          this.rows[resizeRowIndex].height = newHeight;

          this.resizeCanvas();
        }
      } else if (isDragging) {
        const cell = this.getCellAtPosition(x, y);

        if (cell) {
          const startCell = this.getCellAtPosition(dragStartX, dragStartY);

          if (startCell) {
            const range = new CellRange(
              startCell.rowIndex,

              startCell.colIndex,

              cell.rowIndex,

              cell.colIndex
            );

            this.selection.clear();

            const cellsInRange = range.getCells(this);

            cellsInRange.forEach((c) => this.selection.selectCell(c));

            // this.draw();

            // this.updateStatsDisplay();
          }
        }
      } else {
        // Show resize cursor when near edge

        const colIndex = this.getColumnAtPosition(x);

        // if (colIndex !== -1) {
        //   const col = this.columns[colIndex];

        //   if (Math.abs(x - (this.getColumnX(colIndex) + col.width)) < 5) {
        //     this.canvas.style.cursor = "col-resize";

        //     return;
        //   }
        // }

        // const rowIndex = this.getRowAtPosition(y);

        // if (rowIndex !== -1) {
        //   const row = this.rows[rowIndex];

        //   if (Math.abs(y - (this.getRowY(rowIndex) + row.height)) < 5) {
        //     this.canvas.style.cursor = "row-resize";

        //     return;
        //   }
        // }

        // this.canvas.style.cursor = "default";
      }
    });

    this.grid_container.addEventListener("mouseup", () => {
      if (isResizing) {
        if (resizeColumnIndex !== -1) {
          const newWidth = this.columns[resizeColumnIndex].width;

          const command = new ResizeColumnCommand(
            this.columns[resizeColumnIndex],

            initialColumnWidth,

            newWidth
          );

          this.executeCommand(command);
        } else if (resizeRowIndex !== -1) {
          const newHeight = this.rows[resizeRowIndex].height;

          const command = new ResizeRowCommand(
            this.rows[resizeRowIndex],

            initialRowHeight,

            newHeight
          );

          this.executeCommand(command);
        }

        isResizing = false;

        resizeColumnIndex = -1;

        resizeRowIndex = -1;
      }

      isDragging = false;
    });

    // Double click for cell editing

    this.grid_container.addEventListener("dblclick", (e) => {
      if (isResizing) return;

      const rect = this.virtual_class.getBoundingClientRect();

      const x = e.clientX - rect.left + this.scrollX - this.RowlabelWidth;

      const y = e.clientY - rect.top + this.scrollY - this.ColumnlabelHeight;

      // console.log("Mouse Position (Client):", e.clientX, e.clientY);
      // console.log("Virtual Class Position (Rect):", rect.left, rect.top);
      // console.log("Calculated Coordinates (x, y):", x, y);

      const cell = this.getCellAtPosition(x, y);

      if (cell && this.selection.activeCell === cell) {
        this.editCell(cell);
      }
    });

    // Handle scroll events

    this.grid_container.addEventListener("scroll", (e) => {
      this.scrollX = e.target.scrollLeft;
      this.scrollY = e.target.scrollTop;
      this.renderCanvases();
      // console.log(this.scrollX, this.scrollY);
    });
  }

  editCell(cell) {
    const input = document.createElement("input");

    input.type = "text";

    input.value = cell.value;

    input.style.position = "absolute";

    input.style.left =
      this.getColumnX(cell.colIndex) + this.RowlabelWidth + "px";

    input.style.top =
      this.getRowY(cell.rowIndex) + this.ColumnlabelHeight + "px";

    input.style.width = cell.width + "px";

    input.style.height = cell.height + "px";

    input.style.border = "2px solid #137e43"; // initial border color

    input.style.padding = "0 5px";

    input.style.boxSizing = "border-box";
    input.style.backgroundColor = "white"; // background color of the input box
    input.style.fontFamily = "Arial, sans-serif"; // matching Excel font
    input.style.fontSize = "14px"; // adjust font size if necessary

    // Focus styles (for the Excel-like effect)
    input.style.outline = "none"; // remove default focus outline
    input.style.transition = "border 0.2s, box-shadow 0.2s"; // smooth transition effect

    const container = this.grid_container;

    container.appendChild(input);

    input.addEventListener("focus", () => {
      input.style.border = "2px solid #137e43"; // Excel focus border color
      input.style.boxShadow = "0 0 5pxrgb(15, 82, 45)"; // Matching soft glow
    });

    input.focus();

    const handleBlur = () => {
      const newValue = input.value;

      if (newValue !== cell.value) {
        const command = new EditCellCommand(cell, cell.value, newValue);

        this.executeCommand(command);

        // this.updateStatsDisplay();
      }

      container.removeChild(input);

      input.removeEventListener("blur", handleBlur);

      input.removeEventListener("keydown", handleKeyDown);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleBlur();
      } else if (e.key === "Escape") {
        container.removeChild(input);

        input.removeEventListener("blur", handleBlur);

        input.removeEventListener("keydown", handleKeyDown);
      }
    };

    input.addEventListener("blur", handleBlur);

    input.addEventListener("keydown", handleKeyDown);
  }

  getColumnAtPosition(x) {
    let currentX = 0;

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];

      if (x >= currentX && x <= currentX + col.width) {
        return i;
      }

      currentX += col.width;
    }

    return -1;
  }

  getRowAtPosition(y) {
    let currentY = 0;

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];

      if (y >= currentY && y <= currentY + row.height) {
        return i;
      }

      currentY += row.height;
    }

    return -1;
  }

  getCellAtPosition(x, y) {
    const colIndex = this.getColumnAtPosition(x);

    const rowIndex = this.getRowAtPosition(y);

    if (colIndex !== -1 && rowIndex !== -1) {
      return this.getCell(rowIndex, colIndex);
    }

    return null;
  }

  getColumnX(colIndex) {
    let x = 0;

    for (let i = 0; i < colIndex; i++) {
      x += this.columns[i].width;
    }

    return x;
  }

  getRowY(rowIndex) {
    let y = 0;

    for (let i = 0; i < rowIndex; i++) {
      y += this.rows[i].height;
    }

    return y;
  }

  updateStatsDisplay() {
    const selectedCells = Array.from(this.selection.selectedCells);

    const stats = this.calculateStats(selectedCells);

    const statsDisplay = document.getElementById("stats-display");

    if (stats) {
      statsDisplay.innerHTML = `

                Count: ${stats.count} | 

                Min: ${Utils.formatNumber(stats.min)} | 

                Max: ${Utils.formatNumber(stats.max)} | 

                Sum: ${Utils.formatNumber(stats.sum)} | 

                Avg: ${Utils.formatNumber(stats.avg.toFixed(2))}

            `;
    } else {
      statsDisplay.textContent = "";
    }
  }
}
