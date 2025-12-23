import { characters as defaultCharacters, getCharacter } from './characters.js';
import { 
    callAIAgentStream, 
    callAIAgent, 
    formatAIResponse, 
    fetchChapterList, 
    fetchChapterContent,
    fetchChapterCharacters,
    checkBackendHealth
} from './ai-agent.js';

// 游戏状态
const gameState = {
    currentPhase: 'chapters', // 'chapters' | 'characterSelection' | 'gamePlay' | 'gameEnd'
    chapters: [],             // 章节列表
    selectedChapter: null,    // 选中的章节
    characters: [],           // 当前章节的角色列表
    selectedCharacter: null,  // 选中的角色
    currentStep: 1,
    maxSteps: 9,
    storyHistory: [],
    isPlaying: false,
    isStreaming: false,       // 是否正在流式输出
    isLoading: false,         // 是否正在加载
    isLoadingAICharacters: false, // 是否正在加载AI推荐角色
    aiRecommendedCharacters: [],  // AI推荐的角色列表
    chapterContext: '',       // 章节上下文
    typewriterQueue: [],      // 打字机队列
    isTyping: false,          // 是否正在打字
    waitingForEndConfirm: false, // 是否等待用户确认结束
    currentTypingText: '',    // 当前正在打字的文本
    displayedTextLength: 0,   // 已显示的文本长度
    typewriterTimer: null     // 打字机定时器
};

// DOM元素
const elements = {
    // 章节选择
    chapterSelection: document.getElementById('chapterSelection'),
    chapterGrid: document.getElementById('chapterGrid'),
    chapterModal: document.getElementById('chapterModal'),
    chapterModalTitle: document.getElementById('chapterModalTitle'),
    chapterModalContent: document.getElementById('chapterModalContent'),
    closeChapterModal: document.getElementById('closeChapterModal'),
    startFromChapter: document.getElementById('startFromChapter'),
    // 角色选择
    characterSelection: document.getElementById('characterSelection'),
    gamePlay: document.getElementById('gamePlay'),
    gameEnd: document.getElementById('gameEnd'),
    characterGrid: document.getElementById('characterGrid'),
    startGameBtn: document.getElementById('startGameBtn'),
    backToChapters: document.getElementById('backToChapters'),
    selectedChapterInfo: document.getElementById('selectedChapterInfo'),
    chapterContextText: document.getElementById('chapterContextText'),
    // 游戏进行
    currentChapterTitle: document.getElementById('currentChapterTitle'),
    stepCounter: document.getElementById('stepCounter'),
    progressBar: document.getElementById('progressBar'),
    currentCharacterAvatar: document.getElementById('currentCharacterAvatar'),
    currentCharacterName: document.getElementById('currentCharacterName'),
    currentCharacterRole: document.getElementById('currentCharacterRole'),
    storyTitle: document.getElementById('storyTitle'),
    storyContent: document.getElementById('storyContent'),
    characterNotInChapterTip: document.getElementById('characterNotInChapterTip'),
    feedbackBox: document.getElementById('feedbackBox'),
    feedbackText: document.getElementById('feedbackText'),
    originalPlotBox: document.getElementById('originalPlotBox'),
    originalPlotText: document.getElementById('originalPlotText'),
    literaryQuote: document.getElementById('literaryQuote'),
    quoteText: document.getElementById('quoteText'),
    optionsContainer: document.getElementById('optionsContainer'),
    customInput: document.getElementById('customInput'),
    submitCustomBtn: document.getElementById('submitCustomBtn'),
    // 游戏结束
    endingText: document.getElementById('endingText'),
    learningPoints: document.getElementById('learningPoints'),
    restartBtn: document.getElementById('restartBtn'),
    // 加载
    loadingOverlay: document.getElementById('loadingOverlay')
};

/**
 * 初始化游戏
 */
async function initGame() {
    showLoading(true, '正在连接服务器...');
    
    // 检查后端服务
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
        console.warn('后端服务不可用，使用本地数据');
    }
    
    // 加载章节列表
    await loadChapters();
    
    // 绑定事件
    bindEvents();
    
    showLoading(false);
}

/**
 * 加载章节列表
 */
async function loadChapters() {
    try {
        const result = await fetchChapterList();
        if (result && result.chapters && result.chapters.length > 0) {
            gameState.chapters = result.chapters;
        } else {
            // 后端返回数据但格式不正确，使用默认章节
            console.warn('后端返回数据格式不正确，使用默认章节');
            gameState.chapters = getDefaultChapters();
        }
    } catch (error) {
        console.error('加载章节失败:', error);
        // 使用默认章节
        gameState.chapters = getDefaultChapters();
    }
    // 无论成功还是失败，都要渲染章节
    renderChapters();
}

/**
 * 获取默认章节列表
 */
function getDefaultChapters() {
    return [
        { id: 1, title: '石猴出世', displayTitle: '第1回：石猴出世' },
        { id: 2, title: '拜师菩提', displayTitle: '第2回：拜师菩提' },
        { id: 3, title: '大闹地府', displayTitle: '第3回：大闘地府' },
        { id: 4, title: '官封弼马', displayTitle: '第4回：官封弼马' },
        { id: 5, title: '大闹天宫', displayTitle: '第5回：大闹天宫' },
    ];
}

/**
 * 渲染章节列表
 */
