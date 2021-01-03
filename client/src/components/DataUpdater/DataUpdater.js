import React, {useCallback} from 'react';
import {
    Text,
    useToast,
    Link,
} from '@chakra-ui/react'

const DataUpdater = props => {
    const toast = useToast();
    const handleClick = useCallback(async () => {
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
        if(data['message'] === "SUCCESS") {
            toast({
                position: "bottom-left",
                title: "Refresh Complete",
                description: "We've pulled in new data. Reload to view.",
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
    });
    return (<>
        updated {props.text}{' '}
        <Text as="b">
            <Link onClick={handleClick}>
                refresh?
            </Link>
        </Text>
    </>);
};

export default DataUpdater;