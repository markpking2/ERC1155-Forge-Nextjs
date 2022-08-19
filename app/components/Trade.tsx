import { Box, Flex, Button, Text } from "@chakra-ui/react";
import Image from "next/image";
import { IoLeafOutline } from "react-icons/all";
import { CgArrowsExchangeAlt } from "react-icons/cg";

export const Trade = () => {
  const images = ["/0.jpeg", "/1.jpeg", "/2.jpeg"];
  return (
    <Box borderRight={"1px"} borderLeft={"1px"}>
      <Flex flexDirection={"column"} alignItems={"center"}>
        <Text fontSize={"2xl"} align={"center"}>
          Starter Tokens
        </Text>
        <Text fontSize={"md"} align={"center"} w={"70%"}>
          Each starter token can be minted once every minute. You may trade any
          token to get another starter token.
        </Text>
      </Flex>
      <Flex justifyContent={"space-around"}>
        {images.map((image) => {
          return (
            <Box display={"inline-block"} p={10}>
              <Flex flexDirection={"column"} alignItems={"center"}>
                <Image
                  src={image}
                  width={"150px"}
                  height={"150px"}
                  style={{ borderRadius: "10px" }}
                />
                <Button
                  fontSize={"sm"}
                  rightIcon={<IoLeafOutline />}
                  m={2}
                  w={"100%"}
                >
                  Mint this
                </Button>
                <Button
                  fontSize={"sm"}
                  rightIcon={<CgArrowsExchangeAlt fontSize={"25px"} />}
                  m={2}
                  w={"100%"}
                >
                  Trade for this
                </Button>
                <Text fontSize={"sm"}>Balance: 0</Text>
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};
