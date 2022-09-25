import React from "react";
import {
  GridItem,
  Box,
  Text,
  Stack,
  Flex,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { createStandaloneToast } from "@chakra-ui/toast";
import { Link } from "react-router-dom";
import { fromUnixTime, format, formatDistance } from "date-fns";

const maybePluralize = (count, noun, suffix = "s") =>
  `${count} ${noun}${count !== 1 ? suffix : ""}`;

const modeToString = {
  br_brduos: "Duos",
  br_brtrios: "Trios",
  br_brquads: "Quads",
  br_mini_rebirth_mini_royale_quads: "Rebirth Mini Royale Quads",
  br_rebirth_rbrthtrios: "Rebirth Mini Royale Trios",
  br_mini_rebirth_mini_royale_duos: "Rebirth Mini Royale Duos",
  br_mini_miniroyale: "Mini Royale",
  br_brtriostim_name2: "Stimulus Trios",
  br_rebirth_rbrthquad: "Rebirth Resurgence Quads",
};

function getNumberWithOrdinal(n) {
  var s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const { ToastContainer, toast } = createStandaloneToast();

function copyToClipboard(content) {
  const url = window.location.href.split("#/")[0] + "#" + content;
  const el = document.createElement("textarea");
  el.value = url;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  toast({
    position: "bottom-left",
    title: "Game Detail Link Copied",
    description: "Copied " + url + " to clipboard.",
    status: "success",
    duration: 6000,
    isClosable: true,
  });
}

const MatchStats = (props) => {
  const sortedEntries = props.match.sort(
    (player1, player2) => player2.kills - player1.kills
  );
  return (
    <>
      <ToastContainer />
      <GridItem key={props.match[0].matchId}>
        <Box
          backgroundColor="white"
          borderRadius="lg"
          shadow="sm"
          border={
            props.match[0].teamPlacement === 1
              ? "1px solid goldenrod"
              : "1px solid lightgrey"
          }
          pl={3}
          pr={3}
          pt={5}
          pb={5}
        >
          <Flex
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="flex-start"
            mb={2}
            pl={4}
          >
            <Box
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
            >
              <Link
                to={"/game/" + props.match[0].matchId}
                style={{ display: "flex", alignItems: "center" }}
                onClick={() => {
                  copyToClipboard("/game/" + props.match[0].matchId);
                }}
              >
                {props.linkable && (
                  <>
                    <CopyIcon />
                    &nbsp;
                  </>
                )}
                {format(
                  fromUnixTime(props.match[0].matchStart),
                  "MMM d yyyy h:mm aa"
                )}
              </Link>
            </Box>
            <Heading
              size="md"
              as="h2"
              lineHeight="shorter"
              fontWeight="bold"
              fontFamily="heading"
            >
              {modeToString[props.match[0].mode] || props.match[0].mode}
              <Text color="gray.500" fontSize="sm">
                {getNumberWithOrdinal(props.match[0].teamPlacement)} place
                &bull;{" "}
                {formatDistance(0, props.match[0].timePlayed * 1000, {
                  includeSeconds: true,
                })}
              </Text>
            </Heading>
          </Flex>
          <Stack shouldWrapChildren spacing={5} mt={4}>
            <Accordion
              allowToggle
              defaultIndex={
                props.expandAll ? [...Array(props.match.length).keys()] : []
              }
            >
              {sortedEntries.map((entry) => {
                return (
                  <AccordionItem key={entry.id}>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        {entry.playerName} (
                        {maybePluralize(entry.kills, "kill", "s")})
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Stat</Th>
                            <Th>Entry</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Td>Kills</Td>
                            <Td>{entry.kills}</Td>
                          </Tr>
                          <Tr>
                            <Td>Assists</Td>
                            <Td>{entry.assists}</Td>
                          </Tr>
                          <Tr>
                            <Td>Deaths</Td>
                            <Td>{entry.deaths}</Td>
                          </Tr>
                          <Tr>
                            <Td>Damage Done</Td>
                            <Td>{entry.damageDone}</Td>
                          </Tr>
                          <Tr>
                            <Td>Damage Taken</Td>
                            <Td>{entry.damageTaken}</Td>
                          </Tr>
                          <Tr>
                            <Td>Gulag Kills</Td>
                            <Td>{entry.gulagKills}</Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Stack>
        </Box>
      </GridItem>
    </>
  );
};

export default MatchStats;
