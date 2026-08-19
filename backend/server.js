require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();

const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================

app.use(cors());

app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));


// ===============================
// Load Knowledge Base
// ===============================

const knowledgeBasePath = path.join(
    __dirname,
    '../knowledge-base/knowledge.json'
);

const knowledgeBase = JSON.parse(
    fs.readFileSync(knowledgeBasePath, 'utf8')
);


// ===============================
// AI Engine Configuration
// ===============================

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'ollama';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b';

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && process.env.OPENAI_API_KEY !== 'your_actual_openai_api_key_here') {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}


// ===============================
// Conversation Storage
// ===============================

const conversations = new Map();


// ===============================
// Find Best FAQ Match
// ===============================

function findBestMatch(query) {

    const queryLower = query
        .toLowerCase()
        .trim();

    // Exact match
    for (const faq of knowledgeBase.faqs) {

        if (
            faq.question
                .toLowerCase()
                .trim() === queryLower
        ) {
            return faq;
        }
    }

    // Keyword matching
    let bestMatch = null;

    let highestScore = 0;

    for (const faq of knowledgeBase.faqs) {

        let score = 0;

        const keywords = faq.keywords || [];

        const questionWords =
            faq.question
                .toLowerCase()
                .split(' ');


        // Check keywords
        for (const keyword of keywords) {

            if (
                queryLower.includes(
                    keyword.toLowerCase()
                )
            ) {
                score += 2;
            }
        }


        // Check question words
        for (const word of queryLower.split(' ')) {

            if (
                word.length > 3 &&
                questionWords.includes(word)
            ) {
                score += 1;
            }
        }


        if (score > highestScore) {

            highestScore = score;

            bestMatch = faq;
        }
    }


    return (
        bestMatch &&
        highestScore >= 2
    )
        ? bestMatch
        : null;
}


// ===============================
// Generate AI Response
// ===============================

