import { CellRange } from "./CellRange.js";
import { EditCellCommand } from "./commands/EditCellCommand.js";
import { ResizeColumnCommand } from "./commands/ResizeColumnCommand.js";
import { ResizeRowCommand } from "./commands/ResizeRowCommand.js";

export class GridEventHandler {
  /**
   * Constructor for GridEventHandler class.
   * @param {Grid} grid - The Grid object this event handler is attached to.
   */
  constructor(grid) {
    /** @type {Grid} The Grid object this event handler is attached to. */
    this.grid = grid;
  }

  /**
   * Sets up event listeners for the grid.
   */
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

    this.grid.grid_container.addEventListener("mousedown", (e) => {
      const rect = this.grid.canvas.getBoundingClientRect();
      const x =
        e.clientX - rect.left + this.grid.scrollX - this.grid.RowlabelWidth;
      const y =
        e.clientY - rect.top + this.grid.scrollY - this.grid.ColumnlabelHeight;
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      // Clear any existing selection
      this.grid.cellrange.clearRange();
      this.grid.selection.clear();

      //handle column header clicks
      if (
        localY <= this.grid.ColumnlabelHeight + this.grid.toolBoxHeight &&
        localX >= this.grid.RowlabelWidth
      ) {
        //column selection or resize
        let colIndex = this.grid.coordHelper.getColIndexFromX(x);

        // column resize detection
        if (this.grid.isOverColumnResize(localX, localY, colIndex)) {
          resizeColumnIndex = colIndex;
          isResizing = true;
          initialColumnWidth = this.grid.columns[colIndex].width;
          dragStartX = localX;
          return; // Skip selection logic
        }

        // Store initial column for drag selection
        this.grid.dragStartColumn = colIndex;
        this.grid.dragStartRow = null; // Clear any row drag


        // Column selection logic
        // this.grid.cellrange.clearRange();
        // this.grid.selection.clear();
        this.grid.cellrange = new CellRange(
          0,
          colIndex,
          this.grid.totalRows - 1,
          colIndex
        );
        this.grid.selection.selectColumn(colIndex);
        this.grid.selection.setActiveCell(this.grid.rows[0].cells[colIndex]);
        this.grid.renderer.redrawVisible();
      } else if (
        localX <= this.grid.RowlabelWidth &&
        localY >= this.grid.ColumnlabelHeight + this.grid.toolBoxHeight
      ) {
        // row selection or resize
        let rowIndex = this.grid.coordHelper.getRowIndexFromY(y);

        // row resize detection
        if (this.grid.isOverRowResize(localX, localY, rowIndex)) {
          resizeRowIndex = rowIndex;
          isResizing = true;
          initialRowHeight = this.grid.rows[rowIndex].height;
          dragStartY = localY;
          return; // Skip selection logic
        }

        // Row selection logic
        this.grid.cellrange.clearRange();
        this.grid.selection.clear();
        this.grid.cellrange = new CellRange(
          rowIndex,
          0,
          rowIndex,
          this.grid.totalColumns - 1
        );

        // Store initial row for drag selection
        this.grid.dragStartRow = rowIndex;
        this.grid.dragStartColumn = null; // Clear any column drag
        this.grid.selection.selectRow(rowIndex);
        this.grid.selection.setActiveCell(this.grid.rows[rowIndex].cells[0]);
        this.grid.renderer.redrawVisible();
      } else {
        // Handle cell selection
        const cell = this.grid.coordHelper.getCellAtPosition(x, y);
        if (cell) {
          this.grid.cellrange.clearRange();
          this.grid.selection.setActiveCell(cell);
          this.grid.renderer.redrawVisible();
        }
      }

      dragStartY = y;
      dragStartX = x;
      isDragging = true;
    });

