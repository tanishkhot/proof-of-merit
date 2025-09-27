import hre from "hardhat";

async function main() {
  const contractAddress = "0x09aB660CEac220678b42E0e23DebCb1475e1eAD5";
  
  console.log("Checking contract state at:", contractAddress);
  
  try {
    // Get the contract instance using ethers
    const [deployer] = await hre.ethers.getSigners();
    const skillVerification = await hre.ethers.getContractAt("SkillVerification", contractAddress, deployer);
    
    // Check owner
    const owner = await skillVerification.owner();
    console.log("Contract owner:", owner);
    
    // Check available skills
    const skills = await skillVerification.getAllSkills();
    console.log("Available skills:", skills);
    
    // Check predefined stake amount
    const stakeAmount = await skillVerification.getPredefinedStakeAmount();
    console.log("Predefined stake amount:", hre.ethers.formatEther(stakeAmount), "ETH");
    
    // Check resolver
    const resolver = await skillVerification.resolver();
    console.log("Resolver address:", resolver);
    
    console.log("Contract state check completed successfully!");
    
  } catch (error) {
    console.error("Error checking contract state:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});