import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9-]{3,40}$/;
const TTL = 60 * 60 * 24 * 180; // 180 gün hareketsiz kalırsa silinir

const keyOf = (slug) => `halka:${slug}`;
const json = (data, status = 200) => Response.json(data, { status });

async function getSlug(params) {
  const { slug } = await params;
  return SLUG.test(slug) ? slug : null;
}

async function readAll(slug) {
  return (await redis.hgetall(keyOf(slug))) ?? {};
}

export async function GET(_req, { params }) {
  const slug = await getSlug(params);
  if (!slug) return json({ error: "Geçersiz halka adı" }, 400);
  return json({ juz: await readAll(slug) });
}

export async function POST(req, { params }) {
  const slug = await getSlug(params);
  if (!slug) return json({ error: "Geçersiz halka adı" }, 400);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Geçersiz istek" }, 400);
  }

  const juz = Number(body.juz);
  const name = String(body.name ?? "").trim().slice(0, 30);
  const action = body.action;

  if (!Number.isInteger(juz) || juz < 1 || juz > 30)
    return json({ error: "Cüz 1-30 arasında olmalı" }, 400);
  if (!name) return json({ error: "Önce adını yaz" }, 400);
  if (!["claim", "done", "release"].includes(action))
    return json({ error: "Geçersiz işlem" }, 400);

  const key = keyOf(slug);
  const existing = await redis.hget(key, String(juz));

  if (existing && existing.name !== name) {
    return json(
      { error: `${juz}. cüz ${existing.name} tarafından alınmış`, juz: await readAll(slug) },
      409
    );
  }

  if (action === "release") {
    await redis.hdel(key, String(juz));
  } else {
    await redis.hset(key, {
      [juz]: { name, status: action === "done" ? "done" : "reading" },
    });
    await redis.expire(key, TTL);
  }

  return json({ juz: await readAll(slug) });
}

// Yeni hatim: halkadaki tüm işaretleri siler
export async function DELETE(_req, { params }) {
  const slug = await getSlug(params);
  if (!slug) return json({ error: "Geçersiz halka adı" }, 400);
  await redis.del(keyOf(slug));
  return json({ juz: {} });
}
