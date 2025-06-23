export class Utils {
  static isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  static deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
