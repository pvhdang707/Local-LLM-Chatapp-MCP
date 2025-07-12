# AI Agentic System - Hệ thống Trí tuệ Nhân tạo Đa Agent

## Tổng quan

Hệ thống AI Agentic được tích hợp vào chatapp để cung cấp khả năng xử lý thông tin thông minh và toàn diện. Thay vì chỉ sử dụng một mô hình RAG đơn giản, hệ thống này sử dụng nhiều AI Agents chuyên biệt làm việc cùng nhau để giải quyết các vấn đề phức tạp.

## Kiến trúc Hệ thống

### 1. Các AI Agents Chuyên biệt

#### 🎯 **Planner Agent**
- **Vai trò**: Lập kế hoạch và phân tích yêu cầu
- **Chức năng**: 
  - Phân tích câu hỏi phức tạp
  - Chia nhỏ thành các tasks cụ thể
  - Xác định agent phù hợp cho từng task
  - Thiết lập độ ưu tiên và dependencies

#### 🔍 **Researcher Agent**
- **Vai trò**: Nghiên cứu và thu thập thông tin
- **Chức năng**:
  - Tìm kiếm trong vector database
  - Phân tích file được upload
  - Tìm kiếm thông tin trên web (nếu có)
  - Tổng hợp thông tin từ nhiều nguồn

#### 📊 **Analyst Agent**
- **Vai trò**: Phân tích dữ liệu và rút ra insights
- **Chức năng**:
  - Phân tích patterns và xu hướng
  - Rút ra insights có giá trị
  - Đưa ra recommendations
  - Đánh giá độ tin cậy của phân tích

#### 📝 **Summarizer Agent**
- **Vai trò**: Tổng hợp và tạo câu trả lời cuối cùng
- **Chức năng**:
  - Tổng hợp kết quả từ các agents khác
  - Tạo câu trả lời coherent và hữu ích
  - Đánh giá confidence score
  - Maintain context với cuộc trò chuyện

### 2. Multi-Agent Coordinator

Coordinator quản lý và điều phối các agents theo 3 strategies:

#### 🔄 **Sequential Strategy**
- Thực hiện tasks tuần tự, từng bước một
- Phù hợp với: Câu hỏi đơn giản, cần độ chính xác cao
- Ưu điểm: Ít lỗi, logic rõ ràng
- Nhược điểm: Chậm hơn

#### ⚡ **Parallel Strategy**
- Thực hiện các tasks song song
- Phù hợp với: Câu hỏi phức tạp, có nhiều phần độc lập
- Ưu điểm: Nhanh hơn
- Nhược điểm: Phức tạp hơn trong error handling

#### 🧠 **Adaptive Strategy** (Mặc định)
- Tự động điều chỉnh theo tình huống
- Research trước, sau đó analysis dựa trên kết quả
- Cân bằng giữa tốc độ và chất lượng

### 3. Tools System

Mỗi agent có quyền truy cập vào các tools:

- **DocumentSearchTool**: Tìm kiếm trong vector database
- **FileAnalysisTool**: Phân tích file upload
- **WebSearchTool**: Tìm kiếm web (tùy chọn)
- **CalculatorTool**: Tính toán đơn giản
- **DataExtractionTool**: Trích xuất dữ liệu có cấu trúc
- **MemoryTool**: Quản lý memory của agent

## Cách Sử dụng

### 1. API Endpoints

#### Gửi Message với AI Agentic
```bash
POST /chat/sessions/{session_id}/send
{
    "message": "Phân tích chiến lược marketing cho startup",
    "file_urls": ["file1.pdf", "file2.xlsx"],
    "use_agentic": true,  // null = auto-decide, true/false = force
    "strategy": "adaptive"  // sequential, parallel, adaptive
}
```

#### Smart Chat (Standalone)
```bash
POST /ai/chat/smart
{
    "question": "So sánh các mô hình kinh doanh SaaS và B2B",
    "file_urls": [],
    "chat_context": "Previous conversation...",
    "use_agentic": null,
    "strategy": "adaptive"
}
```

#### Phân tích độ phức tạp
```bash
POST /ai/analyze/complexity
{
    "message": "Tại sao AI lại quan trọng trong tương lai?",
    "file_urls": []
}
```

### 2. Khi nào sử dụng AI Agentic?

Hệ thống **tự động quyết định** sử dụng AI Agentic khi:

- ✅ Câu hỏi có từ khóa phức tạp: "phân tích", "so sánh", "đánh giá", "kế hoạch"
- ✅ Có nhiều file cần phân tích (>1 file)
- ✅ Câu hỏi dài và phức tạp (>10 từ)
- ✅ Câu hỏi yêu cầu reasoning: "tại sao", "như thế nào"

