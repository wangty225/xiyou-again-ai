"""
西游记剧本杀智能体后端服务
使用阿里云百炼平台的Application API实现流式输出
"""
import os
import json
import re
import logging
from http import HTTPStatus
from flask import Flask, request, Response, jsonify, stream_with_context
from flask_cors import CORS
from dashscope import Application
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置日志目录
LOG_DIR = os.path.join(os.path.dirname(__file__), 'logs')
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# 配置日志 - 同时输出到控制台和文件
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # 控制台输出
        logging.FileHandler(
            os.path.join(LOG_DIR, 'app.log'), 
            encoding='utf-8'
        )  # 文件输出
    ]
)
logger = logging.getLogger(__name__)

# 创建Flask应用
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# 配置
API_KEY = os.getenv("DASHSCOPE_API_KEY")
APP_ID = os.getenv("APP_ID", "4ba067fe93d94aff93317587b58eed21")

# 章节目录路径
CHAPTERS_DIR = os.path.join(os.path.dirname(__file__), 'chapters')


def get_chapter_list():
    """
    获取所有章节列表
    
    Returns:
        章节列表，包含编号和标题
    """
    chapters = []
    if not os.path.exists(CHAPTERS_DIR):
        return chapters
    logger.info(f"Found chapters directory: {CHAPTERS_DIR}")

    for filename in os.listdir(CHAPTERS_DIR):
        if filename.startswith('chap') and filename.endswith('.txt'):
            # 解析文件名: chap1-石猴出世.txt
            match = re.match(r'chap(\d+)-(.+)\.txt', filename)
            if match:
                chapter_num = int(match.group(1))
                chapter_title = match.group(2)
                chapters.append({
                    'id': chapter_num,
                    'title': chapter_title,
                    'filename': filename,
                    'displayTitle': f'第{chapter_num}回：{chapter_title}'
                })
    logger.info(f"Found {len(chapters)} chapters")
    # 按章节号排序
    chapters.sort(key=lambda x: x['id'])
#     logger.info(f"Chapters: {chapters}")
    return chapters


def get_chapter_content(chapter_id):
    """
    获取指定章节的全文内容
    
    Args:
        chapter_id: 章节编号
        
    Returns:
        章节内容字典
    """
    chapters = get_chapter_list()
    chapter = next((c for c in chapters if c['id'] == chapter_id), None)
    
    if not chapter:
        return None
    
    filepath = os.path.join(CHAPTERS_DIR, chapter['filename'])
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return {
        'id': chapter['id'],
        'title': chapter['title'],
        'displayTitle': chapter['displayTitle'],
        'content': content
    }


def get_chapter_summary(chapter_id, max_length=2000):
    """
    获取章节内容摘要（用于AI上下文）
    
    Args:
        chapter_id: 章节编号
        max_length: 最大长度
        
    Returns:
        章节摘要文本
    """
    chapter_data = get_chapter_content(chapter_id)
    if not chapter_data:
        return ""
    
    content = chapter_data['content']
    # 取前max_length字符作为上下文
    if len(content) > max_length:
        content = content[:max_length] + "..."
    
    return content


