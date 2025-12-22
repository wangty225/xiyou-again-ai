/**
 * 调试工具模块
 * 用于快速测试，与主逻辑分离
 * 在生产环境中可删除此文件
 */

// 模拟的故事历史数据
const mockStoryHistory = [
    {
        step: 1,
        choice: { value: 'follow_sign', text: '依祖师暗示，三更时分悄悄前往后堂求法', isRecommended: true },
        story: {
            title: '灵台授道',
            content: '灵台方寸山，斜月三星洞，云雾缭绕，瑞气千条。你端坐高台，目光如炬，俯视阶下群徒。美猴王悟空立于众中，双目炯炯，虽形貌不凡却难掩灵性天成。',
            literaryQuote: '妙演三乘教，精微万法全。慢摇麈尾喷珠玉，响振雷霆动九天。',
            originalPlot: '菩提祖师在讲道时见孙悟空天资聪颖，故意以"打三下、倒背手、关中门"暗示其三更时分单独前来传授长生妙道。'
        }
    },
    {
        step: 2,
        choice: { value: 'accept_teaching', text: '跪拜领受长生妙道', isRecommended: true },
        story: {
            title: '三更传道',
            content: '子时三更，月明星稀。悟空悄悄来到后堂，见祖师端坐蒲团之上，心中狂喜。祖师传授长生不老之术，悟空如获至宝。',
            literaryQuote: '显密圆通真妙诀，惜修生命无他说。',
            originalPlot: '菩提祖师在三更时分秘密传授孙悟空长生妙道。'
        }
    },
    {
        step: 3,
        choice: { value: 'learn_72', text: '选择学习七十二般变化', isRecommended: true },
        story: {
            title: '学艺神通',
            content: '祖师问悟空愿学天罡三十六变还是地煞七十二变，悟空贪多，选了七十二变。祖师传授口诀，悟空勤加练习，终于学成。',
            literaryQuote: '万般造化皆由我，十方世界任纵横。',
            originalPlot: '孙悟空选择学习地煞七十二变化之术。'
        }
    },
    {
        step: 4,
        choice: { value: 'show_off', text: '在师兄弟面前炫耀变化之术', isRecommended: false },
        story: {
            title: '卖弄神通',
            content: '悟空按捺不住，在众师兄弟面前炫耀变化之术，惹来一片喝彩。然而此举却触怒了祖师。',
            literaryQuote: '道化贤良释化愚，仙家妙诀莫轻吐。',
            originalPlot: '孙悟空因在师兄弟面前卖弄变化之术而被祖师发现。',
            feedback: '你的选择偏离了原著精神，但让故事有了新的发展。'
        }
    },
    {
        step: 5,
        choice: { value: 'apologize', text: '向祖师跪地认错', isRecommended: true },
        story: {
            title: '祖师逐徒',
            content: '祖师怒斥悟空卖弄神通，必招祸患。悟空虽然认错，但祖师心意已决，令其离山，且不许说是灵台山弟子。',
            literaryQuote: '此间不许说出我，说出恐遭天雷打。',
            originalPlot: '菩提祖师将孙悟空逐出师门，并叮嘱其不许提及师门。'
        }
    },
    {
        step: 6,
        choice: { value: 'return_home', text: '驾筋斗云返回花果山', isRecommended: true },
        story: {
            title: '回归故里',
            content: '悟空辞别祖师，一个筋斗翻到花果山。众猴见大王归来，欢喜不尽。悟空重整花果山，威震四方。',
            literaryQuote: '一别家乡十数载，今朝回归气昂然。',
            originalPlot: '孙悟空学艺归来，回到花果山水帘洞。'
        }
    },
    {
        step: 7,
        choice: { value: 'go_dragon_palace', text: '去东海龙宫索取兵器', isRecommended: true },
        story: {
            title: '龙宫寻宝',
            content: '悟空觉得缺件趁手兵器，便去东海龙宫索取。龙王拿出各种神兵，悟空都嫌太轻。最终在龙宫深处发现了定海神针——如意金箍棒。',
            literaryQuote: '金箍棒，两头是两个金箍，中间是一段乌铁。',
            originalPlot: '孙悟空大闹东海龙宫，取得定海神针如意金箍棒。'
        }
    },
    {
        step: 8,
        choice: { value: 'fight_yama', text: '闯入地府强销生死簿', isRecommended: true },
        story: {
            title: '大闹地府',
            content: '悟空在睡梦中被勾魂使者带到地府，大怒之下打入森罗殿，强逼阎王拿出生死簿，将猴属名字尽数勾去，从此不受阴司管辖。',
            literaryQuote: '这簿上有名者，寿终则死，无名者，长生不老。',
            originalPlot: '孙悟空大闹地府，勾销生死簿上所有猴类的名字。'
        }
    }
];

