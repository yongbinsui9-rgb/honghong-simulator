import { Resend } from "resend";
import { LLMClient, Config } from "coze-coding-dev-sdk";
import { isNotNull } from "drizzle-orm";
import { getDatabase } from "@/storage/database/db";
import { users } from "@/storage/database/shared/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

const appUrl = process.env.APP_URL || "http://localhost:5000";

async function generateLoveLetter(userName: string): Promise<string> {
  const config = new Config();
  const client = new LLMClient(config);

  const response = await client.invoke(
    [
      {
        role: "system",
        content:
          "你是「纸片人男友」，温柔体贴，擅长写简短动人的早安情话。每次内容不同，50-120字，口语自然，带一点俏皮和关心。只输出情话正文，不要标题、不要引号、不要 markdown。",
      },
      {
        role: "user",
        content: `请给 ${userName} 写一段今天的早安情话。`,
      },
    ],
    {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.9,
    }
  );

  return (response.content || "早安，今天也要好好照顾自己。").trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");
}

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  await resend.emails.send({
    from: "哄哄模拟器 <onboarding@resend.dev>",
    to: userEmail,
    subject: "你好呀，我是你的专属男友 💌",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Hi ${userName}，欢迎来到哄哄模拟器！</h2>
        <p>从现在起，我就是你的哄女友神器了。</p>
        <p>有什么心事随时来找我聊，我会一直在这里等你。</p>
        <p>明天早上我会给你发一条早安消息，记得查收哦。</p>
        <br/>
        <p>—— 你的哄女友搭档</p>
      </div>
    `,
  });
}

export async function sendDailyLoveLetter(
  userEmail: string,
  userName: string
) {
  const loveLetter = await generateLoveLetter(userName);

  await resend.emails.send({
    from: "纸片人男友 <onboarding@resend.dev>",
    to: userEmail,
    subject: `早安 ${userName}，今天也想你了`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <p>${escapeHtml(loveLetter)}</p>
        <br/>
        <p>—— 你的纸片人男友</p>
        <p style="color: #999; font-size: 12px;">
          想来找我玩？<a href="${appUrl}">点这里回来找我</a>
        </p>
      </div>
    `,
  });
}

export async function sendDailyLoveLetterToAll() {
  const db = await getDatabase();
  const subscribers = await db
    .select({ email: users.email, username: users.username })
    .from(users)
    .where(isNotNull(users.email));

  for (const user of subscribers) {
    if (!user.email) continue;
    try {
      await sendDailyLoveLetter(user.email, user.username);
    } catch (err) {
      console.error(`Daily love letter failed for ${user.email}:`, err);
    }
  }
}
