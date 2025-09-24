import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Hidden Follower",
  projectId: "YOUR_PROJECT_ID", // Replace with your WalletConnect project ID
  chains: [sepolia],
  ssr: false,
});