def build_character_generation_prompt(chapter_id, chapter_title):
    """
    构建角色生成提示词
    
    Args:
        chapter_id: 章节编号
        chapter_title: 章节标题
        
    Returns:
        提示词字符串
    """
    chapter_summary = get_chapter_summary(chapter_id, 1500)
    
    prompt = f"""你是《西游记》剧本杀游戏角色设计师。根据以下章节内容，生成适合该章节的可选角色列表。

## 章节信息
- 章节：第{chapter_id}回
- 标题：{chapter_title}

## 章节内容摘要
{chapter_summary}

## 输出要求
请根据章节内容，选择2个最适合该章节剧情的角色，（按照关联度高到低排序），角色需要包含以下信息：
- id: 角色唯一标识（英文）
- name: 角色名称
- role: 角色身份
- avatar: 使用以下预设头像URL之一（根据角色匹配）
- description: 角色简介（一句话）
- background: 角色背景（2-3句话，结合本章节剧情）
- secret: 角色秘密（与剧情相关的隐藏信息）
- traits: 性格特点数组（3-4个词）
- color: 渐变色CSS类（如 from-yellow-400 to-orange-500）

## 预设头像URL对照
- 唐僧: https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/648a8ed9-45dc-4428-89d7-c398040ea606/image_1766338050_1_1.jpg
- 孙悟空: http://49.232.166.157:8002/assets/wukong_small.png
- 猪八戒: https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/528d382e-af15-477f-9bc8-3fb9cd359934/image_1766338060_1_1.jpg
- 沙悟净: https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/b47a2824-3c54-4ee5-8992-50361ff33ac9/image_1766338064_1_1.jpg
- 白龙马: https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/814abf7c-df54-476a-bdb5-22fdbcef5e89/image_1766338069_1_1.jpg
- 白骨精: https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/ac0c5bd2-74a1-4147-9b51-36900863d5ba/image_1766338076_1_3.jpg
- 牛魔王: https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/936a2386-d3e7-429f-bf9d-ca036012bb33/image_1766338091_1_3.jpg
- 红孩儿: https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/caa27472-9f2e-4196-85c7-d48f8ef45763/image_1766338098_1_3.jpg
- 其他角色可使用孙悟空或唐僧的头像
""" + """
## 输出格式（严格JSON）
```json
{
    "characters": [
        {
            "id": "tangseng",
            "name": "唐僧",
            "role": "取经领队",
            "avatar": "头像URL",
            "description": "角色简介",
            "background": "角色背景",
            "secret": "角色终极目标",
            "traits": ["慈悲", "执着", "善良"],
            "color": "from-yellow-400 to-orange-500"
        }
    ],
    "chapterContext": "章节剧情概要标题，【第5回：大闹天宫】"
}
```
注意：
 - 最多选择2个最适合该章节剧情的角色
 - json需要完整，注意括号匹配和json格式
 - 请直接输出JSON，不要输出其他内容："""
    
    return prompt


