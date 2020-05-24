import React from 'react';
import { Dimensions, Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import Animated, { Easing } from 'react-native-reanimated';
import { TapGestureHandler, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const {
  Value,
  event,
  block,
  cond,
  eq,
  set,
  Clock,
  startClock,
  stopClock,
  debug,
  timing,
  clockRunning,
  interpolate,
  Extrapolate
} = Animated;

function runTiming(clock, value, dest) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0)
  };

  const config = {
    duration: 1000,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease)
  };

  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, value),
      set(state.frameTime, 0),
      set(config.toValue, dest),
      startClock(clock)
    ]),
    timing(clock, state, config),
    cond(state.finished, debug('stop clock', stopClock(clock))),
    state.position
  ]);
}

class LoginApp extends React.Component {
  constructor() {
    super()
    this.buttonOpacity = new Value(1)
    this.onStateChange = event([
      {
        nativeEvent: ({ state }) =>
          block([cond(eq(state, State.END), set(this.buttonOpacity, runTiming(new Clock(), 1, 0)))])
      }
    ])
    this.buttonY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [100, 0],
      extrapolate: Extrapolate.CLAMP
    })
    this.bgY =  interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [-height / 3, 0],
      extrapolate: Extrapolate.CLAMP
    })

  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ ...styles.backgroundContainer, transform: [{ translateY: this.bgY }] }}>
          <Image
            source={require('../assets/images/bg.jpg')}
            style={styles.background}
          />
        </Animated.View>
        <View style={styles.buttonContainer}>
          <TapGestureHandler onHandlerStateChange={this.onStateChange}>
            <Animated.View
              style={{ ...styles.button, opacity: this.buttonOpacity, transform: [{ translateY: this.buttonY }] }}
            >
              <Text style={styles.buttonText}>SIGN IN</Text>
            </Animated.View>
          </TapGestureHandler>
          <Animated.View style={{...styles.button, backgroundColor: '#2E71DC', opacity: this.buttonOpacity, transform: [{ translateY: this.buttonY }] }}>
            <Text style={{...styles.buttonText, color: 'white'}}>SIGN IN WITH FACEBOOK</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }
}

// const LoginApp = () => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.backgroundContainer}>
//         <Image
//           source={require('../assets/images/bg.jpg')}
//           style={styles.background}
//         />
//       </View>
//       <View style={styles.buttonContainer}>
//         <TapGestureHandler onHandlerStateChange={onStateChange}>
//           <View style={styles.button}>
//             <Text style={styles.buttonText}>SIGN IN</Text>
//           </View>
//         </TapGestureHandler>
//         <View style={{...styles.button, backgroundColor: '#2E71DC'}}>
//           <Text style={{...styles.buttonText, color: 'white'}}>SIGN IN WITH FACEBOOK</Text>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-end',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFill,
    top: Constants.statusBarHeight,
  },
  background: {
    flex: 1,
    height: null,
    width: null,
  },
  buttonContainer: {
    height: height / 3,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: height / 35,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'white',
    height: height / 10,
    marginHorizontal: 20,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
});

export default LoginApp;
