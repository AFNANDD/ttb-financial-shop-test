# Shoper - Run Steps

## 1) ติดตั้งเครื่องมือ

1. Node.js 22.11.0 ขึ้นไป
2. .NET SDK 8.0.422
3. SQL Server
4. Android Studio + Android SDK + JDK 17 (สำหรับ Android)
5. Xcode + CocoaPods (สำหรับ iOS/macOS)

## 2) ติดตั้ง dependencies

```bash
cd mobile
npm install
cd ..
dotnet restore server/app.api/app.api.csproj
```

## 3) ตั้งค่า database

1. แก้ connection string ใน server/app.api/appsettings.json
2. รัน migration

```bash
dotnet ef database update --project server/app.api/app.api.csproj --startup-project server/app.api/app.api.csproj
```

ถ้ายังไม่มี dotnet-ef

```bash
dotnet tool install --global dotnet-ef
```

## 4) รัน backend

```bash
dotnet run --project server/app.api/app.api.csproj
```

## 5) ตั้งค่า API URL ใน mobile

แก้ไฟล์ mobile/src/api/axios.ts

- Android Emulator: http://10.0.2.2:5288/api
- iOS Simulator: http://localhost:5288/api
- มือถือจริง: http://<IP-เครื่องที่รัน API>:5288/api

## 6) รัน mobile

Terminal 1:

```bash
cd mobile
npm start
```

Terminal 2:

```bash
cd mobile
npm run android
```

หรือ

```bash
cd mobile
npm run ios
```

## 7) Android เครื่องจริง (ถ้าใช้)

```bash
adb reverse tcp:5288 tcp:5288
```
