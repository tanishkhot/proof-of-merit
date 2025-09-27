import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const SkillVerification = await hre.ethers.getContractFactory("SkillVerification");
  const skillVerification = await SkillVerification.deploy();

  await skillVerification.waitForDeployment();

  const address = await skillVerification.getAddress();
  console.log("SkillVerification deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});