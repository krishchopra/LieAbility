# Computer Vision Implementation for LieAbility Interview App

This document outlines the computer vision (CV) and related analysis techniques used in the LieAbility interview application.

## 1. Core Technology Stack

- **Facial Landmark Detection**: `@tensorflow-models/face-landmarks-detection` (using the MediaPipe Face Mesh model).
  - Provides 468 3D facial landmarks.
  - Configuration: `runtime: 'tfjs'`, `refineLandmarks: false` (for performance), `maxFaces: 1`.
- **TensorFlow.js**: Core library for running the MediaPipe model in the browser.
- **Speech Recognition**: Web Speech API (`window.SpeechRecognition` or `window.webkitSpeechRecognition`).
- **Sentiment Analysis**: `sentiment` library (v5.0.2).
- **Natural Language Processing (NLP)**: `compromise` library (v14.10.0) for analyzing speech patterns (e.g., filler words).

## 2. Facial Analysis (`AnalysisService.ts`)

### 2.1. Initialization

- The `AnalysisService` initializes TensorFlow.js and loads the MediaPipe Face Mesh model.
- The model is configured for performance by disabling `refineLandmarks`.

### 2.2. Landmark Detection

- The `analyzeFacialExpressions` method takes an `HTMLVideoElement` as input.
- It checks if the video element is ready (readyState, dimensions, currentTime) before proceeding.
- To ensure the correct frame is processed, the current video frame is drawn to a temporary internal canvas, and this canvas is passed to the `detector.estimateFaces()` method.
- If no faces are detected, mock analysis data is returned to ensure the UI remains responsive.
- Detected MediaPipe landmarks (x, y coordinates, potentially z) are processed.
  - A bounding box for the face is derived from the landmarks if not directly provided by the model.

### 2.3. Emotion Extraction (Simplified)

- Emotion extraction logic is implemented in `extractEmotions`
- It primarily uses the mouth curvature (derived from landmarks 61, 291, 13, 14 relative to face height) to estimate happiness and sadness.
- Other emotions (anger, fear, surprise, disgust) are given small, relatively fixed values, and a base neutral value is included.
- Confidence is currently set to a fixed high value (0.8) when landmarks are sufficient.
- A fallback with even more basic emotion values is used if fewer than 200 landmarks are available.

### 2.4. Micro-Expression Analysis

- `analyzeMicroExpressions` calculates authenticity and confidence based on the variability of emotions over a short history (last 5 frames).
- Lower change in primary emotions (happiness, sadness, anger) is interpreted as higher authenticity/stability.

## 3. Speech Analysis (`AnalysisService.ts`)

### 3.1. Recognition and Transcription

- Uses the browser's Web Speech API for real-time speech-to-text.
- Collects interim and final transcripts.

### 3.2. Linguistic Analysis

- `analyzeSpeech` processes the final transcript for:
  - **Sentiment**: Uses the `sentiment` library.
  - **Confidence**: Derived from the absolute sentiment score.
  - **Filler Word Ratio**: Uses `compromise` to identify and count filler words relative to total words.
  - **Speech Rate**: Basic count of words per utterance (can be expanded).

## 4. Scoring (`AnalysisService.ts`)

- `generateAuthenticityScore` combines facial and speech analysis into an overall score and a breakdown.
  - **Facial Score**: Based on average emotion confidence and emotional stability.
  - **Speech Score**: Based on average speech confidence and a penalty for filler words.
  - **Overall Score**: Weighted average (currently 60% facial, 40% speech).
  - **Breakdown Scores**:
    - `microExpressions`: Based on `calculateMicroExpressionAuthenticity` (consistency and natural variation in happiness over 10 frames).
    - `sentiment`: Average sentiment score from speech.
    - `coherence`: Derived from filler word ratio (lower fillers = higher coherence).
    - `confidence`: Combined facial and speech confidence.

## 5. UI Overlay (`AnalysisOverlay.tsx`)

### 5.1. Rendering Setup

- Uses an HTML5 Canvas overlaid on the video element.
- Canvas is mirrored (`transform: scaleX(-1)`) to match the mirrored video feed.

### 5.2. Landmark Scaling and Transformation

- The `scaleLandmark` function handles the transformation of landmark coordinates from the model (which can be normalized 0-1 or native video pixels) to the canvas display coordinates.
- It accounts for CSS `object-fit` properties of the video element to correctly scale and position landmarks on the canvas, whether the video is letterboxed, pillarboxed, or scaled to fill.
- Crucially, it also reverses the horizontal mirroring for display, so landmarks appear correctly on the user's mirrored video.

### 5.3. Visual Elements

- **Key Points & Head Pose**: If 400+ landmarks are available:
  - Draws 6 key facial landmarks (derived from indices `[1, 9, 57, 130, 287, 359]`) as prominent green dots with a glow effect.
  - Draws a simple face outline connecting these key points (green, semi-transparent).
  - Draws a vertical line from nose tip to chin (green, semi-transparent) for head orientation.
  - Draws a horizontal line connecting the eyes (green, semi-transparent).
  - Draws an orange arrow indicating head direction, calculated from the nose tip and chin landmarks.
- **Detailed Facial Mesh**: If 400+ landmarks are available:
  - Uses a helper function `drawLandmarkPath` to render connected lines for various facial features.
  - Predefined `MESH_LANDMARK_GROUPS` map feature names (e.g., `lipsOuter`, `leftEye`, `nose`) to their corresponding MediaPipe landmark indices.
  - Lips (outer and inner), eye outlines, eyebrow lines, and a nose line are drawn with a moderately opaque white line (`#ffffff88`, 1.5px width).
  - A simplified face oval is drawn with a more transparent white line (`#ffffff55`, 1.5px width).
  - These mesh lines have no shadow/glow to keep them distinct from the key points.
- **Fallback**: If fewer than 400 (but at least 6) landmarks are detected, it draws all available landmarks as smaller green dots with basic connecting lines.
- **Status Indicators**: Simple text badges for "Face: DETECTED" and "🎤 Listening" are shown in corners.
- **Searching Indicator**: An animated scanning graphic is shown if no facial analysis data is available yet.

## 6. Current State & Focus

- The system successfully uses MediaPipe Face Mesh for robust landmark detection.
- The overlay correctly scales and mirrors landmarks onto the video feed.
- A multi-layered facial mesh is rendered:
  - Prominent key points and head pose lines in green/orange.
  - Subtler, more detailed mesh lines for facial features in semi-transparent white.
- Debug logging has been removed for cleaner console output.

This provides a good foundation for further enhancements to the analysis and visualization.
