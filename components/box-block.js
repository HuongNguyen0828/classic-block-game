import React from "react";
import { StyleSheet, View } from "react-native";

const BoxBlock = () => {
  return (
    <View style={styles.block}>
      <View style={styles.innerBlock} />
    </View>
  );
};

export default React.memo(BoxBlock);

const styles = StyleSheet.create({
  block: {
    width: 10,
    height: 10,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: "#4A4A4A",
  },
  innerBlock: {
    width: "80%",
    height: "80%",
    backgroundColor: "#4A4A4A",
    borderRadius: 1,
    margin: "auto",
  },
});
