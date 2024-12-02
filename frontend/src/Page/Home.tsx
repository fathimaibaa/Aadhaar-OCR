import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAadhaarDetails, setUploadedImage } from '../utils/context/Reducers/authSlice';
import Tesseract from 'tesseract.js';

interface AadhaarData {
  name: string;
  aadhaarNumber: string;
  dob: string;
  gender: string;
  address: string;
}

const Home: React.FC = () => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [aadhaarData, setAadhaarData] = useState<AadhaarData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const image = reader.result as string;
        if (side === 'front') {
          setFrontImage(image);
        } else {
          setBackImage(image);
        }
        dispatch(setUploadedImage(image));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOcrProcess = () => {
    setLoading(true);
    setError(null);

    const ocrPromises = [frontImage, backImage].map((image, index) =>
      Tesseract.recognize(
        image as string,
        'eng',
        {
          logger: (m: any) => console.log(m),
        }
      ).then((result: Tesseract.RecognizeResult) => ({
        side: index === 0 ? 'front' : 'back',
        text: result.data.text,
      }))
    );

    Promise.all(ocrPromises)
      .then((results) => {
        const frontText = results.find((r: { side: string; text: string }) => r.side === 'front')?.text || '';
        const backText = results.find((r: { side: string; text: string }) => r.side === 'back')?.text || '';
        const combinedText = frontText + ' ' + backText;

        const aadhaarNumberPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
        const namePattern = /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/m;
        const dobPattern = /\b\d{2}\/\d{2}\/\d{4}\b/;
        const genderPattern = /\b(Male|Female)\b/i;
        const addressPattern = /(?:Address\s*[:\-]?\s*(.*?)(?:\d{6}|$))/is;

        const extractedData: AadhaarData = {
          name: 'Not found',
          aadhaarNumber: combinedText.match(aadhaarNumberPattern)?.[0]?.replace(/\s/g, ' ') || 'Not found',
          dob: 'Not found',
          gender: 'Not found',
          address: 'Not found',
        };

        const nameMatch = frontText.match(namePattern);
        if (nameMatch) {
          extractedData.name = nameMatch[1].trim();
        }

        const dobMatch = frontText.match(dobPattern);
        if (dobMatch) {
          extractedData.dob = dobMatch[0];
        }

        const genderMatch = frontText.match(genderPattern);
        if (genderMatch) {
          extractedData.gender = genderMatch[0];
        }

        const addressMatch = backText.match(addressPattern);
        if (addressMatch) {
          let address = addressMatch[1]
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          address = address.replace(/[^\w\s,.-]/g, '').trim();
          extractedData.address = address;
        }

        setAadhaarData(extractedData);
        dispatch(setAadhaarDetails(extractedData));
      })
      .catch((error) => {
        console.error('OCR Error:', error);
        setError('Failed to process the Aadhaar card. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Aadhaar OCR Verification</h1>

      <div className="flex flex-wrap justify-center gap-8 mb-10">
        <div className="w-80">
          <label className="flex flex-col items-center justify-center w-full h-48 bg-white shadow-lg rounded-xl border border-gray-200 cursor-pointer hover:shadow-xl transition">
            <span className="text-gray-600 mb-2 font-medium">Upload Front Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'front')}
              className="hidden"
            />
            {frontImage ? (
              <img src={frontImage} alt="Front Aadhaar" className="w-full h-48 object-cover rounded-md" />
            ) : (
              <div className="text-gray-400">Click to upload or drag image here</div>
            )}
          </label>
        </div>

        <div className="w-80">
          <label className="flex flex-col items-center justify-center w-full h-48 bg-white shadow-lg rounded-xl border border-gray-200 cursor-pointer hover:shadow-xl transition">
            <span className="text-gray-600 mb-2 font-medium">Upload Back Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'back')}
              className="hidden"
            />
            {backImage ? (
              <img src={backImage} alt="Back Aadhaar" className="w-full h-48 object-cover rounded-md" />
            ) : (
              <div className="text-gray-400">Click to upload or drag image here</div>
            )}
          </label>
        </div>
      </div>

      <button
        className={`px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition ${
          loading ? 'cursor-not-allowed opacity-50' : ''
        }`}
        onClick={handleOcrProcess}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Process Aadhaar'}
      </button>

      {aadhaarData && (
        <div className="mt-10 p-6 bg-white shadow-xl rounded-xl w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Extracted Aadhaar Details</h2>
          <div className="space-y-2">
            <p><strong className="text-gray-700">Name:</strong> {aadhaarData.name}</p>
            <p><strong className="text-gray-700">Aadhaar Number:</strong> {aadhaarData.aadhaarNumber}</p>
            <p><strong className="text-gray-700">Date of Birth:</strong> {aadhaarData.dob}</p>
            <p><strong className="text-gray-700">Gender:</strong> {aadhaarData.gender}</p>
            <p><strong className="text-gray-700">Address:</strong> {aadhaarData.address}</p>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-6 text-center">{error}</p>}
    </div>
  );
};

export default Home;
