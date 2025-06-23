export class Cell {
  constructor(rowIndex, colIndex, value = "", width = 100, height = 25) {
    this.rowIndex = rowIndex;

    this.colIndex = colIndex;

    this.value = value;

    this.width = width;

    this.height = height;
  }

  setValue(newValue) {
    this.value = newValue;
  }

  getDisplayValue() {
    return this.value || "";
  }
}
