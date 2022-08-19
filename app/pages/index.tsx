import { Burn, Forge, Header, Trade } from "../components";
import { Box, Flex } from "@chakra-ui/react";
import styled from "styled-components";

export default function Home() {
  return (
    <Wrapper p={3} h={"100vh"}>
      <Header />
      <Trade />
      <Flex>
        <Forge />
        <Burn />
      </Flex>
    </Wrapper>
  );
}

const Wrapper = styled(Box)`
  &:before {
    content: "";
    background-image: url("/volcano.jpeg");
    background-size: cover;
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    opacity: 0.2;
    filter: grayscale(50%);
  }
`;
