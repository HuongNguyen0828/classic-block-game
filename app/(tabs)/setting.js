import { useState } from "react";
import { Input, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Feather from "@expo/vector-icons/Feather";

const SpeedSetup = ({ onStart }) => {
  const [selectedSpeed, setSelectedSpeed] = useState("Normal");
  const [customSpeed, setCustomSpeed] = useState(1);

  const speeds = [
    { label: "Slow", value: 800 },
    { label: "Normal", value: 500 },
    { label: "Fast", value: 300 },
  ];

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
  const handleStart = () => {
    const chosen = speeds.find((s) => s.label === selectedSpeed);
    onStart(chosen.value); // Pass the speed value to parent
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Game Speed</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={handlePlus}>
          <Feather name="plus-circle" size={24} color="black" />
        </TouchableOpacity>
        <Input placeholder="Custom Speed: 1, 2, 3.. 8" keyboardType="numeric" />

        <TouchableOpacity optionButton onPress={handleMinus}>
          <Feather name="minus-circle" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.startButton}></TouchableOpacity>
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
