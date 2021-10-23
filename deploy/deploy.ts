// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import dotenv from "dotenv";
import * as fs from "fs-extra";
import path from "path";
import * as envfile from "envfile";

dotenv.config();
import hre from "hardhat";
import { Contract } from "@ethersproject/contracts";
const { BigNumber, utils } = hre.ethers;

// Env files
const backendPath = path.resolve(".env");
const frontendPath = path.resolve("frontend", ".env");

interface DeploymentInfo {
  name: string;
  envKey: string;
  args: any[];
  instance: Contract;
  callback?: Function;
}

class ContractsForDeployment {
  contracts: {
    wrappedEth?: DeploymentInfo;
  };
  constructor() {
    this.contracts = {};
  }

  async initialize(): Promise<ContractsForDeployment> {
    this.contracts.wrappedEth = await (async (): Promise<DeploymentInfo> => {
      const name = "wrappedEth";
      const envKey = "WRAPPED_ETH_ADDRESS";
      const args = [] as any[];
      const instance = await this.deploy(name, args);
      console.log(`${name} deployed at: ${(await instance).address}`);
      return { name, envKey, args, instance };
    })();

    return this;
  }

  async deploy(contractName: string, args: any[]): Promise<Contract> {
    const factory = await hre.ethers.getContractFactory(contractName);
    const contract = await factory.deploy(...args);
    await contract.deployed();
    return contract;
  }

  async updateEnv() {
    const backendItem = envfile.parse(backendPath);
    const frontEndItem = envfile.parse(frontendPath);
    const promises = Object.values(this.contracts).map(async item => {
      const address = (await item.instance).address ?? "";
      if (address.length) {
        frontEndItem[`REACT_APP_${item.envKey}`] = address;
        backendItem[item.envKey] = address;
      }
    });
    await Promise.all(promises);
    await Promise.all([
      fs.writeFile(backendPath, envfile.stringify(backendItem)),
      fs.writeFile(frontendPath, envfile.stringify(frontEndItem)),
    ]);
  }
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy all the contracts
  await (await new ContractsForDeployment().initialize()).updateEnv();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
