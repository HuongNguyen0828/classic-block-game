import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BlockList from "../../components/block-list";
import Box from "../../components/box";

const { width, height } = Dimensions.get("window");

const Z = [
  [0, 1],
  [1, 1],
  [1, 0],
];

const Zattributes = {
  type: Z,
  height: 3 * (10 + 2), // 3 rows of 10px each + 2px border
  width: 2 * (10 + 2), // 2 columns of 10px each + 2px border
};

const T = [
  [1, 0],
  [1, 1],
  [1, 0],
];

const Tattributes = {
  type: T,
  height: 3 * (10 + 2), // 3 rows of 10px each + 2px border
  width: 2 * (10 + 2), // 2 columns of 10px each + 2px border
};

const O = [
  [1, 1],
  [1, 1],
  //[null, null]
];

const Oattributes = {
  type: O,
  height: 2 * (10 + 2), // 2 rows of 10px each + 2px border
  width: 2 * (10 + 2), // 2 columns of 10px each + 2px border
};

const L = [
  [1, 0],
  [1, 0],
  [1, 1],
];

const Lattributes = {
  type: L,
  height: 3 * (10 + 2), // 3 rows of 10px each + 2px border
  width: 2 * (10 + 2), // 2 columns of 10px each + 2px border
};
const I = [
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
];

const Iattributes = {
  type: I,
  height: 4 * (10 + 2), // 4 rows of 10px each + 2px border
  width: 1 * (10 + 2), // 1 columns of 10px each + 2px border
};

const blocks = [
  Zattributes,
  Tattributes,
  Oattributes,
  Lattributes,
  Iattributes,
];

const blockTypes = blocks.map((block) => block.type);

const randomBlock = () => {
  const randomIndex = Math.floor(Math.random() * blocks.length);
  return blocks[randomIndex].type; // Return the block type
};

const randomPosition = () => {
  const minWidth = 30; //
  const maxWidth = 200; //
  const x = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth; // Adjust the range based on your design
  return { x };
};

const randomBlockPosition = () => {
  const block = randomBlock();
  const position = randomPosition();
  return { block, position };
};

const boxes = [];

for (let i = 0; i < 40; i++) {
  boxes.push([]); // create a new row
  for (let j = 0; j < 19; j++) {
    boxes[i].push(1); // push 1 into each column of that row
  }
}