def build_story_prompt(request_data: dict) -> str:
    """
    根据请求数据构建故事生成提示词
    
    Args:
        request_data: 包含角色、步骤、用户选择、章节信息等
    
    Returns:
        构建好的提示词字符串
    """
    character = request_data.get('character', {})
    step = request_data.get('step', 1)
    user_choice = request_data.get('userChoice')
    story_history = request_data.get('storyHistory', [])
    chapter_id = request_data.get('chapterId', 1)
    chapter_title = request_data.get('chapterTitle', '石猴出世')
    
    # 获取章节原文作为上下文
    chapter_summary = get_chapter_summary(chapter_id, 1500)
    
    # 获取角色名称，用于判断角色是否在章节中
    character_name = character.get('name', '')
    
    # 构建角色信息
    character_info = f"""
## 当前角色
- 角色名称：{character.get('name', '唐僧')}
- 角色身份：{character.get('role', '取经人')}
- 角色背景：{character.get('background', '')}
- 角色秘密：{character.get('secret', '')}
- 性格特点：{', '.join(character.get('traits', []))}
"""
    
    # 构建章节信息
    chapter_info = f"""
## 原著章节
- 第{chapter_id}回：{chapter_title}

## 原著内容参考
{chapter_summary}
"""
    
    # 构建历史故事摘要（更详细）
    history_summary = ""
    if story_history:
        history_summary = "\n## 故事历史（完整记录）\n"
        for h in story_history:
            choice_info = h.get('choice') or {}  # 确保不为None
            story_info = h.get('story') or {}    # 确保不为None
            
            # 安全获取选择信息
            choice_text = choice_info.get('text', '无') if choice_info else '开始游戏'
            is_recommended = choice_info.get('isRecommended', True) if choice_info else True
            choice_type = '符合原著' if is_recommended else '创新选择'
            
            # 安全获取故事内容
            story_content = story_info.get('content', '')
            content_preview = story_content[:150] if story_content else ''
            
            history_summary += f"""
### 第{h.get('step', 0)}步
- 玩家选择：{choice_text}
- 选择类型：{choice_type}
- 故事标题：{story_info.get('title', '')}
- 故事内容：{content_preview}...
- 学到的名言：{story_info.get('literaryQuote', '无')}
"""
    
    # 构建用户选择信息
    choice_info = ""
    if user_choice:
        choice_info = f"""
## 用户本次选择
- 选择内容：{user_choice.get('text', '')}
- 选择标识：{user_choice.get('value', '')}
- 是否符合原著：{'是' if user_choice.get('isRecommended', True) else '否（创新选择）'}
"""
    
    # 判断是否是最后一步
    is_final_step = step >= 9
    
    # 构建完整提示词
    if is_final_step:
        # 最后一步，需要生成总结
        prompt = f"""请你作为《西游记》剧本杀游戏叙事智能体，根据以下信息生成**最终总结**。

**重要规则：**
1. 这是第9步（最后一步），需要生成完整的结局和学习要点
2. 学习要点必须基于玩家的实际游戏历史，不要编造
3. 结局要符合原著精神，同时体现玩家的选择
4. 必须准确反映玩家扮演的角色和经历的章节
5. 如果角色选择非章节中存在的，则结合角色进行合理的故事创作，同时注意遵循无论什么时候都要求：符合原著精神，能帮助读者理解名著，具有教育意义。

{chapter_info}
{character_info}
{history_summary}
{choice_info}

## 当前步骤
第 {step}/9 步（最后一步）

## 输出要求
请严格按照以下JSON格式输出，不要输出任何其他内容：
{{
    "title": "旅程终章",
    "content": "基于玩家的实际选择和经历，生成300-500字的结局描述，要体现角色成长和原著精神",
    "literaryQuote": "原著中的经典名句或诗词",
    "options": [],
    "feedback": "",
    "originalPlot": "本章节在原著中的结局",
    "isEnd": true,
    "ending": "基于{character.get('name', '角色')}在第{chapter_id}回《{chapter_title}》中的经历，生成符合原著的结局描述（200-300字）",
    "learningPoints": [
        "必须基于实际游戏历史生成3-6条学习要点",
        "要提到具体的章节：第{chapter_id}回《{chapter_title}》",
        "要提到角色：{character.get('name', '角色')}",
        "要总结玩家的选择倾向（符合原著 vs 创新选择）",
        "要列举学到的具体名言（如果有）",
        "不要提及游戏中没有出现的角色（如白骨精、牛魔王等）"
    ],
    "characterInChapter": true或false（判断角色'{character_name}'是否在本章节《{chapter_title}》中出现过，如果原著章节内容中提到了该角色则为true，否则为false）
}}

请开始生成最终总结："""
    else:
        # 中间步骤
        prompt = f"""请你作为《西游记》剧本杀游戏叙事智能体，根据以下信息生成故事内容。

**重要规则：**
1. 必须严格遵循原著章节的主要情节
2. 用户选择必须符合原著剧情发展方向
3. 如果用户选择偏离原著太远，需要通过故事情节自然引导回正轨
4. 选项设计要体现原著精神，引导用户了解真实的西游记故事

{chapter_info}
{character_info}
{history_summary}
{choice_info}

## 当前步骤
第 {step}/9 步

## 选择合理性判断
如果用户的选择与原著情节严重不符（比如唐僧选择杀生、孙悟空选择放弃保护师父），请在故事中巧妙地设置转折，让情节回到正轨，并在 "feedback" 字段说明为什么这个选择不太合适，以及原著中的处理方式。

## 输出要求
请严格按照以下JSON格式输出，不要输出任何其他内容：
{{
    "title": "章节标题（与原著相关，简短有力）",
    "content": "故事内容（300-500字，语言优美，符合角色视角，遵循原著情节）",
    "literaryQuote": "原著中的经典名句或诗词",
    "options": [
        {{"text": "符合原著的选项1", "value": "option1", "isRecommended": true}},
        {{"text": "符合原著的选项2", "value": "option2", "isRecommended": true}},
        {{"text": "可能偏离原著的选项3（用于教育目的）", "value": "option3", "isRecommended": false}}
    ],
    "feedback": "如果用户上一步选择不合理，这里给出温和的教育性反馈，否则为空",
    "originalPlot": "本段对应原著的情节概要（帮助用户了解原著）",
    "isEnd": false,
    "ending": "",
    "learningPoints": [],
    "characterInChapter": true或false（判断角色'{character_name}'是否在本章节《{chapter_title}》中出现过，如果原著章节内容中提到了该角色则为true，否则为false）
}}

请开始生成故事："""
    
    return prompt


