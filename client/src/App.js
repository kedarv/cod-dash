import React, { Component } from 'react';
import {
  Grid,
  CSSReset,
  Text,
  Flex,
  Progress,
  Heading,
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

  async componentDidMount() {
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
          <Text color="gray.500">{this.state.updatedAgo && <DataUpdater text={this.state.updatedAgo}/>}</Text>
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