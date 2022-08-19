import { Box, Button, Checkbox, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import { ImFire } from "react-icons/im";

export const Burn = () => {
  const images = [
    { src: "/3.jpeg", name: "Token 3" },
    { src: "/4.jpeg", name: "Token 4" },
    { src: "/5.jpeg", name: "Token 5" },
    { src: "/6.jpeg", name: "Token 6" },
  ];
  return (
    <Box w={"50%"} borderTop={"1px"} borderRight={"1px"} borderBottom={"1px"}>
      <Flex flexDirection={"column"} alignItems={"center"}>
        <Text fontSize={"2xl"} textAlign={"center"}>
          Your Forged Tokens
        </Text>
        <Text w={"80%"} fontSize={"sm"} textAlign={"center"}>
          You may burn your forged tokens. Who knows what will happen?
        </Text>
        <Flex flexWrap={"wrap"} w={"90%"} justifyContent={"space-between"}>
          {images.map(({ src, name }) => {
            return (
              <Flex display={"inline-block"} p={2} justifyContent={"center"}>
                <Box>
                  <Flex flexDirection={"column"} alignItems={"center"}>
                    <Image
                      src={src}
                      width={"100px"}
                      height={"100px"}
                      style={{ borderRadius: "10px" }}
                    />
                    <Box p={2}>
                      <Text fontSize={"sm"}>Balance: 0</Text>
                      <Button fontSize={"sm"} rightIcon={<ImFire />}>
                        Burn
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};