// 模拟的角色数据
const mockCharacter = {
    id: 'puti',
    name: '菩提祖师',
    role: '世外高人',
    avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/648a8ed9-45dc-4428-89d7-c398040ea606/image_1766338050_1_1.jpg',
    description: '隐居方寸山的神秘仙师，深谙三教真谛。',
    background: '居住在西牛贺洲灵台方寸山斜月三星洞，精通儒释道三家妙理，门下弟子众多。',
    traits: ['智慧', '神秘', '慈悲', '严厉'],
    color: 'from-purple-400 to-indigo-600'
};

// 模拟的章节数据
const mockChapter = {
    id: 2,
    title: '拜师菩提',
    description: '悟空拜师菩提祖师，学得长生不老术和七十二变。'
};

/**
 * 初始化调试面板
 */
function initDebugPanel() {
    // 检查是否已存在调试面板
    if (document.getElementById('debugPanel')) {
        return;
    }

    // 创建调试面板
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.innerHTML = `
        <style>
            #debugPanel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }
            #debugToggle {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 50px;
                cursor: pointer;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
            }
            #debugToggle:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            #debugMenu {
                display: none;
                position: absolute;
                bottom: 60px;
                right: 0;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                padding: 16px;
                min-width: 220px;
            }
            #debugMenu.show {
                display: block;
            }
            #debugMenu h4 {
                margin: 0 0 12px 0;
                color: #667eea;
                font-size: 14px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 8px;
            }
            .debug-btn {
                display: block;
                width: 100%;
                padding: 10px 16px;
                margin-bottom: 8px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s ease;
                text-align: left;
            }
            .debug-btn:last-child {
                margin-bottom: 0;
            }
            .debug-btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .debug-btn-primary:hover {
                transform: translateX(5px);
            }
            .debug-btn-secondary {
                background: #f0f0f0;
                color: #333;
            }
            .debug-btn-secondary:hover {
                background: #e0e0e0;
            }
            .debug-btn-danger {
                background: #ff6b6b;
                color: white;
            }
            .debug-btn-danger:hover {
                background: #ee5a5a;
            }
        </style>
        <div id="debugMenu">
            <h4>🔧 调试工具</h4>
            <button class="debug-btn debug-btn-primary" onclick="debugSkipToStep(9)">
                ⚡ 跳到第9步（结算页）
            </button>
            <button class="debug-btn debug-btn-primary" onclick="debugSkipToStep(8)">
                ⚡ 跳到第8步
            </button>
            <button class="debug-btn debug-btn-primary" onclick="debugSkipToStep(7)">
                ⚡ 跳到第7步
            </button>
            <button class="debug-btn debug-btn-secondary" onclick="debugSkipToStep(5)">
                📍 跳到第5步
            </button>
            <button class="debug-btn debug-btn-secondary" onclick="debugResetGame()">
                🔄 重置游戏
            </button>
            <button class="debug-btn debug-btn-danger" onclick="debugClosePanel()">
                ✖ 关闭面板
            </button>
        </div>
        <button id="debugToggle" onclick="toggleDebugMenu()">
            🐛 调试
        </button>
    `;

    document.body.appendChild(debugPanel);
}

/**
 * 切换调试菜单显示
 */
