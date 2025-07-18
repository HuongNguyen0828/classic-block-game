import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import HomeScreen from "../../components/home.js"; // Replace with your actual game component

const GameWrapper = () => {
  const [isLoading, setIsLoading] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the progress bar
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000, // adjust duration as needed
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setIsLoading(false); // show game when done
    });

    // Load assets in parallel
    loadGameAssets();
  }, []);

  const loadGameAssets = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulated loading
    } catch (err) {
      console.error("Error loading game:", err);
    }
  };

  if (isLoading) {
    const width = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });

    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.header}>Tetris Puzzle Block</Text>
        <Text style={styles.loadingText}>Loading Game...</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width }]} />
        </View>
      </View>
    );
  }

  return <HomeScreen />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "111",
    padding: 20,
    fontFamily: "Arial",
  },
  header: {
    color: "#00ffc3",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loadingText: {
    color: "grey",
    fontSize: 20,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: "80%",
    height: 10,
    backgroundColor: "#444",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#00ffc3",
  },
});

export default GameWrapper;
