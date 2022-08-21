import {
  Text,
  Flex,
  Box,
  Link,
  HStack,
  Heading,
  Button,
} from "@chakra-ui/react";
import "@fontsource/medievalsharp";
import "@fontsource/silkscreen";
import { useStore } from "../hooks/store.hooks";
import { observer } from "mobx-react";
import { SiCurseforge } from "react-icons/si";

export const Header = observer(() => {
  const store = useStore();
  return (
    <Box
      p={10}
      mb={5}
      border={"1px"}
      borderRadius={"10px"}
      background={"#f5dfcb"}
    >
      <Flex
        justifyContent={"space-around"}
        alignItems={"center"}
        flexWrap={"wrap"}
      >
        <Flex>
          <Flex flexDirection={"column"} alignItems={"center"}>
            <Heading fontSize={"3xl"} mr={5}>
              ERC1155 TOKEN FORGE{" "}
            </Heading>
            <Text>
              <Link
                fontSize={"2xl"}
                href={"https://testnets.opensea.io/collection/token-forge"}
                color={"red"}
                isExternal
              >
                View on OpenSea.
              </Link>
            </Text>
          </Flex>
          <SiCurseforge style={{ display: "inline-block", fontSize: "40px" }} />
        </Flex>

        <Flex w={"30%"} justifyContent={"end"} alignItems={"center"}>
          <Text fontSize={"lg"} fontWeight={"bold"}>
            {!!store.signer && !!store.provider
              ? `You have ${parseFloat(store.balance).toFixed(4)} Matic`
              : "Not Connected"}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
});
