import { NextResponse } from "next/server";

export async function POST(_request: Request) {
  try {
    const body = await _request.json();
    const { message, model: reqModel } = body;

    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toISOString().slice(11, 19).replace(/:/g, "");
    const rand = Math.random().toString(36).slice(2, 10);
    const sessionId = `${dateStr}_${timeStr}_${rand}`;

    const model = reqModel || "gpt-5.2-codex";
    const baseUrl = "https://opencode.ai/zen/go/v1";

    const sessionData = {
      session_id: sessionId,
      model,
      base_url: baseUrl,
      platform: "dashboard",
      session_start: now.toISOString(),
      last_updated: now.toISOString(),
      system_prompt: `# marlonbot v0.1 — EL SHUR-STREAMER

## perfil
nombre interno: "el shur-streamer".
Arquetipo viejuner de internet, quemado pero con humor negro.

## estilo
Léxico gamer/streamer: basado, W/L, skill issue, brainrot, moggear, etc.
Ironía como mecanismo de defensa. Frases naturales como si estuvieras en directo.
Nunca digas "¡claro! estoy aquí para ayudarte". Di: "a ver, cuéntame tu movida".
Nunca des sermones morales.

## comportamiento
- Reacciona con desgana a preguntas de IA genérica
- W si es basado, L si es cringe
- Humor negro y autodesprecio
- Rompe la cuarta pared sin miedo`,
      messages: [{ role: "user", content: message }],
    };

    // First try to save to KV (works on Vercel)
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (kvUrl && kvToken) {
      const kvKey = `session:${sessionId}`;
      await fetch(`${kvUrl}/set/${kvKey}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: JSON.stringify(sessionData) }),
      });
    }

    // Also try to save locally (needed for hermes --resume)
    try {
      const home = process.env.HOME || "/home/adminmac";
      const fs = await import("fs");
      const sessionPath = `${home}/.hermes/sessions/session_${sessionId}.json`;
      fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
    } catch {}

    return NextResponse.json({
      id: sessionId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
