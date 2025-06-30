import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "@expo/vector-icons/Feather";

const SpeedSetup = ({ currentSpeed }) => {
  const [customSpeed, setCustomSpeed] = useState(currentSpeed);

  const handleMinus = () => {
    if (customSpeed > 1) {
      setCustomSpeed(customSpeed - 1);
    }
  };
  const handlePlus = () => {
    if (customSpeed < 8) {
      setCustomSpeed(customSpeed + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Game Speed</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={handlePlus}>
          <Feather name="plus-circle" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          placeholder="Custom Speed: 1, 2, 3.. 8"
          keyboardType="numeric"
          defaultValue={currentSpeed}
          onChangeText={(e) => setCustomSpeed(parseInt(e.nativeEvent.text))}
        />

        <TouchableOpacity optionButton onPress={handleMinus}>
          <Feather name="minus-circle" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SpeedSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 30,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
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
});
