export class Cell {
  constructor(rowIndex, colIndex, value = "", width = 100, height = 25) {
    this.rowIndex = rowIndex;

    this.colIndex = colIndex;

    this.value = value;

    this.width = width;

    this.height = height;

    this.formattedValue = this.formatValue(value);
  }

  formatValue(value) {
    // if (Utils.isNumeric(value)) {
    //   return Utils.formatNumber(value);
    // }

    return value;
  }

  setValue(newValue) {
    this.value = newValue;

    this.formattedValue = this.formatValue(newValue);
  }

  getDisplayValue() {
    return this.formattedValue || "";
  }
}
