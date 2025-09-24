import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk";

let fhevmInstance: any = null;

export const getFhevmInstance = async () => {
  if (!fhevmInstance) {
    const config = {
      ...SepoliaConfig,
      network: window.ethereum,
    };
    fhevmInstance = await createInstance(config);
  }
  return fhevmInstance;
};

export const CONTRACT_ADDRESS = "0x"; // Replace with actual deployed contract address
