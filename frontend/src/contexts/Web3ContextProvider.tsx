import { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

interface Props {
  children: any;
}

export const Web3ProviderContext = React.createContext({
  web3Provider: null,
  setWeb3Provider: (web3Provider: Web3Provider) => {},
  connectToWeb3Provider: () => {},
});

export function Web3ProviderContextProvider(props: Props) {
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | null>(null);

  async function connectToWeb3Provider() {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    setWeb3Provider(provider);
  }

  useEffect(() => {
    try {
      if ((window as any).ethereum.on) {
        (window as any).ethereum.on("accountsChanged", () => {
          connectToWeb3Provider();
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    try {
      if ((window as any).ethereum.on) {
        (window as any).ethereum.on("chainChanged", () => {
          connectToWeb3Provider();
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <Web3ProviderContext.Provider value={{ web3Provider, setWeb3Provider, connectToWeb3Provider }}>
      {props.children}
    </Web3ProviderContext.Provider>
  );
}
