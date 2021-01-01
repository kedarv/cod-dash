import React, { Component } from 'react';
import {
  Grid,
  GridItem,
  CSSReset,
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
  Table, Thead, Tbody, Tr, Th, Td, TableCaption
} from '@chakra-ui/react'

const maybePluralize = (count, noun, suffix = 's') =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`;

const modeToString = {
  'br_brduos': 'Duos',
  'br_brquads': 'Quads',
  'br_mini_rebirth_mini_royale_quads': 'Mini Rebirth Royale Quads',
}

const gameTypeToString = {
  'wz': 'Warzone',
}

function MatchStats(props) {
  return (
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
            <Heading
              size="md"
              as="h2"
              lineHeight="shorter"
              fontWeight="bold"
              fontFamily="heading"
            >
              {modeToString[props.matchData[Object.keys(props.matchData)[0]].mode] || props.matchData[Object.keys(props.matchData)[0]].mode}
              <Text color="gray.500" fontSize="md">({gameTypeToString[props.matchData[Object.keys(props.matchData)[0]].gameType] || props.matchData[Object.keys(props.matchData)[0]].gameType})</Text>
            </Heading>
          </Flex>
          <Stack shouldWrapChildren spacing={5} mt={4}>
            <Accordion allowToggle>
              {Object.entries(props.matchData).map(([key, value]) => {
                return (
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        {key} ({maybePluralize(value.playerStats.kills, "kill", "s")})
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
                            <Td>{value.playerStats.kills}</Td>
                          </Tr>
                          <Tr>
                            <Td>Assists</Td>
                            <Td>{value.playerStats.assists}</Td>
                          </Tr>
                          <Tr>
                            <Td>Deaths</Td>
                            <Td>{value.playerStats.deaths}</Td>
                          </Tr>
                          <Tr>
                            <Td>Damage Done</Td>
                            <Td>{value.playerStats.damageDone}</Td>
                          </Tr>
                          <Tr>
                            <Td>Damage Taken</Td>
                            <Td>{value.playerStats.damageTaken}</Td>
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

}

class App extends Component {
  // Initialize the state
  constructor(props) {
    super(props);
    this.state = {
      matches: [],
      players: [],
    }
  }

  // Fetch the list on first mount
  componentDidMount() {
    this.getData();
  }

  // Retrieves the list of items from the Express app
  getData = () => {
    fetch('/api')
      .then(res => res.json())
      .then(data => this.setState({ 'matches': data['matches'], 'players': data['players'] }))
  }

  render() {
    return (
      <div className="App">
        <CSSReset />
        <Flex
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          mt={4}
        >
          <Flex
            display="flex"
            flexDirection="row"
            alignItems="flex-start"
            justifyContent="flex-start"
          >
            <Text fontSize="3xl" fontWeight="bold">⚡️Dub Squad Dashboard</Text>
          </Flex>
          <Text color="gray.500">let's get dem dubs</Text>
        </Flex>
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} p={10}>
          {/* Check to see if any items are found*/}
          {this.state.matches ? (
            <>
              {/* Render the list of items */}
              {Object.entries(this.state.matches).map((item) => {
                let data = {};
                item[1].map((player => {
                  data[player] = this.state.players[player].matches.filter(match => match.matchID === item[0])[0];
                }));
                return (<MatchStats matchData={data} />)
              })}
            </>
          ) : (
              <div>
                <h2>No Matches Found</h2>
              </div>
            )
          }
        </Grid>
      </div>
    );
  }
}

export default App;