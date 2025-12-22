// AI智能体API配置
// 注意：这里需要替换为实际的智能体API地址
const AI_API_ENDPOINT = '/api/ai-agent';

/**
 * 调用AI智能体生成故事内容
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
            storyHistory: params.storyHistory || []
        };

        // 模拟API调用（实际使用时需要替换为真实API）
        // const response = await fetch(AI_API_ENDPOINT, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(requestData)
        // });
        // const data = await response.json();
        // return data;

        // 临时使用模拟数据
        return await simulateAIResponse(requestData);
    } catch (error) {
        console.error('AI智能体调用失败:', error);
        throw error;
    }
}

/**
 * 模拟AI响应（用于演示，实际使用时删除）
 */
async function simulateAIResponse(requestData) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { character, step, userChoice } = requestData;
    
    // 根据不同角色和步骤生成不同的故事内容
    const storyTemplates = generateStoryByCharacter(character, step, userChoice);
    
    return storyTemplates;
}

/**
 * 根据角色和步骤生成故事内容
 */
function generateStoryByCharacter(character, step, userChoice) {
    const stories = {
        'tangseng': [
            {
                title: '踏上取经之路',
                content: '长安城外，晨光熹微。你披上袈裟，手持锡杖，在众人的祝福声中踏上了西行之路。观音菩萨曾言："此去西天十万八千里，路途凶险，需历经九九八十一难。"你心中默念："贫僧虽肉体凡胎，但心怀慈悲，定当不负如来重托。"',
                literaryQuote: '心生，种种魔生；心灭，种种魔灭。',
                options: [
                    { text: '独自前行，相信佛祖庇佑', value: 'alone' },
                    { text: '在附近寺庙暂住，等待有缘人', value: 'wait' },
                    { text: '向路人打听西行路况', value: 'ask' }
                ]
            },
            {
                title: '五行山下',
                content: '行至五行山，只见一座大山压着一只猴子。那猴子见你到来，高声呼喊："师父！师父救我！我被压了五百年，观音菩萨说会有取经人来救我！"你心生怜悯，但也有些犹豫，这猴子曾大闹天宫，性情如何？',
                literaryQuote: '人心生一念，天地尽皆知。善恶若无报，乾坤必有私。',
                options: [
                    { text: '立即揭去封印，救出悟空', value: 'save' },
                    { text: '先与他约法三章，再行救助', value: 'negotiate' },
                    { text: '继续赶路，此事蹊跷', value: 'leave' }
                ]
            },
            {
                title: '收服八戒',
                content: '来到高老庄，听闻有妖怪作祟。你决定降妖除魔，却发现这"妖怪"竟是天蓬元帅转世。八戒跪地求饶："师父，我愿改邪归正，保你西天取经！"悟空在旁冷笑："师父，这呆子好吃懒做，不可信！"',
                literaryQuote: '一叶浮萍归大海，人生何处不相逢。',
                options: [
                    { text: '慈悲为怀，收他为徒', value: 'accept' },
                    { text: '考验他的诚意', value: 'test' },
                    { text: '听从悟空建议，拒绝他', value: 'refuse' }
                ]
            }
        ],
        'wukong': [
            {
                title: '重见天日',
                content: '五百年了！整整五百年！当那个和尚揭开封印的那一刻，你终于重获自由。"师父！俺老孙这就保你去西天！"你兴奋地翻了个筋斗，却被观音留下的紧箍咒束缚。这取经之路，是自由还是另一个牢笼？',
                literaryQuote: '皇帝轮流做，明年到我家。',
                options: [
                    { text: '全心全意保护师父', value: 'protect' },
                    { text: '试探紧箍咒的威力', value: 'test' },
                    { text: '先去花果山看看', value: 'home' }
                ]
            },
            {
                title: '白骨精现身',
                content: '你火眼金睛一眼就看出那村姑是妖怪变的！举棒就打，却被师父念起紧箍咒。"悟空！你怎可滥杀无辜！"师父的责备让你头痛欲裂。那妖精又变化成老妇人，师父竟然还要赶你走！',
                literaryQuote: '道高一尺，魔高一丈。',
                options: [
                    { text: '忍痛离开，让师父自己去', value: 'leave' },
                    { text: '暗中保护，不让师父发现', value: 'secret' },
                    { text: '再次解释，请师父相信', value: 'explain' }
                ]
            },
            {
                title: '火焰山',
                content: '前方火焰山挡路，八百里火焰，寸草不生。你想起老牛的妻子铁扇公主有芭蕉扇。但当年的结拜兄弟，如今已成陌路。红孩儿一事，更让你们反目成仇。',
                literaryQuote: '世上无难事，只怕有心人。',
                options: [
                    { text: '直接去借扇子', value: 'borrow' },
                    { text: '变化成牛魔王去骗扇子', value: 'trick' },
                    { text: '寻找其他过山之法', value: 'other' }
                ]
            }
        ],
        'bajie': [
            {
                title: '高老庄往事',
                content: '你本是天蓬元帅，只因酒后失言，被贬下凡错投猪胎。在高老庄娶了媳妇，本想安稳度日，却被那猴子打上门来。"呆子！跟我师父去取经！"你心中不甘，但观音菩萨的话言犹在耳...',
                literaryQuote: '人生在世，富贵不能淫，贫贱不能移。',
                options: [
                    { text: '欣然接受，改过自新', value: 'accept' },
                    { text: '提出条件，要带上媳妇', value: 'condition' },
                    { text: '假意答应，寻机逃跑', value: 'fake' }
                ]
            },
            {
                title: '女儿国诱惑',
                content: '女儿国！这里全是女人！国王还看上了师父！你偷偷喝了子母河的水，肚子疼得要命。悟空在旁边笑话你，沙师弟默默挑着担子。师父一脸为难，那国王温柔多情...',
                literaryQuote: '色即是空，空即是色。',
                options: [
                    { text: '劝师父留下来当国王', value: 'stay' },
                    { text: '赶紧找解药，继续赶路', value: 'cure' },
                    { text: '趁机在城里多玩几天', value: 'play' }
                ]
            },
            {
                title: '分行李',
                content: '师父又念紧箍咒了！猴哥一气之下回了花果山！师父让你去请，你心里暗喜："这下好了，分了行李，各回各家！"但看着师父落寞的背影，你又有些不忍...',
                literaryQuote: '兄弟同心，其利断金。',
                options: [
                    { text: '真的分行李，各奔东西', value: 'split' },
                    { text: '去花果山请猴哥回来', value: 'invite' },
                    { text: '自己保护师父继续走', value: 'continue' }
                ]
            }
        ],
        'shaseng': [
            {
                title: '流沙河等待',
                content: '你在流沙河等了多年，观音菩萨说会有取经人路过。每日看着河水流淌，想起天庭往事，心中五味杂陈。今日，河面上出现了一行人的身影...',
                literaryQuote: '千淘万漉虽辛苦，吹尽狂沙始到金。',
                options: [
                    { text: '主动现身，请求加入', value: 'join' },
                    { text: '先考验他们的诚意', value: 'test' },
                    { text: '继续等待，观察情况', value: 'wait' }
                ]
            },
            {
                title: '默默守护',
                content: '大师兄和二师兄又吵起来了，师父在中间为难。你默默挑着担子，心想："我虽话不多，但这担子我挑得稳。"突然，前方出现妖气...',
                literaryQuote: '路遥知马力，日久见人心。',
                options: [
                    { text: '放下担子，准备战斗', value: 'fight' },
                    { text: '保护好师父和行李', value: 'protect' },
                    { text: '提醒大师兄注意', value: 'warn' }
                ]
            },
            {
                title: '团队调解',
                content: '师父要赶走大师兄，二师兄在旁边煽风点火。你看在眼里，急在心里。这团队要是散了，取经大业如何完成？你虽不善言辞，但此时必须站出来说话...',
                literaryQuote: '家和万事兴。',
                options: [
                    { text: '劝说师父三思而行', value: 'persuade' },
                    { text: '指出二师兄的问题', value: 'blame' },
                    { text: '提议大家冷静一下', value: 'calm' }
                ]
            }
        ],
        'bailongma': [
            {
                title: '龙族太子',
                content: '你本是西海龙王三太子，因一时冲动烧了殿上明珠，被判死罪。观音菩萨救下你，让你化作白马驮唐僧取经。虽为马形，但你保留着龙族的记忆和尊严...',
                literaryQuote: '是金子总会发光。',
                options: [
                    { text: '安心做好坐骑本分', value: 'duty' },
                    { text: '寻机展现真实实力', value: 'show' },
                    { text: '暗中观察队伍情况', value: 'observe' }
                ]
            },
            {
                title: '鹰愁涧往事',
                content: '路过鹰愁涧，这里曾是你等待取经人的地方。当时你饿极了，误吞了师父的马。悟空要打你，观音菩萨及时赶到，让你化作白马。如今故地重游，感慨万千...',
                literaryQuote: '塞翁失马，焉知非福。',
                options: [
                    { text: '回忆过往，默默前行', value: 'recall' },
                    { text: '向师父表达歉意', value: 'apologize' },
                    { text: '感谢观音菩萨点化', value: 'thank' }
                ]
            },
            {
                title: '显露真身',
                content: '妖怪太强了！悟空、八戒、沙僧都受了伤！师父危在旦夕！你知道，是时候显露龙族真身了。但这样做，可能会暴露身份，打破平衡...',
                literaryQuote: '路见不平，拔刀相助。',
                options: [
                    { text: '立即变回龙身战斗', value: 'transform' },
                    { text: '暗中施法帮助', value: 'secret' },
                    { text: '去请救兵', value: 'help' }
                ]
            }
        ],
        'baigujing': [
            {
                title: '白虎岭修炼',
                content: '你在白虎岭修炼千年，好不容易修成人形。听闻吃了唐僧肉可以长生不老，你心动了。但你也知道，那猴子火眼金睛，不好对付...',
                literaryQuote: '修行路上，一念成佛，一念成魔。',
                options: [
                    { text: '精心设计，三次变化', value: 'plan' },
                    { text: '联合其他妖怪一起行动', value: 'ally' },
                    { text: '放弃这个危险的想法', value: 'give_up' }
                ]
            },
            {
                title: '第一次变化',
                content: '你变成村姑，提着饭菜接近唐僧。那猴子突然举棒打来！你急忙使出解尸法逃脱，留下一具假尸。唐僧果然中计，开始责怪悟空...',
                literaryQuote: '机关算尽太聪明，反误了卿卿性命。',
                options: [
                    { text: '继续第二次变化', value: 'continue' },
                    { text: '趁机挑拨师徒关系', value: 'provoke' },
                    { text: '暂时撤退，另寻机会', value: 'retreat' }
                ]
            },
            {
                title: '真相大白',
                content: '第三次变化也被识破了！悟空的金箍棒打来，你无处可逃。临死前，你看到唐僧悲伤的眼神，突然明白：长生不老，不如活得有意义...',
                literaryQuote: '放下屠刀，立地成佛。',
                options: [
                    { text: '真心忏悔，请求原谅', value: 'repent' },
                    { text: '临死反击，同归于尽', value: 'fight' },
                    { text: '留下警告，妖界不会放过他们', value: 'warn' }
                ]
            }
        ],
        'niuwang': [
            {
                title: '翠云山往事',
                content: '你是平天大圣牛魔王，当年与悟空结拜为兄弟，何等快活！但他大闹天宫失败后，你选择了明哲保身。如今他保唐僧取经，你却要阻拦，兄弟情义何在？',
                literaryQuote: '人在江湖，身不由己。',
                options: [
                    { text: '重续兄弟情谊，放他们过去', value: 'brother' },
                    { text: '坚守妖界立场，绝不让步', value: 'stand' },
                    { text: '暗中帮助，表面阻拦', value: 'secret' }
                ]
            },
            {
                title: '家庭矛盾',
                content: '铁扇公主因为红孩儿的事怨恨悟空，不肯借芭蕉扇。你夹在妻子和兄弟之间，左右为难。红孩儿被观音收走，虽是好事，但妻子的眼泪让你心痛...',
                literaryQuote: '清官难断家务事。',
                options: [
                    { text: '劝说妻子借出芭蕉扇', value: 'persuade' },
                    { text: '支持妻子，拒绝悟空', value: 'support' },
                    { text: '想办法两全其美', value: 'both' }
                ]
            },
            {
                title: '最终抉择',
                content: '天兵天将来了！你知道，这是最后的机会。是继续对抗，还是顺应天意？你想起当年七兄弟结拜时的誓言，想起悟空那张桀骜不驯的脸...',
                literaryQuote: '识时务者为俊杰。',
                options: [
                    { text: '放下恩怨，成全取经', value: 'let_go' },
                    { text: '战斗到底，绝不屈服', value: 'fight' },
                    { text: '与悟空单独谈判', value: 'talk' }
                ]
            }
        ],
        'honghaier': [
            {
                title: '火云洞',
                content: '你是圣婴大王红孩儿，在火云洞修炼三昧真火。父王常年在外，母后整日叹气。你想做点大事，让父母看看你的本事！听说唐僧肉能长生不老...',
                literaryQuote: '少年不识愁滋味。',
                options: [
                    { text: '捉拿唐僧，证明自己', value: 'catch' },
                    { text: '先试探取经队伍实力', value: 'test' },
                    { text: '找父王商量对策', value: 'ask' }
                ]
            },
            {
                title: '三昧真火',
                content: '你的三昧真火连悟空都怕！八戒和沙僧更不是对手！你得意洋洋，终于可以向父母证明自己了！但悟空去请观音菩萨了...',
                literaryQuote: '骄兵必败。',
                options: [
                    { text: '趁机吃掉唐僧', value: 'eat' },
                    { text: '加强防御，准备迎战', value: 'defend' },
                    { text: '逃跑，保命要紧', value: 'escape' }
                ]
            },
            {
                title: '观音点化',
                content: '观音菩萨来了！你的三昧真火在她面前不堪一击。她说要收你为善财童子，去南海修行。你看看火云洞，想想父母，心中百感交集...',
                literaryQuote: '苦海无边，回头是岸。',
                options: [
                    { text: '接受点化，跟随观音', value: 'accept' },
                    { text: '请求先向父母告别', value: 'farewell' },
                    { text: '拒绝，继续做妖怪', value: 'refuse' }
                ]
            }
        ]
    };

    // 获取对应角色的故事
    const characterStories = stories[character.id] || stories['tangseng'];
    const storyIndex = Math.min(step - 1, characterStories.length - 1);
    let story = characterStories[storyIndex];

    // 如果有用户选择，可以根据选择调整故事
    if (userChoice) {
        story = {
            ...story,
            content: story.content + `\n\n你选择了：${userChoice.text}。` + generateFollowUpContent(userChoice.value)
        };
    }

    return story;
}

