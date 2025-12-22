// AI智能体API配置
// 后端API地址
const AI_API_ENDPOINT = '/api/ai-agent';
const AI_STREAM_ENDPOINT = '/api/ai-agent/stream';
const CHAPTERS_ENDPOINT = '/api/chapters';

// 后端服务地址配置
// 开发模式：本地打开HTML文件或localhost开发服务器
// 生产模式：Nginx部署，需要配置实际的后端地址
const isDevelopment = window.location.protocol === 'file:' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// 生产环境的后端地址（请根据实际部署修改）
const PRODUCTION_BACKEND_URL = 'http://49.232.166.157:5000';

const BACKEND_BASE_URL = isDevelopment 
    ? 'http://localhost:5000'      // 开发环境
    : PRODUCTION_BACKEND_URL;       // 生产环境

/**
 * 获取所有章节列表
 * @returns {Promise<Object>} - 章节列表
 */
export async function fetchChapterList() {
    try {
        const response = await fetch(BACKEND_BASE_URL + CHAPTERS_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取章节列表失败:', error);
        // 返回模拟数据作为备用
        return {
            success: true,
            chapters: [
                { id: 1, title: '石猴出世', displayTitle: '第1回：石猴出世' },
                { id: 2, title: '拜师菩提', displayTitle: '第2回：拜师菩提' },
                { id: 3, title: '大闹地府', displayTitle: '第3回：大闹地府' },
                { id: 4, title: '官封弼马', displayTitle: '第4回：官封弼马' },
                { id: 5, title: '大闹天宫', displayTitle: '第5回：大闹天宫' },
            ],
            total: 5,
            fromFallback: true
        };
    }
}

/**
 * 获取指定章节的全文内容
 * @param {number} chapterId - 章节编号
 * @returns {Promise<Object>} - 章节内容
 */
export async function fetchChapterContent(chapterId) {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}${CHAPTERS_ENDPOINT}/${chapterId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取章节内容失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 根据章节获取AI生成的角色列表
 * @param {number} chapterId - 章节编号
 * @returns {Promise<Object>} - 角色列表
 */
export async function fetchChapterCharacters(chapterId) {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}${CHAPTERS_ENDPOINT}/${chapterId}/characters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取章节角色失败:', error);
        // 返回默认角色
        return {
            success: true,
            characters: getDefaultCharacters(),
            fromFallback: true
        };
    }
}

/**
 * 获取默认角色列表
 */
function getDefaultCharacters() {
    return [
        {
            id: 'tangseng',
            name: '唐僧',
            role: '取经领队',
            avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/648a8ed9-45dc-4428-89d7-c398040ea606/image_1766338050_1_1.jpg',
            description: '慈悲为怀的取经人',
            background: '前世为如来座下金蝉子，立志西天取经。',
            secret: '身负如来重托，必须历经九九八十一难。',
            traits: ['慈悲', '执着', '善良'],
            color: 'from-yellow-400 to-orange-500'
        },
        {
            id: 'wukong',
            name: '孙悟空',
            role: '齐天大圣',
            avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/a4a893ce-082e-4d73-a0ee-66431bb8db38/image_1766338055_1_3.jpg',
            description: '神通广大的美猴王',
            background: '花果山水帘洞美猴王，曾大闹天宫。',
            secret: '头戴紧箍咒，内心渴望自由。',
            traits: ['勇敢', '机智', '忠诚'],
            color: 'from-red-500 to-pink-500'
        },
        {
            id: 'bajie',
            name: '猪八戒',
            role: '天蓬元帅',
            avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/528d382e-af15-477f-9bc8-3fb9cd359934/image_1766338060_1_1.jpg',
            description: '憨厚可爱的二师兄',
            background: '原为天庭天蓬元帅，因调戏嫦娥被贬。',
            secret: '虽然贪吃好色，但关键时刻从不退缩。',
            traits: ['憨厚', '幽默', '贪吃'],
            color: 'from-pink-400 to-rose-500'
        }
    ];
}

/**
 * 调用AI智能体生成故事内容（流式输出）
 * @param {Object} params - 请求参数
 * @param {Function} onChunk - 每次收到数据块时的回调函数
 * @param {Function} onComplete - 完成时的回调函数
 * @param {Function} onError - 错误时的回调函数
 * @returns {Promise<Object>} - AI响应结果
 */
