const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", signer.address);

  const newPoolAddr = "0x055D957692017097D24EB6fA0aEceEfBC5094944";
  const pool = new hre.ethers.Contract(newPoolAddr, [
    "function totalLiquidity() view returns (uint256)",
    "function totalBorrowed() view returns (uint256)",
    "function liquidityProviders(address) view returns (uint256)",
    "function withdrawLiquidity(uint256) external",
    "function getBalance() view returns (uint256)",
  ], signer);

  const bal = await hre.ethers.provider.getBalance(newPoolAddr);
  console.log("Pool balance:", hre.ethers.formatEther(bal));

  const totalLiq = await pool.totalLiquidity();
  console.log("totalLiquidity:", hre.ethers.formatEther(totalLiq));

  const myLiq = await pool.liquidityProviders(signer.address);
  console.log("My liquidity:", hre.ethers.formatEther(myLiq));

  if (myLiq > 0n) {
    console.log("\nWithdrawing 1 ETH...");
    const tx = await pool.withdrawLiquidity(myLiq);
    await tx.wait();
    console.log("Withdrawn!");
  }

  const finalBal = await hre.ethers.provider.getBalance(newPoolAddr);
  console.log("Final pool balance:", hre.ethers.formatEther(finalBal));
}

main().catch(console.error);
