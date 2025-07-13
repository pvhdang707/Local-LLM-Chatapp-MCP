/**
 * API service cho chức năng so sánh file
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function để lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// So sánh file với danh sách ID
export const compareFiles = async (fileIds, comparisonType = 'ai_summary') => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/comparison/files/compare`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_ids: fileIds,
        comparison_type: comparisonType
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi so sánh file');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error comparing files:', error);
    throw error;
  }
};

// Tìm kiếm và so sánh file dựa trên query
export const compareSearch = async (query, comparisonType = 'ai_summary') => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/comparison/files/compare/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        comparison_type: comparisonType
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi tìm kiếm và so sánh file');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in comparison search:', error);
    throw error;
  }
};

// Lấy danh sách loại so sánh
export const getComparisonTypes = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/comparison/files/compare/types`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Có lỗi xảy ra khi lấy danh sách loại so sánh');
    }

    const data = await response.json();
    return data.comparison_types;
  } catch (error) {
    console.error('Error getting comparison types:', error);
    throw error;
  }
};

// Utility function để format kết quả so sánh
export const formatComparisonResult = (result) => {
  if (!result || !result.success) {
    return 'Không thể so sánh file';
  }

  switch (result.comparison_type) {
    case 'ai_summary':
      return result.ai_analysis || 'Không có phân tích AI';
    
    case 'content':
      if (result.comparisons && result.comparisons.length > 0) {
        const comp = result.comparisons[0];
        return `Độ tương đồng: ${comp.similarity_score}% | Khác biệt: ${comp.differences_count} dòng`;
      }
      return 'Không có kết quả so sánh nội dung';
    
    case 'metadata':
      if (result.comparisons && result.comparisons.length > 0) {
        const comp = result.comparisons[0];
        return `Chênh lệch kích thước: ${comp.size_difference_percent}% | Cùng loại: ${comp.same_type ? 'Có' : 'Không'}`;
      }
      return 'Không có kết quả so sánh metadata';
    
    default:
      return 'Kết quả so sánh không xác định';
  }
};

// Utility function để format danh sách file so sánh
export const formatFilesList = (files) => {
  if (!files || files.length === 0) {
    return 'Không có file nào';
  }

  return files.map((file, index) => 
    `${index + 1}. ${file.name} (${file.type || 'unknown'})`
  ).join('\n');
};

const comparisonApi = {
  compareFiles,
  compareSearch,
  getComparisonTypes,
  formatComparisonResult,
  formatFilesList
};

export default comparisonApi;
