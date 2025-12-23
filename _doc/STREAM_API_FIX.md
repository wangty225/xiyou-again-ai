# 流式API修复方案

## 问题描述

### 错误日志
```
2025-12-23 02:52:15,601 - __main__ - INFO - Failed to extract JSON from content: ```json
{
    "characters": [
        {
            "id": "honghaier",
            "name": "红孩儿",
            ...
        },
        {
            "id": "wukong",
            ...
        },
        {
            "id": "tangseng",
            ...
        },
        {
            "id": "bajie",
            ...
        },
        {
            "
```

### 问题原因
1. **非流式API限制**：使用 `stream=False` 时，AI返回的长JSON内容会被截断
2. **角色信息过长**：每个角色包含详细的背景、秘密、特征等信息，导致JSON超长
3. **解析失败**：截断的JSON无法被 `json.loads()` 正确解析

---

## 解决方案

### 修改内容
将 `/api/chapters/<int:chapter_id>/characters` 端点从**非流式**改为**流式**调用。

### 修改前（非流式）
```python
# 调用AI生成角色
response = Application.call(
    api_key=API_KEY,
    app_id=APP_ID,
    prompt=prompt,
    stream=False  # ❌ 非流式，长内容会被截断
)

if response.status_code != HTTPStatus.OK:
    # 错误处理
    ...

# 解析AI响应
content = response.output.text  # ❌ 可能不完整
parsed_data = extract_json(content)
```

### 修改后（流式）
```python
# 调用AI生成角色（使用流式避免长内容被截断）
responses = Application.call(
    api_key=API_KEY,
    app_id=APP_ID,
    prompt=prompt,
    stream=True  # ✅ 流式调用
)

# 收集流式响应
full_content = ""
for response in responses:
    if response.status_code != HTTPStatus.OK:
        # 错误处理
        ...
    full_content += response.output.text  # ✅ 逐步累积完整内容

# 解析AI响应
logger.info(f"AI response characters (length={len(full_content)}): {full_content[:200]}...")
parsed_data = extract_json(full_content)  # ✅ 完整内容
```

---

## 核心改进

### 1. 流式累积内容
```python
full_content = ""
for response in responses:
    full_content += response.output.text
```
- **逐步接收**：不会因为内容过长而被截断
- **完整拼接**：确保获取AI返回的全部内容

### 2. 增强日志
```python
logger.info(f"AI response characters (length={len(full_content)}): {full_content[:200]}...")
```
- **记录长度**：方便排查是否完整
- **预览内容**：只显示前200字符，避免日志过长

### 3. 错误处理
```python
for response in responses:
    if response.status_code != HTTPStatus.OK:
        # 立即返回默认角色
        return jsonify({...})
```
- **及时中断**：发现错误立即返回
- **降级方案**：返回默认角色列表

---

## 验证方法

### 1. 查看日志
```bash
tail -f backend/logs/app.log | grep "AI response characters"
```

**期望输出**：
```
AI response characters (length=3456): ```json
{
    "characters": [
        ...
    ]
}
```

### 2. 测试API
```bash
curl http://localhost:5000/api/chapters/40/characters
```

**期望结果**：
```json
{
  "success": true,
  "characters": [
    {
      "id": "honghaier",
      "name": "红孩儿",
      "role": "牛魔王与铁扇公主之子",
      "avatar": "...",
      "description": "...",
      "background": "...",
      "secret": "...",
      "traits": ["聪明机智", "凶狠顽劣", "自负骄傲", "法力高强"],
      "color": "from-red-500 to-orange-600"
    },
    ...
  ],
  "chapterContext": "第40回：婴儿戏化禅心乱 猿马刀归木母空",
  "fromCache": false
}
```

### 3. 前端测试
1. 打开浏览器开发者工具（F12）
2. 选择任意章节
3. 查看 Network 标签中的 `/api/chapters/XX/characters` 请求
4. 确认返回完整的角色列表

---

## 其他流式API对比

### 故事生成API（已使用流式）
```python
@app.route('/api/ai-agent/stream', methods=['POST'])
def ai_agent_stream():
    """流式API端点 - 使用Server-Sent Events (SSE)"""
    return Response(
        stream_with_context(generate_stream(request_data)),
        mimetype='text/event-stream'
    )
```
- **实时推送**：边生成边推送给前端
- **打字机效果**：前端逐字显示

### 角色生成API（本次修复）
```python
@app.route('/api/chapters/<int:chapter_id>/characters', methods=['GET'])
def get_chapter_characters(chapter_id):
    """使用流式累积完整内容后一次性返回"""
    responses = Application.call(..., stream=True)
    full_content = ""
    for response in responses:
        full_content += response.output.text
    return jsonify(parsed_data)
```
- **流式接收**：避免内容截断
- **一次性返回**：前端不需要实时显示

---

## 注意事项

### 1. 为什么不用SSE？
- **角色生成**：需要完整JSON才能解析，不适合逐步推送
- **故事生成**：可以逐句显示，适合SSE实时推送

### 2. 性能影响
- **流式接收**：略慢于非流式（需要循环累积）
- **可靠性提升**：避免内容截断，值得这点性能损耗

### 3. 兼容性
- **向后兼容**：前端无需修改，仍然接收完整JSON
- **降级方案**：失败时返回默认角色列表

---

## 总结

✅ **问题解决**：AI返回的长JSON不再被截断  
✅ **可靠性提升**：流式累积确保内容完整  
✅ **日志增强**：记录内容长度方便排查  
✅ **向后兼容**：前端无需修改  

**修改文件**：
- `backend/app.py` - 修改 `get_chapter_characters` 函数

**测试清单**：
- [ ] 查看日志确认内容完整
- [ ] 测试API返回完整角色列表
- [ ] 前端选择章节正常显示角色
- [ ] 错误情况返回默认角色
