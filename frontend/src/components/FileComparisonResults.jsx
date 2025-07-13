import React, { useState } from 'react';

const FileComparisonResults = ({ comparisonResult, files, onDownload }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedFile, setExpandedFile] = useState(null);

  if (!comparisonResult || !comparisonResult.success) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          ❌ Không thể so sánh file: {comparisonResult?.error || 'Lỗi không xác định'}
        </p>
      </div>
    );
  }

  const renderSummaryTab = () => (
    <div className="space-y-4">
      {/* Files được so sánh */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Files được so sánh ({files?.length || 0})
        </h4>
        <div className="grid gap-3">
          {files && files.map((file, index) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded border">
              <div className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.type} • {formatFileSize(file.size || 0)}</p>
                </div>
              </div>
              {file.download_url && (
                <button
                  onClick={() => onDownload && onDownload(file.download_url, file.name)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Tải xuống"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kết quả so sánh */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Kết quả so sánh - {getComparisonTypeLabel(comparisonResult.comparison_type)}
          </h4>
        </div>
        <div className="p-4">
          {renderComparisonContent()}
        </div>
      </div>
    </div>
  );
  const renderComparisonContent = () => {
    switch (comparisonResult.comparison_type) {
      case 'ai_summary':
        return (
          <div className="space-y-6">
            {/* Thông tin rút trích từ các file */}
            {comparisonResult.extracted_info && comparisonResult.extracted_info.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thông tin rút trích từ các file
                </h5>
                <div className="grid gap-4">
                  {comparisonResult.extracted_info.map((info, index) => (
                    <div key={index} className="bg-white rounded-lg border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h6 className="font-medium text-gray-900 flex items-center gap-2">
                          <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          {info.name}
                        </h6>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {info.type} • {formatFileSize(info.size)}
                        </span>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        {/* Tóm tắt nội dung chính */}
                        <div>
                          <p className="font-medium text-gray-700 mb-1">📄 Nội dung chính:</p>
                          <p className="text-gray-600 bg-blue-50 p-2 rounded text-sm leading-relaxed">
                            {info.key_info}
                          </p>
                        </div>
                        
                        {/* Từ khóa quan trọng */}
                        {info.keywords && info.keywords.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-700 mb-2">🏷️ Từ khóa quan trọng:</p>
                            <div className="flex flex-wrap gap-1">
                              {info.keywords.slice(0, 10).map((keyword, idx) => (
                                <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  {keyword}
                                </span>
                              ))}
                              {info.keywords.length > 10 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                  +{info.keywords.length - 10} từ khác
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Số liệu quan trọng */}
                        {info.numbers && info.numbers.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-700 mb-2">🔢 Số liệu quan trọng:</p>
                            <div className="flex flex-wrap gap-1">
                              {info.numbers.slice(0, 8).map((number, idx) => (
                                <span key={idx} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-mono">
                                  {number}
                                </span>
                              ))}
                              {info.numbers.length > 8 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                  +{info.numbers.length - 8} số khác
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Preview nội dung */}
                        <div>
                          <details className="cursor-pointer">
                            <summary className="font-medium text-gray-700 hover:text-gray-900">
                              📋 Xem preview nội dung
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded border text-xs font-mono max-h-32 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-gray-600">
                                {info.main_content}
                              </pre>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Phân tích AI */}
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Phân tích AI chi tiết
                </h5>
              </div>
              <div className="p-4">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {comparisonResult.ai_analysis}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-4">
            {comparisonResult.comparisons && comparisonResult.comparisons.map((comp, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-800">
                    {comp.file1.name} ↔ {comp.file2.name}
                  </h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    comp.similarity_score > 80 ? 'bg-green-100 text-green-800' :
                    comp.similarity_score > 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {comp.similarity_score}% tương đồng
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Khác biệt: <span className="font-medium">{comp.differences_count} dòng</span></p>
                  </div>
                  {comp.differences_preview && comp.differences_preview.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedFile(expandedFile === comp.file1.id ? null : comp.file1.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        {expandedFile === comp.file1.id ? 'Ẩn' : 'Xem'} chi tiết khác biệt
                      </button>
                    </div>
                  )}
                </div>
                {expandedFile === comp.file1.id && comp.differences_preview && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border text-xs font-mono">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {comp.differences_preview.slice(0, 20).join('')}
                      {comp.differences_preview.length > 20 && '\n... (và nhiều khác biệt khác)'}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'metadata':
        return (
          <div className="space-y-4">
            {comparisonResult.comparisons && comparisonResult.comparisons.map((comp, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-3">
                  {comp.file1.name} ↔ {comp.file2.name}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kích thước:</span>
                      <span>{formatFileSize(comp.file1.size)} → {formatFileSize(comp.file2.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chênh lệch:</span>
                      <span className={`font-medium ${
                        comp.size_difference_percent > 50 ? 'text-red-600' :
                        comp.size_difference_percent > 20 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {comp.size_difference_percent}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại file:</span>
                      <span className={comp.same_type ? 'text-green-600' : 'text-red-600'}>
                        {comp.same_type ? 'Giống nhau' : 'Khác nhau'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {comp.file1.type} → {comp.file2.type}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <p className="text-gray-600">Không có dữ liệu so sánh.</p>
        );
    }
  };

  const renderExtractedInfoTab = () => {
    if (!comparisonResult.extracted_info || comparisonResult.extracted_info.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Không có thông tin rút trích được.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {comparisonResult.extracted_info.map((info, index) => (
          <div key={index} className="bg-gray-50 rounded-lg border p-4">
            <div className="flex items-start justify-between mb-4">
              <h6 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                {info.name}
              </h6>
              <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                {info.type} • {formatFileSize(info.size)}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Tóm tắt nội dung */}
              <div className="bg-white rounded-lg p-3 border">
                <h6 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Nội dung chính
                </h6>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {info.key_info}
                </p>
              </div>

              {/* Từ khóa */}
              <div className="bg-white rounded-lg p-3 border">
                <h6 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
                  </svg>
                  Từ khóa ({info.keywords?.length || 0})
                </h6>
                {info.keywords && info.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {info.keywords.map((keyword, idx) => (
                      <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Không có từ khóa</p>
                )}
              </div>

              {/* Số liệu */}
              <div className="bg-white rounded-lg p-3 border">
                <h6 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Số liệu ({info.numbers?.length || 0})
                </h6>
                {info.numbers && info.numbers.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {info.numbers.map((number, idx) => (
                      <span key={idx} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-mono">
                        {number}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Không có số liệu</p>
                )}
              </div>

              {/* Preview nội dung */}
              <div className="bg-white rounded-lg p-3 border">
                <h6 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview nội dung
                </h6>
                <div className="max-h-24 overflow-y-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">
                    {info.main_content?.substring(0, 200)}
                    {info.main_content?.length > 200 && '...'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAnalysisTab = () => {
    if (!comparisonResult.ai_analysis) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Không có phân tích từ AI.</p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800">Phân tích chi tiết từ AI</h5>
            <p className="text-sm text-gray-600">Kết quả phân tích và so sánh thông minh</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {comparisonResult.ai_analysis}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getComparisonTypeLabel = (type) => {
    switch (type) {
      case 'ai_summary': return 'Phân tích bằng AI';
      case 'content': return 'So sánh nội dung';
      case 'metadata': return 'So sánh thông tin file';
      default: return 'Không xác định';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-comparison-results border border-blue-200 rounded-lg bg-blue-50 mt-4">
      {/* Header */}
      <div className="px-4 py-3 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-blue-800">Kết quả so sánh file</h3>
          <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            {comparisonResult.files_compared || files?.length || 0} file
          </span>
        </div>
      </div>      {/* Tabs */}
      <div className="border-b border-blue-200">
        <nav className="flex space-x-1 px-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tổng quan
          </button>
          {comparisonResult.comparison_type === 'ai_summary' && comparisonResult.extracted_info && (
            <button
              onClick={() => setActiveTab('extracted')}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'extracted'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông tin rút trích
            </button>
          )}
          {comparisonResult.comparison_type === 'ai_summary' && (
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Phân tích AI
            </button>
          )}
          {comparisonResult.comparison_type === 'content' && (
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chi tiết
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'extracted' && renderExtractedInfoTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        {activeTab === 'details' && renderComparisonContent()}
      </div>
    </div>
  );
};

export default FileComparisonResults;
