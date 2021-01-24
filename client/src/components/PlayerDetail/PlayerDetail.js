import React, { Component } from 'react';
import {
    Grid,
    GridItem,
    Box,
    Flex,
    Heading,
} from '@chakra-ui/react';
import {
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import moment from 'moment'

class PlayerDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            kills_by_week: [],
        }
    }

    populateData = async () => {
        const response = await fetch(process.env.REACT_APP_HOST + '/api/player/' + this.props.match.params.name);
        const data = await response.json();
        data['kills_by_week'].forEach(d => {
            d.time = moment(d.time).valueOf();
        });
        this.setState({ kills_by_week: data['kills_by_week'] });
    }

    async componentDidMount() {
        await this.populateData();
    }

    render() {
        return (
            <>
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
                        <Heading size="lg">{decodeURIComponent(this.props.match.params.name)} stats</Heading>
                    </Flex>
                </Flex>
                <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} p={10}>
                    <GridItem>
                        <Box
                            backgroundColor="white"
                            borderRadius="lg"
                            shadow="sm"
                            border={"1px solid lightgrey"}
                            pl={3}
                            pr={3}
                            pt={5}
                            pb={5}
                        >
                            <Flex
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                textAlign="center"
                            >
                                <Flex
                                    display="flex"
                                    flexDirection="row"
                                    alignItems="flex-start"
                                    justifyContent="flex-start"
                                >
                                    <Heading size="sm">Average Kills by Week</Heading>
                                </Flex>
                            </Flex>

                            <ResponsiveContainer width='100%' height={500} >
                                <ScatterChart>
                                    <XAxis
                                        dataKey='time'
                                        domain={['auto', 'auto']}
                                        name='Time'
                                        scale={"time"}
                                        tickFormatter={(unixTime) => moment(unixTime).format('MMM Do')}
                                        type='number'
                                    />
                                    <YAxis dataKey='value' name='Value' />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => [name === "Time" ? moment(value).format('YYYY-MM-DD') : parseFloat(value).toFixed(2) + " kills", name]} />
                                    <Scatter
                                        data={this.state.kills_by_week}
                                        line
                                        name='Values'
                                        fill="#8884d8"
                                    />

                                </ScatterChart>
                            </ResponsiveContainer></Box></GridItem></Grid>
            </>
        )
    }
}

export default PlayerDetail;