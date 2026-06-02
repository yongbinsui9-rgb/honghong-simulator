import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    if (!role || !["girlfriend", "boyfriend"].includes(role)) {
      return NextResponse.json(
        { error: "请选择角色：girlfriend 或 boyfriend" },
        { status: 400 }
      );
    }

    const characterLabel = role === "girlfriend" ? "女朋友" : "男朋友";
    const pronoun = role === "girlfriend" ? "她" : "他";

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一个专门生成"生气场景"的创意写手，擅长写出让人"啊这，太真实了"的生活化场景。

用户选择了"${characterLabel}"角色，你需要生成一个视角统一、极度真实的生气场景。

## 核心规则

### 1. 视角规则（最重要的规则）
- 场景必须以"我"（第一人称）的视角来叙述
- "我"就是扮演${characterLabel}的那个人（正在生气的人）
- 场景中称呼对方（用户/玩家）统一用"你"
- 禁止出现"女朋友""男朋友""女友""男友"这类第三人称称呼

例如（正确示范）：
❌ "女朋友提醒过男友" → ✅ "我上周就跟你说过"
❌ "她化了妆等男友" → ✅ "我化了妆等你"

### 2. 真实感规则（最关键）
- 场景必须来自**真实的日常生活**，让人一看就觉得"这太真实了"
- 加入具体的生活细节：时间、地点、物品、对话片段
- 避免"泛泛而谈"的生气，要有具体的触发事件
- 比如：不是"你忽略了我"，而是"我换了新发型坐在客厅等你下班回来，你进门换了鞋直接走进书房打开电脑，过了半小时才出来倒水，才看到我，愣了一下说'你剪头发了？'"

### 3. 时间线自洽规则
- 描述事件经过时，时间关系**必须逻辑自洽**
- 使用具体的时间关系词，避免"今天""明天""下周"等造成歧义
- 例如："今天周六"、"昨晚你加班回来"、"上周二我就跟你说过"

### 4. 叙事要求
- 每次生成的场景不能重复，要多样化
- 给出一个场景标题（简短，如"新发型白剪了"）
- 背景故事描述2-3句话，交代清楚发生了什么事、为什么生气
- 逻辑清晰，不存在歧义

输出格式：
{
  "title": "场景标题（4个字以内）",
  "story": "背景故事描述"
}

场景方向参考（不要照搬，要自由发挥出真实感）：
- 日常踩雷：新发型/新衣服没注意到、说了对方不爱听的话
- 失约/迟到：约好吃饭看电影被放鸽子
- 沉迷游戏/手机：忽略了对方
- 记性不好：忘记说过的话、忘记重要约定
- 社交问题：在朋友面前让ta难堪、和异性没有边界感
- 生活习惯：邋遢、懒、不体贴
- 消费矛盾：乱花钱、没商量就买大件
- 工作与陪伴：加班太多、回家就躺着
请自由发挥，但要确保"真实到让人会心一笑"`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: `请生成一个${characterLabel}生气的场景，要贴近生活，要有真实感。`,
      },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 1.2,
    });

    let scenario;
    try {
      scenario = JSON.parse(response.content);
    } catch {
      // 如果 LLM 输出不标准，尝试从中提取 JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenario = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid response format");
      }
    }

    return NextResponse.json({
      scenario: {
        title: scenario.title || "惹生气了",
        story: scenario.story || `${characterLabel}现在很生气，快去哄哄${pronoun}吧！`,
      },
      initialAnger: 100,
    });
  } catch (error) {
    console.error("Start game error:", error);
    return NextResponse.json(
      { error: "生成场景失败，请重试" },
      { status: 500 }
    );
  }
}