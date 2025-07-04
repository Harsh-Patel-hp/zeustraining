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
    let autoScrollTimer = null;
    let lastMouseEvent = null;

    /**
     * Handles mouse down events on the grid.
     * @param {MouseEvent} e - The mouse down event.
     */
    this.grid.grid_container.addEventListener("mousedown", (e) => {
      const rect = this.grid.canvas.getBoundingClientRect();
      const x =
        e.clientX - rect.left + this.grid.scrollX - this.grid.RowlabelWidth;
      const y =
        e.clientY - rect.top + this.grid.scrollY - this.grid.ColumnlabelHeight;
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      const { offsetWidth, offsetHeight, clientWidth, clientHeight } =
        this.grid.grid_container;

      // Right scroll bar detection
      const scrollbarX = clientWidth < offsetWidth && e.offsetX > clientWidth;
      // Bottom scroll bar detection
      const scrollbarY =
        clientHeight < offsetHeight && e.offsetY > clientHeight;

      if (scrollbarX || scrollbarY) {
        // Click was on scroll bar, do nothing
        return;
      }

      // Handle column header clicks
      if (
        localY <= this.grid.ColumnlabelHeight + this.grid.toolBoxHeight &&
        localX >= this.grid.RowlabelWidth
      ) {
        let colIndex = this.grid.coordHelper.getColIndexFromX(x);

        // Column resize detection (unchanged)
        if (
          this.grid.isOverColumnResize(localX, localY, colIndex) &&
          e.button == 0
        ) {
          resizeColumnIndex = colIndex;
          isResizing = true;
          initialColumnWidth = this.grid.columns[colIndex].width;
          dragStartX = localX;
          return;
        }

        // Enhanced column selection with Ctrl support
        this.handleColumnSelection(colIndex, e.ctrlKey);
      } else if (
        localX <= this.grid.RowlabelWidth &&
        localY >= this.grid.ColumnlabelHeight + this.grid.toolBoxHeight
      ) {
        // Handle row header clicks
        let rowIndex = this.grid.coordHelper.getRowIndexFromY(y);

        // Row resize detection (unchanged)
        if (
          this.grid.isOverRowResize(localX, localY, rowIndex) &&
          e.button == 0
        ) {
          resizeRowIndex = rowIndex;
          isResizing = true;
          initialRowHeight = this.grid.rows[rowIndex].height;
          dragStartY = localY;
          return;
        }

        // NEW: Enhanced row selection with Ctrl support
        this.handleRowSelection(rowIndex, e.ctrlKey);
      } else {
        // Handle cell selection (unchanged for now)
        const cell = this.grid.coordHelper.getCellAtPosition(x, y);
        if (cell) {
          if (!e.ctrlKey) {
            this.grid.cellrange.clearRange();
            this.grid.selection.clear();
          }
          this.grid.selection.setActiveCell(cell);
          this.grid.renderer.redrawVisible();
          this.grid.stats.updateAllDisplays(false);
        }
      }

      isDragging = true;
      dragStartX = x;
      dragStartY = y;

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    });

    /**
     * Handles mouse move events on the grid.
     * @param {MouseEvent} e - The mouse event object.
     */
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
        updateDragSelection(e.clientX, e.clientY, e.ctrlKey);
      } else {
        // Update cursor based on hover position
        this.grid.updateCursor(localX, localY);
      }
    });

    /**
     * Handles mouse up events
     */
    this.grid.grid_container.addEventListener("mouseup", () => {
      // Clear drag selection markers
      this.grid.dragStartColumn = null;
      this.grid.dragStartRow = null;
      this.grid.lastDragRowRange = { start: null, end: null };
      this.grid.lastDragColRange = { start: null, end: null };

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
      if (isDragging) {
        // Update displays after drag ends - show active cell only
        this.grid.stats.updateAllDisplays(false);
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

    document.addEventListener("keyup", (e) => {
      if (e.key === "Shift") {
        this.grid.stats.updateAllDisplays(false);
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.grid.scrollManager.setupCanvas();
      this.grid.renderer.redrawVisible();
    });

    const mouseMoveHandler = (e) => {
      lastMouseEvent = e;
      // Check if auto-scroll is needed
      const rect = this.grid.grid_container.getBoundingClientRect();
      const edgeSize = 20; // px from edge to trigger scroll
      let scrollX = 0,
        scrollY = 0;

      if (e.clientX < rect.left + edgeSize) scrollX = -10;
      else if (e.clientX > rect.right - edgeSize) scrollX = 10;

      if (e.clientY < rect.top + edgeSize) scrollY = -10;
      else if (e.clientY > rect.bottom - edgeSize) scrollY = 10;

      if (scrollX !== 0 || scrollY !== 0) {
        if (!autoScrollTimer) startAutoScroll();
      } else {
        stopAutoScroll();
      }
    };

    const mouseUpHandler = (e) => {
      isDragging = false;
      stopAutoScroll();
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    /**
     * Starts the auto-scroll timer
     */
    const startAutoScroll = () => {
      if (autoScrollTimer) return;
      autoScrollTimer = setInterval(() => {
        if (!lastMouseEvent) return;

        const rect = this.grid.grid_container.getBoundingClientRect();
        let dx = 0,
          dy = 0;

        if (lastMouseEvent.clientX < rect.left + 20) dx = -10;
        else if (lastMouseEvent.clientX > rect.right - 20) dx = 10;

        if (lastMouseEvent.clientY < rect.top + 20) dy = -10;
        else if (lastMouseEvent.clientY > rect.bottom - 20) dy = 10;

        this.grid.grid_container.scrollLeft += dx;
        this.grid.grid_container.scrollTop += dy;
        updateDragSelection(
          lastMouseEvent.clientX,
          lastMouseEvent.clientY,
          lastMouseEvent.ctrlKey
        );
      }, 16);
    };

    /**
     * Stops the auto-scroll timer
     */
    const stopAutoScroll = () => {
      if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
        autoScrollTimer = null;
      }
    };

    /**
     * Updates the drag selection by re-calculating the row and column indices based
     * on the mouse position and scroll position of the grid container.
     * @param {number} clientX - The x-coordinate of the mouse in client space.
     * @param {number} clientY - The y-coordinate of the mouse in client space.
     * @param {boolean} ctrlKey - Whether the control key is pressed.
     */
    const updateDragSelection = (clientX, clientY, ctrlKey) => {
      const rect = this.grid.canvas.getBoundingClientRect();
      const x = Math.max(
        0,
        clientX - rect.left + this.grid.scrollX - this.grid.RowlabelWidth
      );
      const y = Math.max(
        0,
        clientY - rect.top + this.grid.scrollY - this.grid.ColumnlabelHeight
      );

      if (
        this.grid.dragStartColumn !== null &&
        this.grid.dragStartColumn !== undefined
      ) {
        const currentColIndex = this.grid.coordHelper.getColIndexFromX(x);
        if (currentColIndex !== -1) {
          const startCol = Math.min(this.grid.dragStartColumn, currentColIndex);
          const endCol = Math.max(this.grid.dragStartColumn, currentColIndex);
          // Only proceed if selection range changed
          const last = this.grid.lastDragColRange;
          if (last.start !== startCol || last.end !== endCol) {
            // Update last drag range
            this.grid.lastDragColRange = { start: startCol, end: endCol };
            if (!ctrlKey) {
              this.grid.selection.clear();
            }
            // this.grid.selection.clear();
            for (let i = startCol; i <= endCol; i++) {
              this.grid.selection.selectColumn(i);
            }

            this.grid.selection.setActiveCell(
              this.grid.rows[0].cells[this.grid.dragStartColumn]
            );

            this.grid.renderer.redrawVisible();
            this.grid.stats.updateAllDisplays(true);
          }
        }
      }

      // Handle row drag selection
      else if (
        this.grid.dragStartRow !== null &&
        this.grid.dragStartRow !== undefined
      ) {
        const currentRowIndex = this.grid.coordHelper.getRowIndexFromY(y);
        if (currentRowIndex !== -1) {
          const startRow = Math.min(this.grid.dragStartRow, currentRowIndex);
          const endRow = Math.max(this.grid.dragStartRow, currentRowIndex);

          // Only proceed if selection range changed
          const last = this.grid.lastDragRowRange;
          if (last.start !== startRow || last.end !== endRow) {
            // Update last drag range
            this.grid.lastDragRowRange = { start: startRow, end: endRow };

            if (!ctrlKey) {
              this.grid.selection.clear();
            }
            // this.grid.selection.clear();
            for (let i = startRow; i <= endRow; i++) {
              this.grid.selection.selectRow(i);
            }

            this.grid.selection.setActiveCell(
              this.grid.rows[this.grid.dragStartRow].cells[0]
            );
            this.grid.renderer.redrawVisible();
            this.grid.stats.updateAllDisplays(true);
          }
        }
      } else {
        const cell = this.grid.coordHelper.getCellAtPosition(x, y);
        const startCell = this.grid.coordHelper.getCellAtPosition(
          dragStartX,
          dragStartY
        );

        // Only proceed if both cells exist and are different
        if (
          cell &&
          startCell &&
          (cell.rowIndex !== startCell.rowIndex ||
            cell.colIndex !== startCell.colIndex)
        ) {
          // Create range
          this.grid.cellrange = new CellRange(
            startCell.rowIndex,
            startCell.colIndex,
            cell.rowIndex,
            cell.colIndex
          );

          this.grid.selection.clear();
          this.grid.selection.setActiveCell(startCell);
          this.grid.renderer.redrawVisible();
          this.grid.stats.updateAllDisplays(true);
        }
      }
    };
  }

  /**
   * Handle column selection with multi-select support
   * @param {number} colIndex - Column index to select
   * @param {boolean} isCtrlHeld - Whether Ctrl key is held
   */
  handleColumnSelection(colIndex, isCtrlHeld) {
    this.grid.selection.wasCtrlUsed = isCtrlHeld;
    // Store initial column for drag selection
    this.grid.dragStartColumn = colIndex;
    this.grid.dragStartRow = null; // Clear any row drag
    if (isCtrlHeld) {
      // Toggle column selection
      if (this.grid.selection.isColumnSelected(colIndex)) {
        this.grid.selection.deselectColumn(colIndex);
        if (this.grid.selection.selectedColumns.size > 0) {
          let slectedcolumnarray = Array.from(
            this.grid.selection.selectedColumns
          );
          this.grid.selection.setActiveCell(
            this.grid.rows[0].cells[
              slectedcolumnarray[slectedcolumnarray.length - 1]
            ]
          );
        }
      } else {
        this.grid.selection.selectColumn(colIndex);
        this.grid.selection.setActiveCell(this.grid.rows[0].cells[colIndex]);
      }
    } else {
      // Single column selection - clear others first
      this.grid.selection.clear();
      this.grid.cellrange.clearRange();
      this.grid.selection.selectColumn(colIndex);
      this.grid.selection.setActiveCell(this.grid.rows[0].cells[colIndex]);
    }

    this.grid.renderer.redrawVisible();
    this.grid.stats.updateAllDisplays(false);
  }

  /**
   * Handle row selection with multi-select support
   * @param {number} rowIndex - Row index to select
   * @param {boolean} isCtrlHeld - Whether Ctrl key is held
   */
  handleRowSelection(rowIndex, isCtrlHeld) {
    this.grid.selection.wasCtrlUsed = isCtrlHeld;
    // Store initial row for drag selection
    this.grid.dragStartRow = rowIndex;
    this.grid.dragStartColumn = null; // Clear any column drag
    if (isCtrlHeld) {
      // Toggle row selection
      if (this.grid.selection.isRowSelected(rowIndex)) {
        this.grid.selection.deselectRow(rowIndex);

        if (this.grid.selection.selectedRows.size > 0) {
          let slectedrowarray = Array.from(this.grid.selection.selectedRows);
          this.grid.selection.setActiveCell(
            this.grid.rows[slectedrowarray[slectedrowarray.length - 1]].cells[0]
          );
        }
      } else {
        this.grid.selection.selectRow(rowIndex);
        this.grid.selection.setActiveCell(this.grid.rows[rowIndex].cells[0]);
      }
    } else {
      // Single row selection - clear others first
      this.grid.selection.clear();
      this.grid.cellrange.clearRange();
      this.grid.selection.selectRow(rowIndex);
      this.grid.selection.setActiveCell(this.grid.rows[rowIndex].cells[0]);
    }

    this.grid.renderer.redrawVisible();
    this.grid.stats.updateAllDisplays(false);
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

    input.addEventListener("input", () => {
      // Clear previous references
      this.grid.selection.clearFormulaReferences();

      // console.log(input.value);
      if (input.value.startsWith("=")) {
        const regex = /\b([a-zA-Z]+)(\d+)\b/g;
        let match;

        while ((match = regex.exec(input.value)) !== null) {
          const colLetters = match[1].toUpperCase(); // e.g., "AB"
          const rowNumber = parseInt(match[2], 10); // e.g., "12" -> 12

          // Convert column letters to index (A=0, B=1, ..., Z=25, AA=26, etc.)
          let colIndex = 0;
          for (let i = 0; i < colLetters.length; i++) {
            colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 65 + 1);
          }
          colIndex -= 1; // Make it 0-based
          const rowIndex = rowNumber - 1; // Also 0-based

          let cell = this.grid.getCell(rowIndex, colIndex);
          this.grid.selection.setFormulaReferences(cell);
        }
      }
      this.grid.stats.syncFormulaBarWithInput(input);
      this.grid.renderer.redrawVisible();
    });

    /**
     * Handle blur and keydown events
     */
    const handleBlur = () => {
      const newValue = input.value;
      if (newValue !== cell.value) {
        const command = new EditCellCommand(cell, cell.value, newValue);
        this.grid.executeCommand(command);
        // Update displays after cell edit
        this.grid.stats.updateAllDisplays(false);
      }
      input.removeEventListener("blur", handleBlur);
      input.removeEventListener("keydown", handleKeyDown);
      container.removeChild(input);
      this.grid.selection.clearFormulaReferences();
      this.grid.renderer.redrawVisible();
    };

    /**
     * Handle keydown event
     * @param {KeyboardEvent} e
     */
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
