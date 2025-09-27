import hre from "hardhat";

async function main() {
  const skillVerification = await hre.viem.deployContract("SkillVerification");

  console.log(
    `SkillVerification deployed to: ${skillVerification.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});