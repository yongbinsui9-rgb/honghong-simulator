import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/storage/database/db";
import { users } from "@/storage/database/shared/schema";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
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
        password: hashedPassword,
      })
      .returning({ id: users.id, username: users.username });

    if (!newUser) {
      return NextResponse.json(
        { error: "注册失败，请重试" },
        { status: 500 }
      );
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
