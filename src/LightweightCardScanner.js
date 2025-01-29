import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
 
const LightweightCardScanner = () => {
  const webcamRef = useRef(null);
  const [ocrResult, setOcrResult] = useState('');
  const [message, setMessage] = useState('Center the card in the rectangle and hold steady');
 
  const videoConstraints = {
    facingMode: 'environment',
    width: { ideal: 640 },
    height: { ideal: 360 },
  };
 
  const autoCapture = () => {
    setMessage('Capturing...');
    const imageSrc = webcamRef.current.getScreenshot();
    processOCR(imageSrc);
  };
 
  const processOCR = (imageData) => {
    setMessage('Processing OCR...');
    Tesseract.recognize(imageData, 'eng', {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        setOcrResult(text);
        setMessage('Scan complete. Check results below.');
      })
      .catch((err) => {
        console.error(err);
        setMessage('Error during OCR processing.');
      });
  };
 
  return (
    <div style={{ textAlign: 'center', marginTop: 10 }}>
      <h3>{message}</h3>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Webcam Feed */}
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{
            width: '100%',
            maxWidth: 640,
            border: '2px solid red', // Visual guide
          }}
        />
        {/* Timer for Auto-Capture */}
        {setTimeout(() => {
          if (webcamRef.current) {
            autoCapture();
          }
        }, 3000)} {/* Capture every 3 seconds */}
      </div>
 
      {/* OCR Results */}
      {ocrResult && (
        <div style={{ marginTop: 20 }}>
          <h4>OCR Result</h4>
          <p>{ocrResult}</p>
        </div>
      )}
    </div>
  );
};
 
export default LightweightCardScanner;