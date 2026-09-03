# TalentForge AI - Backend

This is the backend API for **TalentForge AI**, a modern B2B SaaS platform designed to streamline, automate, and centralize the recruitment lifecycle. It serves as a monolithic API gateway powering the candidate, recruiter, and admin portals.

## 🚀 Tech Stack

- **Framework**: [Express.js](https://expressjs.com/) & [Node.js](https://nodejs.org/) (v20+ LTS)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Caching & Queues**: [Redis](https://redis.io/) & [BullMQ](https://docs.bullmq.io/)
- **Search**: [Elasticsearch](https://www.elastic.co/)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) (Direct signed uploads & storage)
- **Payments**: [Razorpay](https://razorpay.com/)
- **Emails**: [Resend](https://resend.com/)

## 📦 Key Features

- **Authentication & RBAC**: JWT-based access and refresh tokens, Google OAuth 2.0, and strict Role-Based Access Control (Admin, Recruiter, Hiring Manager, Candidate).
- **ATS Pipeline Core**: Manages Kanban board states, job postings, and automated workflow triggers.
- **Resume Processing**: Handles file uploads via Cloudinary, parses PDFs/DOCXs using LLM AI services, and structures extracted text into JSON.
- **AI Matching Engine**: Compares candidate embeddings with job requirements using Cosine similarity.
- **Assessment Engine**: Integrates a sandboxed code compiler for technical tests and handles API endpoints for MCQ templates.
- **AI Proctoring & Interviews**: Processes video streams, verifies facial telemetry, and extracts speech-to-text via Whisper API.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL running locally or remotely
- Redis server
- API keys for Cloudinary, Razorpay, Resend, etc.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/Aaryank-47/TalentForgeAI_Backend.git
   cd TalentForgeAI/Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root of the `Backend` directory. You will need to configure variables for:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `REDIS_URL`
   - `JWT_SECRET` and `JWT_REFRESH_SECRET`
   - `CLOUDINARY_URL`, `RAZORPAY_KEY`, etc.

4. **Database Setup**:
   Generate the Prisma client and push the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *(Optional) Seed the database:*
   ```bash
   npm run seed
   ```

### Running the Application

- **Development Mode**:
  ```bash
  npm run dev
  ```
  This runs the server using `tsx watch` for hot-reloading.

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

- **Type Checking**:
  ```bash
  npm run typecheck
  ```

## 🧪 Testing

We use Jest for testing. To run the tests:

```bash
npm run test
```

For tests requiring a real database connection:
```bash
npm run test:save-answer:real
```

## 🏗️ Project Structure

- `src/` - Application source code.
  - `modules/` - Feature-based modules (e.g., auth, candidate, company, assessment).
  - `server.ts` - Main entry point.
- `prisma/` - Prisma schema and database seed scripts.

## 📄 License

ISC License