function toggleDebugMenu() {
    const menu = document.getElementById('debugMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

/**
 * 关闭调试面板
 */
function debugClosePanel() {
    const panel = document.getElementById('debugPanel');
    if (panel) {
        panel.remove();
    }
}

/**
 * 跳到第9步（结算页面）
 */
function debugSkipToStep9() {
    debugSkipToStep(9);
}

/**
 * 跳到指定步骤
 * @param {number} targetStep - 目标步数
 */
function debugSkipToStep(targetStep) {
    // 获取 gameState（从 window 对象获取）
    if (typeof window.gameState === 'undefined') {
        console.error('gameState not found. Make sure main.js exports it.');
        alert('游戏状态未找到，请确保在主页面中使用');
        return;
    }

    const gameState = window.gameState;
    
    // 设置模拟数据
    gameState.selectedCharacter = mockCharacter;
    gameState.selectedChapter = mockChapter;
    gameState.currentStep = targetStep;
    gameState.isPlaying = true;
    
    // 根据目标步数截取历史记录
    gameState.storyHistory = mockStoryHistory.slice(0, Math.min(targetStep - 1, mockStoryHistory.length));

    // 关闭调试菜单
    const menu = document.getElementById('debugMenu');
    if (menu) {
        menu.classList.remove('show');
    }

    if (targetStep >= 9) {
        // 直接进入结算页面
        const finalStory = {
            title: '取经圆满',
            content: '经历了九九八十一难，你终于完成了这段传奇旅程。',
            ending: '你以菩提祖师的身份完成了对悟空的教导，看着他离去的背影，心中既有不舍，也有欣慰。这只石猴终将成就大业，而你的教诲也将永远铭刻在他心中。',
            learningPoints: [
                '了解了菩提祖师传道授业的智慧',
                '体会了"三更传道"的暗示机巧',
                '学习了《西游记》第二回的经典情节'
            ],
            isEnd: true
        };
        
        // 调用主模块的 endGame 函数
        if (typeof window.endGame === 'function') {
            window.endGame(finalStory);
        } else {
            console.error('endGame function not found');
            alert('结束游戏函数未找到');
        }
    } else {
        // 跳到指定步骤的游戏界面
        if (typeof window.showPhase === 'function') {
            window.showPhase('gamePlay');
        }
        
        // 更新进度UI
        if (typeof window.updateGameUI === 'function') {
            window.updateGameUI();
        }
        
        // 更新角色信息显示
        updateCharacterDisplay();
        
        // 模拟当前步骤的故事
        const currentStory = {
            title: `第${targetStep}步 - 调试模式`,
            content: `这是调试模式下的第${targetStep}步。你可以继续正常游戏或跳到其他步骤。\n\n当前角色：${mockCharacter.name}\n当前章节：${mockChapter.title}`,
            options: [
                { value: 'option1', text: '继续前进', isRecommended: true },
                { value: 'option2', text: '另一个选择', isRecommended: true },
                { value: 'option3', text: '偏离原著的选择', isRecommended: false }
            ],
            literaryQuote: '调试模式下的测试引用',
            originalPlot: '这是调试模式的原著情节说明'
        };
        
        if (typeof window.renderFinalStory === 'function') {
            window.renderFinalStory(currentStory);
        }
    }
    
    console.log(`[Debug] 已跳转到第${targetStep}步`, gameState);
}

/**
 * 更新角色信息显示
 */
function updateCharacterDisplay() {
    const avatarEl = document.getElementById('currentCharacterAvatar');
    const nameEl = document.getElementById('currentCharacterName');
    const roleEl = document.getElementById('currentCharacterRole');
    
    if (avatarEl) {
        avatarEl.src = mockCharacter.avatar;
        avatarEl.alt = mockCharacter.name;
    }
    if (nameEl) {
        nameEl.textContent = mockCharacter.name;
    }
    if (roleEl) {
        roleEl.textContent = mockCharacter.role;
    }
}

/**
 * 重置游戏
 */
function debugResetGame() {
    if (typeof window.resetGame === 'function') {
        window.resetGame();
    } else {
        // 刷新页面作为备选方案
        location.reload();
    }
    
    // 关闭调试菜单
    const menu = document.getElementById('debugMenu');
    if (menu) {
        menu.classList.remove('show');
    }
}

// 页面加载完成后初始化调试面板
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebugPanel);
} else {
    initDebugPanel();
}

// 导出调试函数到全局
window.debugSkipToStep9 = debugSkipToStep9;
window.debugSkipToStep = debugSkipToStep;
window.debugResetGame = debugResetGame;
window.toggleDebugMenu = toggleDebugMenu;
window.debugClosePanel = debugClosePanel;