function renderChapters() {
    if (!elements.chapterGrid) return;
    
    elements.chapterGrid.innerHTML = gameState.chapters.map((chapter, index) => `
        <div class="chapter-card bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-xl hover:scale-105 cursor-pointer" 
             data-chapter-id="${chapter.id}">
            <div class="p-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        ${chapter.id}
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-800">${chapter.title}</h3>
                        <p class="text-sm text-gray-500">${chapter.displayTitle}</p>
                    </div>
                    <i class="fas fa-chevron-right text-gray-400 text-xl"></i>
                </div>
            </div>
            <div class="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-3 flex justify-between items-center">
                <button class="view-chapter-btn text-orange-600 hover:text-orange-800 font-medium text-sm" data-chapter-id="${chapter.id}">
                    <i class="fas fa-book-open mr-1"></i> 查看原文
                </button>
                <button class="play-chapter-btn bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:shadow-md transition-all" data-chapter-id="${chapter.id}">
                    <i class="fas fa-play mr-1"></i> 开始游戏
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 章节列表点击
    if (elements.chapterGrid) {
        elements.chapterGrid.addEventListener('click', async (e) => {
            const viewBtn = e.target.closest('.view-chapter-btn');
            const playBtn = e.target.closest('.play-chapter-btn');
            
            if (viewBtn) {
                e.stopPropagation();
                const chapterId = parseInt(viewBtn.dataset.chapterId);
                await showChapterContent(chapterId);
            } else if (playBtn) {
                e.stopPropagation();
                const chapterId = parseInt(playBtn.dataset.chapterId);
                await selectChapter(chapterId);
            }
        });
    }

    // 章节模态框关闭
    if (elements.closeChapterModal) {
        elements.closeChapterModal.addEventListener('click', closeChapterModal);
    }
    
    // 从章节开始游戏
    if (elements.startFromChapter) {
        elements.startFromChapter.addEventListener('click', async () => {
            const chapterId = gameState.selectedChapter?.id;
            if (chapterId) {
                closeChapterModal();
                await selectChapter(chapterId);
            }
        });
    }

    // 返回章节列表
    if (elements.backToChapters) {
        elements.backToChapters.addEventListener('click', () => {
            showPhase('chapters');
        });
    }

    // 角色选择
    if (elements.characterGrid) {
        elements.characterGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.character-card');
            if (!card) return;

            const characterId = card.dataset.characterId;
            selectCharacter(characterId);
        });
    }

    // 开始游戏
    if (elements.startGameBtn) {
        elements.startGameBtn.addEventListener('click', startGame);
    }

    // 选项点击
    if (elements.optionsContainer) {
        elements.optionsContainer.addEventListener('click', (e) => {
            const optionBtn = e.target.closest('.option-btn');
            if (!optionBtn || gameState.isStreaming) return;

            const optionValue = optionBtn.dataset.value;
            const optionText = optionBtn.dataset.text;
            const isRecommended = optionBtn.dataset.recommended === 'true';
            handleChoice({ value: optionValue, text: optionText, isRecommended });
        });
    }

    // 自定义输入提交
    if (elements.submitCustomBtn) {
        elements.submitCustomBtn.addEventListener('click', handleCustomInput);
    }
    if (elements.customInput) {
        elements.customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !gameState.isStreaming) {
                handleCustomInput();
            }
        });
    }

    // 重新开始
    if (elements.restartBtn) {
        elements.restartBtn.addEventListener('click', restartGame);
    }

    // 点击模态框外部关闭
    if (elements.chapterModal) {
        elements.chapterModal.addEventListener('click', (e) => {
            if (e.target === elements.chapterModal) {
                closeChapterModal();
            }
        });
    }
}

/**
 * 显示章节内容
 */
async function showChapterContent(chapterId) {
    showLoading(true, '正在加载章节内容...');
    
    try {
        const result = await fetchChapterContent(chapterId);
        if (result.success && result.chapter) {
            const chapter = result.chapter;
            gameState.selectedChapter = chapter;
            
            if (elements.chapterModalTitle) {
                elements.chapterModalTitle.textContent = chapter.displayTitle;
            }
            if (elements.chapterModalContent) {
                // 格式化内容，保留段落
                const formattedContent = chapter.content
                    .split('\n')
                    .filter(p => p.trim())
                    .map(p => `<p class="mb-4 leading-relaxed text-gray-700">${p.trim()}</p>`)
                    .join('');
                elements.chapterModalContent.innerHTML = formattedContent;
            }
            
            if (elements.chapterModal) {
                elements.chapterModal.classList.remove('hidden');
            }
        } else {
            alert('无法加载章节内容');
        }
    } catch (error) {
        console.error('加载章节内容失败:', error);
        alert('加载章节内容失败');
    } finally {
        showLoading(false);
    }
}

/**
 * 关闭章节模态框
 */
function closeChapterModal() {
    if (elements.chapterModal) {
        elements.chapterModal.classList.add('hidden');
    }
}

/**
 * 选择章节并加载角色
 */
async function selectChapter(chapterId) {
    try {
        const chapter = gameState.chapters.find(c => c.id === chapterId);
        if (!chapter) {
            throw new Error('章节不存在');
        }
        
        gameState.selectedChapter = chapter;
        
        // 显示10秒加载动画
        showChapterLoadingScreen(chapter);
        
        // 同时开始请求AI角色
        gameState.aiRecommendedCharacters = [];
        gameState.isLoadingAICharacters = true; // 标记正在加载AI角色
        
        const aiCharactersPromise = fetchChapterCharacters(chapterId);
        
        // 等待10秒后跳转到角色选择页
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // 隐藏加载动画
        hideChapterLoadingScreen();
        
        // 设置初始角色列表（2个loading占位 + 默认角色）
        gameState.characters = [...defaultCharacters];
        renderCharacters();
        updateSelectedChapterInfo();
        showPhase('characterSelection');
        
        // 处理AI角色请求结果
        aiCharactersPromise.then(result => {
            gameState.isLoadingAICharacters = false;
            if (result.success && result.characters && result.characters.length > 0) {
                // 合并AI角色和默认角色，AI角色在前，并按name去重
                const aiCharacters = result.characters;
                gameState.aiRecommendedCharacters = aiCharacters;
                
                // 按name去重合并，AI角色在前
                const seen = new Set();
                const mergedCharacters = [];
                
                // 先添加AI角色
                for (const char of aiCharacters) {
                    if (!seen.has(char.name)) {
                        seen.add(char.name);
                        mergedCharacters.push({
                            ...char,
                            isAIRecommended: true // 标记为AI推荐
                        });
                    }
                }
                
                // 再添加默认角色
                for (const char of defaultCharacters) {
                    if (!seen.has(char.name)) {
                        seen.add(char.name);
                        mergedCharacters.push(char);
                    }
                }
                
                gameState.characters = mergedCharacters;
            }
            renderCharacters();
        }).catch(error => {
            console.error('获取AI角色失败:', error);
            gameState.isLoadingAICharacters = false;
            renderCharacters();
        });
        
    } catch (error) {
        console.error('选择章节失败:', error);
        hideChapterLoadingScreen();
        alert('加载角色失败，请重试');
    }
}

/**
 * 显示章节加载动画（10秒倒计时）
 */
function showChapterLoadingScreen(chapter) {
    // 移除已存在的加载屏幕
    hideChapterLoadingScreen();
    
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'chapterLoadingScreen';
    loadingScreen.className = 'fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 z-50 flex items-center justify-center';
    loadingScreen.innerHTML = `
        <div class="text-center text-white px-8">
            <div class="mb-8">
                <i class="fas fa-book-open text-6xl text-yellow-300 animate-pulse"></i>
            </div>
            <h2 class="text-3xl font-bold mb-4">正在进入</h2>
            <h3 class="text-2xl text-yellow-300 mb-6">${chapter.displayTitle}</h3>
            <div class="mb-6">
                <div class="w-64 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                    <div id="loadingProgress" class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
            </div>
            <p class="text-lg text-white/80 mb-2">AI正在为您推荐本章节角色...</p>
            <p id="loadingCountdown" class="text-sm text-white/60">预计等待 10 秒</p>
        </div>
    `;
    document.body.appendChild(loadingScreen);
    
    // 启动进度条动画和倒计时
    let countdown = 10;
    const progressBar = document.getElementById('loadingProgress');
    const countdownText = document.getElementById('loadingCountdown');
    
    const interval = setInterval(() => {
        countdown--;
        if (progressBar) {
            progressBar.style.width = `${(10 - countdown) * 10}%`;
        }
        if (countdownText) {
            countdownText.textContent = countdown > 0 ? `预计等待 ${countdown} 秒` : '即将进入...';
        }
        if (countdown <= 0) {
            clearInterval(interval);
        }
    }, 1000);
    
    // 保存interval引用以便清理
    loadingScreen.dataset.intervalId = interval;
}

/**
 * 隐藏章节加载动画
 */
function hideChapterLoadingScreen() {
    const loadingScreen = document.getElementById('chapterLoadingScreen');
    if (loadingScreen) {
        // 清理定时器
        if (loadingScreen.dataset.intervalId) {
            clearInterval(parseInt(loadingScreen.dataset.intervalId));
        }
        loadingScreen.remove();
    }
}

/**
 * 生成loading占位卡片HTML
 */
function generateLoadingCard(index) {
    const isFirst = index === 0;
    const badgeText = isFirst ? '推荐' : 'AI推荐';
    const badgeIcon = isFirst ? 'fa-star' : 'fa-magic';
    const badgeColor = isFirst ? 'from-yellow-400 to-orange-500' : 'from-blue-400 to-purple-500';
    const ringClass = isFirst ? 'ring-2 ring-yellow-400' : '';
    
    return `
        <div class="character-card bg-white rounded-2xl shadow-lg overflow-hidden ${ringClass} animate-pulse">
            <div class="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                <div class="absolute top-2 left-2 bg-gradient-to-r ${badgeColor} text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                    <i class="fas ${badgeIcon} mr-1"></i>${badgeText}
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                </div>
            </div>
            <div class="p-6">
                <div class="h-8 bg-gray-200 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div class="h-4 bg-gray-200 rounded mb-4"></div>
                <div class="flex flex-wrap gap-2 mb-4">
                    <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                    <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                    <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
                <div class="h-12 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    `;
}

/**
 * 更新选中章节信息
 */
function updateSelectedChapterInfo() {
    if (elements.selectedChapterInfo && gameState.selectedChapter) {
        elements.selectedChapterInfo.textContent = gameState.selectedChapter.displayTitle;
    }
    if (elements.chapterContextText && gameState.chapterContext) {
        elements.chapterContextText.textContent = gameState.chapterContext;
    }
}

/**
 * 显示指定阶段
 */
function showPhase(phase) {
    gameState.currentPhase = phase;
    
    // 隐藏所有阶段
    if (elements.chapterSelection) elements.chapterSelection.classList.add('hidden');
    if (elements.characterSelection) elements.characterSelection.classList.add('hidden');
    if (elements.gamePlay) elements.gamePlay.classList.add('hidden');
    if (elements.gameEnd) elements.gameEnd.classList.add('hidden');
    
    // 显示指定阶段
    switch (phase) {
        case 'chapters':
            if (elements.chapterSelection) elements.chapterSelection.classList.remove('hidden');
            break;
        case 'characterSelection':
            if (elements.characterSelection) elements.characterSelection.classList.remove('hidden');
            break;
        case 'gamePlay':
            if (elements.gamePlay) elements.gamePlay.classList.remove('hidden');
            break;
        case 'gameEnd':
            if (elements.gameEnd) elements.gameEnd.classList.remove('hidden');
            break;
    }
}

/**
 * 渲染角色选择卡片
 */
function renderCharacters() {
    if (!elements.characterGrid) return;
    
    let html = '';
    
    // 如果正在加载AI角色，先显示2个loading占位卡片
    if (gameState.isLoadingAICharacters) {
        html += generateLoadingCard(0); // 推荐位置
        html += generateLoadingCard(1); // AI推荐位置
    }
    
    // 渲染真实角色卡片
    html += gameState.characters.map((char, index) => {
        // 计算实际显示位置（如果有loading卡片，真实角色从第3个位置开始）
        const displayIndex = gameState.isLoadingAICharacters ? index + 2 : index;
        
        // 第一个AI推荐的角色显示"推荐"标识
        const isFirstRecommended = index === 0 && char.isAIRecommended;
        const recommendBadge = isFirstRecommended ? 
            `<div class="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                <i class="fas fa-star mr-1"></i>推荐
            </div>` : '';
        const aiRecommendedBadge = char.isAIRecommended && !isFirstRecommended ? 
            `<div class="absolute top-2 left-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                <i class="fas fa-magic mr-1"></i>AI推荐
            </div>` : '';
        
        return `
        <div class="character-card bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:shadow-2xl ${isFirstRecommended ? 'ring-2 ring-yellow-400' : ''}" data-character-id="${char.id}">
            <div class="relative h-48 overflow-hidden">
                ${recommendBadge}
                ${aiRecommendedBadge}
                <img src="${char.avatar}" alt="${char.name}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/200?text=${encodeURIComponent(char.name)}'">
                <div class="absolute inset-0 bg-gradient-to-t ${char.color || 'from-orange-400 to-red-500'} opacity-30"></div>
            </div>
            <div class="p-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">${char.name}</h3>
                <p class="text-sm text-gray-600 mb-3">${char.role}</p>
                <p class="text-gray-700 mb-4 line-clamp-2">${char.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${(char.traits || []).map(trait => `
                        <span class="px-3 py-1 bg-gradient-to-r ${char.color || 'from-orange-400 to-red-500'} text-white text-xs rounded-full">${trait}</span>
                    `).join('')}
                </div>
                <button class="select-character-btn w-full bg-gradient-to-r ${char.color || 'from-orange-400 to-red-500'} text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                    选择此角色
                </button>
            </div>
        </div>
    `}).join('');
    
    elements.characterGrid.innerHTML = html;
}

/**
 * 选择角色
 */
function selectCharacter(characterId) {
    // 移除所有选中状态
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected', 'ring-4', 'ring-orange-500');
    });

    // 添加选中状态
    const selectedCard = document.querySelector(`[data-character-id="${characterId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected', 'ring-4', 'ring-orange-500');
    }

    // 保存选中的角色
    gameState.selectedCharacter = gameState.characters.find(c => c.id === characterId);
    if (elements.startGameBtn) {
        elements.startGameBtn.disabled = false;
    }

    // 滚动到开始按钮
    if (elements.startGameBtn) {
        elements.startGameBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * 开始游戏
 */
async function startGame() {
    if (!gameState.selectedCharacter || !gameState.selectedChapter) return;

    gameState.isPlaying = true;
    gameState.currentStep = 1;
    gameState.storyHistory = [];

    // 切换界面
    showPhase('gamePlay');

    // 显示当前章回标题
    if (elements.currentChapterTitle && gameState.selectedChapter) {
        elements.currentChapterTitle.textContent = gameState.selectedChapter.displayTitle;
    }

    // 显示角色信息
    updateCharacterInfo();

    // 判断角色是否为AI推荐角色（即是否在本章节中存在）
    // AI推荐的角色一定是章节中存在的，默认角色可能不在章节中
    const isAIRecommended = gameState.aiRecommendedCharacters.some(
        c => c.name === gameState.selectedCharacter.name
    );
    
    // 唐僧师徒四人（含白龙马）的ID列表，这些角色不需要显示演绎提示
    const mainCharacterIds = ['tangseng', 'wukong', 'bajie', 'shaseng', 'bailongma', 'shawujing', 'tangxuanzeng', 'tangsanzang', 'sunwukong', 'qitiandasheng', 'zhubajie', 'zhuganglie'];
    const mainCharacterNames = ['唐僧', '悟空', '八戒', '沙僧', '白龙马', '沙悟净', '唐三藏', '唐玄奘', '孙悟空', '齐天大圣', '猪八戒'];
    const isMainCharacter = mainCharacterNames.includes(gameState.selectedCharacter.name);
    
    // 只有当角色既不是AI推荐，也不是唐僧师徒四人时，才显示演绎提示
    if (elements.characterNotInChapterTip) {
        if (!isAIRecommended && !isMainCharacter && gameState.aiRecommendedCharacters.length > 0) {
            // 角色不在AI推荐列表中，且不是主角团，说明该角色可能不在本章节中
            elements.characterNotInChapterTip.classList.remove('hidden');
        } else {
            elements.characterNotInChapterTip.classList.add('hidden');
        }
    }

    // 加载第一步故事（使用流式输出）
    await loadStoryStream();
}

/**
 * 更新角色信息显示
 */
function updateCharacterInfo() {
    if (elements.currentCharacterAvatar) {
        elements.currentCharacterAvatar.src = gameState.selectedCharacter.avatar;
        elements.currentCharacterAvatar.onerror = function() {
            this.src = `https://via.placeholder.com/80?text=${encodeURIComponent(gameState.selectedCharacter.name)}`;
        };
    }
    if (elements.currentCharacterName) {
        elements.currentCharacterName.textContent = gameState.selectedCharacter.name;
    }
    if (elements.currentCharacterRole) {
        elements.currentCharacterRole.textContent = gameState.selectedCharacter.role;
    }
}

