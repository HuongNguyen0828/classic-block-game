import { StyleSheet, View } from "react-native";

const row = [];
for (let i = 0; i < 20; i++) {
  row[i] = 1;
}

const fullRow = () => {
  return (
    <View style={{ display: "flex", flexDirection: "row" }}>
      {row.map((box, index) => (
        <View key={index} style={styles.block}>
          <View style={styles.innerBlock} />
        </View>
      ))}
    </View>
  );
};

export default fullRow;

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
    backgroundColor: "red",
    borderRadius: 1,
    margin: "auto",
  },
});
