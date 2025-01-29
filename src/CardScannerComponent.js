import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
 
const CardScannerComponent = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState('');
  const [message, setMessage] = useState('Center the card in the rectangle');
 
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isProcessing) {
        detectEdges();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isProcessing]);
 
  const detectEdges = () => {
const video = webcamRef.current.video;
    const canvas = canvasRef.current;
 
if (video && canvas && window.cv) {
const cv = window.cv; // Access OpenCV.js from global scope
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
 
      // Draw the video feed onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
 
      // Convert the canvas to an OpenCV Mat
      const src = cv.imread(canvas);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
 
      // Detect edges
      const edges = new cv.Mat();
      cv.Canny(gray, edges, 50, 150);
 
      // Count non-zero pixels in the rectangle area
      const rectX = canvas.width / 4;
      const rectY = canvas.height / 3;
      const rectWidth = canvas.width / 2;
      const rectHeight = canvas.height / 3;
 
      const rectRegion = edges.roi(new cv.Rect(rectX, rectY, rectWidth, rectHeight));
      const nonZeroCount = cv.countNonZero(rectRegion);
 
      // Draw the rectangle
      ctx.beginPath();
      ctx.rect(rectX, rectY, rectWidth, rectHeight);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'red';
      ctx.stroke();
 
      if (nonZeroCount > 2000) {
        autoCapture();
      }
 
      // Cleanup
      src.delete();
      gray.delete();
      edges.delete();
      rectRegion.delete();
    }
  };
 
  const autoCapture = () => {
    if (!isProcessing) {
      setIsProcessing(true);
      setMessage('Capturing...');
      const imageSrc = webcamRef.current.getScreenshot();
      processOCR(imageSrc);
    }
  };
 
  const processOCR = (image) => {
    Tesseract.recognize(image, 'eng', {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        setOcrResult(text);
        setMessage('Scan Complete');
        setIsProcessing(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage('Error processing OCR. Please try again.');
        setIsProcessing(false);
      });
  };
 
  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: 'environment'
        }}
        style={{ width: '100%', height: 'auto' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      ></canvas>
      <p>{message}</p>
      {ocrResult && (
        <div>
          <h3>OCR Result:</h3>
          <p>{ocrResult}</p>
        </div>
      )}
    </div>
  );
};
 
export default CardScannerComponent;