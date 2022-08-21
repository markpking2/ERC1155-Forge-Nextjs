import { makeAutoObservable, toJS } from "mobx";
import Web3Modal from "web3modal";
import { BigNumber, ethers, Signer } from "ethers";
import * as _ from "lodash/fp";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import env from "../env";
import ForgeToken from "../JSONFiles/ForgeToken.json";
import Forge from "../JSONFiles/Forge.json";
import { UseToastOptions, ToastPosition } from "@chakra-ui/react";
import { createStandaloneToast } from "@chakra-ui/toast";
const { toast } = createStandaloneToast();

const TOAST_DEFAULTS: UseToastOptions = {
  position: "top-right",
  duration: 6000,
  isClosable: true,
};

interface IToastParams {
  title: string;
  description: string;
  position?: ToastPosition;
}

const createToastForStatus =
  (status: UseToastOptions["status"]) => (data: IToastParams) => {
    toast({ ...TOAST_DEFAULTS, ...data, status });
  };

export type EventType = { message: string; type: "add" | "burn" };

export class StoreMobx {
  connected = true;
  switchNetworkModalOpen = false;
  installMetamaskModalOpen = false;
  provider: Web3Provider | null = null;
  signer: JsonRpcSigner | Signer | null = null;
  address: string = "";
  balance: string = "0.00";
  tokenBalances = {
    "0": 0,
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
  } as Record<string, number>;
  error = createToastForStatus("error");
  success = createToastForStatus("success");
  addedListeners = false;
  tradeTokenId = -1;
  events: Array<EventType> = [];

  constructor() {
    makeAutoObservable(this);
  }

  addEvent(event: EventType) {
    this.events = [event, ...this.events];
  }

  setTradeTokenId(id: number) {
    this.tradeTokenId = id;
  }

  setAddedListeners(value: boolean) {
    this.addedListeners = value;
  }

  checkMetamask() {
    if (!window.ethereum) {
      this.installMetamaskModalOpen = true;
      return false;
    }
    return true;
  }

  setSwitchNetworkModelOpen(open: boolean) {
    this.switchNetworkModalOpen = open;
  }

  setInstallMetaMaskModalOpen(open: boolean) {
    this.installMetamaskModalOpen = open;
  }
  async promptSwitchNetwork() {
    if (this.checkMetamask()) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13881" }],
        });
      } catch (err) {
        if (_.get("code", err) === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x13881",
                  rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
                },
                ,
              ],
            });
          } catch (err) {
            console.error(err);
            return;
          }
        }
        console.error(err);
        return;
      }
      return true;
    }
  }

  async setSigner(): Promise<boolean> {
    try {
      const web3Modal = new Web3Modal();
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      this.provider = provider;
      this.signer = signer;
      const address = await signer.getAddress();
      this.address = address;
      return true;
    } catch (err) {
      return false;
    }
  }

  async setBalance(): Promise<void> {
    if (!this.signer || !this.provider) return;
    const balance = await (this.provider as Web3Provider).getBalance(
      await (this.signer as JsonRpcSigner).getAddress()
    );
    this.balance = ethers.utils.formatEther(balance);
  }

  async getTokenBalances(): Promise<Record<string, number> | void> {
    if (!this.signer || !this.provider) return;
    try {
      const forgeToken = new ethers.Contract(
        env.FORGE_TOKEN_ADDRESS as string,
        ForgeToken.abi,
        this.signer as Signer
      );
      const result = await forgeToken.balanceOfBatch(
        Array(7).fill(this.address),
        [0, 1, 2, 3, 4, 5, 6]
      );

      return _.flow(
        _.reduce(
          (acc, cur: BigNumber) => {
            acc[acc.index++] = parseInt(cur._hex, 16);
            return acc;
          },
          {
            index: 0,
            "0": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
          } as Record<string, number>
        ),
        (data) => {
          delete data.index;
          return data;
        }
      )(result);
    } catch (err) {
      console.log("GET TOKEN BALANCES", err);
    }
  }

  setTokenBalances(balances: Record<string, number>) {
    this.tokenBalances = balances;
  }

  async setInitialTokenBalances(): Promise<void> {
    const balances = await this.getTokenBalances();
    if (balances) {
      this.setTokenBalances(balances);
    }
  }

  async setInitialData() {
    try {
      await this.setBalance();
      await this.setInitialTokenBalances();
    } catch (err) {
      console.log("SET INITIAL DATA", err);
    }
  }

  async mint(tokenId: number) {
    if (!this.address) return;
    try {
      const forgeToken = new ethers.Contract(
        env.FORGE_TOKEN_ADDRESS as string,
        ForgeToken.abi,
        this.signer as Signer
      );
      const tx = await forgeToken["mint(uint256)"](tokenId);
      await tx.wait();
    } catch (err) {
      const regex = new RegExp("tokens 0 - 2 each have a 1 min mint cooldown");
      if (_.get("reason", err)?.match(regex)) {
        this.error({
          title: "Mint Failed",
          description: `Failed to mint token ${tokenId}. Wait at least one minute between minting the same token id.`,
        });
      }
    }
  }

  async forge(tokenIds: Array<number>) {
    if (!this.address) return;
    try {
      const forge = new ethers.Contract(
        env.FORGE_ADDRESS as string,
        Forge.abi,
        this.signer as Signer
      );
      const tx = await forge.forge(tokenIds);
      await tx.wait();
    } catch (err) {
      console.log(err);
      this.error({
        title: "Forge Failed",
        description: `Failed to forge token ids: ${tokenIds?.join(", ")}.`,
      });
    }
  }

  async burn(tokenId: number) {
    if (!this.address) return;
    try {
      const forgeToken = new ethers.Contract(
        env.FORGE_TOKEN_ADDRESS as string,
        ForgeToken.abi,
        this.signer as Signer
      );
      const tx = await forgeToken["burn(uint256,uint256)"](tokenId, 1);
      await tx.wait();
    } catch (err) {
      console.log(err);
      this.error({
        title: "Burn Failed",
        description: `Failed to burn token ${tokenId}.`,
      });
    }
  }

  async trade(toBurnId: number, forId: number) {
    if (!this.address) return;
    try {
      const forge = new ethers.Contract(
        env.FORGE_ADDRESS as string,
        Forge.abi,
        this.signer as Signer
      );
      const tx = await forge.trade(toBurnId, forId);
      await tx.wait();
    } catch (err) {
      console.log(err);
      this.error({
        title: "Trade Failed",
        description: `Failed to trade token ${toBurnId} for token ${forId}.`,
      });
    }
  }
}
