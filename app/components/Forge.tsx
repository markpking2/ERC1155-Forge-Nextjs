import { Box, Button, Flex, Checkbox, Text } from "@chakra-ui/react";
import Image from "next/image";
import { SiCurseforge } from "react-icons/si";

export const Forge = () => {
  const images = [
    { src: "/0.jpeg", name: "Token 0" },
    { src: "/1.jpeg", name: "Token 1" },
    { src: "/2.jpeg", name: "Token 2" },
  ];
  return (
    <Box w={"50%"} border={"1px"}>
      <Flex flexDirection={"column"} alignItems={"center"}>
        <Text fontSize={"2xl"}>Forge Your Tokens</Text>
        <Text fontSize={"sm"} w={"80%"}>
          Select 2 or 3 tokens to attempt forging them into tokens 3, 4, 5, or
          6.
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

                    <Box>
                      <Checkbox>
                        <Text>{name}</Text>
                      </Checkbox>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            );
          })}
        </Flex>
        <Button fontSize={"sm"} rightIcon={<SiCurseforge />}>
          Forge!
        </Button>
      </Flex>
    </Box>
  );
};
