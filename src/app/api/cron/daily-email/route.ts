import { sendDailyLoveLetterToAll } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "CRON_SECRET 未配置，请在 Vercel 环境变量中设置" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "未授权访问" }, { status: 401 });
  }

  if (!process.env.PGDATABASE_URL?.trim()) {
    console.error("PGDATABASE_URL is not configured");
    return NextResponse.json(
      { error: "PGDATABASE_URL 未配置，无法连接数据库" },
      { status: 503 }
    );
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    console.warn("RESEND_API_KEY not set, daily emails will be skipped");
  }

  try {
    const result = await sendDailyLoveLetterToAll();
    return NextResponse.json({
      success: true,
      message: "每日情话任务执行完成",
      ...result,
      time: new Date().toISOString(),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "未知错误";
    console.error("每日情话发送失败：", error);
    return NextResponse.json(
      { error: "发送失败", detail },
      { status: 500 }
    );
  }
}
