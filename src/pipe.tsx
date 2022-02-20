import { Dimensions } from "react-native";
import React from "react";
import { pipeColor } from "./constants";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { height, width } = Dimensions.get("window");

const getRandomHeight = () => {
  "worklet";
  const total = height - height * 0.2 - 200;
  const first = total * Math.random();
  const second = total - first;
  return { first, second };
};

const Pipe = ({
  index,
  stop,
  ref1,
  ref2,
}: {
  index: number;
  stop: boolean;
  ref1: any;
  ref2: any;
}) => {
  const val = useSharedValue(0);
  const [state, setState] = React.useState({ first: 0, second: 0 });
  const backUp = useSharedValue(0);

  React.useEffect(() => {
    val.value = withRepeat(
      withSequence(
        withTiming(width + 90, { easing: Easing.exp, duration: 0 }),
        withTiming(
          -120,
          { duration: 2000, easing: Easing.linear },
          (isComp) => {
            if (isComp && !stop) {
              const f = getRandomHeight();
              runOnJS(setState)(f);
            }
          }
        )
      ),
      -1
    );
    if (stop) backUp.value = val.value;
  }, [stop]);

  const style = useAnimatedStyle(() => {
    return {
      left: stop ? backUp.value : val.value,
    };
  });
  return (
    <>
      <Animated.View
        style={[
          style,
          {
            position: "absolute",
            height: state.first,
            width: 60,
            backgroundColor: pipeColor,
            top: 0,
            left: 230 * (index + 1),
            zIndex: 0,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          },
        ]}
        ref={ref1}
      />
      <Animated.View
        style={[
          style,
          {
            position: "absolute",
            height: state.second,
            width: 60,
            backgroundColor: pipeColor,
            bottom: height * 0.2,
            left: 230 * (index + 1),
            zIndex: 0,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          },
        ]}
        ref={ref2}
      />
    </>
  );
};

export default React.memo(Pipe);
