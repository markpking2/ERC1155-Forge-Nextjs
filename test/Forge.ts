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
    it("reverts if attempting to forge more than 2 or 3 tokens", async () => {
      const { ForgeToken, Forge, addr1 } = await loadFixture(deployFixture);

      await ForgeToken.connect(addr1)["mint(uint256)"](0);

      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(1);

      await expect(Forge.connect(addr1).forge([0])).to.be.revertedWith(
        "2 or 3 tokens can be forged at a time"
      );
    });

    it("reverts if token ids are not unique", async () => {
      const { ForgeToken, Forge, addr1 } = await loadFixture(deployFixture);
      await ForgeToken["mint(address,uint256,uint256)"](addr1.address, 1, 10);

      await expect(Forge.connect(addr1).forge([1, 1])).to.be.revertedWith(
        "token ids must be unique"
      );
    });

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

      const tx = await Forge.connect(addr1).forge([0, 2]);
      await tx.wait();

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
    it("reverts if _forId > 2", async () => {
      const { ForgeToken, Forge, addr1, owner } = await loadFixture(
        deployFixture
      );

      await ForgeToken["mint(address,uint256,uint256)"](addr1.address, 3, 1);
      expect(await ForgeToken.balanceOf(addr1.address, 3)).to.equal(1);

      await expect(Forge.connect(addr1).trade(0, 3)).to.be.revertedWith(
        "can only trade for tokens 0, 1  and 2"
      );
    });

    it("reverts is trading token for same token id", async () => {
      const { ForgeToken, Forge, addr1, owner } = await loadFixture(
        deployFixture
      );

      await ForgeToken["mint(address,uint256,uint256)"](addr1.address, 0, 1);
      expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(1);

      await expect(Forge.connect(addr1).trade(0, 0)).to.be.revertedWith(
        "cannot trade for the same token"
      );
    });

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

  describe("Other", function () {
    it("should invoke the fallback function", async () => {
      const { Forge, owner } = await loadFixture(deployFixture);
      const tx = await owner.sendTransaction({
        to: Forge.address,
        data: "0x1234",
        value: ethers.utils.parseEther("1.0"),
      });
      await tx.wait();
    });
  });

  describe("supportsInterface", function () {
    it("tests supportsInterface", async () => {
      const { Forge } = await loadFixture(deployFixture);
      // interface id generated from pasting IERC1155Receiver ABI to https://interfaceid.lucasgrasso.com.ar/
      expect(await Forge.supportsInterface("0x4fdcdb47")).to.not.be.reverted;
    });
  });

  describe("on received", function () {
    it("tests onERC1155Received", async () => {
      const { ForgeToken, Forge, owner } = await loadFixture(deployFixture);

      expect(
        await Forge.onERC1155Received(
          ForgeToken.address,
          owner.address,
          1,
          1,
          "0x"
        )
      ).to.not.be.reverted;
    });

    it("tests onERC1155BatchReceived", async () => {
      const { ForgeToken, Forge, owner } = await loadFixture(deployFixture);

      expect(
        await Forge.onERC1155BatchReceived(
          ForgeToken.address,
          owner.address,
          [0, 1, 2, 3, 4, 5, 6],
          [1, 1, 1, 1, 1, 1, 1],
          "0x"
        )
      ).to.not.be.reverted;
    });
  });
});
