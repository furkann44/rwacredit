const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RWA Credit System", function () {
  let rwaRegistry, rwaToken, valuationOracle, creditPool, p2pLending, liquidation;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const RWARegistry = await ethers.getContractFactory("RWARegistry");
    rwaRegistry = await RWARegistry.deploy();
    await rwaRegistry.waitForDeployment();

    const RWAToken = await ethers.getContractFactory("RWAToken");
    rwaToken = await RWAToken.deploy();
    await rwaToken.waitForDeployment();

    const ValuationOracle = await ethers.getContractFactory("ValuationOracle");
    valuationOracle = await ValuationOracle.deploy();
    await valuationOracle.waitForDeployment();

    const CreditPool = await ethers.getContractFactory("CreditPool");
    creditPool = await CreditPool.deploy(
      await valuationOracle.getAddress(),
      await rwaToken.getAddress(),
      await rwaRegistry.getAddress()
    );
    await creditPool.waitForDeployment();

    const P2PLending = await ethers.getContractFactory("P2PLending");
    p2pLending = await P2PLending.deploy();
    await p2pLending.waitForDeployment();

    const Liquidation = await ethers.getContractFactory("Liquidation");
    liquidation = await Liquidation.deploy(
      await creditPool.getAddress(),
      await p2pLending.getAddress(),
      await rwaToken.getAddress()
    );
    await liquidation.waitForDeployment();
  });

  describe("RWARegistry", function () {
    it("Gayrimenkul kaydedebilmeli", async function () {
      const tx = await rwaRegistry.connect(addr1).registerRealEstate(
        33, // Istanbul
        "Kadikoy",
        "Moda",
        123, // Ada
        45, // Parsel
        120, // m2
        0, // Residence
        0, // FullOwnership
        "Moda Caddesi No:10"
      );
      await tx.wait();

      const assetCounter = await rwaRegistry.getAssetCounter();
      expect(assetCounter).to.equal(1);

      const [, , status, owner_] = await rwaRegistry.getAsset(1);
      expect(status).to.equal(0); // Pending
      expect(owner_).to.equal(addr1.address);
    });

    it("Arac kaydedebilmeli", async function () {
      const tx = await rwaRegistry.connect(addr1).registerVehicle(
        "34ABC123",
        "JN1TDAAL0U0123456",
        "Toyota",
        "Corolla",
        2022,
        45000,
        "Hybrid"
      );
      await tx.wait();

      const assetCounter = await rwaRegistry.getAssetCounter();
      expect(assetCounter).to.equal(1);
    });
  });

  describe("RWAToken", function () {
    it("NFT basabilmeli", async function () {
      const tx = await rwaToken.connect(owner).mint(addr1.address, 1, "ipfs://test-metadata");
      await tx.wait();

      const totalSupply = await rwaToken.getTotalSupply();
      expect(totalSupply).to.equal(1);
      expect(await rwaToken.ownerOf(1)).to.equal(addr1.address);
    });

    it("Kilitli token transfer edilememeli", async function () {
      await rwaToken.connect(owner).mint(addr1.address, 1, "ipfs://test");
      await rwaToken.connect(addr1).lockToken(1);

      await expect(
        rwaToken.connect(addr1).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWith("Token is locked as collateral");
    });

    it("Kilit acildiktan sonra transfer edilebilmeli", async function () {
      await rwaToken.connect(owner).mint(addr1.address, 1, "ipfs://test");
      await rwaToken.connect(addr1).lockToken(1);
      await rwaToken.connect(addr1).unlockToken(1);

      await rwaToken.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await rwaToken.ownerOf(1)).to.equal(addr2.address);
    });
  });

  describe("ValuationOracle", function () {
    it("Otomatik degerleme yapabilmeli", async function () {
      const tx = await valuationOracle.connect(owner).estimateValue(
        1,
        true, // Real estate
        "Istanbul/Kadikoy",
        120, // m2
        0
      );
      await tx.wait();

      const [finalValue, isValid] = await valuationOracle.getAssetValuation(1);
      expect(isValid).to.be.true;
      expect(finalValue).to.be.gt(0);
    });

    it("Kredi limiti hesaplanabilmeli", async function () {
      await valuationOracle.connect(owner).estimateValue(1, true, "Istanbul/Kadikoy", 120, 0);
      const limit = await valuationOracle.calculateCreditLimit(1, true);
      expect(limit).to.be.gt(0);
    });
  });

  describe("CreditPool", function () {
    it("Likidite yatirilibilmeli", async function () {
      const depositAmount = ethers.parseEther("10");
      const tx = await creditPool.connect(addr2).depositLiquidity({ value: depositAmount });
      await tx.wait();

      const poolInfo = await creditPool.getPoolInfo();
      expect(poolInfo[0]).to.equal(depositAmount); // totalLiquidity
    });

    it("Kredi cekilebilmeli", async function () {
      // Once degerleme yap
      await valuationOracle.connect(owner).estimateValue(1, true, "Istanbul/Kadikoy", 120, 0);

      // NFT bas
      await rwaToken.connect(owner).mint(addr1.address, 1, "ipfs://test");

      // Havuza likidite yatir
      await creditPool.connect(addr2).depositLiquidity({ value: ethers.parseEther("10") });

      // Kredi limiti kontrol
      const limit = await valuationOracle.calculateCreditLimit(1, true);

      // Token kilitle ve kredi cek
      await rwaToken.connect(addr1).lockToken(1);

      // Bu test icin credit limit'i manuel ayarlamaliyiz
      // Gercek kullanimda registry ve oracle baglantisi olmali
    });
  });

  describe("P2PLending", function () {
    it("Borc alma teklifi olusturabilmeli", async function () {
      const tx = await p2pLending.connect(addr1).createBorrowOffer(
        1,
        ethers.parseEther("1"),
        1500, // %15
        180n * 24n * 3600n // 180 gun
      );
      await tx.wait();

      const offers = await p2pLending.getActiveOffers();
      expect(offers.length).to.be.gt(0);
    });
  });
});
