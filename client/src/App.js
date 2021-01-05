import React, { Component } from 'react';
import {
  Grid,
  CSSReset,
  Text,
  Flex,
  Progress,
  Heading,
  createStandaloneToast,
} from '@chakra-ui/react'
import MatchStats from './components/MatchStats';
import DataUpdater from './components/DataUpdater';

const PAGE_AMOUNT = 50;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matches: null,
      pageOffset: 0,
      updatedAt: null,
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
    const response = await fetch('/refresh');
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
    const response = await fetch('/api');
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
    this.setState({ matches, updatedAgo: data['updatedAgo'] });

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
          <Text color="gray.500">{this.state.updatedAgo && <DataUpdater text={this.state.updatedAgo} refreshFn={this.handleDataRefresh} />}</Text>
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