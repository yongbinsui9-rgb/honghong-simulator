import { NextRequest, NextResponse } from "next/server";
import { TTSClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, anger } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "缺少文本参数" }, { status: 400 });
    }

    // 根据怒气值调整语速，体现情绪变化
    // 越生气 → 语速越快，声音越大
    let speechRate = 0;
    let loudnessRate = 0;

    if (anger !== undefined) {
      const angerNum = Number(anger);
      if (angerNum >= 70) {
        speechRate = 30;   // 非常生气，语速快
        loudnessRate = 15; // 声音大
      } else if (angerNum >= 40) {
        speechRate = 10;   // 有点生气，语速稍快
        loudnessRate = 5;
      } else if (angerNum >= 10) {
        speechRate = -5;   // 快消气了，语速正常偏慢
        loudnessRate = 0;
      } else {
        speechRate = -15;  // 基本消气了，语速温柔
        loudnessRate = -5; // 声音轻柔
      }
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    const response = await client.synthesize({
      uid: "honghong_user",
      text,
      speaker: voiceId || "zh_female_xiaohe_uranus_bigtts",
      audioFormat: "mp3",
      sampleRate: 24000,
      speechRate,
      loudnessRate,
    });

    return NextResponse.json({
      audioUri: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "语音生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}