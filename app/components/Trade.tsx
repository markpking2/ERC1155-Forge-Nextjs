import { Box, Flex, Button, Text, Tooltip } from "@chakra-ui/react";
import Image from "next/image";
import { CgArrowsExchangeAlt } from "react-icons/cg";
import { RiLeafLine } from "react-icons/ri";
import { observer } from "mobx-react";
import { useStore } from "../hooks";
import * as _ from "lodash/fp";

export const Trade = observer(() => {
  const store = useStore();
  const images = ["/0.jpeg", "/1.jpeg", "/2.jpeg"];
  return (
    <Box
      borderRight={"1px"}
      border={"1px"}
      borderRadius={"10px"}
      mb={5}
      background={"#f5dfcb"}
    >
      <Flex flexDirection={"column"} alignItems={"center"}>
        <Text fontSize={"2xl"} align={"center"}>
          Starter Tokens
        </Text>
        <Text fontSize={"sm"} align={"center"} w={"70%"}>
          Each starter token can be minted once every minute. You may trade any
          token to get another starter token.
        </Text>
      </Flex>
      <Flex justifyContent={"space-around"} flexWrap="wrap">
        {images.map((image, i) => {
          return (
            <Box display={"inline-block"} p={10} key={`trade${i}`}>
              <Flex flexDirection={"column"} alignItems={"center"}>
                <Image
                  src={image}
                  width={"150px"}
                  height={"150px"}
                  style={{ borderRadius: "10px" }}
                />
                <Button
                  fontSize={"sm"}
                  rightIcon={<RiLeafLine />}
                  m={2}
                  w={"100%"}
                  onClick={() => store.mint(i)}
                >
                  Mint this
                </Button>
                <Tooltip
                  isDisabled={
                    _.size(
                      _.filter(
                        (balance) => balance !== 0,
                        _.values(store.tokenBalances)
                      )
                    ) > 0
                  }
                  label={
                    "You must have at least one other token to trade for this one."
                  }
                >
                  <div>
                    <Button
                      onClick={() => {
                        store.setTradeTokenId(i);
                      }}
                      isDisabled={
                        _.size(
                          _.filter(
                            (balance) => balance !== 0,
                            _.values(store.tokenBalances)
                          )
                        ) === 0 ||
                        (_.size(
                          _.filter(
                            (balance) => balance !== 0,
                            _.values(store.tokenBalances)
                          )
                        ) === 1 &&
                          store.tokenBalances[i] == 1)
                      }
                      fontSize={"sm"}
                      rightIcon={<CgArrowsExchangeAlt fontSize={"25px"} />}
                      w={"100%"}
                      mb={2}
                    >
                      Trade for this
                    </Button>
                  </div>
                </Tooltip>
                <Text fontSize={"sm"}>Balance: {store.tokenBalances[i]}</Text>
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
});
