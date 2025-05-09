import React from "react";
import { StyleSheet, View } from "react-native";
import SingleBlock from "./single-block";

const Block = ({ blockTypes, isReversed }) => {
  const blockTypesReversed = blockTypes.map((blockType) =>
    blockType.map((row) => [...row].reverse())
  );
  const blocksToRender = isReversed ? blockTypesReversed : blockTypes;
  return (
    <View style={{ display: "flex", gap: 5 }}>
      {blocksToRender.map((blockType, index) => (
        // View for each block type
        <View key={index} style={styles.blockTypes}>
          {blockType.map((row, rowIndex) => (
            // View for each row in the block type
            <View key={rowIndex} style={{ flexDirection: "row" }}>
              {row.map((cell, cellIndex) =>
                cell === 1 ? (
                  <SingleBlock key={`${rowIndex}-${cellIndex}`} />
                ) : (
                  // Empty view for empty cells
                  <View
                    key={`${rowIndex}-${cellIndex}`}
                    style={{ width: 10, height: 10 }}
                  />
                )
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default Block;

const styles = StyleSheet.create({
  blockTypes: {},
});
