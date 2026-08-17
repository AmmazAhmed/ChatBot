# Inquisitors Society Chatbot

An intelligent, AI-powered chatbot designed to assist students, teachers, mentors, and companies with information about the **Inquisitors Society** platform.

The chatbot answers questions about **courses, events, internships, career development, and account management** using a hybrid approach: a local knowledge base combined with **OpenAI's GPT-3.5**.

---

## Features

- **Natural Language Interaction** – Ask questions in plain English.
- **Hybrid Response System** – First checks a curated FAQ knowledge base, then falls back to AI for deeper understanding.
- **Smart Follow-up Suggestions** – Automatically recommends related questions after each answer.
- **Session Persistence** – Maintains conversation history for each user session using a unique session ID.
- **Quick Reply Buttons** – Provides one-click access to common topics such as Courses, Internships, Events, and Career Development.
- **Responsive UI** – Clean and modern chat interface that works on desktop and mobile devices.
- **Health Check & Logging** – Includes an API health endpoint and chat logging for monitoring and debugging.

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| AI Engine | OpenAI API (GPT-3.5-turbo) |
| Data Storage | In-memory Map + JSON files |
| Development Tools | Nodemon, dotenv, CORS |

---


## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/AmmazAhmed/ChatBox

cd ChatBot
```

### 2. Backend Setup

Open a terminal inside the **backend** folder:

```bash
```
## 3.Environment Setup

Before running the backend:

1. Go to the `backend` folder.
2. Create a `.env` file.
3. Copy the variables from `.env.example`.
4. Add your own OpenAI API key.
5. Run `npm install`.
6. Run `npm start`.

Example:

OPENAI_API_KEY=your_openai_api_key_here

### 4. Start the Backend

Run:

```bash
npm start
```

If the project uses Nodemon, you can also run:

```bash
npm run dev
```

Make sure the backend server is running before using the chatbot.

---

## 5.Frontend Setup

### Using VS Code Live Server

1. Open the **frontend** folder in VS Code.
2. Open `index.html`.
3. Right-click on `index.html`.
4. Select **Open with Live Server**.
5. The chatbot interface will open in your default browser.

> **Important:** Make sure the backend server is already running before starting a chat.

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
   Local Answer       OpenAI GPT-3.5
           │                │
           └───────┬────────┘
                   ↓
             Send Response
                   ↓
       Suggest Related Questions
```

This approach allows the chatbot to provide fast answers to common questions while using AI for questions that require deeper understanding.

---

## Main Topics Supported

The chatbot can provide information related to:

- 📚 Courses
- 💼 Internships
- 🎯 Career Development
- 📅 Events
- 👨‍🏫 Mentors
- 👨‍🎓 Students
- 🏢 Companies
- 🔐 Account Management
- ❓ Frequently Asked Questions

---
