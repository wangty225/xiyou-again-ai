# 🐵 AI话西游记 - 取经路上的爱恨纠葛

> 在游戏中学习名著，感受经典魅力

一个基于AI的《西游记》互动式剧本杀游戏，让你在角色扮演中深入了解经典名著。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8+-green.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/flask-2.0+-red.svg)](https://flask.palletsprojects.com/)

---

## ✨ 特色功能

### 🎭 角色扮演
- 选择《西游记》中的经典角色
- 从角色视角体验原著故事
- AI根据章节智能生成适配角色

### 📖 章节选择
- 支持《西游记》100回章节
- 查看原著全文
- 根据章节生成专属剧情

### 🤖 AI智能叙事
- 使用阿里云百炼平台
- 流式输出，逐字打字机效果
- 根据选择动态生成故事

### 🎯 教育意义
- 引导用户了解原著情节
- 学习经典名言和优美语句
- 培养同理心和决策能力

### 🆕 最新优化（2025-12-22）
- ⌨️ **逐字打字机效果**：流畅的阅读体验，智能停顿
- 🎯 **第9步确认环节**：用户主动查看收获，增加仪式感
- 🎓 **精准AI总结**：基于实际游戏历史，不出现无关内容
- 📖 **完整故事回顾**：9步时间线，记录你的选择
- 📸 **导出图片功能**：一键导出故事和收获为图片

---

## 🚀 快速开始

### 环境要求
- Python 3.8+
- Node.js 14+ (可选，用于前端开发)
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）

### 后端部署

1. **克隆项目**
```bash
git clone https://github.com/yourusername/xiyou-again-ai.git
cd xiyou-again-ai
```

2. **安装依赖**
```bash
cd backend
pip install -r requirements.txt
```

3. **配置环境变量**
```bash
# 创建 .env 文件
cat > .env << EOF
DASHSCOPE_API_KEY=your_api_key_here
APP_ID=4ba067fe93d94aff93317587b58eed21
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False
EOF
```

4. **启动后端服务**
```bash
python app.py
```

后端服务将在 `http://localhost:5000` 启动

### 前端部署

#### 方式一：Nginx部署（推荐）

1. **配置Nginx**
```nginx
server {
    listen 8002;
    server_name your-domain.com;
    root /path/to/xiyou-again-ai/front-ui;
    index index.html;
    
    charset utf-8;
    
    # JavaScript 文件 - 支持 ES6 模块
    location ~ .*\.(js)$ {
        add_header Content-Type "application/javascript; charset=utf-8";
        expires 12h;
    }
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

2. **重启Nginx**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 方式二：本地测试
```bash
cd front-ui
python -m http.server 8000
# 访问 http://localhost:8000
```

---

## 📁 项目结构

```
xiyou-again-ai/
├── backend/                 # 后端服务
│   ├── app.py              # Flask主应用
│   ├── chapters/           # 章节原文
│   │   ├── chap1-石猴出世.txt
│   │   ├── chap14-收悟空.txt
│   │   └── ...
│   ├── logs/               # 日志文件
│   ├── requirements.txt    # Python依赖
│   └── .env               # 环境变量
├── front-ui/               # 前端界面
│   ├── index.html         # 主页面
│   ├── main.js            # 主逻辑
│   ├── ai-agent.js        # AI交互
│   ├── characters.js      # 角色数据
│   └── style.css          # 样式文件
├── OPTIMIZATION_SUMMARY.md # 优化总结
├── TESTING_GUIDE.md       # 测试指南
└── README.md              # 项目说明
```

---

## 🎮 使用指南

### 1. 选择章节
- 浏览《西游记》100回章节列表
- 点击"查看原文"阅读完整章节
- 点击"开始游戏"进入角色选择

### 2. 选择角色
- AI根据章节生成适配角色
- 查看角色背景、性格特点
- 选择你想扮演的角色

### 3. 开始冒险
- 阅读AI生成的故事（逐字打字机效果）
- 从3个选项中做出选择
  - 🟢 绿色标记：符合原著的选择
  - 🟡 黄色标记：创新选择（可能偏离原著）
- 或使用自由输入功能

### 4. 完成旅程
- 完成9步互动故事
- 点击"查看收获"按钮
- 查看学习要点和完整故事回顾
- 导出图片分享你的故事

---

## 🎨 功能演示

### 打字机效果
```
故事内容逐字显示，句号后停顿240ms，
逗号后停顿120ms，营造流畅的阅读体验。
```

### 故事回顾
```
┌─────────────────────────────────┐
│ ① 重见天日                      │
│   五百年了！整整五百年！...     │
│   👉 你的选择：全心全意保护师父  │
│   💬 "皇帝轮流做，明年到我家。" │
├─────────────────────────────────┤
│ ② 初遇妖魔                      │
│   ...                           │
└─────────────────────────────────┘
```

---

## 🛠️ 技术栈

### 前端
- **核心**: Vanilla JavaScript (ES6+)
- **UI框架**: Tailwind CSS 3.0
- **图标**: Font Awesome 6.4.0
- **导出**: html2canvas 1.4.1

### 后端
- **框架**: Flask 2.0+
- **AI平台**: 阿里云百炼 (Dashscope)
- **流式输出**: Server-Sent Events (SSE)
- **日志**: Python logging

### 部署
- **Web服务器**: Nginx
- **Python**: 3.8+
- **操作系统**: Linux/macOS/Windows

---

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| 首屏加载时间 | < 2s |
| AI响应时间 | 2-5s |
| 打字机效果流畅度 | 60fps |
| 导出图片时间 | < 3s |
| 内存占用 | < 100MB |

---

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DASHSCOPE_API_KEY` | 阿里云百炼API密钥 | 必填 |
| `APP_ID` | 百炼应用ID | 4ba067fe93d94aff93317587b58eed21 |
| `FLASK_HOST` | Flask监听地址 | 0.0.0.0 |
| `FLASK_PORT` | Flask监听端口 | 5000 |
| `FLASK_DEBUG` | 调试模式 | False |

### 前端配置

在 `ai-agent.js` 中修改API地址：
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000'
    : 'https://your-backend-domain.com';
```

---

## 🧪 测试

### 运行测试
```bash
# 后端健康检查
curl http://localhost:5000/api/health

# 获取章节列表
curl http://localhost:5000/api/chapters

# 查看日志
tail -f backend/logs/app.log
```

### 测试指南
详见 [TESTING_GUIDE.md](TESTING_GUIDE.md)

---

## 📝 更新日志

### v2.0.0 (2025-12-22)
- ✨ 新增逐字打字机效果
- ✨ 新增第9步确认环节
- ✨ 优化AI总结准确性
- ✨ 新增完整故事回顾
- ✨ 新增导出图片功能
- 🐛 修复流式输出显示问题
- 🐛 修复总结出现无关角色问题

### v1.0.0 (2025-12-20)
- 🎉 初始版本发布
- ✨ 支持章节选择
- ✨ 支持角色扮演
- ✨ AI流式故事生成
- ✨ 互动选择系统

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献流程
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- Python: PEP 8
- JavaScript: ES6+ 标准
- 提交信息: 使用语义化提交

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 👥 团队

- **项目负责人**: wangty
- **AI开发**: AI Assistant
- **UI设计**: AI Assistant

---

## 📞 联系方式

- **项目主页**: https://github.com/yourusername/xiyou-again-ai
- **问题反馈**: https://github.com/yourusername/xiyou-again-ai/issues
- **在线演示**: https://xiyou-ai.wangty.top

---

## 🙏 致谢

- 感谢《西游记》原著作者吴承恩
- 感谢阿里云百炼平台提供AI能力
- 感谢所有贡献者和用户

---

## 📚 相关资源

- [《西游记》原著](https://zh.wikisource.org/wiki/西遊記)
- [阿里云百炼文档](https://help.aliyun.com/zh/model-studio/)
- [Flask文档](https://flask.palletsprojects.com/)
- [Tailwind CSS文档](https://tailwindcss.com/)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个星标！⭐**

Made with ❤️ by AI Assistant

</div>
