import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSpeed } from "../context/speedContext"; // Adjust the import path as necessary

import Feather from "@expo/vector-icons/Feather";

const SpeedSetup = () => {
  const { currentSpeed, setCurrentSpeed } = useSpeed();

  const handleMinus = () => {
    if (currentSpeed > 1) {
      setCurrentSpeed(currentSpeed - 1);
    }
  };
  const handlePlus = () => {
    if (currentSpeed < 8) {
      setCurrentSpeed(parseInt(currentSpeed) + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Game Speed</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={handlePlus}>
          <Feather name="plus-circle" size={24} color="white" />
        </TouchableOpacity>
        <TextInput
          placeholder="1, 2, 3.. 8"
          keyboardType="numeric"
          value={String(currentSpeed)} // get the value as a string
          style={styles.textInput}
          onChangeText={(text) => {
            setCurrentSpeed(text);
          }} // parse the input to an integer
          returnKeyType="done" // ✅ shows "Done" on iOS
        />

        <TouchableOpacity style={styles.optionButton} onPress={handleMinus}>
          <Feather name="minus-circle" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.minMaxContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setCurrentSpeed(8)}
        >
          <Text style={styles.optionText}>Max</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setCurrentSpeed(1)}
        >
          <Text style={styles.optionText}>Min</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SpeedSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 30,
  },
  minMaxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 24,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  optionButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#333",
    marginHorizontal: 8,
  },
  selectedOption: {
    backgroundColor: "#00ffc3",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
  selectedText: {
    color: "#000",
    fontWeight: "bold",
  },
  startButton: {
    marginTop: 40,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#00ffc3",
  },
  startText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textInput: {
    height: 40,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#fff",
    backgroundColor: "#222",
    width: 100,
    textAlign: "center",
    fontSize: 16,
    marginHorizontal: 8,
  },
});
