const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Depositing from:", deployer.address);

  const creditPoolAddress = "0x009B39ee02E99100aB3F761594615eE5e5E22ebe";
  const CreditPool = await hre.ethers.getContractAt("CreditPool", creditPoolAddress);

  // Deposit 0.1 ETH to pool
  const tx = await CreditPool.connect(deployer).depositLiquidity({ value: hre.ethers.parseEther("0.1") });
  await tx.wait();
  console.log("Deposited 0.1 ETH to CreditPool");
}

main().catch(console.error);
