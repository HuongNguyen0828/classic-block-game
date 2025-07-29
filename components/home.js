import AntDesign from "@expo/vector-icons/AntDesign";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useSpeed } from "../context/speedContext"; // Import the speed context
import { soundManager } from "../utils/sound-manager"; // Import the sound manager
import Block from "./block";
import BlockList from "./block-list";
import FullRow from "./fullRow";
import Grid from "./grid";

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// For sounds
// Playing sound

const { width, height } = Dimensions.get("window");
const playGroundHeight = 200;
const playGroundWidth = 200;
const defaultTime = 700;

const timeSpeedTable = [
  { level: 1, time: 800, speed: 1 },
  { level: 2, time: 750, speed: 2 },
  { level: 3, time: 700, speed: 3 },
  { level: 4, time: 650, speed: 4 },
  { level: 5, time: 600, speed: 5 },
  { level: 6, time: 500, speed: 6 },
  { level: 7, time: 400, speed: 7 },
  { level: 8, time: 300, speed: 8 },
  { level: 9, time: 250, speed: 9 },
  { level: 10, time: 200, speed: 10 },
  { level: 11, time: 150, speed: 11 },
  { level: 12, time: 100, speed: 12 },
  { level: 13, time: 50, speed: 13 },
];

const Z = [
  [0, 1],
  [1, 1],
  [1, 0],
];
const Zreversed = [
  [1, 0],
  [1, 1],
  [0, 1],
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
  const blocksWithLReversed = [...blocks, Lreversed, Zreversed]; // Add Lreversed to the blocks array
  const randomIndex = Math.floor(Math.random() * blocksWithLReversed.length);
  return blocksWithLReversed[randomIndex]; // Return a random block from the array
};

const randomPosition = (block) => {
  const minWidth = 0; //
  // const blockWidth = Math.max(...block.map((row) => row.length)) * 10;
  const blockWidth = Math.max(...block.map((row) => row.length)) * 10;
  const maxWidth = playGroundWidth - blockWidth; //
  const x =
    Math.floor((Math.random() * (maxWidth - minWidth + 1)) / 10) * 10 +
    minWidth;

  return { x, y: 0 }; // Adjust the range based on your design
};

