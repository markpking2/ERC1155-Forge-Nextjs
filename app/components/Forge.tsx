import { Box, Button, Flex, Checkbox, Text, Tooltip } from "@chakra-ui/react";
import { observer } from "mobx-react";
import Image from "next/image";
import { SiCurseforge } from "react-icons/si";
import { useState } from "react";
import * as _ from "lodash/fp";
import { useStore } from "../hooks";

export const Forge = observer(() => {
  const store = useStore();
  const images = [{ src: "/0.jpeg" }, { src: "/1.jpeg" }, { src: "/2.jpeg" }];
  const [checkedTokens, setCheckedTokens] = useState([false, false, false]);

  const onForge = async () => {
    const tokenIds = _.filter((id) => checkedTokens[id], [0, 1, 2]);
    await store.forge(tokenIds);
    setCheckedTokens(() => [false, false, false]);
  };

  return (
    <Box
      w={"50%"}
      border={"1px"}
      p={2}
      borderRadius={"10px"}
      background={"#f5dfcb"}
    >
      <Flex flexDirection={"column"} alignItems={"center"}>
        <Text fontSize={"2xl"}>Forge Tokens</Text>
        <Text fontSize={"sm"} w={"80%"} mb={1}>
          Select 2 or 3 tokens to attempt forging them into tokens 3, 4, 5, or
          6.
        </Text>

        <Flex flexWrap={"wrap"} w={"90%"} justifyContent={"space-between"}>
          {images.map(({ src }, i) => {
            return (
              <Tooltip
                key={`forge${i}`}
                isDisabled={store.tokenBalances[i] > 0}
                label={`You do not have any of these tokens.`}
              >
                <Flex
                  style={{
                    cursor:
                      store.tokenBalances[i] > 0 ? "pointer" : "not-allowed",
                  }}
                  onClick={() => {
                    if (store.tokenBalances[i] === 0) return;
                    setCheckedTokens((checked) => [
                      ...checked.slice(0, i),
                      !checked[i],
                      ...checked.slice(i + 1),
                    ]);
                  }}
                  display={"inline-block"}
                  p={2}
                  justifyContent={"center"}
                >
                  <Box>
                    <Flex flexDirection={"column"} alignItems={"center"}>
                      <Image
                        src={src}
                        width={"100px"}
                        height={"100px"}
                        style={{
                          borderRadius: "10px",
                          opacity: store.tokenBalances[i] === 0 ? 0.5 : 1,
                        }}
                      />

                      <Box pt={2}>
                        <Checkbox
                          isDisabled={store.tokenBalances[i] === 0}
                          colorScheme={"red"}
                          isChecked={checkedTokens[i]}
                          onChange={(e) =>
                            setCheckedTokens((checked) => [
                              ...checked.slice(0, i),
                              !checked[i],
                              ...checked.slice(i + 1),
                            ])
                          }
                        />
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              </Tooltip>
            );
          })}
        </Flex>
        <Tooltip
          isDisabled={_.filter((v) => v, checkedTokens).length >= 2}
          label={"You must select at least 2 tokens."}
        >
          <div>
            <Button
              disabled={_.filter((v) => v, checkedTokens).length < 2}
              fontSize={"sm"}
              rightIcon={<SiCurseforge />}
              onClick={onForge}
            >
              Forge
            </Button>
          </div>
        </Tooltip>
      </Flex>
    </Box>
  );
});
