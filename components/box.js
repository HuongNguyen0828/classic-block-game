import React from "react";
import { StyleSheet, View } from "react-native";

const Box = () => {
  return <View style={styles.box}></View>;
};

export default React.memo(Box);

const styles = StyleSheet.create({
  box: {
    width: 10,
    height: 10,
    backgroundColor: "#D2D6C3",
    borderWidth: 1,
    borderColor: "#BEBBAA",
    borderRadius: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.2,
  },
  innerBlock: {
    width: "80%",
    height: "80%",
    backgroundColor: "#4A4A4A",
    borderRadius: 1,
    margin: "auto",
  },
});
