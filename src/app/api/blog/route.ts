import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const client = getSupabaseClient();

    if (id) {
      const { data, error } = await client
        .from("blog_posts")
        .select("id, title, summary, content, created_at")
        .eq("id", Number(id))
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: "查询文章失败" }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    const { data, error } = await client
      .from("blog_posts")
      .select("id, title, summary, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "查询文章列表失败" }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}