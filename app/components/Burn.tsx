import { Box, Button, Tooltip, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import { ImFire } from "react-icons/im";
import { observer } from "mobx-react";
import { useStore } from "../hooks";

export const Burn = observer(() => {
  const store = useStore();
  const images = [
    { src: "/3.jpeg", id: 3 },
    { src: "/4.jpeg", id: 4 },
    { src: "/5.jpeg", id: 5 },
    { src: "/6.jpeg", id: 6 },
  ];

  return (
    <Box
      w={"50%"}
      border={"1px"}
      borderRadius={"10px"}
      p={2}
      ml={5}
      background={"#f5dfcb"}
    >
      <Flex flexDirection={"column"} alignItems={"center"}>
        <Text fontSize={"2xl"} textAlign={"center"}>
          Your Forged Tokens
        </Text>
        <Text w={"80%"} fontSize={"sm"} textAlign={"center"}>
          You may burn your forged tokens. Who knows what will happen?
        </Text>
        <Flex flexWrap={"wrap"} w={"90%"} justifyContent={"space-between"}>
          {images.map(({ src, id }) => {
            return (
              <Flex
                display={"inline-block"}
                p={2}
                justifyContent={"center"}
                key={`burn${id}`}
              >
                <Box>
                  <Flex flexDirection={"column"} alignItems={"center"}>
                    <Image
                      src={src}
                      width={"100px"}
                      height={"100px"}
                      style={{
                        borderRadius: "10px",
                        opacity: store.tokenBalances[id] === 0 ? 0.5 : 1,
                      }}
                    />
                    <Box p={2}>
                      <Text fontSize={"sm"} textAlign={"center"}>
                        Balance: {store.tokenBalances[id]}
                      </Text>
                      <Tooltip
                        isDisabled={store.tokenBalances[id] > 0}
                        label={"You do not have any of these tokens."}
                      >
                        <div>
                          <Button
                            onClick={async () => {
                              await store.burn(id);
                            }}
                            mt={3}
                            disabled={store.tokenBalances[id] == 0}
                            fontSize={"sm"}
                            rightIcon={<ImFire />}
                          >
                            Burn
                          </Button>
                        </div>
                      </Tooltip>
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
});
