import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import("@nomicfoundation/hardhat-chai-matchers");
import { ethers, network } from "hardhat";

describe("ForgeToken contract", function () {
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

  async function dfNoAddress() {
    return await deployFixture(false);
  }

  it("cannot set forge address if not owner", async () => {
    const { ForgeToken, Forge, addr1 } = await loadFixture(dfNoAddress);
    await expect(
      ForgeToken.connect(addr1).setForgeAddress(Forge.address)
    ).to.be.revertedWith("not owner");
  });

  it("sets forge address", async () => {
    const { ForgeToken, Forge } = await loadFixture(dfNoAddress);
    await ForgeToken.setForgeAddress(Forge.address);
    expect(await ForgeToken.forgeAddress()).to.equal(Forge.address);
  });

  describe("burn", function () {
    it("individual can burn a token", async () => {
      const { ForgeToken, owner, addr1 } = await loadFixture(deployFixture);

      await ForgeToken["mint(address,uint256,uint256)"](addr1.address, 1, 1);
      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(1);

      expect(await ForgeToken.connect(addr1)["burn(uint256,uint256)"](1, 1)).to
        .not.be.reverted;

      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(0);
    });

    it("cant burn from anyone if not forge contract", async () => {
      const { ForgeToken, owner, addr1 } = await loadFixture(deployFixture);

      await ForgeToken["mint(address,uint256,uint256)"](addr1.address, 1, 1);
      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(1);

      await expect(
        ForgeToken.connect(addr1)["burn(address,uint256,uint256)"](
          owner.address,
          1,
          1
        )
      ).to.be.revertedWith("not forge contract");
    });

    it("cant burn batch if not forge contract", async () => {
      const { ForgeToken, owner, addr1 } = await loadFixture(deployFixture);

      await ForgeToken["mint(address,uint256,uint256)"](addr1.address, 1, 1);
      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(1);
      await ForgeToken["mint(address,uint256,uint256)"](addr1.address, 2, 1);
      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(1);

      await expect(
        ForgeToken.connect(addr1).burnBatch(owner.address, [1, 2], [1, 1])
      ).to.be.revertedWith("not forge contract");
    });
  });

  describe("minting", function () {
    it("can't mint to anyone if not owner or forge contract", async () => {
      const { ForgeToken, addr1 } = await loadFixture(deployFixture);

      await expect(
        ForgeToken.connect(addr1)["mint(address,uint256,uint256)"](
          addr1.address,
          1,
          100
        )
      ).to.be.revertedWith("cannot mint");
    });

    it("anyone can't mint ids > 2 ", async () => {
      const { ForgeToken, addr1 } = await loadFixture(deployFixture);

      await expect(
        ForgeToken.connect(addr1)["mint(uint256)"](3)
      ).to.be.revertedWith("can only mint tokens 0 - 2");
    });

    it("can mint to anyone if forge contract", async () => {
      const { ForgeToken, Forge, addr1 } = await loadFixture(deployFixture);

      await addr1.sendTransaction({
        to: Forge.address,
        value: ethers.utils.parseEther("1"),
      });

      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [Forge.address],
      });

      const signer = await ethers.getSigner(Forge.address);

      await ForgeToken.connect(signer)["mint(address,uint256,uint256)"](
        addr1.address,
        1,
        100
      );

      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(100);

      await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [Forge.address],
      });
    });

    it("can mint to anyone if owner", async () => {
      const { ForgeToken, owner, addr1 } = await loadFixture(deployFixture);

      await ForgeToken.connect(owner)["mint(address,uint256,uint256)"](
        addr1.address,
        1,
        100
      );

      expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(100);
    });

    it("can't mint tokens > 6", async () => {
      const { ForgeToken, owner, addr1 } = await loadFixture(deployFixture);

      await expect(
        ForgeToken.connect(owner)["mint(address,uint256,uint256)"](
          addr1.address,
          7,
          100
        )
      ).to.be.revertedWith("only mint tokens 0 to 6");
    });

    it("anyone can mint with tokens 0 - 2", async () => {
      const { ForgeToken, addr1 } = await loadFixture(deployFixture);

      await ForgeToken.connect(addr1)["mint(uint256)"](2);

      expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(1);
    });

    it("tokens 0 - 2 each have a 1 min cooldown", async () => {
      const { ForgeToken, addr1 } = await loadFixture(deployFixture);

      await ForgeToken.connect(addr1)["mint(uint256)"](0);
      await ForgeToken.connect(addr1)["mint(uint256)"](1);
      await ForgeToken.connect(addr1)["mint(uint256)"](2);

      await expect(
        ForgeToken.connect(addr1)["mint(uint256)"](2)
      ).to.be.revertedWith("tokens 0 - 2 each have a 1 min mint cooldown");
    });
  });

  it("can mint to anyone if owner", async () => {
    const { ForgeToken, owner, addr1 } = await loadFixture(deployFixture);

    await ForgeToken.connect(owner)["mint(address,uint256,uint256)"](
      addr1.address,
      1,
      100
    );

    expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(100);
  });

  it("forge contract can burn tokens", async () => {
    const { ForgeToken, Forge, addr1 } = await loadFixture(deployFixture);

    await addr1.sendTransaction({
      to: Forge.address,
      value: ethers.utils.parseEther("1"),
    });

    await ForgeToken.connect(addr1)["mint(uint256)"](0);
    await ForgeToken.connect(addr1)["mint(uint256)"](1);
    await ForgeToken.connect(addr1)["mint(uint256)"](2);

    expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(1);
    expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(1);
    expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(1);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [Forge.address],
    });

    const signer = await ethers.getSigner(Forge.address);

    await ForgeToken.connect(signer).burnBatch(
      addr1.address,
      [0, 1, 2],
      [1, 1, 1]
    );

    expect(await ForgeToken.balanceOf(addr1.address, 0)).to.equal(0);
    expect(await ForgeToken.balanceOf(addr1.address, 1)).to.equal(0);
    expect(await ForgeToken.balanceOf(addr1.address, 2)).to.equal(0);

    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [Forge.address],
    });
  });

  it("should invoke the fallback function", async () => {
    const { ForgeToken, owner } = await loadFixture(deployFixture);
    const tx = await owner.sendTransaction({
      to: ForgeToken.address,
      data: "0x1234",
      value: ethers.utils.parseEther("1.0"),
    });
    await tx.wait();
  });
});
