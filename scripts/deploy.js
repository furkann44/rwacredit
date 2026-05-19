const hre = require("hardhat");

async function main() {
  console.log("Deploying RWA Credit System...");

  const RWARegistry = await hre.ethers.getContractFactory("RWARegistry");
  const rwaRegistry = await RWARegistry.deploy();
  await rwaRegistry.waitForDeployment();
  console.log("RWARegistry deployed to:", await rwaRegistry.getAddress());

  const RWAToken = await hre.ethers.getContractFactory("RWAToken");
  const rwaToken = await RWAToken.deploy();
  await rwaToken.waitForDeployment();
  console.log("RWAToken deployed to:", await rwaToken.getAddress());

  const ValuationOracle = await hre.ethers.getContractFactory("ValuationOracle");
  const valuationOracle = await ValuationOracle.deploy();
  await valuationOracle.waitForDeployment();
  console.log("ValuationOracle deployed to:", await valuationOracle.getAddress());

  const CreditPool = await hre.ethers.getContractFactory("CreditPool");
  const creditPool = await CreditPool.deploy(
    await valuationOracle.getAddress(),
    await rwaToken.getAddress(),
    await rwaRegistry.getAddress()
  );
  await creditPool.waitForDeployment();
  console.log("CreditPool deployed to:", await creditPool.getAddress());

  const P2PLending = await hre.ethers.getContractFactory("P2PLending");
  const p2pLending = await P2PLending.deploy();
  await p2pLending.waitForDeployment();
  console.log("P2PLending deployed to:", await p2pLending.getAddress());

  const Liquidation = await hre.ethers.getContractFactory("Liquidation");
  const liquidation = await Liquidation.deploy(
    await creditPool.getAddress(),
    await p2pLending.getAddress(),
    await rwaToken.getAddress()
  );
  await liquidation.waitForDeployment();
  console.log("Liquidation deployed to:", await liquidation.getAddress());

  await rwaToken.setRegistry(await rwaRegistry.getAddress());
  console.log("RWAToken registry set to:", await rwaRegistry.getAddress());

  await creditPool.setContractAddresses(
    await valuationOracle.getAddress(),
    await rwaToken.getAddress(),
    await rwaRegistry.getAddress()
  );

  await liquidation.setContractAddresses(
    await creditPool.getAddress(),
    await p2pLending.getAddress(),
    await rwaToken.getAddress()
  );

  console.log("\nAll contracts deployed and linked successfully!");
  console.log("\nSave these addresses for frontend configuration:");
  console.log(JSON.stringify({
    RWARegistry: await rwaRegistry.getAddress(),
    RWAToken: await rwaToken.getAddress(),
    ValuationOracle: await valuationOracle.getAddress(),
    CreditPool: await creditPool.getAddress(),
    P2PLending: await p2pLending.getAddress(),
    Liquidation: await liquidation.getAddress(),
  }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
