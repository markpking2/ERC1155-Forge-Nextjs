import("@nomicfoundation/hardhat-toolbox");
import { ethers } from "hardhat";

async function main() {
  const TokenFactory = await ethers.getContractFactory("ForgeToken");
  const ForgeToken = await TokenFactory.deploy();
  await ForgeToken.deployed();

  const ForgeFactory = await ethers.getContractFactory("Forge");
  const Forge = await ForgeFactory.deploy(ForgeToken.address);
  await Forge.deployed();

  await ForgeToken.setForgeAddress(Forge.address);

  console.log("ForgeToken.sol", ForgeToken.address);
  console.log("Forge.sol", Forge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
