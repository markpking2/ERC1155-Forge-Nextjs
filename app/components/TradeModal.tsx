import { observer } from "mobx-react";
import { useStore } from "../hooks";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  ModalOverlay,
  useDisclosure,
  Flex,
  Box,
  Tooltip,
  Checkbox,
} from "@chakra-ui/react";
import Image from "next/image";
import { ImFire } from "react-icons/im";
import { useState } from "react";
import * as _ from "lodash/fp";
import { CgArrowsExchangeAlt } from "react-icons/cg";
import { FaQuestion } from "react-icons/fa";

export const TradeModal = observer(() => {
  const store = useStore();
  const [checkedToken, setCheckedToken] = useState(-1);
  const images = [
    { src: "/0.jpeg", id: 0 },
    { src: "/1.jpeg", id: 1 },
    { src: "/2.jpeg", id: 2 },
    { src: "/3.jpeg", id: 3 },
    { src: "/4.jpeg", id: 4 },
    { src: "/5.jpeg", id: 5 },
    { src: "/6.jpeg", id: 6 },
  ];

  const onClose = () => {
    store.setTradeTokenId(-1);
  };

  const onTrade = async () => {
    await store.trade(checkedToken, store.tradeTokenId);
    setCheckedToken(-1);
    store.setTradeTokenId(-1);
  };
  return (
    <Modal isOpen={store.tradeTokenId !== -1} onClose={onClose} size={"xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Trade</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{`Select one of your other tokens to trade it for token ${store.tradeTokenId}.`}</Text>
          <Box p={10}>
            {_.map(
              ({ src, id }) => {
                return (
                  <Flex
                    key={`trademodal${id}`}
                    display={"inline-block"}
                    p={2}
                    justifyContent={"center"}
                  >
                    <Box>
                      <Flex flexDirection={"column"} alignItems={"center"}>
                        <Image
                          onClick={() => {
                            setCheckedToken(checkedToken === id ? -1 : id);
                          }}
                          src={src}
                          width={"100px"}
                          height={"100px"}
                          style={{
                            borderRadius: "10px",
                            opacity: store.tokenBalances[id] === 0 ? 0.5 : 1,
                            cursor: "pointer",
                          }}
                        />
                        <Box p={2}>
                          <Text fontSize={"sm"}>
                            Balance: {store.tokenBalances[id]}
                          </Text>
                          <Box pt={2}>
                            <Checkbox
                              colorScheme={"red"}
                              isChecked={checkedToken === id}
                              onChange={(e) => {
                                setCheckedToken(checkedToken === id ? -1 : id);
                              }}
                            />
                          </Box>
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>
                );
              },
              _.filter(
                ({ id }) =>
                  store.tokenBalances[id] > 0 && id !== store.tradeTokenId,
                images
              )
            )}
          </Box>
          <Flex flexDirection={"column"} alignItems={"center"}>
            <Flex
              alignItems={"center"}
              justifyContent={"space-around"}
              w={"70%"}
            >
              {checkedToken === -1 ? (
                <FaQuestion
                  style={{ width: "100px", height: "100px", color: "grey" }}
                />
              ) : (
                <Image
                  src={images[checkedToken].src}
                  width={"100px"}
                  height={"100px"}
                  style={{
                    borderRadius: "10px",
                  }}
                />
              )}
              <CgArrowsExchangeAlt fontSize={"60px"} />
              <Image
                src={images[store.tradeTokenId]?.src}
                width={"100px"}
                height={"100px"}
                style={{
                  borderRadius: "10px",
                }}
              />
            </Flex>
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Close
          </Button>
          <Tooltip
            isDisabled={checkedToken !== -1}
            label={"Select the token you would like to trade."}
          >
            <div>
              <Button
                isDisabled={checkedToken === -1}
                rightIcon={<CgArrowsExchangeAlt fontSize={"25px"} />}
                onClick={onTrade}
              >
                Trade
              </Button>
            </div>
          </Tooltip>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});
