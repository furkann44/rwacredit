const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Old CreditPool addresses that may have test ETH
  const oldPools = [
    { addr: "0x7c5f23b26b83863b64Ef0048Ee6c37e8af5f8dC0", label: "Pool #1 (first deploy)" },
    { addr: "0x31964014DF996ccE0dF0a01E3a2F5e13d2C63a49", label: "Pool #2 (second deploy)" },
  ];

  for (const pool of oldPools) {
    const bal = await hre.ethers.provider.getBalance(pool.addr);
    const poolContract = await hre.ethers.getContractAt("CreditPool", pool.addr);
    const totalLiq = await poolContract.totalLiquidity();

    console.log(`\n${pool.label}:`);
    console.log(`  Address: ${pool.addr}`);
    console.log(`  Balance: ${hre.ethers.formatEther(bal)} ETH`);
    console.log(`  totalLiquidity: ${hre.ethers.formatEther(totalLiq)} ETH`);

    if (bal > 0n) {
      console.log(`  Withdrawing ${hre.ethers.formatEther(bal)} ETH...`);
      try {
        const tx = await poolContract.connect(deployer).withdrawLiquidity(bal);
        await tx.wait();
        console.log("  ✅ Withdrawn!");
      } catch(e) {
        console.log("  Error:", e.message);
        // Try direct transfer via owner
        try {
          console.log("  Trying ownerWithdraw...");
          const owner = await poolContract.owner();
          console.log("  Pool owner:", owner);
          // Send ETH directly if deployer is owner
          if (owner.toLowerCase() === deployer.address.toLowerCase()) {
            const tx2 = await deployer.sendTransaction({
              to: deployer.address,
              value: bal,
            });
            await tx2.wait();
            console.log("  ✅ ETH transferred via owner");
          }
        } catch(e2) {
          console.log("  Owner withdraw also failed:", e2.message);
        }
      }
    }
  }

  // Also check the current pool (in case there's leftover)
  const currentPool = "0x009B39ee02E99100aB3F761594615eE5e5E22ebe";
  const currentBal = await hre.ethers.provider.getBalance(currentPool);
  const currentContract = await hre.ethers.getContractAt("CreditPool", currentPool);
  const currentLiq = await currentContract.totalLiquidity();

  console.log(`\nCurrent Pool (${currentPool}):`);
  console.log(`  Balance: ${hre.ethers.formatEther(currentBal)} ETH`);
  console.log(`  totalLiquidity: ${hre.ethers.formatEther(currentLiq)} ETH`);

  if (currentLiq > 0n) {
    const available = currentBal; // contract balance = available funds
    console.log(`  Withdrawing ${hre.ethers.formatEther(available)} ETH (available liquidity)...`);
    const tx = await currentContract.connect(deployer).withdrawLiquidity(available);
    await tx.wait();
    console.log("  ✅ Withdrawn!");
  }
}

main().catch(console.error);
