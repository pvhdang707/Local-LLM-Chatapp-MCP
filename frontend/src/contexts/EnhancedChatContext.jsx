import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { chatEnhanced } from '../services/chatApi';

const EnhancedChatContext = createContext();

export const EnhancedChatProvider = ({ children }) => {
  // Enhanced Chat State
  const [chatMode, setChatMode] = useState('normal'); // 'normal' | 'enhanced'
  const [enhancedSettings, setEnhancedSettings] = useState({
    searchFiles: true,
    includeClassification: true,
    includeCloudMetadata: true,
    maxResults: 5
  });
  
  // Loading States
  const [isEnhancedProcessing, setIsEnhancedProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([]);
  
  // Enhanced Results
  const [lastEnhancedResults, setLastEnhancedResults] = useState(null);
  const [enhancedHistory, setEnhancedHistory] = useState([]);
  
  // Error Handling
  const [enhancedError, setEnhancedError] = useState(null);
  
  // Refs for tracking
  const processingTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  // Enhanced Chat Processing Steps
  const ENHANCED_STEPS = {
    INITIALIZING: 'Khởi tạo enhanced chat...',
    SEARCHING_FILES: 'Tìm kiếm file liên quan...',
    CLASSIFYING: 'Phân loại file...',
    PROCESSING_LLM: 'Xử lý với AI...',
    SYNCING_CLOUD: 'Đồng bộ metadata...',
    COMPLETED: 'Hoàn thành'
  };

  // Toggle Chat Mode
  const toggleChatMode = useCallback((mode) => {
    setChatMode(mode);
    setEnhancedError(null);
    setProcessingSteps([]);
    
    if (mode === 'enhanced') {
      console.log('[ENHANCED CHAT] Switched to enhanced mode');
    } else {
      console.log('[ENHANCED CHAT] Switched to normal mode');
    }
  }, []);

  // Update Enhanced Settings
  const updateEnhancedSettings = useCallback((newSettings) => {
    setEnhancedSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  // Process Enhanced Chat
  const processEnhancedChat = useCallback(async (message, sessionId = null) => {
    setIsEnhancedProcessing(true);
    setEnhancedError(null);
    setProcessingSteps([ENHANCED_STEPS.INITIALIZING]);
    retryCountRef.current = 0;

    // Clear previous timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    try {
      // Step 1: Searching Files
      setProcessingSteps(prev => [...prev, ENHANCED_STEPS.SEARCHING_FILES]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing

      // Step 2: Classifying (if enabled)
      if (enhancedSettings.includeClassification) {
        setProcessingSteps(prev => [...prev, ENHANCED_STEPS.CLASSIFYING]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Step 3: Processing with LLM
      setProcessingSteps(prev => [...prev, ENHANCED_STEPS.PROCESSING_LLM]);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Step 4: Syncing Cloud (if enabled)
      if (enhancedSettings.includeCloudMetadata) {
        setProcessingSteps(prev => [...prev, ENHANCED_STEPS.SYNCING_CLOUD]);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Call Enhanced Chat API
      const response = await chatEnhanced(message, {
        search_files: enhancedSettings.searchFiles,
        include_classification: enhancedSettings.includeClassification
      });

      // Step 5: Completed
      setProcessingSteps(prev => [...prev, ENHANCED_STEPS.COMPLETED]);

      // Store results
      const enhancedResult = {
        id: Date.now(),
        message,
        response: response,
        timestamp: new Date().toISOString(),
        mode: 'enhanced',
        sessionId
      };

      setLastEnhancedResults(enhancedResult);
      setEnhancedHistory(prev => [enhancedResult, ...prev.slice(0, 9)]); // Keep last 10

      return enhancedResult;

    } catch (error) {
      console.error('[ENHANCED CHAT] Error:', error);
      setEnhancedError({
        type: 'enhanced_processing',
        message: error.message || 'Lỗi xử lý enhanced chat',
        details: error
      });

      // Auto retry logic
      if (retryCountRef.current < 2) {
        retryCountRef.current += 1;
        console.log(`[ENHANCED CHAT] Retrying... (${retryCountRef.current}/2)`);
        
        // Retry after 2 seconds
        processingTimeoutRef.current = setTimeout(() => {
          processEnhancedChat(message, sessionId);
        }, 2000);
      }

      throw error;
    } finally {
      // Clear processing steps after a delay
      setTimeout(() => {
        setProcessingSteps([]);
        setIsEnhancedProcessing(false);
      }, 1000);
    }
  }, [enhancedSettings]);

  // Clear Enhanced Error
  const clearEnhancedError = useCallback(() => {
    setEnhancedError(null);
  }, []);

  // Reset Enhanced State
  const resetEnhancedState = useCallback(() => {
    setChatMode('normal');
    setEnhancedSettings({
      searchFiles: true,
      includeClassification: true,
      includeCloudMetadata: true,
      maxResults: 5
    });
    setProcessingSteps([]);
    setIsEnhancedProcessing(false);
    setLastEnhancedResults(null);
    setEnhancedHistory([]);
    setEnhancedError(null);
    retryCountRef.current = 0;
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
  }, []);

  // Get Enhanced Statistics
  const getEnhancedStats = useCallback(() => {
    const totalEnhanced = enhancedHistory.length;
    const successfulEnhanced = enhancedHistory.filter(h => !h.error).length;
    const avgProcessingTime = enhancedHistory.length > 0 
      ? enhancedHistory.reduce((acc, h) => acc + (h.processingTime || 0), 0) / enhancedHistory.length 
      : 0;

    return {
      totalEnhanced,
      successfulEnhanced,
      successRate: totalEnhanced > 0 ? (successfulEnhanced / totalEnhanced) * 100 : 0,
      avgProcessingTime: Math.round(avgProcessingTime),
      lastUsed: lastEnhancedResults?.timestamp
    };
  }, [enhancedHistory, lastEnhancedResults]);

  const contextValue = {
    // State
    chatMode,
    enhancedSettings,
    isEnhancedProcessing,
    processingSteps,
    lastEnhancedResults,
    enhancedHistory,
    enhancedError,
    
    // Actions
    toggleChatMode,
    updateEnhancedSettings,
    processEnhancedChat,
    clearEnhancedError,
    resetEnhancedState,
    getEnhancedStats,
    
    // Constants
    ENHANCED_STEPS
  };

  return (
    <EnhancedChatContext.Provider value={contextValue}>
      {children}
    </EnhancedChatContext.Provider>
  );
};

export const useEnhancedChat = () => {
  const context = useContext(EnhancedChatContext);
  if (!context) {
    throw new Error('useEnhancedChat must be used within EnhancedChatProvider');
  }
  return context;
}; 