const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const oracleAddr = "0xB1508Cd5b61a6DC00e06bB7DAf145eE88f70b796";

  const oracle = new hre.ethers.Contract(oracleAddr, [
    "function paused() view returns (bool)",
    "function authorizedValuators(address) view returns (bool)",
    "function submitManualValuation(uint256,uint256,string) returns (uint256)",
    "function getAssetValuation(uint256) view returns (uint256, bool)",
    "function assetValuations(uint256) view returns (uint256)",
  ], signer);

  const paused = await oracle.paused();
  console.log("Contract paused:", paused);

  const isAuthorized = await oracle.authorizedValuators(signer.address);
  console.log("Is authorized:", isAuthorized);

  // Try a direct call
  console.log("\nTrying submitManualValuation(999, 1000000000000000000, 'test')...");
  try {
    const tx = await oracle.submitManualValuation(999, ethers.parseEther("1"), "test");
    console.log("Tx sent:", tx.hash);
    await tx.wait();
    console.log("Confirmed!");

    // Check if it was saved
    const vid = await oracle.assetValuations(999);
    console.log("Valuation ID:", vid.toString());
    if (vid > 0n) {
      const val = await oracle.getAssetValuation(999);
      console.log("Value:", hre.ethers.formatEther(val[0]), "Valid:", val[1]);
    }
  } catch(e) {
    console.log("Error:", e.message);
    console.log("Reason:", e.reason || e.info?.error?.message || "N/A");
  }
}

main().catch(console.error);