def generate_stream(request_data: dict):
    """
    调用百炼平台API进行流式生成
    
    Args:
        request_data: 请求数据
        
    Yields:
        SSE格式的流式数据
    """
    prompt = build_story_prompt(request_data)
    logger.info(f"Generated prompt for step {request_data.get('step', 1)}, chapter {request_data.get('chapterId', 1)}")
    
    try:
        responses = Application.call(
            api_key=API_KEY,
            app_id=APP_ID,
            prompt=prompt,
            stream=True,
            incremental_output=True
        )
        
        full_content = ""
        for response in responses:
            if response.status_code != HTTPStatus.OK:
                error_data = {
                    'error': True,
                    'message': response.message,
                    'code': response.status_code
                }
                yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"
                break
            else:
                text = response.output.text
                full_content += text
                # 发送增量数据
                chunk_data = {
                    'text': text,
                    'done': False
                }
                yield f"data: {json.dumps(chunk_data, ensure_ascii=False)}\n\n"
        
        # 发送完成信号，尝试解析完整的JSON
        try:
            # 尝试从完整内容中提取JSON
            json_content = extract_json(full_content)
            done_data = {
                'done': True,
                'fullContent': full_content,
                'parsedData': json_content
            }
        except Exception as e:
            logger.warning(f"Failed to parse JSON: {e}")
            done_data = {
                'done': True,
                'fullContent': full_content,
                'parsedData': None
            }
        
        yield f"data: {json.dumps(done_data, ensure_ascii=False)}\n\n"
        logger.info(f"full content sent: {full_content}")
    except Exception as e:
        logger.error(f"Error during streaming: {str(e)}")
        error_data = {
            'error': True,
            'message': str(e)
        }
        yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"


def extract_json(content: str) -> dict:
    """
    从文本中提取JSON对象
    
    Args:
        content: 包含JSON的文本
        
    Returns:
        解析后的字典
    """
    # 尝试直接解析
    try:
        return json.loads(content)
    except:
        pass
    
    # 尝试找到JSON部分
    json_pattern = r'\{[\s\S]*\}'
    matches = re.findall(json_pattern, content)
    
    for match in matches:
        logger.info("Found JSON in content mastch-1")
        try:
            return json.loads(match)
        except:
            continue

    matches2 = re.search(r'```json\s*([\s\S]*?)\s*```', content)
    if matches2:
        logger.info("Found JSON in content mastch-2")
        try:
            return json.loads(matches2.group(1))
        except:
            pass

    logger.info(f"Failed to extract JSON from content: {content}")
    # 如果都失败了，返回默认结构
    return {
        "title": "故事继续",
        "content": content,
        "literaryQuote": "",
        "options": [
            {"text": "继续探索", "value": "continue"},
            {"text": "谨慎行事", "value": "careful"},
            {"text": "寻求帮助", "value": "help"}
        ],
        "isEnd": False
    }


# ==================== API 端点 ====================

