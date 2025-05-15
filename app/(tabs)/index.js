import AntDesign from "@expo/vector-icons/AntDesign";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Block from "../../components/block";
import BlockList from "../../components/block-list";
import Box from "../../components/box";

const { width, height } = Dimensions.get("window");

const Z = [
  [0, 1],
  [1, 1],
  [1, 0],
];

const T = [
  [1, 0],
  [1, 1],
  [1, 0],
];

const O = [
  [1, 1],
  [1, 1],
  //[null, null]
];

const L = [
  [1, 0],
  [1, 0],
  [1, 1],
];

const I = [[1], [1], [1], [1]];

const blocks = [Z, T, O, L, I];

const randomBlock = () => {
  const randomIndex = Math.floor(Math.random() * blocks.length);
  return blocks[randomIndex]; // Return the block type
};

const randomPosition = (blockWidth = 20) => {
  const minWidth = 30; //
  const maxWidth = 200 - blockWidth; //
  const x =
    Math.floor((Math.random() * (maxWidth - minWidth + 1)) / 10) * 10 +
    minWidth;

  return { x, y: 0 }; // Adjust the range based on your design
};

const boxes = [];

for (let i = 0; i < 40; i++) {
  boxes.push([]); // create a new row: 41 rows
  for (let j = 0; j < 19; j++) {
    boxes[i].push(1); // push 1 into each column of that row: 20 columns
  }
}

