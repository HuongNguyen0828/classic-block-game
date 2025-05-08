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
    borderRadius: 1.1,
    borderWidth: 0.5,
    borderColor: "#000",
  },
  innerBlock: {
    width: "75%",
    height: "75%",
    backgroundColor: "#000",
    borderRadius: 1.1,
    margin: "auto",
  },
});
