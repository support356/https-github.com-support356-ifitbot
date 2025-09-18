
import React from 'react';
import { Sparkles, Target, Zap } from 'lucide-react';

export default function QuizWelcome({ onStart }: { onStart: () => void }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        iFitBot Assessment
                        <span className="block text-orange-500 text-4xl md:text-5xl mt-2">
                            Ready to Start?
                        </span>
                    </h1>
                    
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                        Get a hyper-personalized fitness plan powered by AI.<br />
                        Your transformation starts with understanding you.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                     <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                        <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">Personalized</h3>
                        <p className="text-gray-400 text-sm">Tailored to your body, goals, and lifestyle</p>
                    </div>
                     <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                        <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
                        <p className="text-gray-400 text-sm">Advanced algorithms create your optimal plan</p>
                    </div>
                     <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                        <Sparkles className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">Actionable</h3>
                        <p className="text-gray-400 text-sm">Clear reports and day-by-day workout guides.</p>
                    </div>
                </div>

                <div>
                    <button
                        onClick={onStart}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                        Start Your Assessment
                        <Sparkles className="w-6 h-6 ml-2 inline" />
                    </button>
                    
                    <p className="text-gray-400 text-sm mt-4">
                        Takes about 2 minutes • Free assessment
                    </p>
                </div>
            </div>
        </div>
    );
}
