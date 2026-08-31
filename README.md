# Ginza Karaoke — QR Feedback System

Энэ нь Ginza Karaoke-ийн ширээн дээр байрлах QR кодоор үйлчлүүлэгчээс санал авах анхны хувилбар.

## Гол боломжууд

- Хугацаагүй QR холбоосын загвар: `/feedback?table=1`
- 1–5 одтой ерөнхий үнэлгээ
- Админ талаас асуулт нэмэх, засах, идэвхгүй болгох
- Ирсэн feedback-үүдийг админ dashboard-аас харах
- Дундаж үнэлгээ, нийт саналын статистик
- Монгол хэл дээрх цэвэр, гэрэлтэй UI
- Inter font
- Гар утсанд зориулсан responsive дизайн
- QR PNG: `public/qr/ginza-table-01.png`

## Ажиллуулах

```bash
npm install
npm run dev
```

Дараа нь:

- Хэрэглэгч: http://localhost:3000/feedback?table=1
- Админ: http://localhost:3000/admin

### Demo admin

- Нэвтрэх нэр: `admin`
- Нууц үг: `ginza1234`

> Анхаар: Энэ demo хувилбар JSON файлд өгөгдөл хадгалдаг. Production-д PostgreSQL/MySQL зэрэг database болон жинхэнэ authentication ашиглах хэрэгтэй.

## QR

Одоогийн QR нь:

`http://localhost:3000/feedback?table=1`

руу заасан. Production domain-оо тохируулсны дараа QR-ийг дахин үүсгэнэ.

## Зураг

Бодит Ginza Karaoke-ийн Улаанбаатар дахь баталгаатай зургийг энэ хайлтаар найдвартай таньж чадсангүй. Тиймээс бусад газрын зургийг Ginza-ийн зураг мэтээр буруу оруулаагүй. `public/images/ginza-hero.svg` нь солиход бэлэн placeholder/brand illustration юм. Бодит зургийг `public/images/ginza-hero.jpg` нэрээр сольж болно.
# Ginza
