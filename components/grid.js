import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
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
      {/* Using FlatList to render the grid: React component for large dynamic grids*/}
      <FlatList
        data={boxes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View key={index} style={styles.row}>
            {item.map((cell, cellIndex) => (
              <Box key={`${index}-${cellIndex}`} />
            ))}
            <Box />
          </View>
        )}
      />
    </View>
  );
};

export default Grid;

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
});
