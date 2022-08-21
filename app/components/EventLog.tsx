import {
  Box,
  Flex,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { observer } from "mobx-react";
import { MdCheckCircle, MdSettings } from "react-icons/md";
import * as _ from "lodash/fp";
import { useStore } from "../hooks";
import { EventType } from "../store/store.mobx";
import { GiTwoCoins } from "react-icons/gi";
import { ImFire } from "react-icons/im";

export const EventLog = observer(() => {
  const store = useStore();

  return (
    <Box
      border={"1px"}
      p={3}
      borderRadius={"10px"}
      mt={5}
      background={"#f5dfcb"}
    >
      <Box p={1}>
        <Text fontSize={"2xl"}>Event Log</Text>
      </Box>
      <Box p={5} border={"1px"} borderRadius={"10px"} background={"white"}>
        <List
          spacing={3}
          overflowY={"scroll"}
          minHeight={"200px"}
          maxHeight={"300px"}
        >
          {/*@ts-ignore*/}
          {_.map.convert({ cap: false })(({ message, type }: EventType, i) => {
            return (
              <ListItem w={"100%"} key={`${type}${i}`}>
                <Flex>
                  {type === "add" ? (
                    <ListIcon
                      fontSize={"20px"}
                      as={GiTwoCoins}
                      color="green.500"
                    />
                  ) : (
                    <ListIcon fontSize={"20px"} as={ImFire} color="red.500" />
                  )}
                  <Text fontSize={"lg"}>{message}</Text>
                </Flex>
              </ListItem>
            );
          }, store.events)}
        </List>
      </Box>
    </Box>
  );
});