/**
 * 更新进度条
 */
function updateProgress() {
    const progress = (gameState.currentStep / gameState.maxSteps) * 100;
    if (elements.progressBar) {
        elements.progressBar.style.width = `${progress}%`;
    }
    if (elements.stepCounter) {
        elements.stepCounter.textContent = `第 ${gameState.currentStep}/${gameState.maxSteps} 步`;
    }
}

/**
 * 加载故事内容（流式输出版本）
 */
async function loadStoryStream(userChoice = null) {
    showStreamingLoading(true);
    gameState.isStreaming = true;
    
    // 重置打字机状态
    gameState.currentTypingText = '';
    gameState.displayedTextLength = 0;
    gameState.isTyping = false;
    if (gameState.typewriterTimer) {
        clearTimeout(gameState.typewriterTimer);
        gameState.typewriterTimer = null;
    }
    
    // 清空当前内容，准备流式显示
    if (elements.storyTitle) {
        elements.storyTitle.textContent = '故事生成中...';
    }
    if (elements.storyContent) {
        elements.storyContent.innerHTML = '<span class="typewriter-cursor">█</span>';
    }
    if (elements.literaryQuote) {
        elements.literaryQuote.classList.add('hidden');
    }
    if (elements.feedbackBox) {
        elements.feedbackBox.classList.add('hidden');
    }
    if (elements.originalPlotBox) {
        elements.originalPlotBox.classList.add('hidden');
    }
    // 注意：characterNotInChapterTip 的显示/隐藏在 startGame 时已判断，后续步骤保持原状态
    if (elements.optionsContainer) {
        elements.optionsContainer.innerHTML = '<p class="text-gray-400 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>等待故事生成完成...</p>';
    }
    
    // 禁用输入
    if (elements.customInput) elements.customInput.disabled = true;
    if (elements.submitCustomBtn) elements.submitCustomBtn.disabled = true;

    // 提前先更新进度
    updateProgress();

    try {
        let streamedText = '';
        let lastParsedData = null;

        await callAIAgentStream(
            {
                character: gameState.selectedCharacter,
                step: gameState.currentStep,
                userChoice: userChoice,
                storyHistory: gameState.storyHistory,
                chapterId: gameState.selectedChapter?.id || 1,
                chapterTitle: gameState.selectedChapter?.title || '石猴出世'
            },
            // onChunk - 每次收到数据块
            (chunk, fullText) => {
                streamedText = fullText;
                renderStreamingContent(fullText);
            },
            // onComplete - 完成时
            (parsedData) => {
                lastParsedData = parsedData;
            },
            // onError - 错误时
            (errorMessage) => {
                console.error('流式输出错误:', errorMessage);
                // 降级到非流式调用
                loadStoryFallback(userChoice);
            }
        );

        // 流式输出完成，使用解析后的数据渲染最终结果
        if (lastParsedData) {
            const storyData = formatAIResponse(lastParsedData);
            
            // 保存到历史
            gameState.storyHistory.push({
                step: gameState.currentStep,
                choice: userChoice,
                story: storyData
            });

            // 等待打字机完成后再渲染其他元素
            waitForTypingComplete(() => {
                // 只渲染选项和其他元素，不重新渲染内容（保留打字机效果）
                renderStoryElements(storyData);

                // 检查是否结束（第9步）
                if (gameState.currentStep >= gameState.maxSteps || storyData.isEnd) {
                    // 显示"查看收获"按钮，而不是直接结束
                    showEndConfirmButton(storyData);
                }
            });
        }

    } catch (error) {
        console.error('加载故事失败:', error);
        // 降级到非流式调用
        await loadStoryFallback(userChoice);
    } finally {
        gameState.isStreaming = false;
        showStreamingLoading(false);
        // 重新启用输入
        if (elements.customInput) elements.customInput.disabled = false;
        if (elements.submitCustomBtn) elements.submitCustomBtn.disabled = false;
    }
}

