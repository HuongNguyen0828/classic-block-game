import React from "react";
import { StyleSheet, View } from "react-native";

const SingleBlock = () => {
  return (
    <View style={styles.block}>
      <View style={styles.innerBlock} />
    </View>
  );
};

export default SingleBlock;

const styles = StyleSheet.create({
  block: {
    width: 10,
    height: 10,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: "#000",
  },
  innerBlock: {
    width: "80%",
    height: "80%",
    backgroundColor: "#000",
    borderRadius: 1,
    margin: "auto",
  },
});
