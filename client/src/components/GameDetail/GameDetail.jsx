import React, { Component } from "react";
import { Progress } from "@chakra-ui/react";
import MatchStats from "../MatchStats";

class GameDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      match: null,
    };
  }

  populateMatch = async () => {
    const response = await fetch(
      import.meta.env.VITE_API_HOST + "/api/match/" + this.props.matchId
    );
    const data = await response.json();
    this.setState({ match: data });
  };

  async componentDidMount() {
    await this.populateMatch();
  }

  render() {
    return (
      <>
        {this.state.match ? (
          <MatchStats
            match={this.state.match}
            key={this.state.match[0].matchId}
            linkable={false}
            expandAll
          />
        ) : (
          <Progress size="xs" isIndeterminate />
        )}
      </>
    );
  }
}

export default GameDetail;
