#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
西游记章节拆分脚本
将西游记.txt按章节拆分为独立文件
"""

import re
import os

# 章节简称映射（回目编号 -> 简称）
# 可以根据需要添加更多章节的简称
CHAPTER_TITLES = {
    1: "石猴出世",
    2: "拜师菩提",
    3: "大闹地府",
    4: "官封弼马",
    5: "大闹天宫",
    6: "二郎斗法",
    7: "五行山下",
    8: "观音东游",
    9: "陈光蕊赴任",
    10: "游地府",
    11: "还魂唐王",
    12: "玄奘出世",
    13: "陷虎穴",
    14: "收悟空",
    15: "收白龙马",
    16: "观音院",
    17: "收伏熊怪",
    18: "高老庄",
    19: "收猪八戒",
    20: "黄风岭",
    21: "虎先锋",
    22: "收沙悟净",
    23: "四圣试禅心",
    24: "万寿山",
    25: "镇元子",
    26: "医树救仙",
    27: "三打白骨精",
    28: "花果山",
    29: "脱难江流",
    30: "邪魔侵正法",
    31: "猴王显圣",
    32: "平顶山",
    33: "外道迷真性",
    34: "金角银角",
    35: "降伏魔王",
    36: "心猿正处",
    37: "乌鸡国",
    38: "婴儿问母",
    39: "降妖伏怪",
    40: "红孩儿",
    41: "婴儿戏化禅心",
    42: "善财龙女",
    43: "黑水河",
    44: "车迟国",
    45: "三清观",
    46: "斗法降三怪",
    47: "通天河",
    48: "鱼精作怪",
    49: "观音收鱼",
    50: "独角兕",
    51: "心猿空用千般计",
    52: "降伏青牛怪",
    53: "女儿国",
    54: "色邪淫戏",
    55: "琵琶洞",
    56: "杀盗",
    57: "真假美猴王",
    58: "二心搅乱大乾坤",
    59: "火焰山",
    60: "牛魔王",
    61: "三借芭蕉扇",
    62: "祭赛国",
    63: "九头虫",
    64: "荆棘岭",
    65: "小雷音寺",
    66: "众神捉怪",
    67: "救驼罗庄",
    68: "朱紫国",
    69: "心主夜间修药物",
    70: "降伏狮猁怪",
    71: "行者假名降怪",
    72: "盘丝洞",
    73: "蜈蚣精",
    74: "狮驼岭",
    75: "狮驼洞",
    76: "心神居舍魔归性",
    77: "群魔欺本性",
    78: "比丘国",
    79: "寻洞擒妖",
    80: "姹女育阳",
    81: "镇海寺",
    82: "姹女求阳",
    83: "心猿识得丹头",
    84: "灭法国",
    85: "隐雾山",
    86: "木母助威",
    87: "凤仙郡",
    88: "天竺国",
    89: "黄狮精",
    90: "师狮授受同归一",
    91: "金平府",
    92: "三僧大战青龙山",
    93: "玉华州",
    94: "四僧宴乐御花园",
    95: "假合真形擒玉兔",
    96: "寇员外",
    97: "金酬外护遭魔毒",
    98: "猿熟马驯八戒觉悟",
    99: "九九数完魔灭尽",
    100: "径回东土五圣成真",
}


def split_chapters(input_file: str, output_dir: str):
    """
    将西游记按章节拆分
    
    Args:
        input_file: 输入文件路径
        output_dir: 输出目录路径
    """
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 读取整个文件
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 正则表达式匹配章节标题
    # 匹配格式: 第X回 XXXX XXXX
    chapter_pattern = r'(第[一二三四五六七八九十百零〇]+回\s+.+?)(?=第[一二三四五六七八九十百零〇]+回|\Z)'
    
    # 找到所有章节
    chapters = re.findall(chapter_pattern, content, re.DOTALL)
    
    # 中文数字到阿拉伯数字的映射
    cn_nums = {
        '零': 0, '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4,
        '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
        '百': 100
    }
    
    def cn_to_num(cn_str: str) -> int:
        """将中文数字转换为阿拉伯数字"""
        result = 0
        temp = 0
        for char in cn_str:
            if char in cn_nums:
                val = cn_nums[char]
                if val == 10:
                    if temp == 0:
                        temp = 1
                    result += temp * 10
                    temp = 0
                elif val == 100:
                    if temp == 0:
                        temp = 1
                    result += temp * 100
                    temp = 0
                else:
                    temp = val
        result += temp
        return result
    
    print(f"找到 {len(chapters)} 个章节")
    
    # 处理每个章节
    for chapter in chapters:
        # 提取回目编号
        match = re.match(r'第([一二三四五六七八九十百零〇]+)回', chapter)
        if not match:
            continue
        
        cn_num = match.group(1)
        chapter_num = cn_to_num(cn_num)
        
        # 提取回目标题（第X回后面的部分，到第一个换行为止）
        title_match = re.match(r'第[一二三四五六七八九十百零〇]+回\s+(.+?)[\n\r]', chapter)
        original_title = title_match.group(1).strip() if title_match else ""
        
        # 获取简称，如果没有则使用原标题的前几个字
        short_title = CHAPTER_TITLES.get(chapter_num)
        if not short_title:
            # 提取原标题的前半部分作为简称
            short_title = original_title.split()[0][:4] if original_title else f"第{chapter_num}回"
        
        # 构建输出文件名
        filename = f"chap{chapter_num}-{short_title}.txt"
        filepath = os.path.join(output_dir, filename)
        
        # 写入文件
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(chapter.strip())
        
        print(f"✓ 已生成: {filename}")
    
    print(f"\n完成！共拆分 {len(chapters)} 个章节到目录: {output_dir}")


def main():
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 输入文件路径
    input_file = os.path.join(script_dir, "西游记.txt")
    
    # 输出目录
    output_dir = os.path.join(script_dir, "chapters")
    
    # 检查输入文件是否存在
    if not os.path.exists(input_file):
        print(f"错误: 找不到输入文件 {input_file}")
        return
    
    # 执行拆分
    split_chapters(input_file, output_dir)


if __name__ == "__main__":
    main()