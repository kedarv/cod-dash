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
  Table, Thead, Tbody, Tr, Th, Td, Progress
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

const PAGE_AMOUNT = 50;

function convertSeconds(seconds) {
  const minutes = (seconds / 60).toFixed(1);
  if (seconds < 60) {
    return seconds + " seconds";
  }
  return minutes + " minutes";
};

function timeConverter(UNIX_timestamp){
  const parsedDate = new Date(UNIX_timestamp * 1000);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const year = parsedDate.getFullYear();
  const month = months[parsedDate.getMonth()];
  const hour = parsedDate.getHours();
  const min = parsedDate.getMinutes();
  return month + ' ' + parsedDate.getDate() + ' ' + year + ' ' + hour + ':' + min;
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

}

class App extends Component {
  // Initialize the state
  constructor(props) {
    super(props);
    this.state = {
      matches: null,
      pageOffset: 0,
    }
    this.handleScroll = this.handleScroll.bind(this);
  }

  // Fetch the list on first mount
  async componentDidMount() {
    const response = await fetch('/api');
    const data = await response.json();
    let matches = [];
    data.forEach((match => {
      let appended = false;
      for (let i = 0; i < matches.length; i++) {
        if (matches[i][0].matchId === match['matchId']) {
          matches[i].push(match);
          appended = true;
          break;
        }
      }
      if (!appended) {
        matches.push([match]);
      }
    }));
    this.setState({ matches })
    window.addEventListener("scroll", this.handleScroll);
  }

  handleScroll() {
    const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + window.pageYOffset;
    if (windowBottom >= docHeight) {
      this.setState({
        pageOffset: this.state.pageOffset + PAGE_AMOUNT
      })
    }
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
          {this.state.matches ? (
            <>
              {this.state.matches.slice(0, this.state.pageOffset + PAGE_AMOUNT).map((match => (<MatchStats match={match} key={match[0].matchId} />)))}
            </>
          ) : (<Progress size="xs" isIndeterminate />)
          }
        </Grid>
      </div>
    );
  }
}

export default App;