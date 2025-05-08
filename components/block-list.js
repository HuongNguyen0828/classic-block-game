import React from "react";
import { StyleSheet, View } from "react-native";
import Block from "./block";

const BlockList = ({ blockTypes, isReversed }) => {
  return (
    <View style={styles.blockTypes}>
      <Block blockTypes={blockTypes} isReversed={isReversed} />
    </View>
  );
};

export default BlockList;

const styles = StyleSheet.create({
  blockTypes: {
    padding: 5,
    flex: 1,
    gap: 5,
  },
});
