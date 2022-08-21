import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import("@nomicfoundation/hardhat-chai-matchers");
import { ethers } from "hardhat";

describe("Forge contract", function () {
  async function deployFixture(autoSetAddress = true) {
    const TokenFactory = await ethers.getContractFactory("ForgeToken");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const ForgeToken = await TokenFactory.deploy();
    await ForgeToken.deployed();

    const ForgeFactory = await ethers.getContractFactory("Forge");
    const Forge = await ForgeFactory.deploy(ForgeToken.address);
    await Forge.deployed();

    if (autoSetAddress) {
      await ForgeToken.setForgeAddress(Forge.address);
    }

    return {
      owner,
      addr1,
      addr2,
      ForgeToken,
      Forge,
    };
  }

  describe("forging", function () {
    it("it mints token 3 for burning tokens 0 and 1", async () => {
      const { ForgeToken, Forge, addr1 } = await loadFixture(deployFixture);

      await ForgeToken.connect(addr1)["mint(uint256)"](0);
      await ForgeToken.connect(addr1)["mint(uint256)"](1);

      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 3)).to.equal(0);

      await Forge.connect(addr1).forge([0, 1]);

      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 3)).to.equal(1);
    });

    it("it mints token 4 for burning tokens 1 and 2", async () => {
      const { ForgeToken, Forge, addr1 } = await loadFixture(deployFixture);

      await ForgeToken.connect(addr1)["mint(uint256)"](1);
      await ForgeToken.connect(addr1)["mint(uint256)"](2);

      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 4)).to.equal(0);

      await Forge.connect(addr1).forge([1, 2]);

      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 4)).to.equal(1);
    });

    it("it mints token 5 for burning tokens 0 and 2", async () => {
      const { ForgeToken, Forge, addr1 } = await loadFixture(deployFixture);

      await ForgeToken.connect(addr1)["mint(uint256)"](0);
      await ForgeToken.connect(addr1)["mint(uint256)"](2);

      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 5)).to.equal(0);

      await Forge.connect(addr1).forge([0, 2]);

      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 5)).to.equal(1);
    });

    it("it mints token 6 for burning tokens 0, 1, and 2", async () => {
      const { ForgeToken, Forge, addr1 } = await loadFixture(deployFixture);

      await ForgeToken.connect(addr1)["mint(uint256)"](0);
      await ForgeToken.connect(addr1)["mint(uint256)"](1);
      await ForgeToken.connect(addr1)["mint(uint256)"](2);

      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 6)).to.equal(0);

      await Forge.connect(addr1).forge([0, 1, 2]);

      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 6)).to.equal(1);
    });

    it("it burns tokens if invalid combination", async () => {
      const { ForgeToken, Forge, addr1, owner } = await loadFixture(
        deployFixture
      );

      await ForgeToken.connect(owner)["mint(address,uint256,uint256)"](
        addr1.address,
        1,
        1
      );
      await ForgeToken.connect(owner)["mint(address,uint256,uint256)"](
        addr1.address,
        2,
        1
      );
      await ForgeToken.connect(owner)["mint(address,uint256,uint256)"](
        addr1.address,
        6,
        1
      );

      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(1);
      expect(await ForgeToken.balanceOf(addr1.address, 6)).to.equal(1);

      await Forge.connect(addr1).forge([1, 2, 6]);

      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 3)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 4)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 5)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 6)).to.equal(0);
    });
  });

  describe("trade", function () {
    it("user can trade token 6 for token 1", async () => {
      const { ForgeToken, Forge, addr1, owner } = await loadFixture(
        deployFixture
      );

      await ForgeToken.connect(addr1)["mint(uint256)"](0);
      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(1);

      await Forge.connect(addr1).trade(0, 2);

      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(0);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(1);
    });
  });
});