export default function HomeScreen() {
  // Check if the screen is focused
  const isFocused = useIsFocused();
  // Setting up state variables
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isReset, setIsReset] = useState(false);

  // Randomly generate a block and its position
  const block = randomBlock(); // call it once, not multiple times
  const position = randomPosition(block); // call it once, not multiple times

  const [currentBlock, setCurrentBlock] = useState(block); // Set initial block
  const [blockPosition, setBlockPosition] = useState(position); // Set initial position
  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  const [isLongPressDown, setIsLongPressDown] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [isLevelUp, setIsLevelUp] = useState(false); // State to track if the level is up

  // Set the next block position
  const [nextBlock, setNextBlock] = useState(randomBlock()); // Set initial next block
  const [score, setScore] = useState(0); // State to keep track of the score
  const [tripleScore, setTripleScore] = useState(1); // State to keep track of the tripple score
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(defaultTime);
  const [fullRowsDetected, setFullRowDetected] = useState([]); // For styling before clearing out of placedBlocks
  const { currentSpeed, setCurrentSpeed } = useSpeed(); // Current speed of the game
  const [needUpdateSpeed, setNeedUpdateSpeed] = useState(false);

  // list of blocks to render
  const [placedBlocks, setPlacedBlocks] = useState([]); // Set initial block list

  const currentTime = useRef(time); // To track of current time before LongPress

  const normalSpeed = useRef(currentSpeed); // To track of current speed before custom speed setting

  const [rotationStartTime, setRotationStartTime] = useState(null);

  // Replace new sound functions:
  const playMoveHorizontal = async () => {
    if (!isSoundOn) return;
    await soundManager.playSound("horizontal");
  };

  const playHappyRowClear = async () => {
    if (!isSoundOn) return;
    await soundManager.playSound("clearRow");
  };
  const playLevelUp = useCallback(async () => {
    if (!isSoundOn) return;
    await soundManager.playSound("levelUp"); // Play sound for level-up
  }, [isSoundOn]);

  const stopAllSounds = async () => {
    await soundManager.stopAllSounds();
  };

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

  // Game over when any row of placedBlock has reach the height of playGroundHeight
  const gameOverDetection = useCallback(() => {
    const filledCells = getAllFilledCells();

    // Track Count cells exist on each column
    const rowCounts = {};
    for (const cell of filledCells) {
      rowCounts[cell.y] = (rowCounts[cell.y] || 0) + 1;
    }

    // exist cell at the height: top = 0
    if (rowCounts["0"] != null) {
      // 1. Set Game Over
      setIsGameOver(true);

      // Alert: either Quit (out of game: Pause ) or Continue (meaning same as Reset)
      Alert.alert("Game over", "Do you want to play again or Quit?", [
        {
          text: "Play All Over Again",
          onPress: () => {
            handleReset();
          },
          style: "default",
        },
        {
          text: "Restart at this level", // To play at same level
          onPress: () => {
            setPlacedBlocks([]); // clear out PlacedBlocks
            const newSpeed = timeSpeedTable.find(
              (set) => set.level === level
            ).speed;
            setCurrentSpeed(newSpeed); // Reset the current speed to the level speed
            setIsGameOver(false); // to let block moving
          },
          style: "destructive",
        },
      ]);
    }
  }, [getAllFilledCells, setCurrentSpeed, handleReset, level]);

  // Full row detection
  const fullRowDetection = useCallback(() => {
    const filledCells = getAllFilledCells();

    // Count how many cells exist in each row (y)
    const rowCounts = {}; // a object: { "10": 1, "20": 3, "30": 10}
    for (const cell of filledCells) {
      rowCounts[cell.y] = (rowCounts[cell.y] || 0) + 1; // = rowCounts[cell.y] + 1; initially, index of rowCounts= 0, 1, 2, 3.
    }

    const fullRows = Object.keys(rowCounts)
      .filter((y) => rowCounts[y] >= playGroundWidth / 10) // 200px width, each cell is 10px wide => 20 cells
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

    // Render Full row Dectection to fullRowsDetected for styling before clearing
    setFullRowDetected(fullRows);
    // Clear rows after animation
    setTimeout(() => {
      playHappyRowClear(); // Play sounds
      setFullRowDetected([]);
    }, 700);

    // update score: with level relationship
    // Update score and level together
    setScore((prevScore) => {
      const newScore = prevScore + fullRows.length * tripleScore;
      const scale = Math.floor(newScore / 30);
      const newLevel = scale + 1; // +1 so level starts at 1

      // Update level  on new score: Must be greater than current level and within the bounds of timeSpeedTable
      if ((newLevel > level) & (newLevel <= timeSpeedTable.length)) {
        // Play level up sound

        setIsLevelUp(true); // Set isLevelUp to true to trigger any UI changes LEVEL UP word
        setLevel(newLevel);

        // Update and time based on currentSpeed, find level. CANNOT directly update currentSpeed because of MUST NOT call state-updating functions while rendering
        const levelwCurrentSpeed = timeSpeedTable.find(
          (set) => set.speed === currentSpeed
        ).level;
        const newLevelwCurrentSpeed = levelwCurrentSpeed + scale;

        const newSetTimeSpeed = timeSpeedTable.find(
          (set) => set.level === newLevelwCurrentSpeed
        );

        setTime(newSetTimeSpeed.time);
        currentTime.current = newSetTimeSpeed.time;
        setNeedUpdateSpeed(true); // Update only pendingSPeedUpdate, then update CurrentSpeed in useEffect()

        // Reset trippleScore to 1 after scoring
        setTripleScore(1);
      }
      return newScore;
    });

    // Update placedBlocks to remove full rows
    const newPlacedBlocks = placedBlocks.map((block) => {
      const { type, position } = block;
      const newType = type.filter((_, rIdx) => {
        const y = position.y + rIdx * 10;
        return !fullRows.includes(y); // remove rows that are in fullRows
      });

      return {
        ...block,
        type: newType,
      };
    });

    //Shifting all new block type above of the fullRow down after removing
    // Shift blocks above cleared rows down
    const newPlacedBlocksShiftDown = newPlacedBlocks
      .map((block) => {
        let countShifts = 0;
        for (let row = 0; row < block.type.length; row++) {
          const y = block.position.y + row * 10;

          // Check count if it > AND = each item, count++, e.g. fullRows = ["190", "180", "170"].
          countShifts = fullRows.filter((fullRow) => y <= fullRow).length;
        }
        // If no shifts needed, return the block as is
        if (countShifts === 0) return block;

        const newPosition = {
          x: block.position.x,
          y: block.position.y + 10 * countShifts,
        };
        const newBlock = { ...block, position: newPosition };

        return newBlock;
      })
      .filter(
        (block) =>
          block.type.length > 0 &&
          block.type.some((row) => row.some((cell) => cell === 1))
      ); // remove empty block and blocks with no filled cells

    // Set the new placed blocks after shifting down
    setTimeout(() => {
      setPlacedBlocks(newPlacedBlocksShiftDown); // Update the placed blocks with the new blocks
    }, 500);
  }, [placedBlocks, getAllFilledCells, tripleScore, currentSpeed]);

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

  // Checking at bottom
  const isAtBottom =
    blockPosition.y >= playGroundHeight - currentBlock.length * 10;

  // Default is rotating 90 degrees clockwise
  const rotateBlock = () => {
    if (!currentBlock || isPaused || isGameOver || disableButton || isAtBottom)
      return;

    // Logic to rotate the block
    const rotatedBlock = currentBlock[0].map((_, colIndex) =>
      currentBlock.map((row) => row[colIndex]).reverse()
    );

    // If reach bottom
    if (blockPosition.y >= playGroundHeight - rotateBlock.length * 10) {
      return; // to stop moveMent of block
    }

    // Find max length of the block

    const rotatedWidth = rotatedBlock[0].length;
    const rotatedHeight = rotatedBlock.length;
    let newX = blockPosition.x;
    // if already reach the boundary to the right, rotate inside the boundary
    if (blockPosition.x + rotatedWidth * 10 > playGroundWidth) {
      newX = playGroundWidth - rotatedWidth * 10;
    }

    // if collision detected, no allow rotate, before updating currentBlock to rotatedBlock
    if (collisionDetection(rotatedBlock, { ...blockPosition, x: newX })) {
      return;
    }

    // Update the current block with the rotated block
    setBlockPosition((prev) => ({
      ...prev,
      x: newX,
    })); // Prevent moving out of bounds
    setCurrentBlock(rotatedBlock);
    setDisableButton(false);
  };

  const moveLeft = useCallback(() => {
    if (!currentBlock || isPaused || isGameOver || disableButton || isAtBottom)
      return;

    const newPosition = {
      ...blockPosition,
      x: blockPosition.x - 10,
    };

    // Check boundaries and collisions
    if (newPosition.x < 0 || collisionDetection(currentBlock, newPosition)) {
      return;
    }

    setBlockPosition(newPosition);
  }, [
    currentBlock,
    isPaused,
    isGameOver,
    collisionDetection,
    disableButton,
    blockPosition,
    isAtBottom,
  ]);

  const moveRight = useCallback(() => {
    if (!currentBlock || isPaused || isGameOver || disableButton || isAtBottom)
      return;

    // Logic to move the block right

    const newPosition = {
      ...blockPosition,
      x: blockPosition.x + 10,
    };
    // Check boundaries and collisions
    const blockWidth = Math.max(...currentBlock.map((row) => row.length)) * 10; // Calculate the width of the current block
    const maxX = playGroundWidth - blockWidth;
    if (newPosition.x > maxX || collisionDetection(currentBlock, newPosition)) {
      return;
    }

    setBlockPosition(newPosition);
  }, [
    currentBlock,
    isPaused,
    isGameOver,
    collisionDetection,
    blockPosition,
    disableButton,
    isAtBottom,
  ]);

  const fetchNewBlock = useCallback(() => {
    setCurrentBlock(nextBlock);
    const newRandomPosition = randomPosition(nextBlock);
    setBlockPosition(newRandomPosition);
    setNextBlock(randomBlock());
    setDisableButton(false);
    setIsLongPressDown(false);
  }, [nextBlock]);

  const moveDown = useCallback(
    (speed = 1) => {
      // Check if game over
      gameOverDetection();

      if (isGameOver || isPaused || disableButton) return;

      let newPosition = {
        x: blockPosition.x,
        y: blockPosition.y + 10 * speed, // at vertically 10 more with speed fast
      };

      let hasCollision = collisionDetection(currentBlock, newPosition);
      // Checking is at bottom with speed
      const isAtBottomWSpeed =
        blockPosition.y >= playGroundHeight - currentBlock.length * 10 * speed;

      // Constrain when at bottom or has collision

      if (hasCollision || isAtBottomWSpeed) {
        /* If at bottom and maybe also being collision but cannot detect (get over boundary), 
        - move it to the bottom
        - Checking if collision, move newPosition 10 up backward, if not, leave it alone
        - Render the placedList lastly
        
        */
        setDisableButton(true);

        if (isAtBottomWSpeed) {
          // Let them at the bottom first
          newPosition = {
            ...blockPosition,
            y: playGroundHeight - currentBlock.length * 10,
          };
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

        // CHeck if the current block get over boundary: on top : y < 0

        const cleanedBlock = currentBlock.map((row, rIdx) => {
          const yRow = newPosition.y + rIdx * 10;
          if (yRow >= 0) return row;
          const newRow = row.map((cel) => 0);
          return newRow;
        });
        const newBlock = {
          // adding new as current block
          type: cleanedBlock,
          position: newPosition, // at new position, butt - 10 as collision occurs
        };

        const newPlacedBlocks = [...placedBlocks, newBlock];
        // Add current block to placedBlocks and spawn new one
        setPlacedBlocks(newPlacedBlocks);

        fetchNewBlock();

        return;
      }

      // If no collision and not at bottom, move down
      setBlockPosition((prev) => ({ ...prev, y: newPosition.y }));
    },
    [
      currentBlock,
      isPaused,
      isGameOver,
      collisionDetection,
      placedBlocks,
      gameOverDetection,
      disableButton,
      blockPosition,
      fetchNewBlock,
    ]
  );

  // When the screen is focused, reset the game
  useEffect(() => {
    if (!isFocused) {
      // Stop or pause the game
      setIsPaused(true);
      stopAllSounds(); // ADD this line for managing sound when not necessary playing
      return;
    }
    setIsPaused(false); // Resume the game when focused
  }, [isFocused]);

  // Use Effect for fullRowDection
  useEffect(() => {
    if (placedBlocks.length === 0) return;
    fullRowDetection(); // Check for full rows after placing blocks
  }, [placedBlocks, fullRowDetection]);

  useEffect(() => {
    if (needUpdateSpeed) {
      const newSpeed = timeSpeedTable.find((set) => set.time === time).speed;
      setCurrentSpeed(newSpeed);
      setNeedUpdateSpeed(false);
    }
  }, [needUpdateSpeed, setCurrentSpeed, time]);

  // Unified game loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    if (isLongPressDown) setTime(50); // Make time for faster speed
    if (currentSpeed !== normalSpeed.current) {
      const newTime = timeSpeedTable.find(
        (set) => set.speed === currentSpeed
      ).time;
      setTime(newTime); // Update time based on currentSpeed
      currentTime.current = newTime; // Update the currentTime ref
    } else setTime(currentTime.current); // Back to normal time
    // Animate the block down
    const gameInterval = setInterval(() => {
      moveDown(1);
    }, time);

    return () => {
      clearInterval(gameInterval);
    };
  }, [isPaused, isGameOver, moveDown, time, isLongPressDown, currentSpeed]);

  // Continuous left movement while holding the button
  useEffect(() => {
    if (!isMovingLeft || isPaused || isGameOver) return;

    const interval = setInterval(() => {
      moveLeft();
    }, 30); // Adjust speed (ms) for responsiveness

    return () => clearInterval(interval);
  }, [isMovingLeft, isPaused, isGameOver, moveLeft]);

  // Continuous right movement while holding the button
  useEffect(() => {
    if (!isMovingRight || isPaused || isGameOver) return;
    const interval = setInterval(() => {
      moveRight();
    }, 30); // Same as left for consistency

    return () => clearInterval(interval);
  }, [isMovingRight, isPaused, isGameOver, moveRight]);

  // ADD useEffect for sound management inside system
  useEffect(() => {
    const initializeSounds = async () => {
      await soundManager.initialize();
      await soundManager.loadSound(
        "horizontal",
        require("../assets/sounds/horizontal.wav")
      );
      await soundManager.loadSound(
        "clearRow",
        require("../assets/sounds/clearRow.wav")
      );
      await soundManager.loadSound(
        "levelUp",
        require("../assets/sounds/levelUp.wav")
      );
    };

    initializeSounds();

    return () => {
      soundManager.cleanup();
    };
  }, []);

  // For level up animation
  useEffect(() => {
    if (isLevelUp) {
      const timer = setTimeout(() => {
        playLevelUp(); // Play level up sound
        setIsLevelUp(false); // Reset after sound plays
      }, 300); // Delay before playing sound (300ms)
      return () => clearTimeout(timer); // Cleanup timer on unmount or when isLevelUp changes
    }
  }, [isLevelUp, playLevelUp]);

  const handleReset = useCallback(() => {
    const newBlock = randomBlock(); // Generate a new block
    const randomPositionReset = randomPosition(newBlock);
    setCurrentBlock(newBlock); // Reset the current block
    setBlockPosition(randomPositionReset);
    setPlacedBlocks([]); // Reset the placed blocks
    setScore(0); // Reset the scores
    setLevel(1);
    setIsGameOver(false); // Reset the game over state
    setIsPaused(false); // Reset the paused state
    setIsReset(true);
    setTime(defaultTime);
    setDisableButton(false);
    currentTime.current = defaultTime;
    setCurrentSpeed(1); // Reset the current speed
  }, [
    setCurrentBlock,
    setCurrentSpeed,
    setBlockPosition,
    setPlacedBlocks,
    setScore,
    setLevel,
    setIsGameOver,
    setIsPaused,
    setIsReset,
    setTime,
    setDisableButton,
  ]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleSound = async () => {
    if (isSoundOn) {
      // If sound is being turned OFF, stop all currently playing sounds
      await soundManager.stopAllSounds(); // Changed from your old stop functions
    }

    setIsSoundOn(!isSoundOn);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Heading */}
      <View style={{ height: 30 }}>
        <Text allowFontScaling={false} style={styles.heading}>
          Block Game
        </Text>
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
            {/* Render the grid of playGround */}
            <Grid />

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
            {/* Render fullRowDetected */}
            {fullRowsDetected.map((row, index) => (
              <View
                key={index}
                style={{
                  position: "absolute",
                  top: row,
                  left: 0,
                }}
              >
                <FullRow />
              </View>
            ))}

            {/* Level Up Animation */}
            {isLevelUp && (
              <View style={styles.levelUpContainer}>
                <Text style={styles.levelUpText}>Level Up!</Text>
              </View>
            )}

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
            <View style={styles.scoreRecordArea}>
              <Text allowFontScaling={false} style={styles.text}>
                Score: {score}{" "}
              </Text>
              <Text allowFontScaling={false} style={styles.text}>
                Level: {level}
              </Text>
              <Text allowFontScaling={false} style={styles.text}>
                Speed: {currentSpeed}
              </Text>
            </View>
            <View style={styles.previewNext}>
              <Text style={styles.text}>Preview Next</Text>
              <Block type={nextBlock} />
            </View>
            <View style={styles.statusIcons}>
              {isPaused ? (
                <MaterialCommunityIcons name="human" size={30} color="black" />
              ) : (
                <FontAwesome5 name="running" size={30} color="black" />
              )}

              {/* Sound icon */}

              <Ionicons
                name={isSoundOn ? "volume-high-sharp" : "volume-mute-sharp"}
                size={24}
                color="black"
              />
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
        {/* Up down Arrow & Rotate control */}
        <View style={styles.arrowArea}>
          {/* First row */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              moveDown(30);
              setTripleScore(3);
            }}
          >
            <Text>Quick</Text>
          </TouchableOpacity>

          {/* Second row: Left - icons - Right */}
          <View style={styles.movingButtonArea}>
            {/* Left */}
            <TouchableOpacity
              style={styles.leftRightButton}
              onPress={() => {
                // Always moveLeft
                moveLeft();
                playMoveHorizontal(); // add sounds

                const now = Date.now();
                if (rotationStartTime === null) {
                  // First press
                  setRotationStartTime(now);
                } else if (now - rotationStartTime <= time) {
                  // Still within period: allow rotation
                } else {
                  // Time expired: reset start time, block rotation this time
                  setRotationStartTime(now);
                  moveDown(1); // Must move down when reach time
                }
              }}
              onPressIn={() => setIsMovingLeft(true)}
              onPressOut={() => setIsMovingLeft(false)}
            >
              <Text>Left</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.arrowIconArea}>
              <AntDesign name="caretup" size={24} color="black" />
              <View style={styles.arrowLeftRight}>
                <AntDesign name="caretleft" size={24} color="black" />
                <AntDesign name="caretright" size={24} color="black" />
              </View>
              <AntDesign name="caretdown" size={24} color="black" />
            </View>

            {/* Right */}
            <TouchableOpacity
              style={styles.leftRightButton}
              onPress={() => {
                //Always move Right
                moveRight();
                playMoveHorizontal();
                const now = Date.now();

                if (rotationStartTime === null) {
                  // First press
                  setRotationStartTime(now);
                } else if (now - rotationStartTime <= time) {
                  // Still within period: allow rotation
                } else {
                  // Time expired: reset start time, block rotation this time
                  setRotationStartTime(now);
                  moveDown(1); // Must move down when reach the time
                }
              }}
              onPressIn={() => setIsMovingRight(true)}
              onPressOut={() => setIsMovingRight(false)}
            >
              <Text allowFontScaling={false} style={styles.text}>
                Right
              </Text>
            </TouchableOpacity>
          </View>

          {/* Third row: Down */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => moveDown(3)}
            onPressIn={() => setIsLongPressDown(true)}
            onPressOut={() => setIsLongPressDown(false)}
          >
            <Text allowFontScaling={false} style={styles.text}>
              Down
            </Text>
          </TouchableOpacity>
        </View>
        {/* Close Arrow Area */}
        {/* Setting: Pause, Sound, Reset */}
        <View style={styles.bottomHalfArea}>
          <View style={styles.settingArea}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePause}
            >
              <Text allowFontScaling={false} style={styles.text}>
                Pause
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSound}
            >
              <Text allowFontScaling={false} style={styles.text}>
                Sound
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.reset]}
              onPress={handleReset}
            >
              <Text allowFontScaling={false} style={styles.text}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            {/* Rotate button */}
            <TouchableOpacity
              style={styles.rotateButton}
              onPress={() => {
                // Always rotate
                rotateBlock();
                const now = Date.now();
                if (rotationStartTime === null) {
                  // First press
                  setRotationStartTime(now);
                } else if (now - rotationStartTime <= time) {
                  // Still within period: allow rotation
                } else {
                  // Time expired: reset start time, block rotation this time
                  setRotationStartTime(now);
                  moveDown(1); // Must move down when reach time
                }
              }}
            >
              <Text
                allowFontScaling={false}
                style={[styles.text, styles.rotateText]}
              >
                Rotate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingVertical: 10,
    fontFamily: "Arial, sans-serif, Helvetica Neue",
  },
  heading: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  mainPlayerSection: {
    flex: 0.95,
    width: "100%",
    gap: 2,
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    shadowColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  mainPlayerYardwithScore: {
    width: 300, // 78% + 10% each for blockList = 98% = width of the main Player section
    height: playGroundHeight + 5, // 400 px + 10 px for the border
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
    flexDirection: "row",
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
    width: "100%",
    height: "50%", // 65% (main player section) + 35% (control area):
    backgroundColor: "#87CEEB",
    borderRadius: 5,
    flexDirection: "row",
  },
  blockList: {
    paddingTop: 20,
    width: 40,
    height: "100%",
    backgroundColor: "#23CEEB",
    alignItems: "center",
  },
  playground: {
    width: playGroundWidth, //200 px; 20 boxes of 10 px each
    height: playGroundHeight, // 400 px: 40 boxes of 10 px each
    backgroundColor: "#F0F0E0",
    borderWidth: 1,
    shadowColor: "#000",
  },
  scoreRecord: {
    width: 95,
    height: "100%",
    backgroundColor: "#D3D3D3",
  },
  scoreRecordArea: {
    height: "30%",
  },
  text: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Arial, sans-serif, Helvetica Neue",
  },
  rotateText: {
    textAlign: "center",
  },
  previewNext: {
    height: "40%",
    alignItems: "center",
  },
  statusIcons: {
    height: "30%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
  },

  bottomHalfArea: {
    display: "flex",
  },
  settingArea: {
    width: width / 2,
    height: "30%",
    flexDirection: "row",
    gap: 5,
    // backgroundColor: "purple",
    alignItems: "center",
  },
  movingButtonArea: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  arrowArea: {
    width: "50%",
    height: "90%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "column",
  },
  arrowIconArea: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowLeftRight: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: "25%",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    width: "35%",
    height: "20%",
    backgroundColor: "#FFDD00", // yellow: full red + green
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftRightButton: {
    height: "60%",
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFDD00",
    borderRadius: 60,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  secondaryButton: {
    width: "30%",
    height: "50%",
    backgroundColor: "#70CC70", // lighter green
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
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

  rotateButton: {
    marginTop: 0,
    marginHorizontal: "auto",
    width: "70%",
    height: "60%",
    backgroundColor: "yellow",
    borderRadius: 90,
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 1,
    },
    shadowOpacity: 0.5,
    justifyContent: "center",
  },

  levelUpContainer: {
    position: "absolute",
    top: playGroundHeight / 2 - 50,
    left: playGroundWidth / 2 - 50,
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 255, 0, 0.8)", // Semi-transparent yellow
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    zIndex: 1,
  },
  levelUpText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
});
