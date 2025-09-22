import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Animated,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import {
  Face,
  useFaceDetector,
} from 'react-native-vision-camera-face-detector';
import { useRunOnJS } from 'react-native-worklets-core';

export default function App() {
  const cameraRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const foundFaceCaptured = useRef<boolean>(false);

  const device = useCameraDevice('front');
  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 720 } },
  ]);

  const { hasPermission, requestPermission } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: microphonePermission,
  } = useMicrophonePermission();

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

  const [faces, setFaces] = useState<Face[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

  // Handle face detection results
  const handleFacesDetection = useRunOnJS(async (result: Face[]) => {
    try {
      // console.log('detection result', result);
      setFaces(result || []);
      const photo = await cameraRef.current?.takePhoto({
        flash: 'off',
        enableShutterSound: false,
        qualityPrioritization: 'quality',
      });
      console.log('photo...', photo);
      setCurrentPhoto(photo.path);
    } catch (error) {
      // console.log('error...', error);
    }
  }, []);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      const result = faceDetector.detectFaces(frame);
      if (result && result.length > 0 && !foundFaceCaptured.current) {
        foundFaceCaptured.current = true;
        handleFacesDetection(result ?? []);
      }
    },
    [handleFacesDetection],
  );

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        await requestPermission();
      }
      if (!hasMicrophonePermission) {
        await microphonePermission();
      }
      console.log('permission..camera and microphone...', {
        hasPermission,
        hasMicrophonePermission,
      });
    })();
  }, [
    hasPermission,
    hasMicrophonePermission,
    requestPermission,
    microphonePermission,
  ]);

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

  if ((!hasPermission && !hasMicrophonePermission) || !device) {
    return <Text>{'Please allow permissions then camera will starts...'}</Text>;
  }

  return !currentPhoto ? (
    <View style={styles.container}>
      {!!device ? (
        <Fragment>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            format={format}
            isActive={true}
            photo={true}
            photoQualityBalance="quality"
            frameProcessor={frameProcessor}
          />
          {/* Face detection overlays */}
          {faces.map((face, index) => {
            return (
              <Animated.View
                key={index}
                style={[
                  styles.faceBox,
                  {
                    left: width - (face.bounds.x + face.bounds.width) * width, // mirror fix for front camera
                    top: face.bounds.y * height,
                    width: face.bounds.width * width,
                    height: face.bounds.height * height,
                  },
                ]}
              />
            );
          })}
        </Fragment>
      ) : (
        <Text>No Device</Text>
      )}
      ``
    </View>
  ) : (
    <View style={styles.container}>
      <Image
        source={{ uri: `file://${currentPhoto}` }}
        style={{ width: width, height: height - 20 }}
      />
      <Pressable
        style={styles.closeButton}
        onPress={() => setCurrentPhoto(null)}
      >
        <Text style={styles.closeText}>{'X'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  faceBox: {
    position: 'absolute',
    borderColor: 'lime',
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 15,
    backgroundColor: 'black',
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});
