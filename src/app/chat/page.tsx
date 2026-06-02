"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Send, Heart, Volume2, VolumeX } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUri?: string;
  audioLoading?: boolean;
}

interface Scenario {
  title: string;
  story: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [role, setRole] = useState<"girlfriend" | "boyfriend" | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [anger, setAnger] = useState(100);
  const [lastAnger, setLastAnger] = useState(100);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);
  const [sceneLoading, setSceneLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");

  const difficultyLabel: Record<string, string> = {
    easy: "简单 😊",
    normal: "一般 😐",
    hard: "魔鬼 😈",
    hell: "地狱 💀",
  };

  const difficultyColor: Record<string, string> = {
    easy: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    normal: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    hard: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    hell: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const characterLabel = role === "girlfriend" ? "女朋友" : "男朋友";
  const avatarSrc =
    role === "girlfriend" ? "/avatar-girlfriend.jpeg" : "/avatar-boyfriend.jpeg";

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  // 生成 AI 消息的语音
  const generateAudio = useCallback(
    async (messageId: string, text: string, currentAnger: number) => {
      if (!voiceId) return; // 没选语音就不生成

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, audioLoading: true } : m
        )
      );

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voiceId,
            anger: currentAnger,
          }),
        });
        const data = await res.json();
        if (data.audioUri) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, audioUri: data.audioUri, audioLoading: false }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, audioLoading: false } : m
            )
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, audioLoading: false } : m
          )
        );
      }
    },
    [voiceId]
  );

  // 播放/暂停语音
  const togglePlay = (msgId: string, audioUri: string) => {
    if (playingId === msgId) {
      // 停止当前播放
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
    } else {
      // 停止之前的播放
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUri);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingId(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setPlayingId(null);
        audioRef.current = null;
      };

      audio.play().catch(() => {
        setPlayingId(null);
        audioRef.current = null;
      });
      setPlayingId(msgId);
    }
  };

  // 初始化
  useEffect(() => {
    const savedRole = sessionStorage.getItem("honghong_role") as
      | "girlfriend"
      | "boyfriend"
      | null;
    const savedScenario = sessionStorage.getItem("honghong_scenario");
    const savedAnger = sessionStorage.getItem("honghong_anger");
    const savedVoice = sessionStorage.getItem("honghong_voice");
    const savedDifficulty = sessionStorage.getItem("honghong_difficulty");

    if (!savedRole) {
      router.replace("/");
      return;
    }

    setRole(savedRole);
    if (savedVoice) setVoiceId(savedVoice);
    if (savedDifficulty) setDifficulty(savedDifficulty);

    const loadScenario = async () => {
      if (savedScenario) {
        try {
          setScenario(JSON.parse(savedScenario));
        } catch {
          // sessionStorage 数据损坏，忽略
        }
        if (savedAnger) setAnger(Number(savedAnger));
        setSceneLoading(false);
      } else {
        try {
          const res = await fetch("/api/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: savedRole }),
          });
          const data = await res.json();
          setScenario(data.scenario);
          sessionStorage.setItem(
            "honghong_scenario",
            JSON.stringify(data.scenario)
          );
        } catch {
          setScenario({
            title: "惹生气了",
            story: `你的${savedRole === "girlfriend" ? "女朋友" : "男朋友"}现在很生气，快去哄哄${savedRole === "girlfriend" ? "她" : "他"}吧！`,
          });
        }
        setSceneLoading(false);
      }
    };

    loadScenario();

    // 注意：不要在 cleanup 中清除 sessionStorage！
    document.body.classList.add("chat-open");
    return () => {
      document.body.classList.remove("chat-open");
    };
  }, [router, characterLabel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  // 发送消息
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setAiTyping(true);
    setStreamingText("");

    const chatHistory = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: text },
    ];

    scrollToBottom();

    try {
      const abortController = new AbortController();
      abortRef.current = abortController;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          currentAnger: anger,
          role,
          scenario,
          difficulty,
        }),
        signal: abortController.signal,
      });

      if (!res.ok) throw new Error("请求失败");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("无响应流");

      const decoder = new TextDecoder();
      let fullText = "";
      let angerThisRound = anger;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("event: anger") || line.startsWith("event: text") || line.startsWith("event: done") || line.startsWith("event: error")) {
            continue;
          }
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.change !== undefined) {
                angerThisRound = Math.max(0, Math.min(100, anger + data.change));
                setAnger(angerThisRound);
                setLastAnger(angerThisRound);
              } else if (data.text !== undefined) {
                fullText += data.text;
                setStreamingText(fullText);
              } else if (data.anger !== undefined) {
                const finalAnger = data.anger;
                if (finalAnger <= 0) {
                  setShowVictory(true);
                } else if (finalAnger >= 100) {
                  setShowDefeat(true);
                }
              } else if (data.error) {
                console.error(data.error);
              }
            } catch {
              // 忽略非 JSON
            }
          }
        }
        scrollToBottom();
      }

      if (fullText) {
        const newMsgId = (Date.now() + 1).toString();
        const aiMessage: Message = {
          id: newMsgId,
          role: "assistant",
          content: fullText,
          audioLoading: true,
        };
        setMessages((prev) => [...prev, aiMessage]);

        // 触发 TTS 语音生成（异步）
        generateAudio(newMsgId, fullText, angerThisRound);
      }

      setStreamingText("");
      setAiTyping(false);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Chat error:", err);
      setAiTyping(false);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    sessionStorage.removeItem("honghong_scenario");
    sessionStorage.removeItem("honghong_anger");
    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getAngerColor = () => {
    if (anger > 60) return "bg-red-500";
    if (anger > 30) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (sceneLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ededed] dark:bg-[#111111]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
          <p className="text-sm text-neutral-500">正在生成场景...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-dvh max-w-md flex-col bg-[#ededed] dark:bg-[#111111]">
      {/* ===== 胜利弹窗 ===== */}
      {showVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-neutral-800">
            <div className="mb-3 flex justify-center">
              <Heart className="h-14 w-14 fill-red-400 text-red-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              哄好啦！🎉
            </h2>
            <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
              你的{characterLabel}已经被你哄好了，Ta 感受到你的真心了~
            </p>
            <button
              onClick={handleRestart}
              className="w-full rounded-xl bg-gradient-to-r from-pink-400 to-red-400 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-pink-500 hover:to-red-500 active:scale-[0.98]"
            >
              再来一次
            </button>
          </div>
        </div>
      )}

      {/* ===== 失败弹窗 ===== */}
      {showDefeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-neutral-800">
            <div className="mb-3 flex justify-center">
              <span className="text-5xl">💔</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              彻底生气了...
            </h2>
            <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
              你的{characterLabel}更生气了，这次真的很难哄...
            </p>
            <button
              onClick={handleRestart}
              className="w-full rounded-xl bg-gradient-to-r from-neutral-400 to-neutral-500 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-neutral-500 hover:to-neutral-600 active:scale-[0.98]"
            >
              重新挑战
            </button>
          </div>
        </div>
      )}

      {/* ===== 顶部导航栏 ===== */}
      <div className="flex h-14 items-center justify-between border-b border-neutral-200 bg-[#ededed] px-4 dark:border-neutral-800 dark:bg-[#2e2e2e]">
        <button
          onClick={handleRestart}
          className="flex items-center gap-1 text-sm text-[#576b95] hover:text-[#3a4f7a]"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>返回</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="text-center">
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {characterLabel}
            </div>
            <div className="text-[10px] text-neutral-400">
              {scenario?.title || "在线"}
            </div>
          </div>
          <div className="h-8 w-8 overflow-hidden rounded-sm">
            <img
              src={avatarSrc}
              alt={characterLabel}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="w-14" />
      </div>

      {/* ===== 怒气值条 ===== */}
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="shrink-0 text-xs font-medium text-neutral-500">
          😤 怒气
        </span>
        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getAngerColor()}`}
            style={{ width: `${anger}%` }}
          />
        </div>
        <span className="w-8 shrink-0 text-right text-xs font-bold text-neutral-600 dark:text-neutral-400">
          {anger}
        </span>
        {difficulty && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${difficultyColor[difficulty] || ""}`}>
            {difficultyLabel[difficulty] || difficulty}
          </span>
        )}
      </div>

      {/* ===== 场景提示条（始终显示） ===== */}
      {scenario && (
        <div className="mx-4 mt-3 rounded-xl bg-white/80 p-3 text-center shadow-sm backdrop-blur dark:bg-neutral-800/80">
          <div className="mb-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            📖 {scenario.title}
          </div>
          <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {scenario.story}
          </p>
          {messages.length === 0 && (
            <p className="mt-2 text-[11px] text-pink-400 dark:text-pink-300">
              💡 说点什么来哄哄 Ta 吧...
            </p>
          )}
        </div>
      )}

      {/* ===== 消息列表 ===== */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mr-2 mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-sm">
                <img
                  src={avatarSrc}
                  alt={characterLabel}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="max-w-[75%]">
              <div
                className={`whitespace-pre-wrap break-words px-3 py-2 text-[15px] leading-relaxed ${
                  msg.role === "user"
                    ? "bubble-self bg-[#95ec69] text-neutral-800"
                    : "bubble-other bg-white text-neutral-800 shadow-sm dark:bg-neutral-800 dark:text-neutral-200"
                }`}
              >
                {msg.content}
              </div>
              {/* 语音播放按钮（仅 AI 消息） */}
              {msg.role === "assistant" && (
                <div className="mt-1 flex items-center gap-1">
                  {msg.audioLoading ? (
                    <div className="flex items-center gap-1 rounded-md bg-neutral-200/60 px-2 py-0.5 dark:bg-neutral-700/60">
                      <div className="h-3 w-3 animate-spin rounded-full border-[2px] border-neutral-400 border-t-transparent" />
                      <span className="text-[10px] text-neutral-400">语音生成中...</span>
                    </div>
                  ) : msg.audioUri ? (
                    <button
                      onClick={() => togglePlay(msg.id, msg.audioUri!)}
                      className="flex items-center gap-1 rounded-md bg-neutral-200/60 px-2 py-0.5 text-[10px] text-neutral-500 transition-colors hover:bg-neutral-300/60 dark:bg-neutral-700/60 dark:text-neutral-400 dark:hover:bg-neutral-600/60"
                    >
                      {playingId === msg.id ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                      {playingId === msg.id ? "停止" : "播放语音"}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="mb-3 flex justify-start">
            <div className="mr-2 mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-sm">
              <img
                src={avatarSrc}
                alt={characterLabel}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="max-w-[75%] whitespace-pre-wrap break-words rounded-lg bg-white px-3 py-2 text-[15px] leading-relaxed shadow-sm dark:bg-neutral-800 dark:text-neutral-200 bubble-other">
              {streamingText}
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-neutral-400" />
            </div>
          </div>
        )}

        {aiTyping && !streamingText && (
          <div className="mb-3 flex justify-start">
            <div className="mr-2 mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-sm">
              <img
                src={avatarSrc}
                alt={characterLabel}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-3 shadow-sm dark:bg-neutral-800">
              <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== 输入区域 ===== */}
      <div className="flex items-center gap-2 border-t border-neutral-200 bg-[#f7f7f7] px-3 py-3 dark:border-neutral-800 dark:bg-[#1e1e1e]">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            anger >= 100 || anger <= 0
              ? "点击上方按钮重新开始"
              : `输入你想对${characterLabel}说的话...`
          }
          disabled={loading || showVictory || showDefeat}
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-500"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading || showVictory || showDefeat}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#07c160] text-white transition-all hover:bg-[#06ad56] disabled:opacity-40"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}