export async function callAIAgentStream(params, onChunk, onComplete, onError) {
    try {
        // 构建请求数据
        const requestData = {
            character: params.character,
            step: params.step,
            userChoice: params.userChoice,
            storyHistory: params.storyHistory || [],
            chapterId: params.chapterId || 1,
            chapterTitle: params.chapterTitle || '石猴出世'
        };

        console.log('请求数据:', requestData);
        console.log('请求地址:', BACKEND_BASE_URL + AI_STREAM_ENDPOINT);

        const response = await fetch(BACKEND_BASE_URL + AI_STREAM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let parsedData = null;

        let buffer = ''; // 用于处理跨chunk的数据
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // 按照双换行分割SSE事件
            const events = buffer.split('\n\n');
            // 保留最后一个可能不完整的事件
            buffer = events.pop() || '';

            for (const event of events) {
                const lines = event.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.slice(6);
                            const data = JSON.parse(jsonStr);
                            
                            if (data.error) {
                                if (onError) {
                                    onError(data.message || '生成失败');
                                }
                                return null;
                            }
                            
                            if (data.done) {
                                // 流式输出完成
                                // 优先使用parsedData，如果解析失败则从fullContent或fullText中提取
                                if (data.parsedData) {
                                    parsedData = data.parsedData;
                                } else if (data.fullContent) {
                                    // 从fullContent中提取JSON（可能包含markdown代码块）
                                    parsedData = extractJsonFromText(data.fullContent);
                                }
                                
                                if (!parsedData) {
                                    parsedData = extractJsonFromText(fullText);
                                }
                                
                                if (onComplete) {
                                    onComplete(parsedData);
                                }
                            } else if (data.text) {
                                // 增量文本
                                fullText += data.text;
                                if (onChunk) {
                                    onChunk(data.text, fullText);
                                }
                            }
                        } catch (e) {
                            // 如果解析失败，可能是数据被截断，等待更多数据
                            console.warn('Failed to parse SSE data, may be incomplete:', e.message);
                            // 将未解析的数据放回buffer
                            if (buffer) {
                                buffer = line + '\n' + buffer;
                            } else {
                                buffer = line;
                            }
                        }
                    }
                }
            }
        }
        
        // 处理buffer中剩余的数据
        if (buffer.trim()) {
            const lines = buffer.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.done && data.parsedData) {
                            parsedData = data.parsedData;
                        } else if (data.done && data.fullContent) {
                            parsedData = extractJsonFromText(data.fullContent);
                        }
                    } catch (e) {
                        console.warn('Failed to parse remaining SSE data:', e.message);
                    }
                }
            }
        }

        return parsedData || extractJsonFromText(fullText);

    } catch (error) {
        console.error('AI智能体流式调用失败:', error);
        if (onError) {
            onError(error.message);
        }
        throw error;
    }
}

/**
 * 调用AI智能体生成故事内容（非流式）
 * @param {Object} params - 请求参数
 * @returns {Promise<Object>} - AI响应结果
 */
export async function callAIAgent(params) {
    try {
        // 构建请求数据
        const requestData = {
            character: params.character,
            step: params.step,
            userChoice: params.userChoice,
            storyHistory: params.storyHistory || [],
            chapterId: params.chapterId || 1,
            chapterTitle: params.chapterTitle || '石猴出世'
        };
        console.log('请求数据:', requestData);
        console.log('请求地址:', BACKEND_BASE_URL + AI_API_ENDPOINT);

        const response = await fetch(BACKEND_BASE_URL + AI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // 如果返回了错误和fallback，使用fallback
        if (data.error && data.fallback) {
            console.warn('AI调用出错，使用备用内容:', data.error);
            return data.fallback;
        }
        
        return data;

    } catch (error) {
        console.error('AI智能体调用失败:', error);
        // 返回备用内容
        return getLocalFallbackStory(params);
    }
}

/**
 * 从文本中提取JSON对象
 * @param {string} text - 包含JSON的文本
 * @returns {Object|null} - 解析后的对象
 */
function extractJsonFromText(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }

    // 尝试直接解析
    try {
        return JSON.parse(text);
    } catch (e) {
        // 忽略，继续尝试其他方法
    }

    // 尝试从Markdown代码块中提取JSON
    // 匹配 ```json ... ``` 或 ``` ... ```
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {
            // 忽略
        }
    }

    // 尝试找到完整的JSON对象（从第一个{到最后一个}）
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(jsonCandidate);
        } catch (e) {
            // 忽略
        }
    }

    // 尝试使用正则表达式匹配JSON对象
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            // 忽略
        }
    }

    // 返回null表示解析失败
    return null;
}

/**
 * 获取本地备用故事内容（当API调用完全失败时使用）
 * @param {Object} params - 请求参数
 * @returns {Object} - 备用故事数据
 */
function getLocalFallbackStory(params) {
    const { character, step, chapterId, chapterTitle } = params;
    
    return {
        title: `第${chapterId}回·${chapterTitle || '西行路上'}`,
        content: `作为${character?.name || '取经人'}，你继续踏上西行的道路。前方的路途依然漫长，但你心中的信念从未动摇。\n\n远处的山峦在夕阳下显得格外庄严，仿佛在默默见证着你的旅程。不知不觉间，你已经走过了无数的艰难险阻，每一步都是对自我的超越。`,
        literaryQuote: '路漫漫其修远兮，吾将上下而求索。',
        options: [
            { text: '继续前进，不畏艰险', value: 'continue', isRecommended: true },
            { text: '稍作休息，养精蓄锐', value: 'rest', isRecommended: true },
            { text: '观察四周，寻找线索', value: 'observe', isRecommended: true }
        ],
        feedback: '',
        originalPlot: `原著第${chapterId}回中的精彩情节。`,
        isEnd: step >= 9,
        ending: step >= 9 ? '经历了漫长的旅途，你终于完成了这段不平凡的冒险。' : '',
        learningPoints: step >= 9 ? [
            `了解了${character?.name || '取经人'}的故事`,
            '学习了坚持不懈的精神',
            '感受了团队合作的重要性'
        ] : []
    };
}

/**
 * 格式化AI响应数据
 * @param {Object} data - 原始响应数据
 * @returns {Object} - 格式化后的数据
 */
export function formatAIResponse(data) {
    return {
        title: data.title || '未知章节',
        content: data.content || '',
        literaryQuote: data.literaryQuote || '',
        options: data.options || [],
        feedback: data.feedback || '',
        originalPlot: data.originalPlot || '',
        isEnd: data.isEnd || false,
        ending: data.ending || '',
        learningPoints: data.learningPoints || []
    };
}

/**
 * 检查后端服务是否可用
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            return false;
        }
        
        const data = await response.json();
        return data.status === 'healthy';
    } catch (error) {
        console.error('后端服务检查失败:', error);
        return false;
    }
}