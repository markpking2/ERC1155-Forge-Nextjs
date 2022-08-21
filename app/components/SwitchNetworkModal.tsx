import { observer } from "mobx-react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { useStore } from "../hooks/store.hooks";
import { CgArrowsExchangeAlt } from "react-icons/cg";

export const SwitchNetworkModal = observer(() => {
  const { isOpen, onClose: onCloseDisclosure } = useDisclosure();
  const store = useStore();

  const onClose = () => {
    store.setSwitchNetworkModelOpen(false);
  };
  return (
    <>
      <Modal isOpen={store.switchNetworkModalOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Wrong Network!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            You are not connected to the Matic Test Network. Click below to
            switch networks.
          </ModalBody>
          <ModalFooter>
            <Button
              ml={4}
              fontSize={"sm"}
              rightIcon={<CgArrowsExchangeAlt fontSize={"30px"} />}
              onClick={store.promptSwitchNetwork}
            >
              Switch
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});
