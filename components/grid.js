import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Box from "./box";

const boxes = [];

for (let i = 0; i < 20; i++) {
  boxes.push([]); // create a new row: 20 rows
  for (let j = 0; j < 20; j++) {
    boxes[i].push(1); // push 1 into each column of that row: 20 columns
  }
}

const Grid = () => {
  return (
    <View>
      {boxes.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, cellIndex) => (
            <Box key={`${rowIndex}-${cellIndex}`} />
          ))}
          <Box />
        </View>
      ))}
    </View>
  );
};

export default Grid;

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
});
