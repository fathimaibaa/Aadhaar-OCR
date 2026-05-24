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

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();

  // =========================
  // IMAGE UPLOAD
  // =========================

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

  // =========================
  // IMAGE PREPROCESSING
  // =========================

  const preprocessImage = (
    imageSrc: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();

      img.src = imageSrc;

      img.onload = () => {
        const canvas =
          document.createElement('canvas');

        const ctx =
          canvas.getContext('2d');

        const scale = 3;

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        if (ctx) {
          ctx.filter =
            'grayscale(100%) contrast(180%) brightness(120%)';

          ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }

        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  };

  // =========================
  // CLEAN OCR TEXT
  // =========================

  const cleanText = (text: string) => {
    return text
      .replace(/\r/g, '')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // =========================
  // EXTRACT AADHAAR NUMBER
  // =========================

  const extractAadhaarNumber = (
    text: string
  ) => {
    const regex =
      /\b\d{4}\s?\d{4}\s?\d{4}\b/;

    const match = text.match(regex);

    if (!match) return 'Not found';

    return match[0].replace(/\s+/g, ' ');
  };

  // =========================
  // EXTRACT DOB
  // =========================

  const extractDOB = (text: string) => {
    const regex =
      /\b\d{2}\/\d{2}\/\d{4}\b/;

    const match = text.match(regex);

    return match ? match[0] : 'Not found';
  };

  // =========================
  // EXTRACT GENDER
  // =========================

  const extractGender = (
    text: string
  ) => {
    const regex =
      /\b(Male|Female)\b/i;

    const match = text.match(regex);

    return match
      ? match[0]
      : 'Not found';
  };

  // =========================
  // EXTRACT NAME
  // =========================

  const extractName = (text: string) => {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2);

    const ignoreWords = [
      'government',
      'india',
      'aadhaar',
      'authority',
      'male',
      'female',
      'dob',
      'year',
      'birth',
      'unique',
      'identification',
    ];

    for (const line of lines) {
      const lower =
        line.toLowerCase();

      const containsIgnored =
        ignoreWords.some(word =>
          lower.includes(word)
        );

      if (containsIgnored)
        continue;

      const validName =
        /^[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+$/.test(
          line
        );

      if (validName) {
        return line;
      }
    }

    return 'Not found';
  };

  // =========================
  // EXTRACT ADDRESS
  // =========================

  const extractAddress = (
    text: string
  ) => {
    const lower =
      text.toLowerCase();

    const index =
      lower.indexOf('address');

    if (index === -1)
      return 'Not found';

    let address =
      text.slice(index);

    address = address
      .replace(/Address[:\-]*/gi, '')
      .replace(
        /www\.uidai\.gov\.in/gi,
        ''
      )
      .replace(
        /help@uidai\.gov\.in/gi,
        ''
      )
      .replace(
        /VID.*$/gi,
        ''
      )
      .replace(
        /1947/gi,
        ''
      )
      .replace(
        /[^\w\s,./()-]/g,
        ''
      )
      .replace(/\s+/g, ' ')
      .trim();

    return address;
  };

  // =========================
  // OCR PROCESS
  // =========================

  const handleOcrProcess =
    async () => {
      if (
        !frontImage ||
        !backImage
      ) {
        setError(
          'Upload both images.'
        );

        return;
      }

      setLoading(true);

      setError(null);

      try {
        // PREPROCESS

        const processedFront =
          await preprocessImage(
            frontImage
          );

        const processedBack =
          await preprocessImage(
            backImage
          );

        // FRONT OCR

        const frontResult =
          await Tesseract.recognize(
            processedFront,
            'eng',
            {
              logger: m =>
                console.log(m),
            }
          );

        // BACK OCR

        const backResult =
          await Tesseract.recognize(
            processedBack,
            'eng+mal',
            {
              logger: m =>
                console.log(m),
            }
          );

        console.log(
          'FRONT OCR:',
          frontResult.data.text
        );

        console.log(
          'BACK OCR:',
          backResult.data.text
        );

        const frontText =
          cleanText(
            frontResult.data.text
          );

        const backText =
          cleanText(
            backResult.data.text
          );

        const combinedText =
          frontText +
          ' ' +
          backText;

        const extractedData: AadhaarData =
          {
            name: extractName(
              frontResult.data.text
            ),

            aadhaarNumber:
              extractAadhaarNumber(
                combinedText
              ),

            dob: extractDOB(
              frontResult.data.text
            ),

            gender:
              extractGender(
                frontResult.data.text
              ),

            address:
              extractAddress(
                backResult.data.text
              ),
          };

        setAadhaarData(
          extractedData
        );

        dispatch(
          setAadhaarDetails(
            extractedData
          )
        );
      } catch (err) {
        console.error(
          'OCR ERROR:',
          err
        );

        setError(
          'OCR failed.'
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

        {/* FRONT */}

        <div className="w-80">

          <label className="flex flex-col items-center justify-center w-full h-64 bg-white shadow-lg rounded-xl border border-gray-200 cursor-pointer hover:shadow-xl transition overflow-hidden">

            <span className="text-gray-600 mb-2 font-medium">
              Upload Front Image
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange(
                  e,
                  'front'
                )
              }
              className="hidden"
            />

            {frontImage ? (
              <img
                src={frontImage}
                alt="Front Aadhaar"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-400">
                Click to upload
              </div>
            )}
          </label>
        </div>

        {/* BACK */}

        <div className="w-80">

          <label className="flex flex-col items-center justify-center w-full h-64 bg-white shadow-lg rounded-xl border border-gray-200 cursor-pointer hover:shadow-xl transition overflow-hidden">

            <span className="text-gray-600 mb-2 font-medium">
              Upload Back Image
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange(
                  e,
                  'back'
                )
              }
              className="hidden"
            />

            {backImage ? (
              <img
                src={backImage}
                alt="Back Aadhaar"
                className="w-full h-full object-contain"
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
        onClick={
          handleOcrProcess
        }
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
              {
                aadhaarData.name
              }
            </p>

            <p>
              <strong>
                Aadhaar Number:
              </strong>{' '}
              {
                aadhaarData.aadhaarNumber
              }
            </p>

            <p>
              <strong>
                Date of Birth:
              </strong>{' '}
              {
                aadhaarData.dob
              }
            </p>

            <p>
              <strong>
                Gender:
              </strong>{' '}
              {
                aadhaarData.gender
              }
            </p>

            <p>
              <strong>
                Address:
              </strong>{' '}
              {
                aadhaarData.address
              }
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