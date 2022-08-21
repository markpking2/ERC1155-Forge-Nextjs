import { observer } from "mobx-react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Link,
} from "@chakra-ui/react";
import { useStore } from "../hooks/store.hooks";

export const InstallMetamaskModal = observer(() => {
  const store = useStore();

  const onClose = () => {
    store.setInstallMetaMaskModalOpen(false);
  };

  return (
    <>
      <Modal isOpen={store.installMetamaskModalOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>MetaMask Not Installed 🦊</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            It looks like MetaMask is not installed. Please install it to use
            this application. You can download it
            <Link
              href={"https://metamask.io/download.html"}
              color={"red"}
              isExternal
            >
              <a> here</a>.
            </Link>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
});
