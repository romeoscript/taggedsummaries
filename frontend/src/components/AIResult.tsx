import React from 'react';
import type { AIProcessingResult } from '../services/groqService';
import { validateAIResult } from '../utils/validation';

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
  // Validate the AI result
  const validation = result ? validateAIResult(result) : null;
  const isValid = validation?.isValid ?? true;
  const validationError = validation?.error;

  if (!result) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1rem'
          }}>
            📊
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>AI Analysis Results</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            Analyze a transaction above to see AI-powered insights and metadata extraction
          </p>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 className="text-lg font-semibold text-gray-900">AI Analysis Result</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isValid ? (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              color: '#10b981', 
              fontSize: '0.75rem', 
              fontWeight: '500' 
            }}>
              ✓ Valid
            </span>
          ) : (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              color: '#ef4444', 
              fontSize: '0.75rem', 
              fontWeight: '500' 
            }}>
              ⚠️ Invalid
            </span>
          )}
        </div>
      </div>

      {validationError && (
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '0.5rem', 
          padding: '0.75rem',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#991b1b', fontSize: '0.875rem', margin: 0 }}>
            <strong>Validation Error:</strong> {validationError}
          </p>
        </div>
      )}
      
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
            disabled={storing || !isValid}
            className={`w-full text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
              storing || !isValid 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {storing ? 'Storing on Blockchain...' : 
             !isValid ? 'Fix validation errors to store' : 
             'Store on Solana Blockchain'}
          </button>
          {!isValid && (
            <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '0.5rem 0 0 0', textAlign: 'center' }}>
              Please fix the validation errors above before storing on blockchain
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
