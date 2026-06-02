import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const { messages: chatMessages, currentAnger, role, scenario, difficulty } =
    await request.json();

  if (!chatMessages || !Array.isArray(chatMessages)) {
    return new Response(JSON.stringify({ error: "缺少对话消息" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const characterLabel = role === "girlfriend" ? "女朋友" : "男朋友";
  const pronoun = role === "girlfriend" ? "她" : "他";
  const userLabel = role === "girlfriend" ? "男朋友" : "女朋友";

  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
  const config = new Config();
  const client = new LLMClient(config, customHeaders);

  // 根据难度调整怒气值变化范围和AI行为
  const difficultyConfig = {
    easy: {
      name: "简单",
      desc: "你比较容易哄，对方说几句好话你就会心软",
      angerRange: "变化幅度通常在 15~30 之间，非常好/非常差的话可以到 35~40",
      angerIncreaseLimit: "对方说错话最多只涨 5~8",
      personality: "你虽然生气但内心柔软，容易被打动，偶尔会忍不住笑场或者被逗到",
    },
    normal: {
      name: "一般",
      desc: "你的生气程度适中",
      angerRange: "变化幅度通常在 8~20 之间，非常好/非常差的话可以到 25~30",
      angerIncreaseLimit: "对方说错话可以涨 8~15",
      personality: "你说话带情绪，但对方真诚时会心软",
    },
    hard: {
      name: "魔鬼",
      desc: "你非常难哄，对方说什么你都要挑刺",
      angerRange: "变化幅度通常在 3~12 之间，非常好/非常差的话可以到 15~20",
      angerIncreaseLimit: "对方说错话可以涨 10~25，敷衍/狡辩涨 20~30",
      personality: "你很难被取悦，对方说什么你都会挑毛病，对方越解释你越来气，除非对方真的说到心坎里",
    },
    hell: {
      name: "地狱",
      desc: "你极度难哄，对方说什么你都能找到理由更生气",
      angerRange: "变化幅度通常在 1~8 之间，非常好最多只能降 15",
      angerIncreaseLimit: "对方说错话可以涨 15~30，敷衍/狡辩涨 25~40",
      personality: "你极度难取悦，对方说什么你都能找到更生气的角度。对方道歉你觉得敷衍，对方解释你觉得狡辩，对方不说话你觉得冷暴力。除非对方用非常真诚、非常打动人的方式，才有可能让你消气一点点。你的每一个回复都带有让人又气又好笑的吐槽感",
    },
  };

  const diff = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.normal;

  const systemPrompt = `你正在扮演${characterLabel}的角色，因为以下原因正在生气：

【场景：${scenario?.title || "惹生气了"}】
${scenario?.story || `${characterLabel}现在很生气。`}

【当前怒气值：${currentAnger}/100】
【难度等级：${diff.name} — ${diff.desc}】

===== 角色设定 =====
你非常爱你的另一半（正在和你聊天的那个人），但你现在很生气。

1. 说话语气特点：
   - 生气的时候会阴阳怪气、反问、翻旧账、偶尔不讲道理
   - 但你的生气中**带有一种让人哭笑不得的幽默感**——比如用夸张的比喻、自嘲式的吐槽、或者突然冒出搞笑的潜台词
   - 例如："呵，你道歉的样子比你打游戏认真的样子真诚多了" / "我生气了吗？没有啊，我怎么会生气呢，我只是想把你做成表情包"
   - 如果对方的话很有趣或出乎意料，你可能会在生气中**忍不住被逗到**（但嘴上绝不承认）
   - 随着怒气下降，你的幽默感会越来越多，从阴阳怪气变成撒娇式吐槽

2. 随着怒气值下降，你的语气会逐渐软化：
   - 怒气值 70-100：非常生气，说话带刺，毒舌吐槽模式
   - 怒气值 40-70：还有点气，但已经能好好说话了，偶尔漏出幽默感
   - 怒气值 10-40：基本消气了，开始撒娇/委屈/搞笑地翻旧账
   - 怒气值 0-10：快好了，甜蜜中带着调侃

3. 怒气的增减规则（严格遵循）：
   - ${diff.angerRange}
   - ${diff.angerIncreaseLimit}
   - 总怒气值不能低于 0 也不能高于 100
   - 怒气值变化要合理，不能无缘无故大变

4. 对话要丰富自然：
   - 回复长度 20~80 字，像真实聊天一样自然
   - 每次回复可以结合当前场景的具体细节来回应
   - 不要每次都说同样的话，要有多样性
   - ${diff.personality}

===== 回复格式 =====
你必须在回复的开头第一句话就包含怒气值变化标记，格式为 [ANGER:+数字] 或 [ANGER:-数字]。

例如（注意幽默感）：
- 对方说得好：[ANGER:-20]哼，算你会说话……不过你最好说清楚错哪了，别想糊弄我
- 对方真诚道歉：[ANGER:-25]……好吧好吧，你赢了。不过下次再犯我也不是这么好哄的了！
- 对方敷衍：[ANGER:+10]就打这几个字？你写作文都没这么敷衍过吧
- 对方狡辩：[ANGER:+20]哇塞，你这理由编得比你工资条还好看呢
- 对方说了让你暖心的话：[ANGER:-30]……你认真起来还挺要命的，好了好了不气了不气了
- 对方说错话：[ANGER:+15]行，你成功让我从生气变成了想打人`;

  const llmMessages: Message[] = [
    { role: "system", content: systemPrompt },
    ...chatMessages.slice(-6),
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const llmStream = client.stream(
          llmMessages,
          {
            model: "doubao-seed-2-0-lite-260215",
            temperature: 0.9,
          }
        );

        let fullContent = "";
        let angerChange: number | null = null;
        let angerEventSent = false;

        for await (const chunk of llmStream) {
          if (chunk.content) {
            const text = chunk.content.toString();
            fullContent += text;

            // 尝试从开头提取怒气值变化标记
            if (!angerEventSent) {
              const angerMatch = fullContent.match(/\[ANGER:([+-]?\d+)\]/);
              if (angerMatch) {
                angerChange = parseInt(angerMatch[1], 10);
                // 发送怒气值 SSE 事件
                const angerData = JSON.stringify({ change: angerChange });
                controller.enqueue(
                  encoder.encode(`event: anger\ndata: ${angerData}\n\n`)
                );
                angerEventSent = true;

                // 移除标记后的纯文本部分
                const afterMarker = fullContent.split(/\[ANGER:[+-]?\d+\]/)[1] || "";
                if (afterMarker) {
                  const textData = JSON.stringify({ text: afterMarker });
                  controller.enqueue(
                    encoder.encode(`event: text\ndata: ${textData}\n\n`)
                  );
                }
                continue;
              }
            }

            if (angerEventSent) {
              const textData = JSON.stringify({ text });
              controller.enqueue(
                encoder.encode(`event: text\ndata: ${textData}\n\n`)
              );
            }
          }
        }

        // 如果一直没有解析到怒气值标记，用默认值
        if (!angerEventSent) {
          const fallbackChange = -10;
          const fallbackData = JSON.stringify({ change: fallbackChange });
          controller.enqueue(
            encoder.encode(`event: anger\ndata: ${fallbackData}\n\n`)
          );
          if (fullContent) {
            const textData = JSON.stringify({ text: fullContent });
            controller.enqueue(
              encoder.encode(`event: text\ndata: ${textData}\n\n`)
            );
          }
        }

        // 发送完成事件，附带当前怒气值
        const newAnger = Math.max(
          0,
          Math.min(100, currentAnger + (angerChange || -10))
        );
        const doneData = JSON.stringify({ anger: newAnger });
        controller.enqueue(encoder.encode(`event: done\ndata: ${doneData}\n\n`));
        controller.close();
      } catch (error) {
        const errorData = JSON.stringify({
          error: "AI 回复失败，请重试",
        });
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${errorData}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}