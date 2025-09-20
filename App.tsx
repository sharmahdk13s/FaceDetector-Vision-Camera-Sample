import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  useCameraPermission,
  useMicrophonePermission,
  useCameraFormat
} from 'react-native-vision-camera';
import {
  useFaceDetector
} from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';

export default function App() {
  const cameraRef = useRef(null);
  const {width,height} = useWindowDimensions();
  const foundFaceCaptured = useRef<boolean>(false);
  const device = useCameraDevice('front');
  const format = useCameraFormat(device, [
  { photoResolution: { width: 1280, height: 720 } }
])
  const { hasPermission, requestPermission } = useCameraPermission()
  const { hasPermission: hasMicrophonePermission, requestPermission: microphonePermission } = useMicrophonePermission()
  const faceDetector = useFaceDetector({
    cameraFacing: 'front',
    autoMode: true, 
    classificationMode: 'none', 
    landmarkMode: 'none', 
    minFaceSize: 0.5, 
    contourMode: 'none', 
    performanceMode: 'fast', 
    trackingEnabled: false,
  });
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const handleFacesDetection = Worklets.createRunOnJS(
    async(result: DetectionResult) => {
       console.log('detection result', result);
      if(result && result.length > 0){
      const photo = await cameraRef.current?.takePhoto({
        flash: 'off',
        enableShutterSound: false,
        qualityPrioritization: 'quality'
      });
        console.log('photo...', photo);
        setCurrentPhoto(photo.path);
      }
    },
  );
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      const result = faceDetector.detectFaces(frame);
      if(result && result.length > 0 && !foundFaceCaptured.current){
          foundFaceCaptured.current = true;
          handleFacesDetection(result);
      }
    },
    [handleFacesDetection],
  );

   useEffect(() => {
    (async () => {
    if(!hasPermission){
      await requestPermission();
    }
    if(!hasMicrophonePermission){
       await microphonePermission();
    }
      console.log('permission..camera and microphone...', { hasPermission, hasMicrophonePermission });
    })();
  }, [hasPermission, hasMicrophonePermission, requestPermission, microphonePermission]);

    // Cleanup native listeners on unmount (Android)
  useEffect(() => {
    return () => {
      try {
        faceDetector?.stopListeners?.();
      } catch (e) {
        // no-op
      }
    };
  }, [faceDetector]);

  if(!hasPermission && !hasMicrophonePermission || !device){
    return  <Text>{'Please allow permissions then camera will starts...'}</Text>
  }

  return !currentPhoto ? (
    <View style={{ flex: 1 }}>
      {!!device ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          format={format}
          isActive={true}
          photo={true}
          photoQualityBalance='quality'
          frameProcessor={frameProcessor}
        />
      ) : (
        <Text>No Device</Text>
      )}
    </View>
  ) : <View style={{flex: 1}}>
    <Image source={{uri: `file://${currentPhoto}`}} style={{width: width, height: height - 20}} />
    <Pressable style={{position: 'absolute', right: 10, top: 10, padding: 15, backgroundColor: 'black'}} onPress={() => setCurrentPhoto(null)}>
      <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>{'X'}</Text>
    </Pressable>
  </View>;
}