/**
 * 打字机效果 - 增量逐字显示（流式输出专用）
 * @param {string} fullText - 完整文本（不断增长）
 * @param {HTMLElement} element - 显示元素
 * @param {number} speed - 打字速度（毫秒）
 */
function typewriterEffectIncremental(fullText, element, speed = 30) {
    // 如果文本没有变化，不做任何操作
    if (fullText === gameState.currentTypingText) {
        return;
    }
    
    // 更新当前文本
    gameState.currentTypingText = fullText;
    
    // 开始逐字显示
    function typeNextChar() {
        const currentText = gameState.currentTypingText;
        const displayedLength = gameState.displayedTextLength;
        
        if (displayedLength < currentText.length) {
            // 显示下一个字符
            const char = currentText.charAt(displayedLength);
            gameState.displayedTextLength++;
            
            // 更新显示内容（包含光标）
            const displayedText = currentText.substring(0, gameState.displayedTextLength);
            element.innerHTML = formatTextWithLineBreaks(displayedText) + '<span class="typewriter-cursor">█</span>';
            
            // 自动滚动
            element.scrollTop = element.scrollHeight;
            
            // 根据字符类型调整速度
            let delay = speed;
            if (char === '。' || char === '！' || char === '？') {
                delay = speed * 8; // 句号停顿更久
            } else if (char === '，' || char === '、') {
                delay = speed * 4; // 逗号停顿
            } else if (char === '\n') {
                delay = speed * 6; // 换行停顿
            }
            
            // 继续打字
            gameState.typewriterTimer = setTimeout(typeNextChar, delay);
        } else {
            // 打字完成，移除光标
            element.innerHTML = formatTextWithLineBreaks(currentText);
            gameState.isTyping = false;
        }
    }
    
    // 如果是第一次打字，清空内容并开始
    if (gameState.displayedTextLength === 0) {
        element.innerHTML = '<span class="typewriter-cursor">█</span>';
        gameState.isTyping = true;
        typeNextChar();
    } else if (!gameState.isTyping) {
        // 如果之前的打字已完成，继续打新增的内容
        gameState.isTyping = true;
        typeNextChar();
    }
    // 如果正在打字中，不需要做任何事，typeNextChar会自动处理新增的文本
}