    this.grid.grid_container.addEventListener("mousemove", (e) => {
      const rect = this.grid.canvas.getBoundingClientRect();
      const x = Math.max(
        0,
        e.clientX - rect.left + this.grid.scrollX - this.grid.RowlabelWidth
      );
      const y = Math.max(
        0,
        e.clientY - rect.top + this.grid.scrollY - this.grid.ColumnlabelHeight
      );
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (isResizing) {
        // Enhanced resize logic with command pattern
        if (resizeColumnIndex !== -1) {
          const newWidth = Math.max(
            30,
            initialColumnWidth + (localX - dragStartX)
          );
          this.grid.columns[resizeColumnIndex].width = newWidth;
          // Update virtual class dimensions when resizing
          this.grid.scrollManager.updateVirtualClassDimensions();
          this.grid.renderer.redrawVisible();
        } else if (resizeRowIndex !== -1) {
          const newHeight = Math.max(
            20,
            initialRowHeight + (localY - dragStartY)
          );
          this.grid.rows[resizeRowIndex].height = newHeight;
          // Update virtual class dimensions when resizing
          this.grid.scrollManager.updateVirtualClassDimensions();
          this.grid.renderer.redrawVisible();
        }
      } else if (isDragging) {

        if (this.grid.dragStartColumn !== null && this.grid.dragStartColumn !== undefined) {
          const currentColIndex = this.grid.coordHelper.getColIndexFromX(x);
          if (currentColIndex !== -1) {
            const startCol = Math.min(this.grid.dragStartColumn, currentColIndex);
            const endCol = Math.max(this.grid.dragStartColumn, currentColIndex);

            this.grid.cellrange = new CellRange(0, startCol, this.grid.totalRows - 1, endCol);
            this.grid.selection.selectColumn(currentColIndex);
            this.grid.selection.setActiveCell(this.grid.rows[0].cells[this.grid.dragStartColumn]);
            this.grid.renderer.redrawVisible();
          }
        }
        // Handle row drag selection
        else if (this.grid.dragStartRow !== null && this.grid.dragStartRow !== undefined) {
          const currentRowIndex = this.grid.coordHelper.getRowIndexFromY(y);
          if (currentRowIndex !== -1) {
            const startRow = Math.min(this.grid.dragStartRow, currentRowIndex);
            const endRow = Math.max(this.grid.dragStartRow, currentRowIndex);

            this.grid.cellrange = new CellRange(startRow, 0, endRow, this.grid.totalColumns - 1);
            this.grid.selection.selectRow(currentRowIndex);
            this.grid.selection.setActiveCell(this.grid.rows[this.grid.dragStartRow].cells[0]);
            this.grid.renderer.redrawVisible();

          }
        }
        else {
          const cell = this.grid.coordHelper.getCellAtPosition(x, y);
          // Auto-scroll to keep the new cell visible
          if (cell) {
            this.grid.scrollManager.scrollToCell(cell.rowIndex, cell.colIndex);
            const startCell = this.grid.coordHelper.getCellAtPosition(
              dragStartX,
              dragStartY
            );
            if (startCell) {
              this.grid.cellrange = new CellRange(
                startCell.rowIndex,
                startCell.colIndex,
                cell.rowIndex,
                cell.colIndex
              );
              this.grid.selection.clear();
              this.grid.selection.setActiveCell(startCell);
              this.grid.renderer.redrawVisible();
            }
          }
        }
      } else {
        // Update cursor based on hover position
        this.grid.updateCursor(localX, localY);
      }
    });

