import { Selection } from "./Selection.js";
import { Column } from "./Column.js";
import { Row } from "./Row.js";
import { Cell } from "./Cell.js";
import { EditCellCommand } from "./commands/EditCellCommand.js";
import { Utils } from "./utils.js";
import { CellRange } from "./CellRange.js";
export class Grid {
  constructor(canvas, columns = 500, rows = 100000) {
    this.canvas = canvas;

    this.ctx = canvas.getContext("2d");

    this.totalColumns = columns;

    this.totalRows = rows;

    this.visibleColumns = 30;

    this.visibleRows = 50;

    this.rowHeight = 25;
    this.zoomFactor = this.zoomLevel || 1;

    this.RowlabelWidth = 25;

    this.ColumnlabelHeight = 25;

    this.columnWidth = 100;

    this.scrollX = 0;

    this.scrollY = 0;

    this.startColumn = 0;
    this.endColumn = 20;
    this.startRow = 0;
    this.endRow = 0;
    this.bufferRow = 5;
    this.bufferColumn = 5;
    this.userScreenWidth = window.innerWidth;
    this.userScreenHeight = window.innerHeight;

    this.columns = [];

    this.rows = [];

    this.selection = new Selection();

    this.commandHistory = [];

    this.historyPointer = -1;

    this.data = [];

    this.headers = [];
    this.grid_container = document.getElementById("grid_container") || "";
    this.virtual_class = document.getElementById("virtual_class") || "";

    this.init();

    this.setupEventListeners();
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

    this.resizeCanvas();
  }

  getvisibleColumnCount() {
    let startColIndex = this.endColumn;
    this.endColumn = this.startColumn + this.bufferColumn;
    let visibleColumnswidth = 0;
    while (visibleColumnswidth <= this.userScreenWidth) {
      visibleColumnswidth += this.columns[this.endColumn].width;
      this.endColumn++;
    }
    this.startColumn = startColIndex;
  }

  getvisibleRowCount() {
    let startRowIndex = this.endRow;
    this.endRow = this.startRow + this.bufferRow;
    let visibleRowsHeight = 0;
    while (visibleRowsHeight <= this.userScreenHeight) {
      visibleRowsHeight += this.rows[this.endRow].height;
      this.endRow++;
    }
    this.startRow = startRowIndex;
  }

  createCanvas() {

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

    this.draw();
  }

  setCellValue(rowIndex, colIndex, value) {
    const cell = this.getCell(rowIndex, colIndex);

    if (cell) {
      cell.setValue(value);
    }
  }

  resizeCanvas() {
    const width = this.columns.reduce((sum, col) => sum + col.width, 0);

    const height = this.rows.reduce((sum, row) => sum + row.height, 0);

    this.canvas.width = width;

    this.canvas.height = height;

    this.draw();
  }

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

  draw() {
    this.drawLabel();
    this.drawCell();
  }

  drawCell() {
    const labelWidth = this.RowlabelWidth; // Width for row labels
    const labelHeight = this.rowHeight; // Height for column labels

    let y = labelHeight;
    for (let r = 0; r < this.rows.length; r++) {
      const row = this.rows[r];

      let x = labelWidth;
      for (let c = 0; c < this.columns.length; c++) {
        const col = this.columns[c];
        const cell = row.getCell(c);

        this.ctx.fillStyle = this.getCellBackgroundColor(cell);
        this.ctx.fillRect(x, y, col.width, row.height);

        this.ctx.strokeStyle = "#ddd";
        this.ctx.strokeRect(x + 0.5, y + 0.5, col.width, row.height);

        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        const text = cell ? cell.getDisplayValue() : "";
        this.ctx.fillText(text, x + 5, y + row.height / 2, col.width - 10);

        x += col.width;
      }

      y += row.height;
    }
  }

  drawLabel() {
    const labelWidth = this.RowlabelWidth; // Width for row labels
    const labelHeight = this.rowHeight; // Height for column labels

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#e0e0e0";
    this.ctx.fillRect(0, 0, labelWidth, labelHeight);
    this.ctx.strokeStyle = "#ccc";
    this.ctx.strokeRect(0 + 0.5, 0 + 0.5, labelWidth, labelHeight);
    let x = labelWidth;
    for (let c = 0; c < this.columns.length; c++) {
      const col = this.columns[c];
      const label = Utils.colIndexToName(c);

      this.ctx.fillStyle = "#f0f0f0";
      this.ctx.fillRect(x, 0, col.width, labelHeight);

      this.ctx.strokeStyle = "#ccc";
      this.ctx.strokeRect(x + 0.5, 0 + 0.5, col.width, labelHeight);

      this.ctx.fillStyle = "#000";
      this.ctx.font = "bold 12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(label, x + col.width / 2, labelHeight / 2);

      x += col.width;
    }

    //Column label
    let y = labelHeight;
    for (let r = 0; r < this.rows.length; r++) {
      const row = this.rows[r];
      const label = (r + 1).toString();

      this.ctx.fillStyle = "#f0f0f0";
      this.ctx.fillRect(0, y, labelWidth, row.height);

      this.ctx.strokeStyle = "#ccc";
      this.ctx.strokeRect(0 + 0.5, y + 0.5, labelWidth, row.height);

      this.ctx.fillStyle = "#000";
      this.ctx.font = "bold 12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(label, labelWidth / 2, y + row.height / 2);

      y += row.height;
    }
  }

  getCellBackgroundColor(cell) {
    if (this.selection.activeCell === cell) {
      return "#d4e6f7";
    } else if (this.selection.isCellSelected(cell)) {
      return "#e6f2ff";
    }

    return "#fff";
  }

  executeCommand(command) {
    // Clear redo history if we're not at the end

    if (this.historyPointer < this.commandHistory.length - 1) {
      this.commandHistory = this.commandHistory.slice(
        0,
        this.historyPointer + 1
      );
    }

    command.execute();

    this.commandHistory.push(command);

    this.historyPointer++;

    this.draw();
  }

  undo() {
    if (this.historyPointer >= 0) {
      const command = this.commandHistory[this.historyPointer];

      command.undo();

      this.historyPointer--;

      this.draw();

      return true;
    }

    return false;
  }

  redo() {
    if (this.historyPointer < this.commandHistory.length - 1) {
      this.historyPointer++;

      const command = this.commandHistory[this.historyPointer];

      command.execute();

      this.draw();

      return true;
    }

    return false;
  }

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

      // console.log("--------------");
      // console.log("react.left", rect.left);
      // console.log("react.top", rect.top);
      // console.log("e.clientX", e.clientX);
      // console.log("e.clientY", e.clientY);
      // console.log("this.scrollX", this.scrollX);
      // console.log("this.scrollY", this.scrollY);

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

        this.draw();

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

            this.draw();

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

        this.canvas.style.cursor = "default";
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
      console.log(this.scrollX, this.scrollY);
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

    const container = this.canvas.parentElement;

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
