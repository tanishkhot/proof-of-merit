import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SkillVerificationModule", (m) => {
  const skillVerification = m.contract("SkillVerification");

  return { skillVerification };
});
