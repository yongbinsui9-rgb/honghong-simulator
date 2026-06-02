import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const payload = verifyToken(token);
    return NextResponse.json({
      user: { id: payload.userId, username: payload.username },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}