/**
 * 打字机效果 - 完整文本一次性打字（用于最终渲染）
 */
function typewriterEffectComplete(text, element, speed = 20) {
    return new Promise((resolve) => {
        let index = 0;
        element.innerHTML = '';
        
        function typeChar() {
            if (index < text.length) {
                const char = text.charAt(index);
                index++;
                
                // 更新显示内容（包含光标）
                const displayedText = text.substring(0, index);
                element.innerHTML = formatTextWithLineBreaks(displayedText) + '<span class="typewriter-cursor">█</span>';
                
                // 自动滚动
                element.scrollTop = element.scrollHeight;
                
                // 根据字符类型调整速度
                let delay = speed;
                if (char === '。' || char === '！' || char === '？') {
                    delay = speed * 8;
                } else if (char === '，' || char === '、') {
                    delay = speed * 4;
                } else if (char === '\n') {
                    delay = speed * 6;
                }
                
                setTimeout(typeChar, delay);
            } else {
                // 完成后移除光标
                element.innerHTML = formatTextWithLineBreaks(text);
                resolve();
            }
        }
        
        typeChar();
    });
}

/**
 * 格式化文本，处理换行
 */
function formatTextWithLineBreaks(text) {
    return text.replace(/\n/g, '<br>');
}

/**
 * 渲染流式内容（优化版 - 增量打字机效果）
 * 只展示正文内容，不展示原始JSON结构
 */
function renderStreamingContent(text) {
    // 尝试提取title（完整的title字段）
    const titleMatch = text.match(/"title"\s*:\s*"([^"]*)"/);
    if (titleMatch && elements.storyTitle) {
        elements.storyTitle.textContent = titleMatch[1];
    }

    // 尝试从文本中提取content字段的内容
    let displayText = null;
    
    // 检查是否包含content字段
    if (text.includes('"content"')) {
        try {
            // 方法1：尝试提取完整的content字段（带结束引号）
            const completeContentMatch = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
            if (completeContentMatch) {
                displayText = completeContentMatch[1]
                    .replace(/\\n/g, '\n')
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\');
            } else {
                // 方法2：提取不完整的content字段（正在流式输出中）
                // 匹配从 "content": " 开始到当前位置的所有内容
                const partialContentMatch = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)/s);
                if (partialContentMatch) {
                    displayText = partialContentMatch[1]
                        .replace(/\\n/g, '\n')
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\');
                }
            }
        } catch (e) {
            console.warn('解析content失败:', e);
        }
    }

    // 只有成功提取到content内容时才展示
    // 避免展示原始JSON结构
    if (displayText !== null && displayText.length > 0 && elements.storyContent) {
        typewriterEffectIncremental(displayText, elements.storyContent, 30);
    }
    // 如果没有提取到content，保持等待状态（显示光标）
}

/**
 * 格式化流式文本
 */
function formatStreamingText(text) {
    // 处理换行
    return text
        .split('\n\n')
        .map(para => para.trim())
        .filter(para => para)
        .map(para => `<p class="mb-3 leading-relaxed">${para}</p>`)
        .join('');
}

/**
 * 等待打字机完成
 */
function waitForTypingComplete(callback) {
    const checkInterval = setInterval(() => {
        if (!gameState.isTyping) {
            clearInterval(checkInterval);
            // 移除光标
            if (elements.storyContent) {
                const cursorElement = elements.storyContent.querySelector('.typewriter-cursor');
                if (cursorElement) {
                    cursorElement.remove();
                }
            }
            callback();
        }
    }, 100);
}

/**
 * 渲染故事元素（不包括内容，保留打字机效果）
 */
function renderStoryElements(storyData) {
    // 标题（如果还没设置）
    if (elements.storyTitle && elements.storyTitle.textContent === '故事生成中...') {
        elements.storyTitle.textContent = storyData.title;
    }

    // 注意：characterNotInChapterTip 的显示/隐藏在 startGame 时已判断，此处不再处理

    // 反馈信息（如果用户选择不合理）
    if (storyData.feedback && storyData.feedback.trim()) {
        if (elements.feedbackBox) {
            elements.feedbackBox.classList.remove('hidden');
        }
        if (elements.feedbackText) {
            elements.feedbackText.textContent = storyData.feedback;
        }
    } else {
        if (elements.feedbackBox) {
            elements.feedbackBox.classList.add('hidden');
        }
    }

    // 原著情节参考
    if (storyData.originalPlot && storyData.originalPlot.trim()) {
        if (elements.originalPlotBox) {
            elements.originalPlotBox.classList.remove('hidden');
        }
        if (elements.originalPlotText) {
            elements.originalPlotText.textContent = storyData.originalPlot;
        }
    } else {
        if (elements.originalPlotBox) {
            elements.originalPlotBox.classList.add('hidden');
        }
    }

    // 文学引用
    if (storyData.literaryQuote && storyData.literaryQuote.trim()) {
        if (elements.literaryQuote) {
            elements.literaryQuote.classList.remove('hidden');
        }
        if (elements.quoteText) {
            elements.quoteText.textContent = `"${storyData.literaryQuote}"`;
        }
    } else {
        if (elements.literaryQuote) {
            elements.literaryQuote.classList.add('hidden');
        }
    }

    // 渲染选项
    renderOptions(storyData.options || []);
}

/**
 * 渲染最终故事（流式完成后）
 */
