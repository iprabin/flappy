import {
  StyleSheet,
  Image,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import React from "react";
import { skyColor, groundColor } from "./constants";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Pipe from "./pipe";
import { checkIfColided, Position } from "./calc";
import * as Haptics from "expo-haptics";

const { height } = Dimensions.get("window");

const gravity = -20;
const speed = 120;

const getMeasured = (ref: any) => {
  if (ref.current) {
    return new Promise<Position>((resolve, reject) => {
      ref.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          resolve({ x, y, width, height, pageX, pageY });
        }
      );
    });
  } else return { x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 };
};

const MainPage = () => {
  const jumpValue = useSharedValue(height / 2);
  const xValue = useSharedValue(100);
  const [started, setStarted] = React.useState(false);
  const intra = React.useRef<NodeJS.Timer | null>(null);
  const [gameOver, setGameOver] = React.useState(false);
  const birdRef = React.useRef<any | null>(null);
  const pipeOneRef = React.useRef<any | null>(null);
  const pipeTwoRef = React.useRef<any | null>(null);
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    if (started) startTimer();
    return () => {
      if (intra.current) clearInterval(intra.current);
    };
  }, [started]);

  const startTimer = () => {
    intra.current = setInterval(async () => {
      jumpValue.value = withTiming(
        jumpValue.value + speed * 0.6 + (gravity / 2) * (0.6 ^ 2),
        {
          duration: 200,
          easing: Easing.linear,
        }
      );

      let pipeOne: Position = await getMeasured(pipeOneRef);
      let pipeTwo: Position = await getMeasured(pipeTwoRef);
      let bird: Position = await getMeasured(birdRef);

      if (checkIfColided(bird, pipeOne, pipeTwo)) {
        setGameOver(true);
        setStarted(false);
        clearTimeout(intra.current!);
        xValue.value = 80;
        jumpValue.value = withTiming(height, { duration: 1000 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      if (bird.x + bird.width > pipeTwo.x + pipeTwo.width && pipeTwo.x < -60) {
        calc();
      }
      if (jumpValue.value > height - height * 0.2) {
        setGameOver(true);
        setStarted(false);
        clearTimeout(intra.current!);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }, 120);
  };

  const calc = () => {
    setScore((s) => s + 1);
  };

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: jumpValue.value,
        },
        { translateX: withSpring(xValue.value) },
      ],
    };
  });

  const onPress = React.useCallback(() => {
    if (gameOver) return;
    if (!started) {
      setStarted(true);
    }
    if (intra.current) {
      clearInterval(intra.current);
    }
    jumpValue.value = withTiming(jumpValue.value - speed, {
      duration: 200,
      easing: Easing.linear,
    });

    startTimer();
  }, [gameOver, started]);

  const reset = React.useCallback(() => {
    setGameOver(false);
    setStarted(true);
    jumpValue.value = withTiming(height / 2, { duration: 0 });
    setScore(0);
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1} style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.sky} />
        <Pipe index={0} stop={!started} ref1={pipeOneRef} ref2={pipeTwoRef} />
        <View style={{ position: "absolute", top: 200, left: 0, right: 0 }}>
          {!gameOver && (
            <Text
              style={{
                fontSize: 22,
                textAlign: "center",
                position: "absolute",
                top: -90,
                left: 0,
                right: 0,
                zIndex: 99900,
              }}
            >
              {score}
            </Text>
          )}
          {gameOver && (
            <View style={{ position: "absolute", width: "100%" }}>
              <Text
                style={{ fontSize: 32, textAlign: "center", fontWeight: "700" }}
              >
                Game Over
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#fff",
                  marginHorizontal: 120,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 20,
                  padding: 10,
                  borderRadius: 5,
                }}
                onPress={reset}
              >
                <Text style={{ textAlign: "center", fontSize: 17 }}>
                  Play Again
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  marginHorizontal: 90,
                  marginTop: 40,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 22, textAlign: "center", width: 120 }}>
                  Highscore
                </Text>
                <Text style={{ fontSize: 22, textAlign: "center" }}>Score</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  marginHorizontal: 90,
                  marginTop: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 22, textAlign: "center", width: 90 }}>
                  22
                </Text>
                <Text style={{ fontSize: 22, textAlign: "center", width: 30 }}>
                  {score}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Animated.View style={[style, { position: "absolute" }]} ref={birdRef}>
          <Image
            source={require("../assets/yellowbird-midflap.png")}
            style={{ height: 35, width: 50 }}
          />
        </Animated.View>
        <View
          style={[
            styles.ground,
            { position: "absolute", bottom: 0, zIndex: 2 },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

export default MainPage;

const styles = StyleSheet.create({
  sky: {
    backgroundColor: skyColor,
    height: "80%",
    width: "100%",
    justifyContent: "center",
  },
  ground: { height: "20%", width: "100%", backgroundColor: groundColor },
});
