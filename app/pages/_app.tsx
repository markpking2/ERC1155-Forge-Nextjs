import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../styles";
import { StoreProvider } from "../hooks";
import { createStandaloneToast } from "@chakra-ui/toast";

const { ToastContainer } = createStandaloneToast();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider initialState={pageProps.initialState}>
      <ChakraProvider resetCSS theme={theme}>
        <ToastContainer />
        <Component {...pageProps} />
      </ChakraProvider>
    </StoreProvider>
  );
}

export default MyApp;