export default function HomeScreen() {
  // Setting up state variables
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isReset, setIsReset] = useState(false);

  // Randomly generate a block and its position
  const position = randomPosition(); // call it once, not multiple times
  const block = randomBlock(); // call it once, not multiple times
  const [currentBlock, setCurrentBlock] = useState(block); // Set initial block
  const [blockPosition, setBlockPosition] = useState(position); // Set initial position
  const [disableButton, setDisableButton] = useState(false); // State to check if the block reached the bottom

  // Set the next block position
  const [nextBlock, setNextBlock] = useState(randomBlock()); // Set initial next block
  const [score, setScore] = useState(0); // State to keep track of the score

  // list of blocks to render
  const [placedBlocks, setPlacedBlocks] = useState([]); // Set initial block list

  // Track of the score fore each row and column inside playground
  const [playground, setPlayground] = useState(
    Array.from({ length: 41 }, () => Array(20).fill(0))
  );

  const collisionDetection = useCallback(
    (block, position) => {
      // Check against placed blocks
      for (let row = 0; row < block.length; row++) {
        for (let col = 0; col < block[row].length; col++) {
          if (block[row][col] === 1) {
            const blockX = position.x + col * 10;
            const blockY = position.y + row * 10;

            // Check each placed block
            for (const placedBlock of placedBlocks) {
              const placedX = placedBlock.position.x;
              const placedY = placedBlock.position.y;
              const placedType = placedBlock.type;

              // Check if this block cell overlaps any placed block cell
              for (let pRow = 0; pRow < placedType.length; pRow++) {
                for (let pCol = 0; pCol < placedType[pRow].length; pCol++) {
                  if (placedType[pRow][pCol] === 1) {
                    const placedCellX = placedX + pCol * 10;
                    const placedCellY = placedY + pRow * 10;

                    if (blockX === placedCellX && blockY === placedCellY) {
                      return true; // Collision detected
                    }
                  }
                }
              }
            }
          }
        }
      }

      return false; // No collision
    },
    [placedBlocks]
  );
  // Spawn a new block
  const spawnNewBlock = useCallback(() => {
    // Add current block to placed blocks before replacing it
    setPlacedBlocks((prev) => [
      ...prev,
      {
        type: currentBlock,
        position: blockPosition,
      },
    ]);
    setCurrentBlock(nextBlock); // Set the current block to the next block
    setBlockPosition(randomPosition()); // Reset the block position
    setNextBlock(randomBlock()); // Generate a new next block
    setDisableButton(false); // Reset the disable button state
  }, [currentBlock, blockPosition, nextBlock]);

  // Unified game loop
  useEffect(() => {
    if (isGameOver || isPaused) return;
    // Animate the block down
    const gameInterval = setInterval(() => {
      // Adding current block to the block list
      moveDown(); // Move the block down every second
    }, 100);

    return () => clearInterval(gameInterval);
  }, [isPaused, isGameOver, isReset, currentBlock, blockPosition, moveDown]);

  // Default is rotating 90 degrees clockwise
  const rotateBlock = () => {
    if (!currentBlock || isPaused || isReset || isGameOver) return; // Logic to move the block left

    // Logic to rotate the block
    const rotatedBlock = currentBlock[0].map((_, colIndex) =>
      currentBlock.map((row) => row[colIndex]).reverse()
    );
    setCurrentBlock(rotatedBlock); // Update the current block with the rotated block
    // Find max length of the block
    const maxLength = Math.max(...rotatedBlock.map((row) => row.length));

    // if already reach the boundary to the right, rotate inside the boundary
    if (blockPosition.x > 200 - maxLength * 10) {
      setBlockPosition((prev) => ({
        ...prev,
        x: 200 - maxLength * 10,
      })); // Prevent moving out of bounds
    }
  };

  const moveLeft = () => {
    if (!currentBlock || isPaused || isReset || isGameOver) return; // Logic to move the block left

    setBlockPosition((prev) => {
      let newX = prev.x - 10;
      // Check if the block collides with the placed blocks
      if (collisionDetection(currentBlock, { ...prev, x: newX })) {
        newX = prev.x; // Reset to the previous position
      }
      if (newX < 0) {
        newX = 0; // Prevent moving out of bounds
      }
      return { ...prev, x: newX };
    }); // Update the block position
  };

  const moveRight = () => {
    if (!currentBlock || isPaused || isReset || isGameOver) return;
    // Logic to move the block right
    setBlockPosition((prev) => {
      let newX = prev.x + 10;
      // Check for collision with the right boundary
      if (collisionDetection(currentBlock, { ...prev, x: newX })) {
        newX = prev.x; // Reset to the previous position
      }

      if (newX > 200 - currentBlock[0].length * 10) {
        newX = 200 - currentBlock[0].length * 10; // Prevent moving out of bounds
      }
      return { ...prev, x: newX };
    }); // Update the block position
  };

  const moveDown = useCallback(() => {
    // Disable button when
    if (!currentBlock || isPaused || isReset || isGameOver) return;

    setBlockPosition((prev) => {
      // Logic to move the block down
      const newPosition = { ...prev, y: prev.y + 10 };
      // Check for collision with the bottom or other blocks
      if (collisionDetection(currentBlock, newPosition)) {
        // If collision detected, set the block to the bottom
        setDisableButton(true); // Set disable button state
        spawnNewBlock(); // Spawn a new block
        return prev;
      }

      // Check if the block has reached the bottom
      if (prev.y === 400 - currentBlock.length * 10) {
        setDisableButton(true); // Set reached bottom state
        spawnNewBlock(); // Spawn a new block
        return prev;
      }
      return newPosition;
    });
  }, [collisionDetection, currentBlock, spawnNewBlock]);

  const handleReset = () => {
    setIsReset(!isReset);
    setCurrentBlock(randomBlock());
    setBlockPosition(randomPosition());
    setPlacedBlocks([]); // Reset the placed blocks
    setScore(0); // Reset the score
    setDisableButton(false); // Reset the reached bottom state
    setIsGameOver(false); // Reset the game over state
    setIsPaused(false); // Reset the paused state
  };
  const handlePause = () => {
    // are paused, now unpause, then set the button to be enabled
    if (isPaused) {
      setDisableButton(false); // Disable buttons when paused
    } else {
      setDisableButton(true); // Enable buttons when unpaused
    }

    setIsPaused(!isPaused);
  };
  const handleSound = () => {
    setIsSoundOn(!isSoundOn);
  };

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
          <BlockList blockTypes={blocks} isReversed={false} />
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
                  <Box />
                </View>
              ))}
            </View>

            {/* Render the settled down blocks */}
            {placedBlocks.map((item, index) => (
              <View
                key={index}
                style={{
                  position: "absolute",
                  top: item.position.y,
                  left: item.position.x,
                }}
              >
                <Block type={item.type} />
              </View>
            ))}

            {/* Rendering Current Block */}
            {currentBlock && (
              <View
                style={{
                  position: "absolute",
                  top: blockPosition.y,
                  left: blockPosition.x,
                }}
              >
                <Block type={currentBlock} />
              </View>
            )}
          </View>

          {/* Score and record section */}
          <View style={styles.scoreRecord}>
            <View style={{ height: "50%" }}>
              <Text>Score</Text>
              <Text>Record</Text>
            </View>
            <View style={{ height: "50%" }}>
              <Text>Preview Next</Text>
              <Block type={nextBlock} />
            </View>
          </View>
        </View>

        {/* Block types: is Reversed*/}
        <View style={styles.blockList}>
          <BlockList blockTypes={blocks} isReversed={true} />
        </View>
      </View>
      {/*  Divider */}
      <View style={styles.divider} />
      {/* Control section */}
      <View style={styles.controlArea}>
        {/* Setting: Pause, Sound, Reset */}
        <View style={styles.settingArea}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePause}
          >
            <Text>Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text>Sound</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, styles.reset]}
            onPress={handleReset}
          >
            <Text>Reset</Text>
          </TouchableOpacity>
        </View>
        {/* Up down Arrow & Rotate control */}
        <View style={styles.arrowArea}>
          {/* First row */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              !disableButton && rotateBlock();
            }}
          >
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
              onPress={moveLeft}
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
              onPress={moveRight}
            >
              <Text>Right</Text>
            </TouchableOpacity>
          </View>

          {/* Third row: Down */}
          <TouchableOpacity style={styles.button} onPress={moveDown}>
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
    width: 90,
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
