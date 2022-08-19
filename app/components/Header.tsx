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
import { BsWallet2 } from "react-icons/bs";
import "@fontsource/silkscreen";

export const Header = () => {
  return (
    <Box p={10} border={"1px"}>
      <Flex justifyContent={"space-around"} alignItems={"center"}>
        <Heading fontSize={"4xl"}>ERC1155 TOKEN FORGE</Heading>
        <Flex w={"30%"} justifyContent={"end"} alignItems={"center"}>
          <Text fontSize={"sm"}>You have ??? Matic</Text>
          <Button ml={4} fontSize={"sm"} rightIcon={<BsWallet2 />}>
            Connect
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
