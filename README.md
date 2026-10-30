# Cüz Takip

Arkadaşlarla Kur'an hatmi takibi. Herkes bir cüz seçer, okuyunca "Okudum" der.
Next.js (App Router) + Upstash Redis.

## Vercel'e kurulum

1. Bu klasörü GitHub'a at (`git init && git add . && git commit -m "ilk" && git push`).
2. vercel.com > Add New > Project > repoyu seç > Deploy.
3. Projede **Storage** sekmesi > **Upstash Redis** (Marketplace) > Create > projeye bağla.
   Ortam değişkenleri (`UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN`
   ya da `KV_REST_API_URL` ve `KV_REST_API_TOKEN`) otomatik eklenir.
4. **Deployments > Redeploy** yap (değişkenlerin devreye girmesi için).

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # Upstash değerlerini yaz
npm run dev
```

## Notlar

- Giriş/şifre yok: halka adını bilen herkes girebilir, ad kutusuna yazılan isim kullanılır.
- Liste 5 saniyede bir ve sekmeye dönüldüğünde yenilenir.
- Bir cüzü alan kişi sadece kendi adıyla "Okudum / Vazgeç / Geri al" yapabilir.
- Halka 180 gün hareketsiz kalırsa otomatik silinir.
