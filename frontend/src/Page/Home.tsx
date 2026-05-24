import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  setAadhaarDetails,
  setUploadedImage,
} from '../utils/context/Reducers/authSlice';

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

  const [aadhaarData, setAadhaarData] =
    useState<AadhaarData | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

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
  };

  const cleanText = (text: string) => {
    return text
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[|]/g, '')
      .trim();
  };

  const extractName = (text: string) => {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2);

    const ignoreWords = [
      'government',
      'india',
      'aadhaar',
      'unique',
      'identification',
      'authority',
      'male',
      'female',
      'dob',
      'year',
      'birth',
    ];

    for (const line of lines) {
      const lower = line.toLowerCase();

      const containsIgnoreWord = ignoreWords.some(word =>
        lower.includes(word)
      );

      if (containsIgnoreWord) continue;

      const isValidName =
        /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)+$/.test(line);

      if (isValidName) {
        return line;
      }
    }

    return 'Not found';
  };

  const extractDOB = (text: string) => {
    const dobRegex =
      /\b\d{2}\/\d{2}\/\d{4}\b/;

    const match = text.match(dobRegex);

    return match ? match[0] : 'Not found';
  };

  const extractGender = (text: string) => {
    const genderRegex =
      /\b(Male|Female)\b/i;

    const match = text.match(genderRegex);

    return match ? match[0] : 'Not found';
  };

  const extractAadhaarNumber = (text: string) => {
    const aadhaarRegex =
      /\b\d{4}\s?\d{4}\s?\d{4}\b/;

    const match = text.match(aadhaarRegex);

    if (!match) return 'Not found';

    return match[0].replace(/\s+/g, ' ');
  };

  const extractAddress = (text: string) => {
    const lowerText = text.toLowerCase();

    const addressIndex =
      lowerText.indexOf('address');

    if (addressIndex === -1) {
      return 'Not found';
    }

    let address = text.slice(addressIndex + 7);

    address = address
      .replace(/www\.uidai\.gov\.in/gi, '')
      .replace(/help@uidai\.gov\.in/gi, '')
      .replace(/[^\w\s,./-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return address || 'Not found';
  };

  const handleOcrProcess = async () => {
    if (!frontImage || !backImage) {
      setError('Please upload both front and back Aadhaar images.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const frontResult =
        await Tesseract.recognize(
          frontImage,
          'eng',
          {
            logger: m => console.log(m),
          }
        );

      const backResult =
        await Tesseract.recognize(
          backImage,
          'eng',
          {
            logger: m => console.log(m),
          }
        );

      const frontText = cleanText(
        frontResult.data.text
      );

      const backText = cleanText(
        backResult.data.text
      );

      console.log('FRONT OCR:', frontText);
      console.log('BACK OCR:', backText);

      const combinedText =
        frontText + ' ' + backText;

      const extractedData: AadhaarData = {
        name: extractName(frontResult.data.text),
        aadhaarNumber:
          extractAadhaarNumber(combinedText),
        dob: extractDOB(frontResult.data.text),
        gender: extractGender(frontResult.data.text),
        address: extractAddress(backResult.data.text),
      };

      setAadhaarData(extractedData);

      dispatch(setAadhaarDetails(extractedData));
    } catch (err) {
      console.error('OCR Error:', err);

      setError(
        'Failed to process Aadhaar card.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center py-10">

      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Aadhaar OCR Verification
      </h1>

      <div className="flex flex-wrap justify-center gap-8 mb-10">

        <div className="w-80">
          <label className="flex flex-col items-center justify-center w-full h-48 bg-white shadow-lg rounded-xl border border-gray-200 cursor-pointer hover:shadow-xl transition">

            <span className="text-gray-600 mb-2 font-medium">
              Upload Front Image
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange(e, 'front')
              }
              className="hidden"
            />

            {frontImage ? (
              <img
                src={frontImage}
                alt="Front Aadhaar"
                className="w-full h-48 object-cover rounded-md"
              />
            ) : (
              <div className="text-gray-400">
                Click to upload
              </div>
            )}
          </label>
        </div>

        <div className="w-80">
          <label className="flex flex-col items-center justify-center w-full h-48 bg-white shadow-lg rounded-xl border border-gray-200 cursor-pointer hover:shadow-xl transition">

            <span className="text-gray-600 mb-2 font-medium">
              Upload Back Image
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange(e, 'back')
              }
              className="hidden"
            />

            {backImage ? (
              <img
                src={backImage}
                alt="Back Aadhaar"
                className="w-full h-48 object-cover rounded-md"
              />
            ) : (
              <div className="text-gray-400">
                Click to upload
              </div>
            )}
          </label>
        </div>
      </div>

      <button
        className={`px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition ${
          loading
            ? 'cursor-not-allowed opacity-50'
            : ''
        }`}
        onClick={handleOcrProcess}
        disabled={loading}
      >
        {loading
          ? 'Processing...'
          : 'Process Aadhaar'}
      </button>

      {aadhaarData && (
        <div className="mt-10 p-6 bg-white shadow-xl rounded-xl w-full max-w-2xl">

          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Extracted Aadhaar Details
          </h2>

          <div className="space-y-2">
            <p>
              <strong>Name:</strong>{' '}
              {aadhaarData.name}
            </p>

            <p>
              <strong>Aadhaar Number:</strong>{' '}
              {aadhaarData.aadhaarNumber}
            </p>

            <p>
              <strong>Date of Birth:</strong>{' '}
              {aadhaarData.dob}
            </p>

            <p>
              <strong>Gender:</strong>{' '}
              {aadhaarData.gender}
            </p>

            <p>
              <strong>Address:</strong>{' '}
              {aadhaarData.address}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 mt-6">
          {error}
        </p>
      )}
    </div>
  );
};

export default Home;