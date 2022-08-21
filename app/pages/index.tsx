import {
  Burn,
  SwitchNetworkModal,
  Forge,
  Header,
  Trade,
  InstallMetamaskModal,
  TradeModal,
  EventLog,
} from "../components";
import { Box, Button, Flex } from "@chakra-ui/react";
import styled from "styled-components";
import { useStore } from "../hooks/store.hooks";
import { useEffect } from "react";
import env from "../env";
import { BigNumber, BytesLike, ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { observer } from "mobx-react";
import * as _ from "lodash/fp";

export default observer(function Home() {
  const store = useStore();

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }

    return () => window.ethereum.removeAllListeners();
  });

  useEffect(() => {
    if (!store.signer || !store.provider) {
      store.setSigner().then(async (success: boolean) => {
        if (success) {
          await store.setInitialData();
        }
      });
    }
    store.promptSwitchNetwork().then((success) => {});
  }, [store.signer, store.provider]);

  useEffect(() => {
    if (store.provider && store.address && !store.addedListeners) {
      const gainedSingleFilter = {
        address: env.FORGE_TOKEN_ADDRESS,
        topics: [
          ethers.utils.id(
            "TransferSingle(address,address,address,uint256,uint256)"
          ),
          null,
          null,
          ethers.utils.hexZeroPad(store.address, 32),
        ],
      };

      const getSingleTransfer = (data: BytesLike) => {
        let [tokenId, amount] = ethers.utils.defaultAbiCoder.decode(
          ["uint256", "uint256"],
          data
        );
        tokenId = parseInt(tokenId.toString());
        amount = parseInt(amount.toString());

        return { tokenId, amount };
      };

      const getBatchTransfer = (data: BytesLike) => {
        let [tokenIds, amounts] = ethers.utils.defaultAbiCoder.decode(
          ["uint256[]", "uint256[]"],
          data
        );
        tokenIds = tokenIds.map((id: BigNumber) => parseInt(id.toString()));
        amounts = amounts.map((amount: BigNumber) =>
          parseInt(amount.toString())
        );

        return { tokenIds, amounts };
      };

      store.provider.on(gainedSingleFilter, (result) => {
        const { tokenId, amount } = getSingleTransfer(result.data);
        const newBalances = { ...store.tokenBalances };
        newBalances[tokenId] += amount;
        store.setTokenBalances(newBalances);
        store.success({
          title: "Success",
          description: `You received token ${tokenId}.`,
        });
        store.addEvent({
          message: `You received token ${tokenId}.`,
          type: "add",
        });
      });

      const burnSingleFilter = {
        address: env.FORGE_TOKEN_ADDRESS,
        topics: [
          ethers.utils.id(
            "TransferSingle(address,address,address,uint256,uint256)"
          ),
          null,
          null,
          ethers.utils.hexZeroPad(ethers.constants.AddressZero, 32),
        ],
      };

      store.provider.on(burnSingleFilter, (result) => {
        const { tokenId, amount } = getSingleTransfer(result.data);
        const newBalances = { ...store.tokenBalances };
        newBalances[tokenId] -= amount;
        store.setTokenBalances(newBalances);
        store.success({
          title: "Success",
          description: `You burned token ${tokenId}.`,
        });
        store.addEvent({
          message: `You burned token ${tokenId}.`,
          type: "burn",
        });
      });

      const burnBatchFilter = {
        address: env.FORGE_TOKEN_ADDRESS,
        topics: [
          ethers.utils.id(
            "TransferBatch(address,address,address,uint256[],uint256[])"
          ),
          null,
          null,
          ethers.utils.hexZeroPad(ethers.constants.AddressZero, 32),
        ],
      };

      store.provider.on(burnBatchFilter, (result) => {
        const { tokenIds, amounts } = getBatchTransfer(result.data);
        const newBalances = { ...store.tokenBalances };
        const tokenAmounts = _.zip(tokenIds, amounts);
        _.each(([tokenId, amount]: [number, number]) => {
          newBalances[tokenId] -= amount;
        }, tokenAmounts);
        store.setTokenBalances(newBalances);
        store.success({
          title: "Success",
          description: `You burned tokens ${tokenIds.join(", ")}.`,
        });
        store.addEvent({
          message: `You burned tokens ${tokenIds.join(", ")}.`,
          type: "burn",
        });
      });

      store.setAddedListeners(true);

      return () => {
        (store.provider as Web3Provider).removeAllListeners();
        store.setAddedListeners(false);
      };
    }
  }, [store.provider, store.address, store.addedListeners]);

  return (
    <Wrapper p={5} h={"100vh"}>
      <>
        <Header />
        <Trade />
        <Flex>
          <Forge />
          <Burn />
        </Flex>
        <EventLog />
        <InstallMetamaskModal />
        <SwitchNetworkModal />
        <TradeModal />
      </>
    </Wrapper>
  );
});

const Wrapper = styled(Box)`
  &:before {
    content: "";
    pointer-events: none;
    background-image: url("/volcano.jpeg");
    background-size: cover;
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    opacity: 0.1;
    filter: grayscale(0.4);
  }
`;