### 3. Ví dụ Sử dụng

#### Câu hỏi đơn giản (RAG thường)
```
"Thủ đô của Việt Nam là gì?"
→ Sử dụng: Enhanced RAG
→ Strategy: Không cần
```

#### Câu hỏi phức tạp (AI Agentic)
```
"Phân tích và so sánh các chiến lược phát triển kinh tế của Việt Nam với Singapore trong 10 năm qua"
→ Sử dụng: Pure Agentic System
→ Strategy: Adaptive
→ Agents: Planner → Researcher → Analyst → Summarizer
```

## Response Format

### Từ AI Agentic System
```json
{
    "answer": "Detailed analysis...",
    "method": "agentic",
    "confidence": 0.92,
    "agent_results": {
        "research": {...},
        "analysis": {...}
    },
    "execution_trace": {
        "tasks_completed": 4,
        "total_tasks": 4
    },
    "strategy_used": "adaptive"
}
```

### Từ Enhanced RAG
```json
{
    "answer": "Simple answer...",
    "method": "enhanced_rag", 
    "confidence": 0.85,
    "steps": ["retrieve", "generate", "store"],
    "agent_trace": {...}
}
```

## Quản lý System

### Kiểm tra Agent Status
```bash
GET /ai/agents/status
```

### Xóa Agent Memory (Admin only)
```bash
POST /ai/agents/memory/clear
```

### System Info
```bash
GET /ai/system/info
```

## Tích hợp Frontend

### JavaScript Example
```javascript
// Gửi message với AI Agentic
async function sendAgenticMessage(sessionId, message, files = []) {
    const response = await fetch(`/chat/sessions/${sessionId}/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            message: message,
            file_urls: files,
            use_agentic: null, // Auto-decide
            strategy: 'adaptive'
        })
    });
    
    const result = await response.json();
    
    // Hiển thị thông tin AI system được sử dụng
    console.log('AI Method:', result.ai_method);
    console.log('Confidence:', result.confidence);
    console.log('Recommended Agentic:', result.system_info.agentic_recommended);
    
    return result;
}

// Phân tích độ phức tạp trước khi gửi
async function analyzeComplexity(message, files = []) {
    const response = await fetch('/ai/analyze/complexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: message,
            file_urls: files
        })
    });
    
    return await response.json();
}
```

## Cấu hình và Tuning

### Environment Variables
```bash
# Ollama configuration
OLLAMA__HOST=http://localhost:11434
OLLAMA__RAG=mistral
OLLAMA__EMBEDDING_MODEL=nomic-embed-text

# AI Agentic settings (optional)
AGENTIC_DEFAULT_STRATEGY=adaptive
AGENTIC_AUTO_ENABLE=true
AGENTIC_CONFIDENCE_THRESHOLD=0.7
```

### Memory Management

Agents có 3 loại memory:
- **Working Memory**: Dữ liệu tạm thời cho task hiện tại
- **Short-term Memory**: Lịch sử gần đây (session-based)
- **Long-term Memory**: Kinh nghiệm và reflection từ các tasks trước

## Performance & Monitoring

### Metrics cần theo dõi:
- Response time cho từng strategy
- Confidence scores
- Agent success rates
- Memory usage
- Error rates

### Logs
```bash
# Xem logs của AI Agentic system
tail -f backend.log | grep "agentic"

# Monitor agent performance
curl /ai/agents/status
```

## Troubleshooting

### Common Issues

1. **AI Agentic system không hoạt động**
   - Kiểm tra Ollama service
   - Verify model availability
   - Check memory và disk space

2. **Response chậm**
   - Thử strategy "parallel" thay vì "adaptive"
   - Giảm số file upload
   - Optimize vectorDB

3. **Confidence score thấp**
   - Cải thiện prompt engineering
   - Thêm training data vào vectorDB
   - Review agent prompts

## Roadmap

### Planned Features:
- [ ] Custom agent creation
- [ ] Agent fine-tuning
- [ ] Advanced memory management
- [ ] Multi-modal support (images, audio)
- [ ] Agent performance analytics
- [ ] Dynamic strategy selection
- [ ] Integration với external APIs

## Contributing

Để contribute vào AI Agentic system:

1. Tạo custom agents trong `/backend/agents/`
2. Implement tools mới trong `/backend/agents/tools.py`
3. Test với various strategies
4. Update documentation

---

**Lưu ý**: Hệ thống AI Agentic này được thiết kế để backwards compatible với RAG system cũ. Nếu có lỗi, system sẽ tự động fallback về RAG thông thường.
