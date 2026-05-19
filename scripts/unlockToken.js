const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const token = await hre.ethers.getContractAt("RWAToken", "0xd2e987050717Da047A960991f16D5A4fE5685739");
  const tx = await token.unlockTokenByAuthority(2);
  await tx.wait();
  console.log("Token 2 unlocked");
  const locked = await token.isLocked(2);
  console.log("isLocked(2):", locked);
}

main().catch(console.error);
