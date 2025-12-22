# 西游记剧本杀智能体后端服务

基于阿里云百炼平台的 Application API 实现的流式输出后端服务。

## 环境要求

- Python 3.8+
- pip

## 安装步骤

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 配置环境变量：
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，填入你的 API Key
# DASHSCOPE_API_KEY=your_actual_api_key
```

## 运行服务

```bash
python app.py
```

服务将在 `http://localhost:5000` 启动。

## API 端点

### 1. 非流式接口
- **地址**: `POST /api/ai-agent`
- **描述**: 一次性返回完整的故事内容

### 2. 流式接口（推荐）
- **地址**: `POST /api/ai-agent/stream`
- **描述**: 使用 Server-Sent Events (SSE) 流式返回内容

### 3. 健康检查
- **地址**: `GET /api/health`
- **描述**: 检查服务状态

## 请求格式

```json
{
    "character": {
        "id": "wukong",
        "name": "孙悟空",
        "role": "齐天大圣",
        "background": "花果山水帘洞美猴王...",
        "secret": "头戴紧箍咒...",
        "traits": ["勇敢", "机智", "忠诚"]
    },
    "step": 1,
    "userChoice": {
        "value": "protect",
        "text": "保护师父"
    },
    "storyHistory": []
}
```

## 响应格式

```json
{
    "title": "章节标题",
    "content": "故事内容...",
    "literaryQuote": "经典名句",
    "options": [
        {"text": "选项1", "value": "option1"},
        {"text": "选项2", "value": "option2"}
    ],
    "isEnd": false,
    "ending": "",
    "learningPoints": []
}
```

## 前端集成

确保前端的 `ai-agent.js` 中的 `BACKEND_BASE_URL` 指向正确的后端地址。

开发时，前端和后端可以分别运行：
- 后端: `http://localhost:5000`
- 前端: 使用任意静态服务器，如 `python -m http.server 8080`

## 注意事项

1. 确保已配置有效的 `DASHSCOPE_API_KEY`
2. 智能体 APP_ID 已预设为 `4ba067fe93d94aff93317587b58eed21`
3. 如需修改智能体，请在 `.env` 文件中更新 `APP_ID`
