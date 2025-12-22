import { characters, getCharacter } from './characters.js';
import { callAIAgent, formatAIResponse } from './ai-agent.js';

// 游戏状态
const gameState = {
    selectedCharacter: null,
    currentStep: 1,
    maxSteps: 9,
    storyHistory: [],
    isPlaying: false
};

// DOM元素
const elements = {
    characterSelection: document.getElementById('characterSelection'),
    gamePlay: document.getElementById('gamePlay'),
    gameEnd: document.getElementById('gameEnd'),
    characterGrid: document.getElementById('characterGrid'),
    startGameBtn: document.getElementById('startGameBtn'),
    stepCounter: document.getElementById('stepCounter'),
    progressBar: document.getElementById('progressBar'),
    currentCharacterAvatar: document.getElementById('currentCharacterAvatar'),
    currentCharacterName: document.getElementById('currentCharacterName'),
    currentCharacterRole: document.getElementById('currentCharacterRole'),
    storyTitle: document.getElementById('storyTitle'),
    storyContent: document.getElementById('storyContent'),
    literaryQuote: document.getElementById('literaryQuote'),
    quoteText: document.getElementById('quoteText'),
    optionsContainer: document.getElementById('optionsContainer'),
    customInput: document.getElementById('customInput'),
    submitCustomBtn: document.getElementById('submitCustomBtn'),
    endingText: document.getElementById('endingText'),
    learningPoints: document.getElementById('learningPoints'),
    restartBtn: document.getElementById('restartBtn'),
    loadingOverlay: document.getElementById('loadingOverlay')
};

/**
 * 初始化游戏
 */
function initGame() {
    renderCharacters();
    bindEvents();
}

/**
 * 渲染角色选择卡片
 */
