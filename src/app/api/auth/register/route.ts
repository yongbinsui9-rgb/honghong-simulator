import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/storage/database/db";
import { users } from "@/storage/database/shared/schema";
import { hashPassword, signToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: NextRequest) {
  try {
    const { username, password, email, turnstileToken } = await request.json();

    if (!username || !password || !email) {
      return NextResponse.json(
        { error: "用户名、邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: "请完成人机验证" },
          { status: 400 }
        );
      }

      const remoteIp =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        undefined;

      const verifyResult = await verifyTurnstileToken(
        turnstileToken,
        remoteIp
      );

      if (!verifyResult.success) {
        console.error("Turnstile verify failed:", verifyResult.errorCodes);
        return NextResponse.json(
          { error: "人机验证失败，请重试" },
          { status: 403 }
        );
      }
    }

    if (username.length < 2 || username.length > 50) {
      return NextResponse.json(
        { error: "用户名长度需在 2-50 个字符之间" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少 6 位" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "该用户名已被注册" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id, username: users.username });

    if (!newUser) {
      return NextResponse.json(
        { error: "注册失败，请重试" },
        { status: 500 }
      );
    }

    try {
      await sendWelcomeEmail(email, username);
    } catch (err) {
      console.error("Welcome email failed:", err);
    }

    const token = signToken({ userId: newUser.id, username: newUser.username });

    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, username: newUser.username },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "注册失败，请重试" },
      { status: 500 }
    );
  }
}
