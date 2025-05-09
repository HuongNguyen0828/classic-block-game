import React from "react";
import { StyleSheet, View } from "react-native";

const Box = () => {
  return <View style={styles.box}></View>;
};

export default Box;

const styles = StyleSheet.create({
  box: {
    width: 10,
    height: 10,
    backgroundColor: "#F1F1F1",
    borderWidth: 1,
    borderColor: "#2F4F4F",
    borderRadius: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});
