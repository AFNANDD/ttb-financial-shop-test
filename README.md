# Shoper Project

Shoper เป็นโปรเจกต์ Full Stack สำหรับระบบร้านค้า แยกเป็น 2 ส่วนหลัก:

- `mobile/` : แอป React Native
- `server/app.api/` : ASP.NET Core Web API

เอกสารนี้เขียนให้ใช้งานได้ทั้ง

- คนทั่วไปที่ต้องการ "รันโปรเจกต์ให้ขึ้น"
- นักพัฒนาที่ต้องการ "ตั้งค่าและดีบักต่อ"

## โครงสร้างระบบ

- Mobile: React Native 0.86, TypeScript, React Navigation, Axios
- Backend: .NET 8 Web API, Entity Framework Core, SQL Server

## Quick Start (สำหรับคนทั่วไป)

ถ้าต้องการรันให้ขึ้นเร็วที่สุด ทำตามนี้:

1. ติดตั้งเครื่องมือที่จำเป็น (Node.js, .NET, SQL Server, Android Studio)
2. รันคำสั่งติดตั้งแพ็กเกจ
3. รัน API
4. ตั้งค่า API URL ในแอปมือถือ
5. รันแอป

คำสั่งรวม:

```bash
# ติดตั้ง dependencies
cd mobile
npm install
cd ..
dotnet restore server/app.api/app.api.csproj

# อัปเดตฐานข้อมูล
dotnet ef database update --project server/app.api/app.api.csproj --startup-project server/app.api/app.api.csproj

# รัน API
dotnet run --project server/app.api/app.api.csproj

# เปิดอีก terminal เพื่อรัน Mobile
cd mobile
npm start
# เปิดอีก terminal
npm run android
```

## Prerequisites

ติดตั้งให้ครบก่อนเริ่ม:

1. Node.js `>= 22.11.0`
2. npm
3. .NET SDK `8.0.422`
4. SQL Server
5. Android (ถ้าทดสอบบน Android)
   - Android Studio
   - Android SDK + Emulator
   - JDK 17
6. iOS (เฉพาะ macOS)
   - Xcode
   - CocoaPods

หมายเหตุ: โปรเจกต์ล็อก .NET SDK ที่ `server/global.json`

## ขั้นตอนติดตั้งแบบละเอียด

### 1) ติดตั้ง Dependencies

จากโฟลเดอร์หลักโปรเจกต์:

```bash
cd mobile
npm install
cd ..

dotnet restore server/app.api/app.api.csproj
```

### 2) ตั้งค่าฐานข้อมูล (SQL Server)

ค่าเริ่มต้นอยู่ที่ `server/app.api/appsettings.json`:

```json
"DefaultConnection": "Server=localhost;Database=shoper;User Id=sa;Password=DevAfnan@2026;TrustServerCertificate=True"
```

แนะนำให้แก้ให้ตรงเครื่องตัวเอง โดยเฉพาะ `Server`, `User Id`, `Password`

จากนั้นรัน migration:

```bash
dotnet ef database update --project server/app.api/app.api.csproj --startup-project server/app.api/app.api.csproj
```

ถ้ายังไม่มี `dotnet-ef`:

```bash
dotnet tool install --global dotnet-ef
```

### 3) รัน Backend API

```bash
dotnet run --project server/app.api/app.api.csproj
```

ค่าเริ่มต้น:

- API: `http://localhost:5288`
- Swagger: `http://localhost:5288/swagger`

### 4) ตั้งค่า URL API ใน Mobile

แก้ `baseURL` ใน `mobile/src/api/axios.ts` ให้ตรงกับ environment:

- Android Emulator: `http://10.0.2.2:5288/api`
- iOS Simulator: `http://localhost:5288/api`
- มือถือจริง: `http://<IP-เครื่องที่รัน API>:5288/api`

ตัวอย่าง:

```ts
const api = axios.create({
  baseURL: 'http://10.0.2.2:5288/api',
});
```

### 5) รัน Mobile App

Terminal 1 (Metro):

```bash
cd mobile
npm start
```

Terminal 2 (Run App):

```bash
cd mobile
npm run android
```

หรือ iOS:

```bash
cd mobile
npm run ios
```

## การรันบน Android เครื่องจริง

ถ้าใช้มือถือจริง แนะนำสั่ง:

```bash
adb reverse tcp:5288 tcp:5288
```

แล้วตั้ง `baseURL` เป็น `http://localhost:5288/api`

## คำสั่งที่ใช้บ่อย (Developer)

```bash
# Mobile
cd mobile
npm run lint
npm test

# Backend
dotnet build server/app.api/app.api.csproj
```

## Troubleshooting

### 1) `npm run android` ไม่ผ่าน

- ตรวจว่าเปิด Emulator แล้ว
- ตรวจ Android SDK/JDK และ environment variables
- ลอง `cd mobile/android && gradlew clean` แล้วรันใหม่

### 2) แอปเรียก API ไม่ได้

- ตรวจว่า API รันอยู่ (`http://localhost:5288/swagger` เปิดได้)
- ตรวจค่า `baseURL` ใน `mobile/src/api/axios.ts`
- ถ้าใช้มือถือจริง ต้องอยู่เครือข่ายเดียวกับเครื่องที่รัน API

### 3) ต่อฐานข้อมูลไม่ได้

- ตรวจ connection string ใน `server/app.api/appsettings.json`
- ตรวจว่า SQL Server ทำงานอยู่
- รัน migration ใหม่อีกครั้ง

## หมายเหตุสำหรับทีม

- ถ้าจะเปลี่ยนพอร์ต API: แก้ที่ `server/app.api/Properties/launchSettings.json`
- หลังเปลี่ยนพอร์ต อย่าลืมอัปเดต `baseURL` ฝั่ง mobile ให้ตรงกัน
