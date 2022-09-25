import React, { useCallback } from "react";
import { Text, Link } from "@chakra-ui/react";
import TimeAgo from "timeago-react";

const DataUpdater = (props) => {
  const handleClick = useCallback(async () => {
    props.refreshFn();
  });
  return (
    <>
      {import.meta.env.VITE_API_ENABLED === true ? (
        <>
          updated <TimeAgo datetime={props.time} />{" "}
          <Text as="sup">
            <Text as="b">
              <Link onClick={handleClick}>manual refresh?</Link>
            </Text>
          </Text>
        </>
      ) : (
        "static mode - no data refresh available"
      )}
    </>
  );
};

export default DataUpdater;
