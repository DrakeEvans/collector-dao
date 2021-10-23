import { CollectorDao__factory, WrappedEth__factory } from "../types";

export default class EnumContracts {
  static wrappedEth = {
    factory: WrappedEth__factory,
    envKey: "REACT_APP_WRAPPED_ETH_ADDRESS",
  };
  static collectorDao = {
    factory: CollectorDao__factory,
    envKey: "REACT_APP_COLLECTOR_DAO_ADDRESS",
  };
}