function renderCharacters() {
    elements.characterGrid.innerHTML = characters.map(char => `
        <div class="character-card bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:shadow-2xl" data-character-id="${char.id}">
            <div class="relative h-48 overflow-hidden">
                <img src="${char.avatar}" alt="${char.name}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t ${char.color} opacity-30"></div>
            </div>
            <div class="p-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">${char.name}</h3>
                <p class="text-sm text-gray-600 mb-3">${char.role}</p>
                <p class="text-gray-700 mb-4 line-clamp-2">${char.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${char.traits.map(trait => `
                        <span class="px-3 py-1 bg-gradient-to-r ${char.color} text-white text-xs rounded-full">${trait}</span>
                    `).join('')}
                </div>
                <button class="select-character-btn w-full bg-gradient-to-r ${char.color} text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                    选择此角色
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 角色选择
    elements.characterGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.character-card');
        if (!card) return;

        const characterId = card.dataset.characterId;
        selectCharacter(characterId);
    });

    // 开始游戏
    elements.startGameBtn.addEventListener('click', startGame);

    // 选项点击
    elements.optionsContainer.addEventListener('click', (e) => {
        const optionBtn = e.target.closest('.option-btn');
        if (!optionBtn) return;

        const optionValue = optionBtn.dataset.value;
        const optionText = optionBtn.dataset.text;
        handleChoice({ value: optionValue, text: optionText });
    });

    // 自定义输入提交
    elements.submitCustomBtn.addEventListener('click', handleCustomInput);
    elements.customInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCustomInput();
        }
    });

    // 重新开始
    elements.restartBtn.addEventListener('click', restartGame);
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
    selectedCard.classList.add('selected', 'ring-4', 'ring-orange-500');

    // 保存选中的角色
    gameState.selectedCharacter = getCharacter(characterId);
    elements.startGameBtn.disabled = false;

    // 滚动到开始按钮
    elements.startGameBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * 开始游戏
 */
async function startGame() {
    if (!gameState.selectedCharacter) return;

    gameState.isPlaying = true;
    gameState.currentStep = 1;
    gameState.storyHistory = [];

    // 切换界面
    elements.characterSelection.classList.add('hidden');
    elements.gamePlay.classList.remove('hidden');

    // 显示角色信息
    updateCharacterInfo();

    // 加载第一步故事
    await loadStory();
}

/**
 * 更新角色信息显示
 */
function updateCharacterInfo() {
    elements.currentCharacterAvatar.src = gameState.selectedCharacter.avatar;
    elements.currentCharacterName.textContent = gameState.selectedCharacter.name;
    elements.currentCharacterRole.textContent = gameState.selectedCharacter.role;
}

/**
 * 更新进度条
 */
function updateProgress() {
    const progress = (gameState.currentStep / gameState.maxSteps) * 100;
    elements.progressBar.style.width = `${progress}%`;
    elements.stepCounter.textContent = `第 ${gameState.currentStep}/${gameState.maxSteps} 步`;
}

/**
 * 加载故事内容
 */
async function loadStory(userChoice = null) {
    showLoading(true);

    try {
        // 调用AI智能体
        const response = await callAIAgent({
            character: gameState.selectedCharacter,
            step: gameState.currentStep,
            userChoice: userChoice,
            storyHistory: gameState.storyHistory
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

        // 更新进度
        updateProgress();

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
 * 渲染故事内容
 */
function renderStory(storyData) {
    // 标题
    elements.storyTitle.textContent = storyData.title;

    // 内容（添加动画效果）
    elements.storyContent.innerHTML = '';
    const paragraphs = storyData.content.split('\n\n');
    paragraphs.forEach((para, index) => {
        const p = document.createElement('p');
        p.textContent = para;
        p.style.opacity = '0';
        p.style.animation = `slide-in 0.6s ease-out ${index * 0.2}s forwards`;
        elements.storyContent.appendChild(p);
    });

    // 优美语句
    if (storyData.literaryQuote) {
        elements.literaryQuote.classList.remove('hidden');
        elements.quoteText.textContent = storyData.literaryQuote;
    } else {
        elements.literaryQuote.classList.add('hidden');
    }

    // 选项
    renderOptions(storyData.options);

    // 清空自定义输入
    elements.customInput.value = '';

    // 滚动到顶部
    elements.gamePlay.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 渲染选项
 */
function renderOptions(options) {
    if (!options || options.length === 0) {
        elements.optionsContainer.innerHTML = '<p class="text-gray-500 text-center">暂无预设选项，请使用自由输入</p>';
        return;
    }

    elements.optionsContainer.innerHTML = options.map((option, index) => `
        <button class="option-btn w-full text-left px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-200 hover:border-orange-400 rounded-xl font-medium text-gray-800 shadow-sm hover:shadow-md transition-all" 
                data-value="${option.value}" 
                data-text="${option.text}"
                style="animation: slide-in 0.6s ease-out ${index * 0.1}s backwards;">
            <i class="fas fa-chevron-right text-orange-500 mr-3"></i>
            ${option.text}
        </button>
    `).join('');
}

/**
 * 处理选择
 */
async function handleChoice(choice) {
    if (!gameState.isPlaying) return;

    // 增加步数
    gameState.currentStep++;

    // 加载下一步故事
    await loadStory(choice);
}

/**
 * 处理自定义输入
 */
async function handleCustomInput() {
    const input = elements.customInput.value.trim();
    if (!input) {
        alert('请输入你的想法或行动');
        return;
    }

    await handleChoice({
        value: 'custom',
        text: input
    });
}

/**
 * 显示/隐藏加载提示
 */
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.remove('hidden');
    } else {
        elements.loadingOverlay.classList.add('hidden');
    }
}

/**
 * 结束游戏
 */
function endGame(finalStory) {
    gameState.isPlaying = false;

    // 切换到结束界面
    elements.gamePlay.classList.add('hidden');
    elements.gameEnd.classList.remove('hidden');

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

    elements.endingText.textContent = endings[gameState.selectedCharacter.id] || endings['tangseng'];

    // 生成学习要点
    const learningPoints = [
        { icon: 'fa-book', text: `了解了《西游记》中${gameState.selectedCharacter.name}的性格特点和故事背景` },
        { icon: 'fa-quote-left', text: '学习了多句经典名言和优美语句' },
        { icon: 'fa-users', text: '理解了团队协作和人际关系的重要性' },
        { icon: 'fa-heart', text: '感受到了坚持、勇气、忠诚等优秀品质' },
        { icon: 'fa-lightbulb', text: '通过角色扮演，培养了同理心和思考能力' }
    ];

    elements.learningPoints.innerHTML = learningPoints.map(point => `
        <div class="flex items-start gap-3 text-gray-700">
            <i class="fas ${point.icon} text-orange-600 mt-1"></i>
            <span>${point.text}</span>
        </div>
    `).join('');

    // 滚动到顶部
    elements.gameEnd.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 重新开始游戏
 */
function restartGame() {
    // 重置游戏状态
    gameState.selectedCharacter = null;
    gameState.currentStep = 1;
    gameState.storyHistory = [];
    gameState.isPlaying = false;

    // 重置界面
    elements.gameEnd.classList.add('hidden');
    elements.gamePlay.classList.add('hidden');
    elements.characterSelection.classList.remove('hidden');
    elements.startGameBtn.disabled = true;

    // 移除所有选中状态
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected', 'ring-4', 'ring-orange-500');
    });

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initGame);
