'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const slideVariants = {
  enter: { x: 1000, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -1000, opacity: 0 },
};

const slides = [
  {
    id: 'intro',
    content: (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-7xl font-bold mb-8">RunJudge 🏃‍♂️</h1>
        <p className="text-2xl text-gray-300 text-center max-w-3xl">
          An AI-powered judge for social fitness challenges that verifies Strava
          runs while funds are staked.
        </p>
        <p className="text-xl text-gray-400 mt-8 italic">
          Think of it as a decentralized fitness escrow with a sassy personality
          that won&apos;t let you get away with taking the bus. 🚌
        </p>
      </div>
    ),
  },
  {
    id: 'problem',
    content: (
      <div className="space-y-8">
        <h2 className="text-5xl font-bold mb-12">The Problem 🤔</h2>
        <ul className="space-y-6">
          <li className="flex items-center text-2xl">
            <span className="text-red-400 mr-4">❌</span>
            Fitness challenges with friends lack accountability
          </li>
          <li className="flex items-center text-2xl">
            <span className="text-red-400 mr-4">❌</span>
            No way to verify if someone actually ran or took the bus
          </li>
          <li className="flex items-center text-2xl">
            <span className="text-red-400 mr-4">❌</span>
            Manual verification is time-consuming and unreliable
          </li>
          <li className="flex items-center text-2xl">
            <span className="text-red-400 mr-4">❌</span>
            Managing prize pools and payouts is complicated
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'solution',
    content: (
      <div className="space-y-8">
        <h2 className="text-5xl font-bold mb-12">Our Solution 💡</h2>
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 rounded-2xl">
          <p className="text-3xl leading-relaxed">
            A decentralized fitness escrow with AI verification that makes
            running challenges fun, fair, and rewarding!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'features',
    content: (
      <div className="space-y-12">
        <h2 className="text-5xl font-bold">Key Features 🚀</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-blue-900/50 to-blue-900/20 p-6 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">
              AI-Powered Verification 🤖
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li>• Real-time Strava analysis</li>
              <li>• Heart rate data verification</li>
              <li>• Pace normalization</li>
              <li>• Suspicious activity detection</li>
            </ul>
          </div>
          <div className="bg-gradient-to-b from-green-900/50 to-green-900/20 p-6 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">USDC Prize Pools 💰</h3>
            <ul className="space-y-3 text-gray-300">
              <li>• Stake USDC on Base</li>
              <li>• Automated distribution</li>
              <li>• Gasless transactions</li>
              <li>• No crypto knowledge needed</li>
            </ul>
          </div>
          <div className="bg-gradient-to-b from-purple-900/50 to-purple-900/20 p-6 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">Smart Analysis ❤️</h3>
            <ul className="space-y-3 text-gray-300">
              <li>• Heart rate verification</li>
              <li>• Pace normalization</li>
              <li>• Route validation</li>
              <li>• Real-time tracking</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'tech',
    content: (
      <div className="space-y-12">
        <h2 className="text-5xl font-bold">Technical Deep Dive 🛠</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-6">Architecture</h3>
            <ul className="space-y-4 text-xl">
              <li className="flex items-center">
                <span className="text-blue-400 mr-4">1.</span>
                Next.js frontend with OnchainKit
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 mr-4">2.</span>
                AI agent powered by Coinbase Agent Kit
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 mr-4">3.</span>
                Smart contracts on Base
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 mr-4">4.</span>
                The Graph for challenge indexing
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-6">Privacy & Security</h3>
            <ul className="space-y-4 text-xl">
              <li className="flex items-center">
                <span className="text-green-400 mr-4">✓</span>
                Secure Strava OAuth integration
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-4">✓</span>
                Private activity verification
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-4">✓</span>
                Protected user data
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-4">✓</span>
                Transparent verification process
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'demo',
    content: (
      <div className="space-y-12">
        <h2 className="text-5xl font-bold">Demo Time! 🎮</h2>
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-12 rounded-2xl">
          <div className="space-y-8">
            <div className="flex items-center space-x-6 text-2xl">
              <span className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center">
                1
              </span>
              <span>Connect Strava account</span>
            </div>
            <div className="flex items-center space-x-6 text-2xl">
              <span className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center">
                2
              </span>
              <span>Create challenge & stake USDC</span>
            </div>
            <div className="flex items-center space-x-6 text-2xl">
              <span className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center">
                3
              </span>
              <span>Complete your runs</span>
            </div>
            <div className="flex items-center space-x-6 text-2xl">
              <span className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center">
                4
              </span>
              <span>AI verifies activities</span>
            </div>
            <div className="flex items-center space-x-6 text-2xl">
              <span className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center">
                5
              </span>
              <span>Automatic prize distribution</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'join',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-6xl font-bold mb-12">Join Us! 🚀</h2>
        <p className="text-3xl mb-12">Help us make fitness challenges:</p>
        <div className="space-y-6 text-2xl">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 px-8 py-4 rounded-xl">
            More accountable
          </div>
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-8 py-4 rounded-xl">
            More rewarding
          </div>
          <div className="bg-gradient-to-r from-pink-900/50 to-red-900/50 px-8 py-4 rounded-xl">
            More fun!
          </div>
        </div>
        <p className="text-xl text-gray-400 mt-12">
          Built with ❤️ for ETHGlobal Agentic Ethereum 2025
        </p>
      </div>
    ),
  },
];

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        setCurrentSlide((c) => c + 1);
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide((c) => c - 1);
      }
    },
    [currentSlide]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, handleKeyDown]);

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden"
      suppressHydrationWarning
    >
      <div
        className="w-full h-full px-8 py-16 flex flex-col"
        suppressHydrationWarning
      >
        <motion.div
          key={currentSlide}
          initial="enter"
          animate="center"
          exit="exit"
          variants={slideVariants}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex-1 flex items-center justify-center"
        >
          {slides[currentSlide]?.content}
        </motion.div>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => currentSlide > 0 && setCurrentSlide((c) => c - 1)}
            className="px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled={currentSlide === 0}
          >
            Previous
          </button>
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === currentSlide ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() =>
              currentSlide < slides.length - 1 && setCurrentSlide((c) => c + 1)
            }
            className="px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled={currentSlide === slides.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
