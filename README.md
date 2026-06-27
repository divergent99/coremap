<div align="center">

# Coremap
### Cut Through the GenAI Noise

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-FF9900?style=for-the-badge&logo=amazondynamodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)

![Claude](https://img.shields.io/badge/Powered%20by-Claude%20Sonnet-CC785C?style=for-the-badge)
![Tavily](https://img.shields.io/badge/News-Tavily%20API-4F46E5?style=for-the-badge)
![React Flow](https://img.shields.io/badge/Graphs-React%20Flow-FF0072?style=for-the-badge)

**[Live Demo](https://coremap.vercel.app)** · **[Devpost](https://h01.devpost.com)** · **[Report Bug](https://github.com/divergent99/coremap/issues)**

</div>

---

## What is Coremap?

Coremap is a personalized GenAI command center that helps developers, data scientists, PMs, and students cut through the noise and learn what actually matters. Instead of another generic AI chatbot, it gives you three tools that work together:

- **Roadmap** — A personalized 8-step learning path based on your background and goal, with every concept tagged as foundational, worth knowing, or hype to skip
- **AI News** — Live GenAI news summarized and filtered by Claude, tagged by topic and labeled signal vs hype
- **Architect** — Describe a GenAI use case and get a full production architecture with an interactive graph, component breakdown, request flow, and production caveats

Built for the [H0: Hack the Zero Stack](https://h01.devpost.com) hackathon with Vercel v0 and AWS DynamoDB.

---

## Screenshots

> Roadmap view with card grid and progress tracking

> Architecture simulator with React Flow graph

> AI News feed with signal/hype filtering

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS, React Flow |
| AI | Claude Sonnet (Anthropic API) |
| News | Tavily Search API |
| Database | AWS DynamoDB (SDK v3) |
| Background | Custom WebGL shader (OGL) |
| Deployment | Vercel |

---

## Features

### Roadmap Tab
- Personalized 8-step GenAI learning path
- 4 backgrounds: Software Engineer, Data Scientist, PM, Student
- 4 goals: Build RAG apps, Get a GenAI job, Understand LLMs deeply, Build AI agents
- Each step categorized as **foundational**, **worth knowing**, or **hype/skip**
- 4-6 curated resources per step (papers, docs, courses, tools)
- Progress tracked in AWS DynamoDB with anonymous session IDs
- Toggle between card grid and interactive node graph view
- Click any step to open a side panel with full detail and resource links
- Progress and roadmap persist across page refreshes via localStorage + DynamoDB

### AI News Tab
- Fetches latest GenAI news via Tavily (past 3 days)
- Claude Sonnet summarizes every article into 2-3 actionable sentences
- Tags: LLMs, Agents, RAG, Tools, Research, Industry, Policy
- Signal quality labels: signal or hype
- Filter by tag
- 3-hour localStorage cache to avoid redundant API calls

### Architect Tab
- Plain English input for any GenAI use case
- Generates 5-8 components with type classification
- Interactive React Flow graph with color-coded nodes and semantic cross-edges
- Step-by-step request flow
- Real tool recommendations with links
- 3-5 production caveats
- Architecture persists in localStorage across refreshes

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Anthropic API key
- Tavily API key
- AWS account with DynamoDB access

### Installation

```bash
git clone https://github.com/divergent99/coremap.git
cd coremap
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-north-1
```

### AWS DynamoDB Setup

Create two tables in your AWS console:

**coremap-users**
- Partition key: `userID` (String)
- Capacity: On-demand

**coremap-progress**
- Partition key: `userID` (String)
- Sort key: `conceptId` (String)
- Capacity: On-demand

### Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                   │
│         (Vercel v0 scaffolded, App Router)           │
├──────────────┬──────────────┬────────────────────────┤
│   Roadmap    │   AI News    │      Architect         │
│   Tab        │   Tab        │      Tab               │
├──────────────┴──────────────┴────────────────────────┤
│              Next.js API Routes                      │
├──────────────┬──────────────┬────────────────────────┤
│ /api/roadmap │  /api/news   │   /api/architect       │
│              │              │                        │
│ Claude       │ Tavily →     │   Claude Sonnet        │
│ Sonnet       │ Claude       │   + React Flow         │
│              │ Sonnet       │                        │
├──────────────┴──────────────┴────────────────────────┤
│              /api/progress                           │
│         AWS DynamoDB SDK v3                          │
├──────────────────────────────────────────────────────┤
│   coremap-users    │    coremap-progress             │
│   userID (PK)      │    userID (PK) + conceptId (SK) │
└────────────────────┴─────────────────────────────────┘
```

---

## Project Structure

```
coremap/
├── app/
│   ├── api/
│   │   ├── roadmap/route.ts      # Claude roadmap generation
│   │   ├── architect/route.ts    # Claude architecture generation
│   │   ├── news/route.ts         # Tavily + Claude news pipeline
│   │   └── progress/route.ts     # DynamoDB read/write
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── app-shell.tsx             # Tab navigation shell
│   ├── coremap-form.tsx          # Roadmap + graph + side panel
│   ├── news-feed.tsx             # News feed with filtering
│   ├── architect.tsx             # Architecture simulator + graph
│   ├── Galaxy.tsx                # WebGL star background
│   └── Galaxy.css
└── lib/
    ├── roadmap.ts                # Types + API call
    └── dynamo.ts                 # DynamoDB client + helpers
```

---

## Deployment

The app is deployed on Vercel. To deploy your own:

```bash
pnpm approve-builds
git add .
git commit -m "deploy"
git push
```

Import the repo on [vercel.com](https://vercel.com) and add the environment variables in the Vercel dashboard before deploying.

---

## Built With

- [Vercel v0](https://v0.dev) — Frontend scaffolding
- [Anthropic Claude](https://anthropic.com) — Roadmap generation, architecture simulation, news summarization
- [Tavily](https://tavily.com) — Real-time news search
- [AWS DynamoDB](https://aws.amazon.com/dynamodb) — Progress persistence
- [React Flow](https://reactflow.dev) — Interactive graph visualization
- [OGL](https://github.com/oframe/ogl) — WebGL star background

---

## License

MIT

---

<div align="center">
Built for the <a href="https://h01.devpost.com">H0: Hack the Zero Stack</a> hackathon · Vercel v0 + AWS DynamoDB
</div>