/**
 * 根据用户选择生成后续内容
 */
function generateFollowUpContent(choiceValue) {
    const followUps = {
        'alone': '你决定独自前行，相信佛祖会庇佑你的取经之路。',
        'wait': '你选择在寺庙中等待，或许这是天意的安排。',
        'ask': '你向路人打听，得知前方有五行山，山下压着一只神猴。',
        'save': '你心怀慈悲，立即救出了孙悟空，收他为徒。',
        'negotiate': '你与悟空约法三章，他答应一路保护你西天取经。',
        'leave': '你选择继续赶路，但心中总觉得有些不安。',
        'accept': '你决定给他一个改过自新的机会，收他为徒。',
        'test': '你决定先考验他的诚意，看他是否真心悔改。',
        'refuse': '你听从悟空的建议，拒绝了八戒的请求。',
        'protect': '你发誓要全心全意保护师父，完成取经大业。',
        'home': '你想先回花果山看看，但观音的话让你犹豫了。',
        'borrow': '你决定直接去借扇子，凭借旧日情谊。',
        'trick': '你变化成牛魔王的样子，准备去骗取芭蕉扇。',
        'other': '你决定寻找其他方法，不想与老牛为敌。',
        'stay': '你劝师父留下来，但师父坚定地拒绝了。',
        'cure': '你们赶紧寻找解药，准备继续西行。',
        'play': '你想多玩几天，但师父催促赶路。',
        'split': '你真的开始分行李，但心中却有些不舍。',
        'invite': '你决定去花果山请猴哥回来。',
        'continue': '你决定自己保护师父继续前行。',
        'join': '你主动现身，请求加入取经队伍。',
        'duty': '你安心做好坐骑的本分，默默守护师父。',
        'show': '你寻找机会展现真实实力，证明自己的价值。',
        'observe': '你暗中观察队伍情况，等待合适的时机。',
        'transform': '你决定变回龙身，与妖怪决一死战！',
        'plan': '你精心设计了三次变化的计划。',
        'continue': '你决定继续第二次变化，不达目的不罢休。',
        'repent': '你真心忏悔，希望能得到原谅。',
        'brother': '你决定重续兄弟情谊，放他们过去。',
        'stand': '你坚守妖界立场，绝不让步。',
        'persuade': '你劝说妻子借出芭蕉扇，为了大局着想。',
        'let_go': '你决定放下恩怨，成全取经大业。',
        'catch': '你决定捉拿唐僧，证明自己的本事。',
        'accept': '你接受了观音的点化，跟随她去南海修行。'
    };

    return followUps[choiceValue] || '你的选择将影响接下来的故事发展...';
}

/**
 * 格式化AI响应数据
 */
export function formatAIResponse(data) {
    return {
        title: data.title || '未知章节',
        content: data.content || '',
        literaryQuote: data.literaryQuote || '',
        options: data.options || [],
        isEnd: data.isEnd || false,
        ending: data.ending || '',
        learningPoints: data.learningPoints || []
    };
}
