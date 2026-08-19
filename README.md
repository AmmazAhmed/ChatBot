# Inquisitors Society Portal & Chatbot

An intelligent, AI-powered student portal and chatbot designed to assist students, teachers, mentors, and partners with information about the **Inquisitors Society** platform at UET Lahore.

The chatbot answers questions about **courses, events, internships, and career development** using a hybrid approach: a local knowledge base combined with a locally hosted LLM via **Ollama**.

---

## Key Features

- **Double-Mode Premium UI** – Sleek, fully responsive design with dynamic **Dark Mode** and **Light Mode** options.
- **Interactive Detail Modals** – Click on any portal pillar (Courses, Internships, Events, Career) to view lists of current opportunities in a glassmorphic overlay.
- **One-Command Auto Start** – The backend server automatically hosts the static frontend files, starts your local Ollama model in the background, and opens your default web browser to the portal page.
- **Hybrid AI Engine** – Instantly answers common questions via a fast local FAQ knowledge base, falling back to local Ollama AI for complex queries.
- **Direct Social Shortcuts** – Brand-themed direct access buttons for the society's **LinkedIn**, **Facebook**, and **Instagram** handles.

---
## Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| AI Engine | OpenAI API [ollama] |
| Data Storage | In-memory Map + JSON files |
| Development Tools | Nodemon, dotenv, CORS |

---

## Setup and Running

### 1. Clone the Repository

```bash
git clone https://github.com/AmmazAhmed/ChatBot
```

### 2. Download and Run Ollama
If you don't have Ollama installed, download it from [ollama.com](https://ollama.com). 

Before launching the app, run the following commands in your Command Prompt/terminal to pull the ultra-lightweight AI model:
```bash
ollama pull qwen2.5:0.5b
```

## 3.Environment Setup

Before running the backend:

1. Go to the `backend` folder.
2. Create a `.env` file.
3. Copy the variables from `.env.example`.
4. Add your own OpenAI API key.


### 4. Startup Command
```bash
cd backend
npm install
npm start
```

### What happens when you run `npm start`?
- The backend server boots up on port `5000`.
- The system automatically triggers `ollama run qwen2.5:0.5b` in the background (no need to open a separate terminal!).
- Your default web browser will **automatically open** to the student portal at `http://localhost:5000/`.

---

## How the Chatbot Works

The chatbot follows a **hybrid response system**:

```text
User asks a question
        ↓
Chatbot receives the question
        ↓
Search local FAQ / Knowledge Base
        ↓
   ┌───────────────┐
   │ Answer found? │
   └───────┬───────┘
       Yes │ No
           ↓
   Local Answer       OpenAI (ollama)
           │                │
           └───────┬────────┘
                   ↓
             Send Response
                   ↓
       Suggest Related Questions
```

This approach allows the chatbot to provide fast answers to common questions while using AI for questions that require deeper understanding.