@app.route('/api/chapters', methods=['GET'])
def list_chapters():
    """
    获取所有章节列表
    """
    try:
        chapters = get_chapter_list()
        return jsonify({
            'success': True,
            'chapters': chapters,
            'total': len(chapters)
        })
    except Exception as e:
        logger.error(f"Error listing chapters: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/chapters/<int:chapter_id>', methods=['GET'])
def get_chapter(chapter_id):
    """
    获取指定章节的全文内容
    """
    try:
        chapter_data = get_chapter_content(chapter_id)
        if not chapter_data:
            return jsonify({
                'success': False,
                'error': f'章节 {chapter_id} 不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'chapter': chapter_data
        })
    except Exception as e:
        logger.error(f"Error getting chapter {chapter_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/chapters/<int:chapter_id>/characters', methods=['GET'])
def get_chapter_characters(chapter_id):
    """
    根据章节生成AI角色列表
    """
    try:
        chapters = get_chapter_list()
        chapter = next((c for c in chapters if c['id'] == chapter_id), None)
        
        if not chapter:
            return jsonify({
                'success': False,
                'error': f'章节 {chapter_id} 不存在'
            }), 404
        
        # 构建提示词
        prompt = build_character_generation_prompt(chapter_id, chapter['title'])
        
        # 调用AI生成角色（非流式）
        response = Application.call(
            api_key=API_KEY,
            app_id=APP_ID,
            prompt=prompt,
            stream=False
        )
        
        # 检查响应状态
        if response.status_code != HTTPStatus.OK:
            logger.error(f"AI call failed: {response.message}")
            # 返回默认角色列表
            return jsonify({
                'success': True,
                'characters': get_default_characters(chapter_id, chapter['title']),
                'chapterContext': f"第{chapter_id}回：{chapter['title']}",
                'fromCache': True
            })
        
        # 获取完整内容
        full_content = response.output.text
        
        # 解析AI响应
        logger.info(f"AI response characters (length={len(full_content)}): {full_content}")
        parsed_data = extract_json(full_content)
        
        # 获取AI推荐的角色
        ai_characters = parsed_data.get('characters', [])
        
        # 使用name去重，保持顺序
        seen_names = set()
        unique_characters = []
        for char in ai_characters:
            name = char.get('name', '')
            if name and name not in seen_names:
                seen_names.add(name)
                unique_characters.append(char)
        
        # 仅返回AI推荐的角色列表（去重后）
        return jsonify({
            'success': True,
            'characters': unique_characters
        })
        
    except Exception as e:
        logger.error(f"Error generating characters for chapter {chapter_id}: {str(e)}")
        # 返回空角色列表，前端使用默认角色
        return jsonify({
            'success': True,
            'characters': [],
            'error': str(e)
        }), 200


def get_default_characters(chapter_id, chapter_title):
    """
    获取默认角色列表（唐僧师徒四人）
    """
    return [
        {
            "id": "tangseng",
            "name": "唐僧",
            "role": "取经领队",
            "avatar": "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/648a8ed9-45dc-4428-89d7-c398040ea606/image_1766338050_1_1.jpg",
            "description": "慈悲为怀的取经人，心怀天下苍生",
            "background": f"在第{chapter_id}回《{chapter_title}》中，唐僧继续他的取经之旅。",
            "secret": "身负如来重托，必须历经九九八十一难方能取得真经。",
            "traits": ["慈悲", "执着", "善良", "有时固执"],
            "color": "from-yellow-400 to-orange-500"
        },
        {
            "id": "wukong",
            "name": "孙悟空",
            "role": "齐天大圣",
            "avatar": "http://49.232.166.157:8002/assets/wukong_small.png",
            "description": "神通广大的美猴王，火眼金睛识妖魔",
            "background": f"在第{chapter_id}回《{chapter_title}》中，悟空保护师父继续西行。",
            "secret": "头戴紧箍咒，受制于唐僧，但内心渴望自由。",
            "traits": ["勇敢", "机智", "忠诚", "有时冲动"],
            "color": "from-red-500 to-pink-500"
        },
        {
            "id": "bajie",
            "name": "猪八戒",
            "role": "天蓬元帅",
            "avatar": "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/528d382e-af15-477f-9bc8-3fb9cd359934/image_1766338060_1_1.jpg",
            "description": "憨厚可爱的二师兄，好吃懒做却心地善良",
            "background": f"在第{chapter_id}回《{chapter_title}》中，八戒跟随师父西行。",
            "secret": "虽然贪吃好色，但关键时刻从不退缩。",
            "traits": ["憨厚", "幽默", "贪吃", "重情义"],
            "color": "from-pink-400 to-rose-500"
        },
        {
            "id": "wujing",
            "name": "沙悟净",
            "role": "卷帘大将",
            "avatar": "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/caa27472-9f2e-4196-85c7-d48f8ef45763/image_1766338070_1_1.jpg",
            "description": "忠厚老实的三师弟，任劳任怨挑担前行",
            "background": f"在第{chapter_id}回《{chapter_title}》中，沙僧默默挑担保护师父。",
            "secret": "曾是天庭卷帘大将，因失手打碎琉璃盏被贬下凡。",
            "traits": ["忠诚", "勤劳", "稳重", "少言寡语"],
            "color": "from-blue-400 to-cyan-500"
        }
    ]


@app.route('/api/ai-agent', methods=['POST'])
def ai_agent():
    """
    非流式API端点
    """
    try:
        request_data = request.get_json()
        logger.info(f"Received request: step={request_data.get('step', 1)}, chapter={request_data.get('chapterId', 1)}")
        
        prompt = build_story_prompt(request_data)
        
        # 非流式调用
        response = Application.call(
            api_key=API_KEY,
            app_id=APP_ID,
            prompt=prompt,
            stream=False
        )
        
        if response.status_code != HTTPStatus.OK:
            return jsonify({
                'error': response.message,
                'fallback': get_fallback_story(request_data)
            }), 500
        
        # 解析响应
        content = response.output.text
        parsed_data = extract_json(content)
        
        return jsonify(parsed_data)
        
    except Exception as e:
        logger.error(f"Error in ai_agent: {str(e)}")
        return jsonify({
            'error': str(e),
            'fallback': get_fallback_story(request.get_json() if request.is_json else {})
        }), 500


@app.route('/api/ai-agent/stream', methods=['POST'])
def ai_agent_stream():
    """
    流式API端点 - 使用Server-Sent Events (SSE)
    """
    try:
        request_data = request.get_json()
        logger.info(f"Received stream request: step={request_data.get('step', 1)}, chapter={request_data.get('chapterId', 1)}")
        
        return Response(
            stream_with_context(generate_stream(request_data)),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
            }
        )
        
    except Exception as e:
        logger.error(f"Error in ai_agent_stream: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500


def get_fallback_story(request_data: dict) -> dict:
    """
    获取备用故事内容（当AI调用失败时使用）
    
    Args:
        request_data: 请求数据
        
    Returns:
        备用的故事数据
    """
    character = request_data.get('character', {})
    step = request_data.get('step', 1)
    chapter_id = request_data.get('chapterId', 1)
    chapter_title = request_data.get('chapterTitle', '石猴出世')
    
    return {
        "title": f"第{chapter_id}回·{chapter_title}",
        "content": f"作为{character.get('name', '取经人')}，你继续踏上西行的道路。前方的路途依然漫长，但你心中的信念从未动摇。远处的山峦在夕阳下显得格外庄严，仿佛在默默见证着你的旅程。",
        "literaryQuote": "路漫漫其修远兮，吾将上下而求索。",
        "options": [
            {"text": "继续前进", "value": "continue", "isRecommended": True},
            {"text": "休息片刻", "value": "rest", "isRecommended": True},
            {"text": "观察四周", "value": "observe", "isRecommended": True}
        ],
        "feedback": "",
        "originalPlot": f"原著第{chapter_id}回《{chapter_title}》中的精彩情节。",
        "isEnd": step >= 9,
        "ending": "经历了漫长的旅途，你终于完成了这段不平凡的冒险。" if step >= 9 else "",
        "learningPoints": [
            f"了解了{character.get('name', '取经人')}的故事",
            "学习了坚持不懈的精神",
            "感受了团队合作的重要性"
        ] if step >= 9 else []
    }


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'app_id': APP_ID[:10] + '...' if APP_ID else 'not configured',
        'chapters_count': len(get_chapter_list())
    })


if __name__ == '__main__':
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting server on {host}:{port}")
    logger.info(f"App ID: {APP_ID}")
    logger.info(f"Chapters directory: {CHAPTERS_DIR}")
    logger.info(f"Found {len(get_chapter_list())} chapters")
    
    app.run(host=host, port=port, debug=debug)
