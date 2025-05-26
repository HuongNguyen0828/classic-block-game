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
];

const L = [
  [1, 0],
  [1, 0],
  [1, 1],
];
const Lreversed = [
  [0, 1],
  [0, 1],
  [1, 1],
];

const I = [[1], [1], [1], [1]];

const blocks = [Z, T, O, L, I];

const randomBlock = () => {
  const blocksWithLReversed = [...blocks, Lreversed]; // Add Lreversed to the blocks array
  const randomIndex = Math.floor(Math.random() * blocksWithLReversed.length);
  return blocksWithLReversed[randomIndex]; // Return a random block from the array
};

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
  const [level, setLevel] = useState(1);
  const [pressDown, setPressDown] = useState(false); // initalize pressDown is false

  // list of blocks to render
  const [placedBlocks, setPlacedBlocks] = useState([]); // Set initial block list

  // Logic for clear full row and record score
  /* 
    Every time that currentBlock move down, check against all the y position ( as each line Horizontally) of each currentBlock
    If found any time that 20 boxes in same position.y (top position) inside PlacedBlock list, 
        score++, and 
        move all blocks that these box belonging to down 10px
  */

  const getAllFilledCells = useCallback(() => {
    const filledCells = [];

    for (const placedBlock of placedBlocks) {
      const { type, position } = placedBlock;

      for (let row = 0; row < type.length; row++) {
        for (let col = 0; col < type[row].length; col++) {
          if (type[row][col] === 1) {
            const x = position.x + col * 10; // left position of the cell
            const y = position.y + row * 10; // top position of the cell
            // a cell of value 1 with left and top position, which block belonging to and in which row and column
            filledCells.push({ x, y, block: placedBlock, row, col }); //
          }
        }
      }
    }

    return filledCells;
  }, [placedBlocks]);

  const fullRowDetection = useCallback(() => {
    const filledCells = getAllFilledCells();

    // Count how many cells exist in each row (y)
    const rowCounts = {}; // a object: { "10": 1, "20": 3, "30": 10}
    for (const cell of filledCells) {
      rowCounts[cell.y] = (rowCounts[cell.y] || 0) + 1; // = rowCounts[cell.y] + 1; initially, index of rowCounts= 0, 1, 2, 3.
    }

    const fullRows = Object.keys(rowCounts)
      .filter((y) => rowCounts[y] === 200 / 10) // 200px width, each cell is 10px wide => 20 cells
      .map((y) => parseInt(y));

    if (fullRows.length === 0) return; // empty object
    /* Else, for example:  fullRows = ["10", "40"] if 
    rowCounts = {
      "10": 10, 
      "20": 20, 
      "30": 9, 
      "40": 7, 
      "50": 20
    }
    */

    // update score: with level relationship
    setScore((prev) => prev + fullRows.length * level);
    // Update level
    const odd = score / 5;
    setLevel(parseInt(odd + 1));

    // Remove blocks in full rows
    const newPlacedBlocks = placedBlocks.reduce((acc, block) => {
      const type = block.type; // Get the type of the block
      const position = block.position; // Get the position of the block
      // Check if the block is in a full row
      const newType = type.reduce((newRows, rowArr, rIdx) => {
        const y = position.y + rIdx * 10; // Calculate the top position of the row
        !fullRows.includes(y) && newRows.push(rowArr); // If the row is not in a full row, add it to the newRows array
        return newRows; // Check if this row is in fullRows
      }, []); // Reduce the type array to only include rows that are not in fullRows

      // Resemble the block with the new type
      acc.push({
        ...block,
        type: newType, // Update the type of the block with the new type
      });
      return acc; // Return the accumulator
    }, []);

    //Remove cells in full rows
    // const newPlacedBlocks = placedBlocks.map((block) => {
    //   const newType = block.type.map((rowArr, rIdx) =>
    //     rowArr.map((val, cIdx) => {
    //       const y = block.position.y + rIdx * 10;
    //       const x = block.position.x + cIdx * 10;

    //       // Remove if in full row
    //       return fullRows.includes(y) ? null : val; // Map rowArr for each cell, if inside fullRow, remove it, else keep the value
    //     })
    //   );
    //   return { ...block, type: newType };
    // });

    //Shifting all new block type above of the fullRow down after removing
    // Shift blocks above cleared rows down
    const newPlacedBlocksShiftDown = newPlacedBlocks.map((block) => {
      let countShifts = 0;
      for (let row = 0; row < block.type.length; row++) {
        const y = block.position.y + row * 10;

        // Check count if it > AND = each item, count++
        countShifts = fullRows.filter((fullRow) => y <= fullRow).length;
      }

      const newPosition = {
        x: block.position.x,
        y: block.position.y + 10 * countShifts,
      };
      const newBlock = { ...block, position: newPosition };

      return newBlock;
    });

    setPlacedBlocks(newPlacedBlocksShiftDown); // Update the placed blocks with the new blocks
  }, [placedBlocks, getAllFilledCells, score, level]);

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
      if (pressDown) moveDown(10);
      else moveDown(level); // Move the block down every second
    }, 200);

    return () => clearInterval(gameInterval);
  }, [
    isPaused,
    isGameOver,
    isReset,
    currentBlock,
    blockPosition,
    moveDown,
    pressDown,
    level,
  ]);

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

  const moveDown = useCallback(
    (speed) => {
      if (!currentBlock || isPaused || isGameOver) return;

      // Check against full row detection, and record score BEFORE SET placedBlocks
      fullRowDetection();

      let newPosition = {
        x: blockPosition.x,
        y: blockPosition.y + 10 * speed, // at vertically 10 more with speed fast
      };

      let hasCollision = collisionDetection(currentBlock, newPosition);
      const isAtBottom =
        blockPosition.y >= 400 - currentBlock.length * 10 * speed;

      // Constrain when at bottom or has collision

      if (hasCollision || isAtBottom) {
        // disable movement buttons
        setDisableButton(true);

        /* If at bottom and maybe also being collision but cannot detect (get over boundary), 
        - move it to the bottom
        - Checking if collision, move newPosition 10 up backward, if not, leave it alone
        - Render the placedList lastly
        */

        if (isAtBottom) {
          // Let them at the bottom first
          newPosition = { ...blockPosition, y: 400 - currentBlock.length * 10 };
        }

        // if collision occurs
        if (collisionDetection(currentBlock, newPosition)) {
          newPosition = {
            ...blockPosition,
            y: blockPosition.y, // move up 10 more if still collision, 10, 20, 30
          };
          hasCollision = collisionDetection(currentBlock, newPosition);
          while (!hasCollision) {
            // Updating testPosition
            newPosition = {
              ...newPosition,
              y: newPosition.y + 10, // move up 10 more if still collision, 10, 20, 30
            };

            // Checking collision
            hasCollision = collisionDetection(currentBlock, newPosition);
          }

          // Move backward 10 as already has collision
          newPosition = {
            ...newPosition,
            y: newPosition.y - 10, // move up 10 more if still collision, 10, 20, 30
          };
        }

        // Add current block to placedBlocks and spawn new one
        setPlacedBlocks((prev) => [
          ...prev, // keep the old ones
          {
            // adding new as current block
            type: currentBlock,
            position: newPosition, // at new position, butt - 10 as collision occurs
          },
        ]);

        // Check against full row detection, and record score AFTER SET placedBlocks
        fullRowDetection();

        // Before Fetching new Block
        setCurrentBlock(nextBlock);
        setBlockPosition(randomPosition());
        setNextBlock(randomBlock());
        setPressDown(false);

        return;
      }

      // If no collision and not at bottom, move down
      setBlockPosition(newPosition);
    },
    [
      blockPosition,
      currentBlock,
      nextBlock,
      isPaused,
      isGameOver,
      collisionDetection,
      fullRowDetection,
    ]
  );

  const handleReset = () => {
    setCurrentBlock(randomBlock());
    setBlockPosition(randomPosition());
    setPlacedBlocks([]); // Reset the placed blocks
    setScore(0); // Reset the scores
    setLevel(1);
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
              <Text>LeveL: {level} </Text>
            </View>
            <View style={{ height: "30%", alignItems: "center" }}>
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
          <TouchableOpacity
            style={styles.button}
            onPress={() => setPressDown(true)}
          >
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