    this.grid.grid_container.addEventListener("mouseup", () => {
      // Clear drag selection markers
      this.grid.dragStartColumn = null;
      this.grid.dragStartRow = null;
      // Enhanced resize completion with command pattern
      if (isResizing) {
        if (resizeColumnIndex !== -1) {
          const newWidth = this.grid.columns[resizeColumnIndex].width;
          if (newWidth !== initialColumnWidth) {
            // Create and execute resize command for undo/redo functionality
            const command = new ResizeColumnCommand(
              this.grid.columns[resizeColumnIndex],
              initialColumnWidth,
              newWidth
            );
            this.grid.executeCommand(command);
          }
          resizeColumnIndex = -1;
        } else if (resizeRowIndex !== -1) {
          const newHeight = this.grid.rows[resizeRowIndex].height;
          if (newHeight !== initialRowHeight) {
            // Create and execute resize command for undo/redo functionality
            const command = new ResizeRowCommand(
              this.grid.rows[resizeRowIndex],
              initialRowHeight,
              newHeight
            );
            this.grid.executeCommand(command);
          }
          resizeRowIndex = -1;
        }
        isResizing = false;
        // Update virtual class dimensions after resize is complete
        this.grid.scrollManager.updateVirtualClassDimensions();
      }
      isDragging = false;
    });

    // Double click for cell editing
    this.grid.grid_container.addEventListener("dblclick", (e) => {
      if (isResizing) return;
      const rect = this.grid.canvas.getBoundingClientRect();
      const x =
        e.clientX - rect.left + this.grid.scrollX - this.grid.RowlabelWidth;
      const y =
        e.clientY - rect.top + this.grid.scrollY - this.grid.ColumnlabelHeight;

      const cell = this.grid.coordHelper.getCellAtPosition(x, y);
      if (cell && this.grid.selection.activeCell === cell) {
        this.editCell(cell);
      }
    });

    // Handle scroll events - this is the key for virtual scrolling
    this.grid.grid_container.addEventListener("scroll", (e) => {
      this.grid.scrollX = this.grid.grid_container.scrollLeft;
      this.grid.scrollY = this.grid.grid_container.scrollTop;
      this.grid.renderer.redrawVisible();
    });

    document.addEventListener("keydown", (e) => {
      // Only handle keyboard navigation if the grid container or canvas has focus
      // or if no input elements are currently focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable);

      // Only handle navigation if no input is focused
      if (!isInputFocused) {
        this.grid.navigation.handleKeyboardNavigation(e);
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.grid.scrollManager.setupCanvas();
      this.grid.renderer.redrawVisible();
    });
  }

  /**
   * Edit the cell's value
   * @param {Cell} cell - the cell to edit
   */
  editCell(cell) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = cell.value;
    input.style.position = "absolute";

    // Calculate position relative to viewport
    const cellX =
      this.grid.coordHelper.getColumnX(cell.colIndex) + this.grid.RowlabelWidth;
    const cellY =
      this.grid.coordHelper.getRowY(cell.rowIndex) +
      this.grid.ColumnlabelHeight;

    input.style.left = cellX + "px";
    input.style.top = cellY + "px";
    input.style.width = this.grid.columns[cell.colIndex].width + "px";
    input.style.height = this.grid.rows[cell.rowIndex].height + "px";
    input.style.border = "2px solid #137e43";
    input.style.padding = "0 5px";
    input.style.boxSizing = "border-box";
    input.style.backgroundColor = "white";
    input.style.fontFamily = "Arial, sans-serif";
    input.style.fontSize = "12px";
    input.style.outline = "none";
    input.style.transition = "border 0.2s, box-shadow 0.2s";

    const container = this.grid.canvas.parentElement;
    container.appendChild(input);

    input.addEventListener("focus", () => {
      input.style.border = "2px solid #137e43";
      input.style.boxShadow = "0 0 5px rgb(15, 82, 45)";
    });

    input.focus();

    const handleBlur = () => {
      const newValue = input.value;
      if (newValue !== cell.value) {
        const command = new EditCellCommand(cell, cell.value, newValue);
        this.grid.executeCommand(command);
      }
      input.removeEventListener("blur", handleBlur);
      input.removeEventListener("keydown", handleKeyDown);
      container.removeChild(input);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleBlur();
      } else if (e.key === "Escape") {
        input.removeEventListener("blur", handleBlur);
        input.removeEventListener("keydown", handleKeyDown);
        container.removeChild(input);
      }
    };

    input.addEventListener("blur", handleBlur);
    input.addEventListener("keydown", handleKeyDown);
  }
}
