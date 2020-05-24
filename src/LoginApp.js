import React from 'react';
import { TextInput, Dimensions, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Image, Circle, ClipPath } from 'react-native-svg';
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
  Extrapolate,
  concat
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
    this.onCloseState = event([
      {
        nativeEvent: ({ state }) =>
          block([cond(eq(state, State.END), set(this.buttonOpacity, runTiming(new Clock(), 0, 1)))])
      }
    ])
    this.buttonY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [100, 0],
      extrapolate: Extrapolate.CLAMP
    })
    this.bgY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [-height / 3 - 50, 0],
      extrapolate: Extrapolate.CLAMP
    })
    this.textInputZindex = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, -1],
      extrapolate: Extrapolate.CLAMP
    })
    this.textInputY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, 100],
      extrapolate: Extrapolate.CLAMP
    })
    this.textInputOpacity = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, 0],
      extrapolate: Extrapolate.CLAMP
    })
    this.rotateCross = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [180, 360],
      extrapolate: Extrapolate.CLAMP
    })
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ ...styles.backgroundContainer, transform: [{ translateY: this.bgY }] }}>
          <Svg height={height+50} width={width}>
            <ClipPath id='clip'>
              <Circle r={height+50} cx={width / 2} />
            </ClipPath>
            <Image
              href={require('../assets/images/bg.jpg')}
              height={height+50}
              width={width}
              preserveAspectRatio='xMidYMid slice'
              clipPath='url(#clip)'
            />
          </Svg>
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
          <Animated.View
            style={{
              ...styles.form,
              zIndex: this.textInputZindex,
              opacity: this.textInputOpacity,
              transform: [{ translateY: this.textInputY }],
            }}
          >
            <TapGestureHandler
              onHandlerStateChange={this.onCloseState}
            >
              <Animated.View style={styles.buttonClose}>
                <Animated.Text
                  style={{ fontSize: 15, transform: [{ rotate: concat(this.rotateCross, 'deg') }] }}>X</Animated.Text>
              </Animated.View>
            </TapGestureHandler>
            <TextInput
              placeholder='EMAIL'
              style={styles.textInput}
              placeholderTextColor='black'
            />
            <TextInput
              placeholder='PASSWORD'
              style={styles.textInput}
              placeholderTextColor='black'
            />
            <Animated.View
              style={styles.button}
            >
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>SIGN IN</Text>
            </Animated.View>
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
  buttonClose: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -2,
    left: width / 2 - 20,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 2,
  },
  button: {
    backgroundColor: 'white',
    height: height / 10,
    marginHorizontal: 20,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 2,
  },
  form: {
    height: height / 3,
    ...StyleSheet.absoluteFill,
    top: null,
    justifyContent: 'center',
  },
  textInput: {
    height: 50,
    borderRadius: 25,
    borderWidth: 0.5,
    marginHorizontal: 20,
    paddingLeft: 10,
    marginVertical: 5,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
});

export default LoginApp;
