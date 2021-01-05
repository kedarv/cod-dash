import React, { useCallback } from 'react';
import {
    Text,
    useToast,
    Link,
} from '@chakra-ui/react'

const DataUpdater = props => {
    const handleClick = useCallback(async () => {
        props.refreshFn();
    });
    return (<>
        updated {props.text}{' '}
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