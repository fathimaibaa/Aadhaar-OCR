import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 blur-xl opacity-30 animate-gradient"></div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl p-6">
        {/* Title Section */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 tracking-wide leading-tight animate-fade-in-up">
          Aadhaar Verification<br />
          <span className="text-white">With <span className="text-pink-400"> OCR Technology</span></span>
        </h1>

        <p className="text-lg md:text-xl mt-4 text-gray-300 leading-relaxed animate-fade-in-up delay-200">
        One Click Aadhaar Verification
        </p>

        {/* Animated Aadhaar Cards */}
        <div className="relative mt-10 flex justify-center space-x-8 animate-fade-in-up delay-300">
          <div className="transform hover:scale-105 transition duration-500">
            <img
              src="https://aadhaarkyc.io/wp-content/uploads/2020/02/updated-aadhaar@4x-1-300x177.png"
              alt="Aadhaar Card Front"
              className="w-64 md:w-72 rounded-3xl shadow-2xl filter drop-shadow-xl"
            />
          </div>
          <div className="transform hover:scale-105 transition duration-500">
            <img
              src="https://qph.cf2.quoracdn.net/main-qimg-09995aeca5fc834dc24c5743348592fe"
              alt="Aadhaar Card Back"
              className="w-64 md:w-72 rounded-3xl shadow-2xl filter drop-shadow-xl"
            />
          </div>
        </div>

        {/* Button Section */}
        <div className="mt-12">
          <button
            className="relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 transition duration-300 tracking-wide"
            onClick={() => navigate('/home')}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Floating Dots Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-400 rounded-full opacity-20 blur-3xl animate-floating"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-3xl animate-floating-slow"></div>
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-30 blur-xl animate-floating-reverse"></div>
      </div>
    </div>
  );
};

export default Landing;
