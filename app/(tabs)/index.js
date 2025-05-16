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

const randomPosition = (blockWidth = 20) => {
  const minWidth = 0; //
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
  // Clear value of the box
  const [valueBox, setValueBox] = useState(1); // initALLY value = 1
  // Track of the box need to clear out
  const [clearRow, setClearRow] = useState([]); // initally empty block
  const [count, setCount] = useState(0); // Count box up to 20: being full row
  const [positionsToCheckAgainst, setPositionsToCheckAgainst] = useState([]);

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
  const [score, setScore] = useState(20); // State to keep track of the score

  // list of blocks to render
  const [placedBlocks, setPlacedBlocks] = useState([]); // Set initial block list

  // Logic for clear full row and record score
  /* 
    Every time that currentBlock move down, check against all boxes of that currentBlock
    If found any time that 20 boxes in same position.y (top position) inside PlacedBlock list, 
        score++, and 
        move all blocks that these box belonging to down 10px
  */
  const fullRowDetection = useCallback(
    (block, position) => {
      setPositionsToCheckAgainst([]);
      for (let row = 0; row < block.length; row++) {
        // Find each position.y at each row. Avoid duplicate position as at 1 row, there are MORE THAN 1 box
        const blockPositionY = position.y + row * 10;
        setPositionsToCheckAgainst((prev) => [...prev, blockPositionY]); // Adding each position of Valid box of current block into list of position
      }

      // Check again each Position inside positionsToCheckAgainst
      for (const positionToCheck of positionsToCheckAgainst) {
        // if up to 20, FullRow = true, update position

        // For each block inside placed blocks
        for (const placedBlock of placedBlocks) {
          //Each block inside placedBlocks
          const placedType = placedBlock.type;
          // Position of each block inside placedBlocks
          const placedY = placedBlock.position.y;

          // Each cell inside each block
          for (let row = 0; row < placedType.length; row++) {
            for (let column = 0; column < placedType[row].length; column++) {
              const boxXY = placedType[row][column];
              // Extract position.y of each VAlID box (box === 1 )
              const positionY = placedY.y + row * 10;
              if (boxXY === 1 && positionY === positionToCheck) {
                setCount((prev) => prev + 1); // update count
                setValueBox(0);
                setClearRow([...clearRow, boxXY]); // Adding new boxXY into clearRow
              }
            }
          }
        }

        // If make up full row of 20 full boxes
        if (count === 20) {
          // Update score
          setScore((prev) => prev + 1);
          // Update value for all boxes to be be clear = 0
          setValueBox(0);
        }
        // release the row to be clear
        else setClearRow([]);
      }
    },
    [clearRow, count, placedBlocks, positionsToCheckAgainst]
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
              //Each block inside placedBlocks
              const placedType = placedBlock.type;
              // Position of each block inside placedBlocks
              const placedX = placedBlock.position.x;
              const placedY = placedBlock.position.y;

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
    if (!currentBlock || isPaused || isGameOver) return;

    // Logic to rotate the block
    const rotatedBlock = currentBlock[0].map((_, colIndex) =>
      currentBlock.map((row) => row[colIndex]).reverse()
    );
    setCurrentBlock(rotatedBlock); // Update the current block with the rotated block
    // Find max length of the block
    const maxLength = Math.max(...rotatedBlock.map((row) => row.length));

    // if already reach the boundary to the right, rotate inside the boundary
    if (blockPosition.x > 200 - maxLength * 10) {
      setBlockPosition({ ...blockPosition, x: 200 - maxLength * 10 }); // Prevent moving out of bounds
    }
  };

  const moveLeft = () => {
    if (!currentBlock || isPaused || isGameOver) return; // Logic to move the block left

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
    if (!currentBlock || isPaused || isGameOver) return;
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
    if (!currentBlock || isPaused || isGameOver) return;

    const newPosition = {
      x: blockPosition.x,
      y: blockPosition.y + 10,
    };

    const hasCollision = collisionDetection(currentBlock, newPosition);
    const isAtBottom = blockPosition.y >= 400 - currentBlock.length * 10;

    if (hasCollision || isAtBottom) {
      setDisableButton(true);

      // Add current block to placedBlocks and spawn new one
      setPlacedBlocks((prev) => [
        ...prev,
        {
          type: currentBlock,
          position: blockPosition,
        },
      ]);

      // Check against full row detection, and record score
      fullRowDetection(currentBlock, blockPosition);

      // Before Fetching new Block
      setCurrentBlock(nextBlock);
      setBlockPosition(randomPosition());
      setNextBlock(randomBlock());

      return;
    }

    // If no collision and not at bottom, move down
    setBlockPosition(newPosition);
  }, [
    blockPosition,
    currentBlock,
    nextBlock,
    isPaused,
    isGameOver,
    collisionDetection,
    fullRowDetection,
    randomBlock,
  ]);

  const handleReset = () => {
    setCurrentBlock(randomBlock());
    setBlockPosition(randomPosition());
    setPlacedBlocks([]); // Reset the placed blocks
    setScore(0); // Reset the score
    setDisableButton(false); // Reset the reached bottom state
    setIsGameOver(false); // Reset the game over state
    setIsPaused(false); // Reset the paused state
    setIsReset(true);
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

  /// Now, need implement logic for record score and detech finised line
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
              <Text>Score: {score} </Text>
              <Text>Record: </Text>
            </View>
            <View style={{ height: "30%" }}>
              <Text>Preview Next</Text>
              <Block type={nextBlock} />
            </View>
            <View style={{ height: "20%" }}>
              <Text>
                Status:{" "}
                {isPaused
                  ? "Pause"
                  : isGameOver
                  ? "Game Over"
                  : isReset
                  ? "Reset"
                  : "Play"}
              </Text>
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
          <TouchableOpacity style={styles.button} onPress={rotateBlock}>
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
