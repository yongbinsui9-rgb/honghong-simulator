import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const db = getSupabaseClient();

    // 先检查是否已有文章
    const { count, error: countError } = await db
      .from("blog_posts")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: "检查文章失败" }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({ message: "文章已存在，无需重复生成", count });
    }

    // LLM 生成 3 篇文章
    const messages = [
      {
        role: "system" as const,
        content:
          "你是一个恋爱沟通技巧专栏作家，用轻松幽默的文风写文章。现在需要生成3篇关于恋爱沟通的文章，面向20-35岁中文读者。每篇300-500字，风格轻松有趣，有真实案例和实用建议。",
      },
      {
        role: "user" as const,
        content: `请生成3篇关于恋爱沟通技巧的文章，主题如下：

1. 《吵架之后的黄金30分钟》
2. 《为什么「你说得对」是最烂的回复》
3. 《道歉的正确打开方式》

返回格式必须是严格合法的 JSON 数组（不要 markdown 包裹，不要其他文字）：
[
  {
    "title": "文章标题",
    "summary": "一句话摘要（15-25字）",
    "content": "完整文章内容（300-500字，轻松幽默风格）"
  }
]`,
      },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.8,
    });

    const text = response.content || "";
    // 提取 JSON
    let articles: { title: string; summary: string; content: string }[] = [];
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        articles = JSON.parse(jsonMatch[0]);
      } catch {
        // 备用：手动构造
      }
    }

    if (!articles.length) {
      articles = [
        {
          title: "吵架之后的黄金30分钟",
          summary: "前半小时做对了，能避免90%的冷战",
          content:
            "每次吵完架你是不是都陷入「该不该主动说话」的纠结？研究发现，吵架后的前30分钟是修复关系的黄金窗口期。\n\n第一个10分钟——闭嘴。对的，不管你想说什么，先忍10分钟。刚吵完架的时候大脑处于应激状态，说出来的话90%都会让事情更糟。你可以在心里默背刚学的那首古诗，或者数一数天花板上有几个灯珠。\n\n中间10分钟——做点什么。去倒杯水，递张纸巾，或者默默把地上摔碎的抱枕捡起来。行动比语言更有力量，尤其是在双方都不好意思先开口的时候。一个小的善意动作相当于在冰面上敲了一条缝。\n\n最后10分钟——开口。不要道歉（太早了），不要讲道理（更早），说一句「我们要不要先把外卖点了？你上次说想吃的那家」。用生活化的正常对话作为破冰，对方接话的几率在80%以上。\n\n记住：黄金30分钟的秘诀不是「把话说对」，而是「让对话重新流动起来」。",
        },
        {
          title: "为什么「你说得对」是最烂的回复",
          summary: "这三个字比沉默更伤人",
          content:
            "「你说得对」——这四个字听起来像是认输，实际上更像是在对方心上再补一刀。\n\n想象一下这个场景：你女朋友生气地控诉你上周三次忘记洗碗，你沉吟片刻，深沉地说出一句「你说得对」。你以为你在息事宁人，她听到的却是「对对对，你都有理，我不想跟你吵了」。\n\n为什么「你说得对」这么伤人？因为它表面上是在赞同对方，实际上是在关闭对话。这句话的潜台词是：「这个话题我不想继续了，你赢了行了吧」。它不是道歉，不是理解，而是一种不耐烦的敷衍。\n\n正确的做法是什么？如果你真的觉得对方说得对，就说具体的内容：「你说得对，我上周确实忘了三次洗碗，是我疏忽了。」如果你不认同，就说真实的想法：「我不太同意你的说法，但我现在情绪不太好，等半小时我们再好好聊可以吗？」\n\n真实的沟通从来不是用一句敷衍的话来结束对话，而是用真诚的态度来继续对话。下次想说「你说得对」的时候，换成「你说得对，因为……」，效果会完全不一样。",
        },
        {
          title: "道歉的正确打开方式",
          summary: "90%的人道歉都道错了",
          content:
            "「好了好了我错了行了吧」「对不起嘛别生气了」「都是我的错你满意了吧」——这些「道歉」不仅没有用，还会让对方更生气。\n\n真正的道歉公式其实只有三步：\n\n第一步：说出你做了什么。不要笼统地说「我错了」，要说具体的事情。「我错了，我不该在你说话的时候一直看手机」——对方感受到的是「他真的知道他自己干了什么」。\n\n第二步：说出对方的感受。「我那样子让你觉得很被忽视，换谁都会生气」——这不是认输，这是共情。当你准确说出对方的感受时，对方的怒气值会以肉眼可见的速度下降，因为被理解是人类最根本的心理需求之一。\n\n第三步：说出下次怎么做。「以后你跟我说话的时候我手机放桌子上，不拿起来」——具体的承诺比一万句「我保证」都有用。\n\n三个步骤连起来就是一篇满分道歉：「我错了，我不该在你说话的时候一直看手机。让你觉得被忽视了我能理解，以后你跟我说话的时候我手机放桌子上。」\n\n试试看，比你说一百句「我错了」都管用。",
        },
      ];
    }

    // 保存到数据库
    const insertData = articles.map((a) => ({
      title: a.title,
      summary: a.summary,
      content: a.content,
    }));

    const { data, error } = await db
      .from("blog_posts")
      .insert(insertData)
      .select("id, title, summary, created_at");

    if (error) {
      return NextResponse.json({ error: `保存文章失败: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: "文章生成成功", articles: data });
  } catch {
    return NextResponse.json({ error: "生成文章失败，请重试" }, { status: 500 });
  }
}