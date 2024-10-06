## Packages to be installed
npm install next@latest react@latest react-dom@latest @nextui-org/react @heroicons/react lucide-react react-swipeable yarn next-pwa next-compose-plugins axios @react-oauth/google
npm install js-cookie @types/js-cookie
npm i @aws-sdk/client-s3
npm i @aws-sdk/s3-request-presigner
npx nextui-cli@latest add avatar
npx nextui-cli@latest add select

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

##  FRONT MAIN PR

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

```
Final-front-1
├─ app
│  ├─ ClientLayout.tsx
│  ├─ addEvent
│  │  └─ page.tsx
│  ├─ auth
│  │  └─ token
│  │     └─ set
│  │        └─ page.tsx
│  ├─ calendarapp
│  │  ├─ Calendar.tsx
│  │  └─ page.tsx
│  ├─ chatbot
│  │  └─ page.tsx
│  ├─ diary
│  │  └─ page.tsx
│  ├─ editEvent
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ editMemo
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ home
│  │  ├─ EventCard.tsx
│  │  └─ page.tsx
│  ├─ index.html
│  ├─ initialSettings
│  │  ├─ AvatarWithUpload.tsx
│  │  └─ page.tsx
│  ├─ layout.tsx
│  ├─ login
│  │  ├─ google.tsx
│  │  └─ page.tsx
│  ├─ memo
│  │  └─ MemoDetail.tsx
│  ├─ metadata.ts
│  ├─ modal
│  │  ├─ CreateDiaryModal.tsx
│  │  ├─ CreateModal.tsx
│  │  ├─ DeleteModal.tsx
│  │  ├─ DiaryDetailModal.tsx
│  │  └─ RecordModal.tsx
│  ├─ notice
│  │  ├─ [month]
│  │  │  └─ page.tsx
│  │  └─ page.tsx
│  ├─ page.tsx
│  ├─ pages
│  │  └─ _document.js
│  ├─ profile
│  │  └─ page.tsx
│  ├─ providers.tsx
│  └─ story
│     ├─ StoryCard.tsx
│     ├─ StoryCardGrid.tsx
│     ├─ [id]
│     │  └─ page.tsx
│     └─ page.tsx
├─ components
│  ├─ BottomContainer.tsx
│  ├─ CommonContainer.tsx
│  ├─ DetailedContainer.tsx
│  ├─ EditContainer.tsx
│  ├─ EventCalendar.tsx
│  ├─ Header.tsx
│  ├─ Input.tsx
│  ├─ Loading.tsx
│  ├─ MainContainer.tsx
│  ├─ OptionButton.tsx
│  ├─ Select.tsx
│  └─ VideoPlayer.tsx
├─ contexts
│  └─ BottomContainerContext.tsx
├─ global.css
├─ public
│  ├─ img
│  │  ├─ button
│  │  │  ├─ addSchedule.png
│  │  │  ├─ back.png
│  │  │  ├─ camera.png
│  │  │  ├─ changeDate.png
│  │  │  ├─ confirm.png
│  │  │  ├─ confirm_circle.png
│  │  │  └─ notice.png
│  │  ├─ cloud.gif
│  │  ├─ google.png
│  │  ├─ loading.mp4
│  │  ├─ mg-logoback.png
│  │  └─ storyThumbnail
│  │     └─ fallback.jpg
├─ styles
│  └─ global.css
├─ tailwind.config.ts
├─ tsconfig.json
├─ types
│  └─ index.ts
├─ types.d.ts
├─ utils
│  ├─ authUtils.ts
│  ├─ dateFormatter.ts
├─ vercel.svg
└─ yarn.lock
