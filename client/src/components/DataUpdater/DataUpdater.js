import React, { useCallback } from 'react';
import { Text, Link} from '@chakra-ui/react'
import TimeAgo from 'timeago-react';

const DataUpdater = props => {
    const handleClick = useCallback(async () => {
        props.refreshFn();
    });
    return (<>
        updated <TimeAgo datetime={props.time}/>{' '}
        <Text as="sup">
            <Text as="b">
                <Link onClick={handleClick}>
                    manual refresh?
            </Link>
            </Text>
        </Text>
    </>);
};

export default DataUpdater;