import React from "react";
import { StyleSheet, View } from "react-native";
import BoxBlock from "./box-block";

const BlockList = ({ blockTypes, isReversed }) => {
  const blockTypesReversed = blockTypes.map((blockType) =>
    blockType.map((row) => [...row].reverse())
  );
  const blocksToRender = isReversed ? blockTypesReversed : blockTypes;
  return (
    <View
      style={{
        display: "flex",
        gap: 10,
      }}
    >
      {blocksToRender.map((blockType, index) => (
        // View for each block type
        <View key={index} style={styles.blockTypes}>
          {blockType.map((row, rowIndex) => (
            // View for each row in the block type
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, cellIndex) =>
                cell === 1 ? (
                  <BoxBlock key={`${rowIndex}-${cellIndex}`} />
                ) : (
                  // Empty view for empty cells
                  <View
                    key={`${rowIndex}-${cellIndex}`}
                    style={styles.emptyCell}
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

export default BlockList;

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  emptyCell: { width: 10, height: 10 },
});
