import {
  Config,
  HeaderUtils,
  ImageGenerationClient,
} from "coze-coding-dev-sdk";
import { nanoid } from "nanoid";
import { uploadToR2 } from "./r2";
import { getDatabase } from "@/storage/database/db";
import { generatedImages } from "@/storage/database/shared/schema";

interface GenerateScenePhotoOptions {
  description: string;
  role: "girlfriend" | "boyfriend";
  scenario?: { title?: string; story?: string };
  currentAnger: number;
  requestHeaders: Headers;
  userId?: number | null;
}

function buildMoodHint(anger: number): string {
  if (anger >= 80) {
    return "表情冷淡或明显生气，可能侧脸、背影，或故意拍得很敷衍";
  }
  if (anger >= 50) {
    return "表情不太高兴，有点别扭，生活化自然";
  }
  if (anger >= 20) {
    return "表情逐渐缓和，带一点委屈或撒娇";
  }
  return "表情温柔自然，带一点笑意";
}

function buildPrompt(options: GenerateScenePhotoOptions): string {
  const { description, role, scenario, currentAnger } = options;
  const characterLabel = role === "girlfriend" ? "年轻中国女生" : "年轻中国男生";
  const moodHint = buildMoodHint(currentAnger);
  const sceneHint = scenario?.story
    ? `场景背景参考：${scenario.story.slice(0, 120)}`
    : "";

  return [
    "真实生活感手机照片，像微信聊天里发的日常照片",
    characterLabel,
    description,
    moodHint,
    sceneHint,
    "自然光线，不要文字水印，不要卡通风格，不要过度美颜",
  ]
    .filter(Boolean)
    .join("，");
}

async function callAIImageAPI(
  prompt: string,
  requestHeaders: Headers
): Promise<string | null> {
  const customHeaders = HeaderUtils.extractForwardHeaders(requestHeaders);
  const config = new Config();
  const client = new ImageGenerationClient(config, customHeaders);

  const response = await client.generate({
    prompt,
    size: "2K",
    watermark: false,
  });

  const helper = client.getResponseHelper(response);
  const tempImageUrl = helper.imageUrls[0];

  if (!tempImageUrl) {
    console.error("AI image generation failed:", helper.errorMessages);
    return null;
  }

  return tempImageUrl;
}

async function persistImageRecord(
  permanentUrl: string,
  prompt: string,
  userId?: number | null
): Promise<void> {
  try {
    const db = await getDatabase();
    await db.insert(generatedImages).values({
      userId: userId ?? null,
      imageUrl: permanentUrl,
      prompt,
    });
  } catch (error) {
    console.error("Failed to save generated image record:", error);
  }
}

async function isPublicUrlAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function generateScenePhoto(
  options: GenerateScenePhotoOptions
): Promise<string | null> {
  const prompt = buildPrompt(options);

  const tempImageUrl = await callAIImageAPI(prompt, options.requestHeaders);
  if (!tempImageUrl) return null;

  const imageResponse = await fetch(tempImageUrl);
  if (!imageResponse.ok) {
    console.error("Failed to download temp image:", imageResponse.status);
    return null;
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const fileName = `images/${nanoid()}.png`;

  try {
    const permanentUrl = await uploadToR2(imageBuffer, fileName, "image/png");
    const accessible = await isPublicUrlAccessible(permanentUrl);

    if (!accessible) {
      console.error("R2 public URL not accessible:", permanentUrl);
      return tempImageUrl;
    }

    await persistImageRecord(permanentUrl, prompt, options.userId);
    return permanentUrl;
  } catch (error) {
    console.error("R2 upload failed, using temp image URL:", error);
    return tempImageUrl;
  }
}

export function stripPhotoMarker(text: string): string {
  return text.replace(/\[PHOTO:[^\]]+\]/g, "").trim();
}

export function extractPhotoDescription(text: string): string | null {
  const match = text.match(/\[PHOTO:([^\]]+)\]/);
  return match?.[1]?.trim() || null;
}
