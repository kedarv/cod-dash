import React, { Component } from 'react';
import {
  Grid,
  CSSReset,
  Text,
  Flex,
  Progress,
  Heading,
  createStandaloneToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  GridItem,
  Box,
  Container,
  Center,
  Divider,
} from '@chakra-ui/react';
import MatchStats from '../MatchStats';
import DataUpdater from '../DataUpdater';
import GameDetail from '../GameDetail';

const PAGE_AMOUNT = 50;
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matches: null,
      pageOffset: 0,
      updatedAt: null,
      viewingGameDetail: props.match?.params?.id,
      modalOpen: props.match?.params?.id !== undefined,
      players: null,
    }
    this.handleScroll = this.handleScroll.bind(this);
  }

  handleDataRefresh = async () => {
    const toast = createStandaloneToast()
    toast({
      position: "bottom-left",
      title: "Refreshing Data",
      description: "We've issued a data refresh.",
      status: "info",
      duration: 6000,
      isClosable: true,
    })
    const response = await fetch(process.env.REACT_APP_HOST + '/refresh');
    const data = await response.json();
    if (data['message'] === "SUCCESS") {
      await this.populateMatches();
      toast({
        position: "bottom-left",
        title: "Refresh Complete",
        description: "We've pulled in new data.",
        status: "success",
        duration: 6000,
        isClosable: true,
      })
    } else {
      toast({
        position: "bottom-left",
        title: "Refresh Refused",
        description: "It looks like we've already refreshed data recently. Try again later.",
        status: "warning",
        duration: 6000,
        isClosable: true,
      })
    }
  }

  populateMatches = async () => {
    const response = await fetch(process.env.REACT_APP_HOST + '/api');
    const data = await response.json();
    let matches = [];

    // Transform data into array of arrays of match objects
    data['results'].forEach((match => {
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
    this.setState({ matches, updatedAgo: data['updatedAgo'], players: data['players'] });

    if (data['triggerRefresh']) {
      this.handleDataRefresh();
    }
  }

  async componentDidMount() {
    await this.populateMatches();
    window.addEventListener("scroll", this.handleScroll);
  }

  // Listen for scroll to bottom to infinite-scroll
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
        {this.state.viewingGameDetail && (
          <>
            <Modal closeOnOverlayClick={true} isOpen={this.state.modalOpen} onClose={() => { this.setState({ "modalOpen": false }) }}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Game Detail</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                  <GameDetail matchId={this.props.match.params.id} />
                </ModalBody>
              </ModalContent>
            </Modal>
          </>)}
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
            <Heading>⚡️Dub Squad Dashboard</Heading>
          </Flex>
          <Text color="gray.500">let's get dem dubs</Text>
          <Text color="gray.500">{this.state.updatedAgo && <DataUpdater time={this.state.updatedAgo} refreshFn={this.handleDataRefresh} />}</Text>
        </Flex>
        {!this.state.players && (
          <Container mt={8}>
            <Progress size="xs" isIndeterminate />
          </Container>
        )}
        <Container maxW="7xl">
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6} p={10}>
            {this.state.players && (
              this.state.players.map((player =>
                <GridItem>
                  <Box
                    backgroundColor="white"
                    borderRadius="lg"
                    shadow="md"
                    border={"1px solid lightgrey"}
                    pl={3}
                    pr={3}
                    pt={5}
                    pb={5}
                  >
                    <Center>{player['display']}</Center>
                </Box>
                </GridItem>
              ))
            )}
          </Grid>
          <Divider/>
        </Container>
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} p={10}>
          {this.state.matches && (
            <>
              {this.state.matches.slice(0, this.state.pageOffset + PAGE_AMOUNT).map((match => (<MatchStats match={match} key={match[0].matchId} linkable />)))}
            </>
          )}
        </Grid>
      </div>
    );
  }
}

export default Home;