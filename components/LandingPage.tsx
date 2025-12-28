// Stunning landing page about red roses and machine learning
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PublicNavbar } from './PublicNavbar';

export function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Public Navbar */}
      <PublicNavbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-rose-50 via-red-50 to-pink-50">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 38, 38, 0.1), transparent 50%)`,
          }}
        />
        {/* Floating Rose Petals Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-rose-300/20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            >
              🌹
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 md:pt-28">
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Rose Icon */}
            <div className="mb-8 animate-bounce-in">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-red-600 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-rose-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                  <span className="text-6xl md:text-7xl">🌹</span>
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Red Rose
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Diagnosis
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-4 font-light animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Where <span className="font-bold text-rose-600">Nature's Beauty</span> Meets
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-12 font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Machine Learning Intelligence
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/auth/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-rose-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Get Started</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-700 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-rose-600 font-bold text-lg rounded-full border-2 border-rose-300 hover:border-rose-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <svg className="w-6 h-6 mx-auto text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                Powered by Advanced AI
              </span>
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Combining the elegance of red roses with cutting-edge machine learning technology
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-rose-100">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Neural Networks</h3>
                <p className="text-gray-600">
                  Deep learning algorithms trained on thousands of symptom patterns to provide accurate diagnoses
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-rose-100">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Analysis</h3>
                <p className="text-gray-600">
                  Real-time symptom processing with machine learning models that learn and improve continuously
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-rose-100">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Data-Driven Insights</h3>
                <p className="text-gray-600">
                  Advanced analytics powered by machine learning to track patterns and provide personalized recommendations
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ML Showcase Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-100/50 to-red-100/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                    Machine Learning
                  </span>
                  <br />
                  <span className="text-gray-800">at its Finest</span>
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  Our AI system uses state-of-the-art machine learning algorithms to analyze symptoms with precision. 
                  Just like a red rose blooms with care, our models have been carefully trained and refined.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Deep neural networks for pattern recognition</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Natural language processing for symptom understanding</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Continuous learning from user feedback</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-red-400 rounded-3xl blur-3xl opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-rose-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl">
                      <span className="text-rose-600 font-semibold">Model Accuracy</span>
                      <span className="text-2xl font-bold text-rose-600">98.5%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl">
                      <span className="text-rose-600 font-semibold">Training Data</span>
                      <span className="text-2xl font-bold text-rose-600">10K+ Cases</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl">
                      <span className="text-rose-600 font-semibold">Response Time</span>
                      <span className="text-2xl font-bold text-rose-600">&lt;2s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-rose-900/20"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Experience AI-Powered Diagnosis?
                </h2>
                <p className="text-xl text-rose-100 mb-8">
                  Join thousands of users who trust Red Rose AI for accurate symptom analysis
                </p>
                <Link
                  href="/auth/signup"
                  className="inline-block px-8 py-4 bg-white text-rose-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Your Journey →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

