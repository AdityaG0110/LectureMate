# LectureMate

> Transform lectures into knowledge.

LectureMate is an AI-powered study workspace for turning lectures, PDFs, slides, documents, images, and recordings into structured study material. The current project contains a premium marketing site and a frontend-only dashboard foundation for the student experience.

## Screenshots

Screenshots will be added as the product matures.

| Landing page | Dashboard overview | Upload workspace |
| --- | --- | --- |
| _Coming soon_ | _Coming soon_ | _Coming soon_ |

## Features

- Modern responsive landing page with dark-mode support
- Premium dashboard shell with desktop sidebar and mobile drawer
- Study overview: progress, streak, goals, activity, uploads, chats, and notes
- Upload workspace with drag/drop, client-side dummy progress, and AI processing timeline
- Route foundations for library, notes, flashcards, quizzes, mind maps, AI chat, revision planning, and settings
- Framer Motion transitions and glassmorphism visual system

## Tech stack

- [Next.js 15](https://nextjs.org/) with App Router
- React 19 and TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React icons

## Installation

### Prerequisites

- Node.js 20.9 or newer
- npm 10 or newer

### Run locally

```bash
git clone <repository-url>
cd lecturemate
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard is available at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

### Production build

```bash
npm run build
npm run start
```

## Folder structure

```text
app/
  dashboard/                # Dashboard routes and shared route layout
  globals.css               # Base styles and design tokens
  page.tsx                  # Marketing landing page
components/
  dashboard/                # Dashboard shell, views, data, and workspaces
  landing-page.tsx          # Marketing page composition
PROJECT_RULES.md            # Engineering standards for future development
```

## Future roadmap

- Authentication, teams, subscriptions, and role-based access
- Direct-to-storage material uploads with quotas and processing jobs
- AI ingestion pipeline for documents, audio, video, and images
- Generated notes, summaries, flashcards, quizzes, and mind maps
- Source-grounded AI chat with citations
- Revision planner, spaced repetition, and learning analytics
- Collaboration and sharing controls

## Contributing

Please read [PROJECT_RULES.md](./PROJECT_RULES.md) before contributing. Use focused branches, follow Conventional Commit messages, keep all routes responsive and dark-mode compatible, and run `npm run build` before opening a pull request.

## License

This project is currently proprietary and all rights are reserved. A license may be added before any public distribution.