function renderFinalStory(storyData) {
    // 添加过渡动画
    if (elements.storyContent) {
        elements.storyContent.style.opacity = '0';
    }
    
    setTimeout(() => {
        // 标题
        if (elements.storyTitle) {
            elements.storyTitle.textContent = storyData.title;
        }

        // 注意：characterNotInChapterTip 的显示/隐藏在 startGame 时已判断，此处不再处理

        // 内容
        if (elements.storyContent) {
            elements.storyContent.innerHTML = '';
            const paragraphs = storyData.content.split('\n\n');
            paragraphs.forEach((para, index) => {
                if (para.trim()) {
                    const p = document.createElement('p');
                    p.textContent = para.trim();
                    p.className = 'mb-4 leading-relaxed';
                    p.style.opacity = '0';
                    p.style.animation = `fade-in 0.5s ease-out ${index * 0.1}s forwards`;
                    elements.storyContent.appendChild(p);
                }
            });
        }

        // 反馈信息（如果用户选择不合理）
        if (storyData.feedback && storyData.feedback.trim()) {
            if (elements.feedbackBox) {
                elements.feedbackBox.classList.remove('hidden');
            }
            if (elements.feedbackText) {
                elements.feedbackText.textContent = storyData.feedback;
            }
        } else {
            if (elements.feedbackBox) {
                elements.feedbackBox.classList.add('hidden');
            }
        }

        // 原著情节参考
        if (storyData.originalPlot && storyData.originalPlot.trim()) {
            if (elements.originalPlotBox) {
                elements.originalPlotBox.classList.remove('hidden');
            }
            if (elements.originalPlotText) {
                elements.originalPlotText.textContent = storyData.originalPlot;
            }
        } else {
            if (elements.originalPlotBox) {
                elements.originalPlotBox.classList.add('hidden');
            }
        }

        // 优美语句
        if (storyData.literaryQuote) {
            if (elements.literaryQuote) {
                elements.literaryQuote.classList.remove('hidden');
                elements.literaryQuote.style.animation = 'fade-in 0.5s ease-out 0.3s forwards';
            }
            if (elements.quoteText) {
                elements.quoteText.textContent = storyData.literaryQuote;
            }
        } else {
            if (elements.literaryQuote) {
                elements.literaryQuote.classList.add('hidden');
            }
        }

        // 选项（延迟显示）
        setTimeout(() => {
            renderOptions(storyData.options);
        }, 500);

        // 清空自定义输入
        if (elements.customInput) {
            elements.customInput.value = '';
        }

        // 恢复透明度
        if (elements.storyContent) {
            elements.storyContent.style.opacity = '1';
            elements.storyContent.style.transition = 'opacity 0.3s ease-in';
        }
        
        // 滚动到顶部
        if (elements.gamePlay) {
            elements.gamePlay.scrollIntoView({ behavior: 'smooth' });
        }
    }, 200);
}

/**
 * 降级到非流式加载
 */
async function loadStoryFallback(userChoice = null) {
    showLoading(true, '故事生成中...');

    try {
        const response = await callAIAgent({
            character: gameState.selectedCharacter,
            step: gameState.currentStep,
            userChoice: userChoice,
            storyHistory: gameState.storyHistory,
            chapterId: gameState.selectedChapter?.id || 1,
            chapterTitle: gameState.selectedChapter?.title || '石猴出世'
        });

        const storyData = formatAIResponse(response);

        // 保存到历史
        gameState.storyHistory.push({
            step: gameState.currentStep,
            choice: userChoice,
            story: storyData
        });

        // 渲染故事
        renderStory(storyData);

        // 检查是否结束
        if (gameState.currentStep >= gameState.maxSteps || storyData.isEnd) {
            setTimeout(() => endGame(storyData), 2000);
        }

    } catch (error) {
        console.error('加载故事失败:', error);
        alert('故事加载失败，请重试');
    } finally {
        showLoading(false);
    }
}

/**
 * 渲染故事内容（非流式版本）
 */
