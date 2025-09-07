import React from 'react';
import { AIProcessingResult } from '../services/groqService';

interface AIResultProps {
  result: AIProcessingResult | null;
  onStoreOnChain: () => void;
  storing: boolean;
}

export const AIResult: React.FC<AIResultProps> = ({ 
  result, 
  onStoreOnChain, 
  storing 
}) => {
  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Result</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-500">Process a transaction to see AI analysis results</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      dining: 'bg-green-100 text-green-800',
      academic: 'bg-blue-100 text-blue-800',
      transportation: 'bg-yellow-100 text-yellow-800',
      entertainment: 'bg-purple-100 text-purple-800',
      shopping: 'bg-pink-100 text-pink-800',
      services: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Result</h3>
      
      <div className="space-y-4">
        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{result.summary}</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(result.category)}`}>
            {result.category}
          </span>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2">
            {result.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Confidence Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Score</label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${result.confidenceScore}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${getConfidenceColor(result.confidenceScore)}`}>
              {result.confidenceScore}%
            </span>
          </div>
        </div>

        {/* Store on Chain Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onStoreOnChain}
            disabled={storing}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {storing ? 'Storing on Blockchain...' : 'Store on Solana Blockchain'}
          </button>
        </div>
      </div>
    </div>
  );
};
