import React, { useEffect, useState } from 'react';
import { useEnhancedChat } from '../contexts/EnhancedChatContext';

const EnhancedProcessingModal = () => {
  const { 
    isEnhancedProcessing, 
    processingSteps, 
    enhancedError,
    clearEnhancedError 
  } = useEnhancedChat();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Animation for progress bar
  useEffect(() => {
    if (isEnhancedProcessing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 5;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
      setCurrentStepIndex(0);
    }
  }, [isEnhancedProcessing]);

  // Update current step based on processing steps
  useEffect(() => {
    if (processingSteps.length > 0) {
      setCurrentStepIndex(processingSteps.length - 1);
    }
  }, [processingSteps]);

  if (!isEnhancedProcessing && !enhancedError) return null;

  const steps = [
    { key: 'INITIALIZING', icon: '🚀', label: 'Khởi tạo enhanced chat...' },
    { key: 'SEARCHING_FILES', icon: '🔍', label: 'Tìm kiếm file liên quan...' },
    { key: 'CLASSIFYING', icon: '🏷️', label: 'Phân loại file...' },
    { key: 'PROCESSING_LLM', icon: '🤖', label: 'Xử lý với AI...' },
    { key: 'SYNCING_CLOUD', icon: '☁️', label: 'Đồng bộ metadata...' },
    { key: 'COMPLETED', icon: '✅', label: 'Hoàn thành' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Enhanced Chat Processing</h3>
              <p className="text-green-100 text-sm">Đang xử lý tin nhắn với AI...</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {enhancedError && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">Lỗi xử lý</h4>
                <p className="text-sm text-red-700 mt-1">{enhancedError.message}</p>
              </div>
              <button
                onClick={clearEnhancedError}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-50 border border-blue-200' 
                      : isCompleted 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {/* Step Icon */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive 
                      ? 'bg-blue-500 text-white animate-pulse' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}>
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{step.icon}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-800' : isCompleted ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <div className="flex space-x-1 mt-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>

                  {/* Step Status */}
                  {isCompleted && (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isEnhancedProcessing ? 'Đang xử lý...' : 'Hoàn thành'}
            </div>
            {enhancedError && (
              <button
                onClick={clearEnhancedError}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProcessingModal; 