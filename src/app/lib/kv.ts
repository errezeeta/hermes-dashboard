/** KV helper for sessions */
const KV_URL = process.env.KV_REST_API_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || "";

function headers() {
  return {
    Authorization: `Bearer ${KV_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function kvGet(key: string): Promise<any> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${key}`, { headers: headers() });
    const data = await res.json();
    if (!data?.result) return null;
    const parsed = JSON.parse(data.result);
    if (parsed?.value) return JSON.parse(parsed.value);
    return parsed;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: any): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    await fetch(`${KV_URL}/set/${key}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ value: JSON.stringify(value) }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function kvKeys(pattern: string): Promise<string[]> {
  if (!KV_URL || !KV_TOKEN) return [];
  try {
    const res = await fetch(`${KV_URL}/keys/${pattern}`, { headers: headers() });
    const data = await res.json();
    return data?.result || [];
  } catch {
    return [];
  }
}
