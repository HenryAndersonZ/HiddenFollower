import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFHECounter = await deploy("FHECounter", {
    from: deployer,
    log: true,
  });

  const deployedHiddenFollower = await deploy("HiddenFollower", {
    from: deployer,
    log: true,
  });

  console.log(`FHECounter contract: `, deployedFHECounter.address);
  console.log(`HiddenFollower contract: `, deployedHiddenFollower.address);
};
export default func;
func.id = "deploy_contracts";
func.tags = ["FHECounter", "HiddenFollower"];
