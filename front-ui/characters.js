// 角色数据配置
export const characters = [
    {
        id: 'tangseng',
        name: '唐僧',
        role: '取经领队',
        avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/648a8ed9-45dc-4428-89d7-c398040ea606/image_1766338050_1_1.jpg',
        description: '慈悲为怀的取经人，心怀天下苍生',
        background: '前世为如来座下金蝉子，因轻慢佛法被贬下凡。立志西天取经，普度众生。',
        secret: '身负如来重托，必须历经九九八十一难方能取得真经。对妖魔的态度常引发师徒矛盾。',
        traits: ['慈悲', '执着', '善良', '有时固执'],
        color: 'from-yellow-400 to-orange-500'
    },
    {
        id: 'wukong',
        name: '孙悟空',
        role: '齐天大圣',
        avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/a4a893ce-082e-4d73-a0ee-66431bb8db38/image_1766338055_1_3.jpg',
        description: '神通广大的美猴王，火眼金睛识妖魔',
        background: '花果山水帘洞美猴王，曾大闹天宫，被压五行山下五百年。受观音点化，保护唐僧西天取经。',
        secret: '头戴紧箍咒，受制于唐僧。内心渴望自由，但也逐渐理解责任与担当的意义。',
        traits: ['勇敢', '机智', '忠诚', '有时冲动'],
        color: 'from-red-500 to-pink-500'
    },
    {
        id: 'bajie',
        name: '猪八戒',
        role: '天蓬元帅',
        avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/528d382e-af15-477f-9bc8-3fb9cd359934/image_1766338060_1_1.jpg',
        description: '憨厚可爱的二师兄，好吃懒做却心地善良',
        background: '原为天庭天蓬元帅，因调戏嫦娥被贬下凡，错投猪胎。在高老庄被悟空收服，加入取经队伍。',
        secret: '虽然贪吃好色，但关键时刻从不退缩。对师父忠心耿耿，常在悟空和师父之间调解。',
        traits: ['憨厚', '幽默', '贪吃', '重情义'],
        color: 'from-pink-400 to-rose-500'
    },
    {
        id: 'shaseng',
        name: '沙悟净',
        role: '卷帘大将',
        avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/b47a2824-3c54-4ee5-8992-50361ff33ac9/image_1766338064_1_1.jpg',
        description: '忠厚老实的三师弟，任劳任怨挑行李',
        background: '原为天庭卷帘大将，因失手打碎琉璃盏被贬流沙河。受观音点化，等待取经人。',
        secret: '看似木讷，实则心思细腻。默默守护着师徒，是团队中最稳定的力量。',
        traits: ['忠诚', '稳重', '勤劳', '低调'],
        color: 'from-blue-400 to-cyan-500'
    },
    {
        id: 'bailongma',
        name: '白龙马',
        role: '西海龙王三太子',
        avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/814abf7c-df54-476a-bdb5-22fdbcef5e89/image_1766338069_1_1.jpg',
        description: '默默承载的坐骑，实为龙族太子',
        background: '西海龙王三太子，因纵火烧了殿上明珠被判死罪。观音救下，化作白马驮唐僧取经。',
        secret: '虽化作马形，但保留龙族神力。在关键时刻可显露真身，是隐藏的强大战力。',
        traits: ['坚韧', '低调', '强大', '忠诚'],
        color: 'from-gray-400 to-slate-500'
    },
    {
        id: 'baigujing',
        name: '白骨精',
        role: '白虎岭妖怪',
        avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/ac0c5bd2-74a1-4147-9b51-36900863d5ba/image_1766338076_1_3.jpg',
        description: '善于变化的妖精，渴望长生不老',
        background: '白虎岭上修炼千年的白骨成精，听闻吃唐僧肉可长生不老，设计接近取经队伍。',
        secret: '虽为妖怪，但也有自己的苦衷。在妖界地位不高，渴望通过吃唐僧肉改变命运。',
        traits: ['狡猾', '执着', '善变', '求生欲强'],
        color: 'from-purple-400 to-indigo-500'
    },
    {
        id: 'niuwang',
        name: '牛魔王',
        role: '平天大圣',
        avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/936a2386-d3e7-429f-bf9d-ca036012bb33/image_1766338091_1_3.jpg',
        description: '妖界大佬，悟空的结拜兄弟',
        background: '翠云山芭蕉洞洞主，妖界七大圣之首。与孙悟空曾是结拜兄弟，后因立场不同反目。',
        secret: '内心矛盾，既怀念与悟空的兄弟情谊，又要维护妖界利益。家庭关系复杂。',
        traits: ['豪爽', '重义', '强大', '左右为难'],
        color: 'from-green-500 to-emerald-600'
    },
    {
        id: 'honghaier',
        name: '红孩儿',
        role: '圣婴大王',
        avatar: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/caa27472-9f2e-4196-85c7-d48f8ef45763/image_1766338098_1_3.jpg',
        description: '牛魔王之子，三昧真火神通',
        background: '牛魔王与铁扇公主之子，在火云洞修炼三昧真火。年纪虽小但法力高强。',
        secret: '渴望父母关注，用捉唐僧来证明自己。最终被观音收服，成为善财童子。',
        traits: ['聪明', '任性', '强大', '缺爱'],
        color: 'from-orange-500 to-red-600'
    }
];

// 获取角色信息
export function getCharacter(id) {
    return characters.find(char => char.id === id);
}
