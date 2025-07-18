import { StyleSheet, View } from "react-native";
import BoxBlock from "./box-block";

const Block = ({ type }) => {
  return (
    <View>
      {type.map((row, rowIndex) => (
        // View for each row in the block type
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, cellIndex) =>
            cell === 1 ? (
              <BoxBlock key={`${rowIndex}-${cellIndex}`} />
            ) : (
              cell === 0 && (
                // Empty view for empty cells
                <View
                  key={`${rowIndex}-${cellIndex}`}
                  style={styles.emptyCell}
                />
              )
            )
          )}
        </View>
      ))}
    </View>
  );
};

export default Block;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  emptyCell: {
    width: 10,
    height: 10,
  },
});