async function generateAIResponse(
    query,
    context = ''
) {

    try {

        // Knowledge base context
        const faqContext =
            knowledgeBase.faqs
                .slice(0, 10)
                .map(
                    (faq) =>
                        `Q: ${faq.question}\nA: ${faq.answer}`
                )
                .join('\n\n');


        const systemPrompt = `
You are the Inquisitors Society Assistant.

Your job is to help users with information about
the Inquisitors Society platform.

Here is the context from our FAQ Knowledge Base:
${faqContext}

Rules:
1. Be helpful, friendly, and conversational.
2. If the user greets you or asks if you are working, reply politely.
3. Use the knowledge base to answer questions about the Inquisitors Society.
4. If a question is about the Inquisitors Society but the exact answer is not in the knowledge base, use your intelligence to provide a helpful, reasonable answer.
5. If the question is completely unrelated to the Inquisitors Society, briefly answer it politely and guide the user back to platform topics.
6. Suggest follow-up questions when useful.

Additional context:
${context}
`;

        if (LLM_PROVIDER === 'ollama') {
            const cleanedHost = OLLAMA_HOST.replace(/\/$/, "");
            const targetUrl = `${cleanedHost}/api/chat`;
            console.log(`Calling Ollama model '${OLLAMA_MODEL}' at ${targetUrl}...`);
            
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: query
                        }
                    ],
                    stream: false
                })
            });

            if (!response.ok) {
                console.log(`Ollama API error response status: ${response.status}`);
                throw new Error(`Ollama responded with status: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.message && data.message.content) {
                return data.message.content;
            } else {
                throw new Error('Invalid response structure from Ollama');
            }
        } else {
            if (!openai) {
                throw new Error('OpenAI key is not configured.');
            }
            console.log('Calling OpenAI GPT-3.5-turbo...');
            const response =
                await openai.chat.completions.create({

                    model: 'gpt-3.5-turbo',

                    messages: [

                        {
                            role: 'system',
                            content: systemPrompt
                        },

                        {
                            role: 'user',
                            content: query
                        }

                    ],

                    temperature: 0.7,

                    max_tokens: 500
                });

            return response
                .choices[0]
                .message
                .content;
        }

    } catch (error) {

        console.error(
            'AI Error:',
            error.message
        );

        return null;
    }
}


// ===============================
// Main Chat API
// ===============================

app.post(
    '/api/chat',
    async (req, res) => {

        try {

            const {
                message,
                sessionId,
                userId
            } = req.body;


            // Validate message
            if (
                !message ||
                !message.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    error: 'Message is required'

                });
            }


            // Create session if necessary
            if (
                !conversations.has(sessionId)
            ) {

                conversations.set(
                    sessionId,
                    {
                        messages: [],
                        context: {}
                    }
                );
            }


            const session =
                conversations.get(sessionId);


            // Store user message
            session.messages.push({

                role: 'user',

                content: message

            });


            // ===============================
            // Step 1: Search Knowledge Base
            // ===============================

            const faqMatch =
                findBestMatch(message);


            let response = null;


            // ===============================
            // FAQ Response
            // ===============================

            if (faqMatch) {

                response = {

                    text: faqMatch.answer,

                    source: 'knowledge-base',

                    links:
                        faqMatch.links || [],

                    followup:
                        faqMatch.followup || []

                };

            }


            // ===============================
            // Greeting
            // ===============================

            else {

                const greetings = [
                    'hi',
                    'hello',
                    'hey',
                    'greetings'
                ];


                const isGreeting =
                    greetings.some(
                        greeting =>
                            message
                                .toLowerCase()
                                .includes(greeting)
                    );


                if (isGreeting) {

                    const greetingMessages =
                        knowledgeBase.greetings ||
                        [
                            'Hello! How can I help you today?',
                            'Hi there! What would you like to know?'
                        ];


                    response = {

                        text:
                            greetingMessages[
                                Math.floor(
                                    Math.random() *
                                    greetingMessages.length
                                )
                            ],

                        source: 'greeting',

                        links: [],

                        followup: [
                            'How do I enroll in a course?',
                            'Tell me about events',
                            'How do I apply for internships?'
                        ]

                    };

                }


                // ===============================
                // AI Response
                // ===============================

                else {

                    const aiResponse =
                        await generateAIResponse(
                            message
                        );


                    if (aiResponse) {

                        response = {

                            text: aiResponse,

                            source: 'ai',

                            links: [],

                            followup: [
                                'Tell me more',
                                'What else can you help with?'
                            ]

                        };

                    }


                    // ===============================
                    // Fallback
                    // ===============================

                    else {

                        const fallbacks =
                            knowledgeBase.fallbacks ||
                            [
                                "I don't have information about that yet. Please try rephrasing your question."
                            ];


                        response = {

                            text:
                                fallbacks[
                                    Math.floor(
                                        Math.random() *
                                        fallbacks.length
                                    )
                                ],

                            source: 'fallback',

                            links: [],

                            followup: [
                                'What courses are available?',
                                'Tell me about events',
                                'How do I get a certificate?'
                            ]

                        };

                    }

                }

            }


            // ===============================
            // Store Assistant Response
            // ===============================

            session.messages.push({

                role: 'assistant',

                content: response.text

            });


            // ===============================
            // Send Response
            // ===============================

            res.json({

                success: true,

                response: response.text,

                source:
                    response.source ||
                    'knowledge-base',

                links:
                    response.links || [],

                followup:
                    response.followup || [],

                sessionId: sessionId,

                userId: userId || 'guest'

            });


        } catch (error) {

            console.error(
                'Chat error:',
                error
            );


            res.status(500).json({

                success: false,

                error:
                    'Internal server error. Please try again.',

                response:
                    'I apologize, but I encountered an error. Please try again later.'

            });

        }

    }
);


// ===============================
// Get Conversation History
// ===============================

app.get(
    '/api/chat/history/:sessionId',
    (req, res) => {

        const {
            sessionId
        } = req.params;


        if (
            conversations.has(sessionId)
        ) {

            res.json({

                success: true,

                history:
                    conversations
                        .get(sessionId)
                        .messages

            });

        } else {

            res.json({

                success: true,

                history: []

            });

        }

    }
);


// ===============================
// Clear Conversation
// ===============================

app.delete(
    '/api/chat/history/:sessionId',
    (req, res) => {

        const {
            sessionId
        } = req.params;


        if (
            conversations.has(sessionId)
        ) {

            conversations.delete(
                sessionId
            );


            res.json({

                success: true,

                message:
                    'Conversation cleared'

            });

        } else {

            res.json({

                success: true,

                message:
                    'No conversation found'

            });

        }

    }
);


// ===============================
// Health Check
// ===============================

app.get(
    '/api/health',
    (req, res) => {

        res.json({

            status: 'healthy',

            timestamp:
                new Date().toISOString(),

            knowledgeBaseCount:
                knowledgeBase.faqs.length

        });

    }
);


// ===============================
// Start Server
// ===============================

app.listen(
    PORT,
    '0.0.0.0',
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Knowledge base loaded: ${knowledgeBase.faqs.length} FAQs`
        );

        // Check if model exists in Ollama and auto-pull if missing
        console.log(`Checking if Ollama model 'qwen2.5:0.5b' is installed...`);
        const { exec } = require('child_process');
        const http = require('http');
        
        const checkRequest = http.get('http://127.0.0.1:11434/api/tags', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    const models = result.models || [];
                    const hasModel = models.some(m => m.name.includes('qwen2.5:0.5b'));
                    
                    if (!hasModel) {
                        console.log("Model 'qwen2.5:0.5b' not found. Automatically pulling the model, this may take a moment...");
                        exec('ollama pull qwen2.5:0.5b', (pullErr) => {
                            if (pullErr) {
                                console.log('Failed to automatically pull model. Please run "ollama pull qwen2.5:0.5b" manually.');
                            } else {
                                console.log("Model 'qwen2.5:0.5b' pulled successfully! Launching...");
                                exec('ollama run qwen2.5:0.5b');
                            }
                        });
                    } else {
                        console.log("Model 'qwen2.5:0.5b' is already installed. Starting model in background...");
                        exec('ollama run qwen2.5:0.5b');
                    }
                } catch (err) {
                    console.log('Error parsing local Ollama tags. Starting model fallback...');
                    exec('ollama run qwen2.5:0.5b');
                }
            });
        });

        checkRequest.on('error', () => {
            console.log('Ollama is not currently running. Attempting to start Ollama with model qwen2.5:0.5b...');
            exec('start ollama run qwen2.5:0.5b', (err) => {
                if (err) {
                    console.log('Could not start Ollama. Please ensure Ollama is installed and running.');
                }
            });
        });

        // Auto-open browser
        const startUrl = `http://localhost:${PORT}`;
        const startCmd = process.platform === 'win32'
            ? `start ${startUrl}`
            : process.platform === 'darwin'
                ? `open ${startUrl}`
                : `xdg-open ${startUrl}`;

        setTimeout(() => {
            console.log(`Opening default browser to ${startUrl}...`);
            exec(startCmd);
        }, 1500);

    }
);