function renderStory(storyData) {
    // 标题
    if (elements.storyTitle) {
        elements.storyTitle.textContent = storyData.title;
    }

    // 注意：characterNotInChapterTip 的显示/隐藏在 startGame 时已判断，此处不再处理

    // 内容（添加动画效果）
    if (elements.storyContent) {
        elements.storyContent.innerHTML = '';
        const paragraphs = storyData.content.split('\n\n');
        paragraphs.forEach((para, index) => {
            if (para.trim()) {
                const p = document.createElement('p');
                p.textContent = para.trim();
                p.className = 'mb-4 leading-relaxed';
                p.style.opacity = '0';
                p.style.animation = `slide-in 0.6s ease-out ${index * 0.2}s forwards`;
                elements.storyContent.appendChild(p);
            }
        });
    }

    // 反馈信息
    if (storyData.feedback && storyData.feedback.trim()) {
        if (elements.feedbackBox) elements.feedbackBox.classList.remove('hidden');
        if (elements.feedbackText) elements.feedbackText.textContent = storyData.feedback;
    } else {
        if (elements.feedbackBox) elements.feedbackBox.classList.add('hidden');
    }

    // 原著情节
    if (storyData.originalPlot && storyData.originalPlot.trim()) {
        if (elements.originalPlotBox) elements.originalPlotBox.classList.remove('hidden');
        if (elements.originalPlotText) elements.originalPlotText.textContent = storyData.originalPlot;
    } else {
        if (elements.originalPlotBox) elements.originalPlotBox.classList.add('hidden');
    }

    // 优美语句
    if (storyData.literaryQuote) {
        if (elements.literaryQuote) elements.literaryQuote.classList.remove('hidden');
        if (elements.quoteText) elements.quoteText.textContent = storyData.literaryQuote;
    } else {
        if (elements.literaryQuote) elements.literaryQuote.classList.add('hidden');
    }

    // 选项
    renderOptions(storyData.options);

    // 清空自定义输入
    if (elements.customInput) {
        elements.customInput.value = '';
    }

    // 滚动到顶部
    if (elements.gamePlay) {
        elements.gamePlay.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * 渲染选项
 */
function renderOptions(options) {
    if (!elements.optionsContainer) return;
    
    if (!options || options.length === 0) {
        elements.optionsContainer.innerHTML = '<p class="text-gray-500 text-center">暂无预设选项，请使用自由输入</p>';
        return;
    }

    elements.optionsContainer.innerHTML = options.map((option, index) => {
        const isRecommended = option.isRecommended !== false;
        const recommendedClass = isRecommended 
            ? 'from-orange-50 to-red-50 border-orange-200 hover:border-orange-400' 
            : 'from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400';
        const recommendedIcon = isRecommended 
            ? '<i class="fas fa-chevron-right text-orange-500 mr-3"></i>' 
            : '<i class="fas fa-exclamation-triangle text-yellow-500 mr-3" title="此选项可能偏离原著"></i>';
        
        return `
            <button class="option-btn w-full text-left px-6 py-4 bg-gradient-to-r ${recommendedClass} border-2 rounded-xl font-medium text-gray-800 shadow-sm hover:shadow-md transition-all ${gameState.isStreaming ? 'opacity-50 cursor-not-allowed' : ''}" 
                    data-value="${option.value}" 
                    data-text="${option.text}"
                    data-recommended="${isRecommended}"
                    ${gameState.isStreaming ? 'disabled' : ''}
                    style="animation: slide-in 0.6s ease-out ${index * 0.1}s backwards;">
                ${recommendedIcon}
                ${option.text}
                ${!isRecommended ? '<span class="text-xs text-yellow-600 ml-2">(可能偏离原著)</span>' : ''}
            </button>
        `;
    }).join('');
}

/**
 * 处理选择
 */
async function handleChoice(choice) {
    if (!gameState.isPlaying || gameState.isStreaming) return;

    // 增加步数
    gameState.currentStep++;

    // 加载下一步故事（使用流式输出）
    await loadStoryStream(choice);
}

/**
 * 处理自定义输入
 */
async function handleCustomInput() {
    if (gameState.isStreaming) return;
    
    const input = elements.customInput?.value.trim();
    if (!input) {
        alert('请输入你的想法或行动');
        return;
    }

    await handleChoice({
        value: 'custom',
        text: input,
        isRecommended: false // 自定义输入标记为可能偏离原著
    });
}

/**
 * 显示/隐藏普通加载提示
 */
function showLoading(show, message = '加载中...') {
    if (!elements.loadingOverlay) return;
    
    if (show) {
        elements.loadingOverlay.innerHTML = `
            <div class="bg-white rounded-2xl p-8 shadow-2xl text-center">
                <div class="animate-spin text-6xl mb-4">🌀</div>
                <p class="text-xl font-bold text-gray-800">${message}</p>
            </div>
        `;
        elements.loadingOverlay.classList.remove('hidden');
    } else {
        elements.loadingOverlay.classList.add('hidden');
    }
}

/**
 * 显示/隐藏流式加载提示
 */
function showStreamingLoading(show) {
    if (!elements.loadingOverlay) return;
    
    if (show) {
        // 修改加载提示为流式模式
        elements.loadingOverlay.innerHTML = `
            <div class="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm">
                <div class="flex items-center justify-center gap-1 mb-4">
                    <span class="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style="animation-delay: 0s"></span>
                    <span class="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                    <span class="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                </div>
                <p class="text-xl font-bold text-gray-800">智能体思考中...</p>
                <p class="text-gray-600 mt-2">正在为你编织精彩的故事</p>
            </div>
        `;
        elements.loadingOverlay.classList.remove('hidden');
        // 短暂显示后隐藏，让流式内容可见
        setTimeout(() => {
            elements.loadingOverlay.classList.add('hidden');
        }, 1000);
    } else {
        elements.loadingOverlay.classList.add('hidden');
    }
}

/**
 * 显示结束确认按钮
 */
function showEndConfirmButton(storyData) {
    gameState.waitingForEndConfirm = true;
    
    // 隐藏选项和自定义输入
    if (elements.optionsContainer) {
        elements.optionsContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="mb-6">
                    <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">恭喜！你已完成这段旅程</h3>
                    <p class="text-gray-600">点击下方按钮查看你的收获和完整故事</p>
                </div>
                <button id="viewResultBtn" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <i class="fas fa-trophy mr-2"></i>
                    查看收获
                </button>
            </div>
        `;
        
        // 绑定按钮事件
        const viewResultBtn = document.getElementById('viewResultBtn');
        if (viewResultBtn) {
            viewResultBtn.addEventListener('click', () => {
                endGame(storyData);
            });
        }
    }
    
    // 禁用自定义输入
    if (elements.customInput) elements.customInput.disabled = true;
    if (elements.submitCustomBtn) elements.submitCustomBtn.disabled = true;
}

/**
 * 结束游戏
 */
function endGame(finalStory) {
    gameState.isPlaying = false;
    gameState.waitingForEndConfirm = false;

    // 切换到结束界面
    showPhase('gameEnd');

    // 生成结局文本
    const endings = {
        'tangseng': '经过九九八十一难，你终于到达西天，取得真经。如来佛祖赞叹你的慈悲与坚持，封你为旃檀功德佛。你将真经带回东土，普度众生，功德圆满。',
        'wukong': '一路降妖除魔，你保护师父完成了取经大业。如来佛祖认可你的功绩，封你为斗战胜佛。你终于明白，真正的自由不是无拘无束，而是心中有责、肩上有担。',
        'bajie': '虽然一路贪吃懒做，但你从未真正放弃。如来佛祖看到你的改变，封你为净坛使者。你明白了，人生不在于完美，而在于不断进步。',
        'shaseng': '你默默挑着担子走完了十万八千里，如来佛祖赞叹你的坚韧，封你为金身罗汉。你证明了，平凡的坚持也能成就不凡。',
        'bailongma': '你驮着师父走过千山万水，如来佛祖感念你的功劳，恢复你的龙身，封你为八部天龙。你明白了，真正的高贵不在于身份，而在于责任。',
        'baigujing': '你的执念最终害了自己。但在最后一刻，你似乎明白了什么。或许来世，你会选择不同的道路...',
        'niuwang': '在兄弟情义和妖界立场之间，你做出了自己的选择。无论结果如何，你都坦然面对。这就是平天大圣的风范。',
        'honghaier': '跟随观音菩萨修行，你逐渐放下了执念。在南海的日子里，你学会了慈悲与智慧。或许这才是父母真正希望看到的你。'
    };

    // 优先使用AI生成的结局
    if (elements.endingText) {
        elements.endingText.textContent = finalStory?.ending || endings[gameState.selectedCharacter?.id] || endings['tangseng'];
    }

    // 生成学习要点（基于实际游戏历史）
    const defaultLearningPoints = generateLearningPoints();

    // 使用AI生成的学习要点或默认要点
    const learningPoints = (finalStory?.learningPoints?.length > 0)
        ? finalStory.learningPoints.map((text, i) => ({
            icon: ['fa-book', 'fa-user', 'fa-quote-left', 'fa-users', 'fa-heart', 'fa-lightbulb'][i % 6],
            text: text
        }))
        : defaultLearningPoints;

    if (elements.learningPoints) {
        elements.learningPoints.innerHTML = learningPoints.map(point => `
            <div class="flex items-start gap-3 text-gray-700">
                <i class="fas ${point.icon} text-orange-600 mt-1"></i>
                <span>${point.text}</span>
            </div>
        `).join('');
    }
    
    // 生成完整故事回顾
    generateStoryReview();

    // 滚动到顶部
    if (elements.gameEnd) {
        elements.gameEnd.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * 生成学习要点（基于实际游戏历史）
 */
function generateLearningPoints() {
    const points = [];
    
    // 基础要点
    points.push({
        icon: 'fa-book',
        text: `深入了解了《西游记》第${gameState.selectedChapter?.id}回"${gameState.selectedChapter?.title}"的故事情节`
    });
    
    points.push({
        icon: 'fa-user',
        text: `体验了${gameState.selectedCharacter?.name}的角色视角，理解了${gameState.selectedCharacter?.role}的责任与使命`
    });
    
    // 统计用户选择
    const recommendedChoices = gameState.storyHistory.filter(h => 
        h.choice && h.choice.isRecommended !== false
    ).length;
    
    const totalChoices = gameState.storyHistory.filter(h => h.choice).length;
    
    if (recommendedChoices / totalChoices > 0.7) {
        points.push({
            icon: 'fa-star',
            text: `你的选择大多符合原著精神，展现了对经典的尊重和理解`
        });
    } else {
        points.push({
            icon: 'fa-lightbulb',
            text: `你勇于尝试不同的选择，虽然有些偏离原著，但也展现了创新思维`
        });
    }
    
    // 收集学到的名言（去重）
    const quotes = [...new Set(
        gameState.storyHistory
            .map(h => h.story?.literaryQuote)
            .filter(q => q && q.trim())
    )];
    
    if (quotes.length > 0) {
        points.push({
            icon: 'fa-quote-left',
            text: `学习了${quotes.length}句经典名言，如："${quotes[0]}"`
        });
    }
    
    // 角色特质相关
    if (gameState.selectedCharacter?.traits) {
        const traits = gameState.selectedCharacter.traits.slice(0, 3).join('、');
        points.push({
            icon: 'fa-heart',
            text: `感受到了${traits}等优秀品质的重要性`
        });
    }
    
    points.push({
        icon: 'fa-users',
        text: `通过${gameState.currentStep}步的互动，培养了同理心和决策能力`
    });
    
    return points;
}

/**
 * 生成完整故事回顾
 */
function generateStoryReview() {
    const storyReviewHTML = `
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-book-open text-purple-600 mr-2"></i>
                    你的完整故事
                </h3>
                <button id="exportStoryBtn" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                    <i class="fas fa-download mr-2"></i>
                    导出图片
                </button>
            </div>
            
            <div id="storyReviewContent" class="space-y-4 max-h-96 overflow-y-auto pr-2">
                ${generateStoryTimeline()}
            </div>
        </div>
    `;
    
    // 先检查是否已存在故事回顾容器，如果存在则删除旧的
    const existingContainer = document.getElementById('storyReviewContainer');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // 创建新容器并插入
    if (elements.learningPoints && elements.learningPoints.parentElement) {
        const reviewContainer = document.createElement('div');
        reviewContainer.id = 'storyReviewContainer';  // 添加ID以便后续检测
        reviewContainer.innerHTML = storyReviewHTML;
        elements.learningPoints.parentElement.insertAdjacentElement('afterend', reviewContainer);
        
        // 绑定导出按钮事件
        const exportBtn = document.getElementById('exportStoryBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportStoryAsImage);
        }
    }
}

/**
 * 生成故事时间线
 */
function generateStoryTimeline() {
    if (!gameState.storyHistory || gameState.storyHistory.length === 0) {
        return '<p class="text-gray-500 text-left">暂无故事记录</p>';
    }
    
    return gameState.storyHistory.map((history, index) => {
        const story = history.story || {};
        const choice = history.choice || {};
        const storyContent = story.content || '';
        const isLongContent = storyContent.length > 150;
        const previewContent = isLongContent ? storyContent.substring(0, 150) : storyContent;
        const uniqueId = `story-content-${index}`;
        
        return `
            <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                <div class="flex items-center gap-2 mb-2">
                    <span class="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        ${history.step}
                    </span>
                    <h4 class="font-bold text-gray-800">${story.title || '故事片段'}</h4>
                </div>
                
                <div class="text-gray-700 text-sm mb-2 text-left">
                    <p id="${uniqueId}-preview" class="text-left ${isLongContent ? '' : 'hidden'}">
                        ${previewContent.replace(/\n/g, '<br>')}...
                        <button onclick="toggleStoryContent('${uniqueId}')" class="text-purple-600 hover:text-purple-800 ml-1 font-medium">
                            展开全文 <i class="fas fa-chevron-down text-xs"></i>
                        </button>
                    </p>
                    <p id="${uniqueId}-full" class="text-left ${isLongContent ? 'hidden' : ''}">
                        ${storyContent.replace(/\n/g, '<br>')}
                        ${isLongContent ? `
                            <button onclick="toggleStoryContent('${uniqueId}')" class="text-purple-600 hover:text-purple-800 ml-1 font-medium">
                                收起 <i class="fas fa-chevron-up text-xs"></i>
                            </button>
                        ` : ''}
                    </p>
                </div>
                
                ${choice.text ? `
                    <div class="flex items-center gap-2 text-sm">
                        <i class="fas fa-hand-pointer text-purple-500"></i>
                        <span class="text-gray-600">你的选择：</span>
                        <span class="font-medium text-gray-800">${choice.text}</span>
                        ${choice.isRecommended === false ? 
                            '<span class="text-yellow-600 text-xs ml-2">(创新选择)</span>' : 
                            '<span class="text-green-600 text-xs ml-2">(符合原著)</span>'
                        }
                    </div>
                ` : ''}
                
                ${story.literaryQuote ? `
                    <div class="mt-2 pt-2 border-t border-gray-200">
                        <p class="text-purple-700 italic text-sm">
                            <i class="fas fa-quote-left text-xs mr-1"></i>
                            ${story.literaryQuote}
                        </p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

/**
 * 切换故事内容展开/折叠状态
 * @param {string} uniqueId - 故事内容的唯一ID
 */
function toggleStoryContent(uniqueId) {
    const previewEl = document.getElementById(`${uniqueId}-preview`);
    const fullEl = document.getElementById(`${uniqueId}-full`);
    
    if (previewEl && fullEl) {
        previewEl.classList.toggle('hidden');
        fullEl.classList.toggle('hidden');
    }
}

// 将函数暴露到全局作用域，以便onclick能调用
window.toggleStoryContent = toggleStoryContent;

/**
 * 导出故事为图片
 */
async function exportStoryAsImage() {
    const exportBtn = document.getElementById('exportStoryBtn');
    if (exportBtn) {
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
        exportBtn.disabled = true;
    }
    
    try {
        // 动态加载 html2canvas
        if (typeof html2canvas === 'undefined') {
            await loadHtml2Canvas();
        }
        
        // 获取要导出的元素
        const gameEndSection = document.getElementById('gameEnd');
        if (!gameEndSection) {
            throw new Error('找不到要导出的内容');
        }
        
        // 生成图片
        const canvas = await html2canvas(gameEndSection, {
            backgroundColor: '#ffffff',
            scale: 2, // 提高清晰度
            logging: false,
            useCORS: true
        });
        
        // 下载图片
        const link = document.createElement('a');
        link.download = `西游记故事_${gameState.selectedChapter?.title}_${gameState.selectedCharacter?.name}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // 恢复按钮
        if (exportBtn) {
            exportBtn.innerHTML = '<i class="fas fa-check mr-2"></i>导出成功';
            setTimeout(() => {
                exportBtn.innerHTML = '<i class="fas fa-download mr-2"></i>导出图片';
                exportBtn.disabled = false;
            }, 2000);
        }
        
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请重试');
        
        if (exportBtn) {
            exportBtn.innerHTML = '<i class="fas fa-download mr-2"></i>导出图片';
            exportBtn.disabled = false;
        }
    }
}

/**
 * 动态加载 html2canvas 库
 */
function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * 重新开始游戏
 */
function restartGame() {
    // 重置游戏状态
    gameState.selectedChapter = null;
    gameState.characters = [];
    gameState.selectedCharacter = null;
    gameState.currentStep = 1;
    gameState.storyHistory = [];
    gameState.isPlaying = false;
    gameState.isStreaming = false;
    gameState.chapterContext = '';

    // 切换到章节选择
    showPhase('chapters');

    // 重置按钮状态
    if (elements.startGameBtn) {
        elements.startGameBtn.disabled = true;
    }

    // 移除所有选中状态
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected', 'ring-4', 'ring-orange-500');
    });

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initGame);

// 暴露必要的函数和状态到 window 对象，供调试模块使用
window.gameState = gameState;
window.showPhase = showPhase;
window.endGame = endGame;
window.resetGame = restartGame;
window.updateGameUI = updateProgress;
window.renderFinalStory = renderFinalStory;