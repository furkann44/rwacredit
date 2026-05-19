const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Testing with:", deployer.address);

  const registry = await hre.ethers.getContractAt("RWARegistry", "0x72BBacef0E293d9287336B75ef769F5e14E1EF2C");
  const token = await hre.ethers.getContractAt("RWAToken", "0x36078c978FA7371E2347BC63AaE7a9cc4CDb9Fdc");
  const oracle = await hre.ethers.getContractAt("ValuationOracle", "0xe9713875521cCA580FE47790cc081e79Feda1FB2");
  const pool = await hre.ethers.getContractAt("CreditPool", "0x009B39ee02E99100aB3F761594615eE5e5E22ebe");

  const ISTANBUL = 33;

  // 1. Register asset
  const countBefore = await registry.getAssetCounter();
  console.log("\n1. Registering real estate (counter:", countBefore.toString(), ")...");
  const tx = await registry.registerRealEstate(ISTANBUL, "Kadikoy", "Caferaga", 1000, 1, 100, 0, 0, "Test data");
  await tx.wait();
  const countAfter = await registry.getAssetCounter();
  const assetId = countAfter;
  console.log("   Asset ID:", assetId.toString());

  // 2. Estimate value
  console.log("\n2. Estimating value...");
  let tx2 = await oracle.estimateValue(assetId, true, "Istanbul/Kadikoy", 100, 0);
  await tx2.wait();
  console.log("   Done");

  // 3. Check valuation
  const [value, valid] = await oracle.getAssetValuation(assetId);
  console.log("\n   Oracle value:", hre.ethers.formatEther(value), "ETH");
  console.log("   Valid:", valid);

  // 4. Mint NFT
  console.log("\n3. Minting NFT...");
  let tx3 = await token.mint(deployer.address, assetId, "ipfs://test");
  await tx3.wait();
  console.log("   NFT minted");

  // 5. Draw credit
  const amount = hre.ethers.parseEther("0.0125");
  console.log("\n4. Drawing", hre.ethers.formatEther(amount), "ETH...");
  let tx4 = await pool.drawCredit(assetId, amount);
  await tx4.wait();
  console.log("   ✅ Credit drawn!");

  // 5b. Check asset creditId
  const asset = await registry.getAsset(assetId);
  const creditIdFromAsset = Number(asset[6]);
  console.log("   Asset creditId:", creditIdFromAsset);

  // 6. Check balances
  const poolBal = await hre.ethers.provider.getBalance(pool.target);
  console.log("\n   Pool balance left:", hre.ethers.formatEther(poolBal), "ETH");
}

main().catch(console.error);
