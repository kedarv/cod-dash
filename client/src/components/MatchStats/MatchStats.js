import React from 'react';
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
} from '@chakra-ui/react'

const maybePluralize = (count, noun, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`;

const modeToString = {
    'br_brduos': 'Duos',
    'br_brtrios': 'Trios',
    'br_brquads': 'Quads',
    'br_mini_rebirth_mini_royale_quads': 'Mini Rebirth Royale Quads',
    'br_mini_miniroyale': 'Mini Royale',
    'br_brtriostim_name2': 'Stimulus Trios'
}

const gameTypeToString = {
    'wz': 'Warzone',
}

function convertSeconds(seconds) {
    const minutes = (seconds / 60).toFixed(1);
    if (seconds < 60) {
        return seconds + " seconds";
    }
    return minutes + " minutes";
};

function timeConverter(UNIX_timestamp) {
    const parsedDate = new Date(UNIX_timestamp * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = parsedDate.getFullYear();
    const month = months[parsedDate.getMonth()];
    const hour = parsedDate.getHours();
    const min = parsedDate.getMinutes();
    return month + ' ' + parsedDate.getDate() + ' ' + year + ' ' + hour + ':' + min;
}

const MatchStats = props => (
    <GridItem>
        <Box
            backgroundColor="white"
            borderRadius="lg"
            shadow="sm"
            border="1px solid lightgrey"
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
                    {timeConverter(props.match[0].matchStart)}
                </Box>
                <Heading
                    size="md"
                    as="h2"
                    lineHeight="shorter"
                    fontWeight="bold"
                    fontFamily="heading"
                >
                    {modeToString[props.match[0].mode] || props.match[0].mode}
                    <Text color="gray.500" fontSize="sm">{gameTypeToString[props.match[0].gameType] || props.match[0].gameType} &bull; {convertSeconds(props.match[0].timePlayed)}</Text>
                </Heading>
            </Flex>
            <Stack shouldWrapChildren spacing={5} mt={4}>
                <Accordion allowToggle>
                    {props.match.map(entry => {
                        return (
                            <AccordionItem>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left">
                                        {entry.playerName} ({maybePluralize(entry.kills, "kill", "s")})
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
                                        </Tbody>
                                    </Table>
                                </AccordionPanel>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </Stack>
        </Box>
    </GridItem>
);

export default MatchStats;