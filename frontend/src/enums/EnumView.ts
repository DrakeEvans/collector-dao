export default class EnumView {
  static wrappedEth = "Wrapped Ether";
  static collectorDao = "Collector DAO";
  static getKey = value => Object.entries(EnumView).find(([key, val]) => value === val)?.[0];
}
