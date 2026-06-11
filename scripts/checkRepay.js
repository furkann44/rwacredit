const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", signer.address);

  const poolAddr = "0x009B39ee02E99100aB3F761594615eE5e5E22ebe";
  const pool = await hre.ethers.getContractAt("CreditPool", poolAddr);

  const bal = await hre.ethers.provider.getBalance(poolAddr);
  const totalLiq = await pool.totalLiquidity();
  const totalBorr = await pool.totalBorrowed();
  console.log(`Pool balance: ${hre.ethers.formatEther(bal)}`);
  console.log(`totalLiquidity: ${hre.ethers.formatEther(totalLiq)}`);
  console.log(`totalBorrowed: ${hre.ethers.formatEther(totalBorr)}`);
  console.log(`Available: ${hre.ethers.formatEther(totalLiq - totalBorr)}`);

  const myLiq = await pool.liquidityProviders(signer.address);
  console.log(`My liquidity: ${hre.ethers.formatEther(myLiq)}`);

  // Check credits
  const credits = await pool.getUserCredits(signer.address);
  console.log("\nCredits:", credits);

  for (const cid of credits) {
    const c = await pool.getCredit(cid);
    console.log(`\nCredit ${cid}:`);
    console.log(`  Asset ID: ${c[2]}`);
    console.log(`  Principal: ${hre.ethers.formatEther(c[3])}`);
    console.log(`  Interest: ${hre.ethers.formatEther(c[4])}`);
    console.log(`  Total Repayment: ${hre.ethers.formatEther(c[5])}`);
    console.log(`  Amount Repaid: ${hre.ethers.formatEther(c[6])}`);
    console.log(`  Status: ${c[9]}`);

    const remaining = c[5] - c[6];
    console.log(`  Remaining: ${hre.ethers.formatEther(remaining)}`);

    if (remaining > 0n && c[9] == 0n) { // Active = 0
      console.log(`  Repaying ${hre.ethers.formatEther(remaining)} ETH...`);
      const tx = await pool.repayCredit(cid, { value: remaining });
      await tx.wait();
      console.log("  ✅ Repaid!");
    }
  }

  // Check again after repay
  const bal2 = await hre.ethers.provider.getBalance(poolAddr);
  const totalLiq2 = await pool.totalLiquidity();
  const totalBorr2 = await pool.totalBorrowed();
  console.log(`\n--- After repay ---`);
  console.log(`Pool balance: ${hre.ethers.formatEther(bal2)}`);
  console.log(`totalLiquidity: ${hre.ethers.formatEther(totalLiq2)}`);
  console.log(`totalBorrowed: ${hre.ethers.formatEther(totalBorr2)}`);
  console.log(`Available: ${hre.ethers.formatEther(totalLiq2 - totalBorr2)}`);

  const myLiq2 = await pool.liquidityProviders(signer.address);
  console.log(`My liquidity: ${hre.ethers.formatEther(myLiq2)}`);

  if (myLiq2 > 0n) {
    const avail = totalLiq2 - totalBorr2;
    const withdrawAmt = myLiq2 < avail ? myLiq2 : avail;
    if (withdrawAmt > 0n) {
      console.log(`\nWithdrawing ${hre.ethers.formatEther(withdrawAmt)} ETH...`);
      const tx = await pool.withdrawLiquidity(withdrawAmt);
      await tx.wait();
      console.log("✅ Withdrawn!");
    }
  }

  const finalBal = await hre.ethers.provider.getBalance(poolAddr);
  console.log(`\nFinal pool balance: ${hre.ethers.formatEther(finalBal)} ETH`);
}

main().catch(console.error);
