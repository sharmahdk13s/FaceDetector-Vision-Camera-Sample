# 📸 Face Detector POC – React Native Vision Camera

This is a **Proof of Concept (POC)** showcasing **real-time face detection** in a React Native app using [react-native-vision-camera](https://github.com/cuvent/react-native-vision-camera) and the [react-native-vision-camera-face-detector](https://github.com/luicfrr/react-native-vision-camera-face-detector) plugin.

It demonstrates how to use **Frame Processors** with **Worklets Core** for efficient on-device ML face detection.

---

## 🚀 Features

- 🔍 Detects faces in real-time
- 🧑‍🤝‍🧑 Supports multiple faces simultaneously
- 🎯 Provides face bounds, landmarks, and contours
- ⚡ 100% on-device ML (works offline)
- 📱 iOS & Android supported
- ✅ Compatible with **React Native New Architecture**

---

## 🛠️ Tech Stack

- **React Native** `0.81.4`
- **react-native-vision-camera** `^4.7.2`
- **react-native-vision-camera-face-detector** `^1.8.9`
- **react-native-worklets-core** `^1.6.2`

---

## 📦 Installation

1. Install dependencies:

```sh
yarn install
```

2. iOS setup:

```sh
cd ios && pod install
```

3. Android setup:  
   Ensure your `android/build.gradle` has:

```gradle
minSdkVersion = 24
```

---

## ⚙️ Babel Config

Your `babel.config.js` already has Worklets Core enabled:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [['react-native-worklets-core/plugin']],
};
```

This means you don’t need `react-native-reanimated/plugin` – everything runs via **Worklets Core**.

---

## 🧪 Tested On

- ✅ iOS 17+ (Xcode 15.4)
- ✅ Android 13+ (CameraX)

---

## 📌 Notes

- Requires **camera permission** (`Info.plist` and `AndroidManifest.xml`)
- Runs better on **physical devices** than emulators
- Use `fps={5}` to balance CPU load

---

## 📄 License

This POC is for demo and learning purposes. MIT License.