export default function HomeScreen() {
  const yPosition = useRef(new Animated.Value(0)).current;
  const yNextPosition = useRef(new Animated.Value(0)).current;

  // Setting up state variables
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isReset, setIsReset] = useState(false);

  const { block, position } = randomBlockPosition(); // call it once, not multiple times
  const [currentBlock, setCurrentBlock] = useState(block);
  const [nextBlock, setNextBlock] = useState([]);

  useEffect(() => {
    Animated.timing(yPosition, {
      toValue: 400 - 40, // fall to near bottom of screen
      duration: 1000, // 2 seconds
      useNativeDriver: false, // must be false for top/left
    }).start(({ finished }) => {
      if (finished) {
        setNextBlock(randomBlockPosition().block);
        yNextPosition.setValue(0);
        // Start the animation again
        Animated.timing(yNextPosition, {
          toValue: 400 - 40, // fall to near bottom of screen
          duration: 1000, // 2 seconds
          useNativeDriver: false, // must be false for top/left
        }).start();
      }
    });
  }, [yPosition, yNextPosition]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Heading */}
      <View style={{ height: 30 }}>
        <Text style={styles.heading}>Block Game</Text>
      </View>
      {/* Main player section */}
      <View style={styles.mainPlayerSection}>
        {/* Block types: not Reversed */}
        <View style={styles.blockList}>
          <BlockList blockTypes={blockTypes} isReversed={false} />
        </View>

        {/* Play Yard  with score section */}
        <View style={styles.mainPlayerYardwithScore}>
          {/* Playground */}
          <View style={styles.playground}>
            <View>
              {boxes.map((row, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: "row" }}>
                  {row.map((cell, cellIndex) => (
                    <Box key={`${rowIndex}-${cellIndex}`} />
                  ))}
                  {/* <Box key={rowIndex} /> */}
                  <Box />
                </View>
              ))}
            </View>

            <Animated.View
              style={{
                position: "absolute",
                top: yPosition,
                left: position.x,
              }}
            >
              <BlockList
                blockTypes={[randomBlockPosition().block]}
                isReversed={false}
              />
            </Animated.View>

            <Animated.View
              style={{
                position: "absolute",
                top: yNextPosition,
                left: position.x,
              }}
            >
              <BlockList
                blockTypes={[randomBlockPosition().block]}
                isReversed={false}
              />
            </Animated.View>
          </View>

          {/* Score and record section */}
          <View style={styles.scoreRecord}>
            <Text>Score</Text>
            <Text>Record</Text>
          </View>
        </View>

        {/* Block types: is Reversed*/}
        <View style={styles.blockList}>
          <BlockList blockTypes={blockTypes} isReversed={true} />
        </View>
      </View>
      {/*  Divider */}
      <View style={styles.divider} />
      {/* Control section */}
      <View style={styles.controlArea}>
        {/* Setting: Pause, Sound, Reset */}
        <View style={styles.settingArea}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text>Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text>Sound</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryButton, styles.reset]}>
            <Text>Reset</Text>
          </TouchableOpacity>
        </View>
        {/* Up down Arrow & Rotate control */}
        <View style={styles.arrowArea}>
          {/* First row */}
          <TouchableOpacity style={styles.button}>
            <Text>Rotate</Text>
          </TouchableOpacity>

          {/* Second row: Left - icons - Right */}
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* Left */}
            <TouchableOpacity
              style={{
                height: "60%",
                width: "30%",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#FFDD00",
                borderRadius: 60,
              }}
            >
              <Text>Left</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View
              style={{
                width: "40%",
                backgroundColor: "#D3D3D3",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AntDesign name="caretup" size={24} color="black" />
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "25%",
                }}
              >
                <AntDesign name="caretleft" size={24} color="black" />
                <AntDesign name="caretright" size={24} color="black" />
              </View>
              <AntDesign name="caretdown" size={24} color="black" />
            </View>

            {/* Right */}
            <TouchableOpacity
              style={{
                height: "60%",
                width: "30%",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#FFDD00",
                borderRadius: 60,
              }}
            >
              <Text>Right</Text>
            </TouchableOpacity>
          </View>

          {/* Third row: Down */}
          <TouchableOpacity style={styles.button}>
            <Text>Down</Text>
          </TouchableOpacity>
        </View>
        {/* Close Arrow Area */}
      </View>
      {/* Close Control Area */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#87CEEB",
    paddingTop: Platform.OS === "ios" ? height : 0,
  },
  heading: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  mainPlayerSection: {
    flex: 1,
    width: "100%",
    gap: 2,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
  },
  mainPlayerYardwithScore: {
    width: 300, // 78% + 10% each for blockList = 98% = width of the main Player section
    height: 400,
    backgroundColor: "#E0E0E0",
    borderColor: "#000",
    borderWidth: 3,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlArea: {
    width: "97%",
    height: "35%", // 65% (main player section) + 35% (control area):
    backgroundColor: "#87CEEB",
    borderRadius: 5,
    flexDirection: "row",
  },
  blockList: {
    width: 30,
    backgroundColor: "#23CEEB",
  },
  playground: {
    width: 200, //200 px; 20 boxes of 10 px each
    height: 400, // 400 px: 40 boxes of 10 px each
    backgroundColor: "#F0F0E0",
    borderRadius: 3,
    borderColor: "#000",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  scoreRecord: {
    width: 100,
    height: "100%",
    backgroundColor: "#D3D3D3",
  },
  settingArea: {
    width: "50%",
    height: "100%",

    flexDirection: "row",
    gap: 5,
  },
  arrowArea: {
    width: "50%",
    height: "90%",
    backgroundColor: "#D3D3D3",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "column",
  },
  button: {
    width: "30%",
    height: "20%",
    backgroundColor: "#FFDD00", // yellow: full red + green
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
  secondaryButton: {
    width: "25%",
    height: "15%",
    backgroundColor: "#70CC70", // lighter green
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reset: {
    backgroundColor: "red",
  },
  divider: {
    width: "100%",
    height: 20,
    backgroundColor: "#87CEEB",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
