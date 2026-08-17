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
// OpenAI Configuration
// ===============================

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


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

Use the provided knowledge base to answer questions.

If the answer is not available in the knowledge base,
do not invent information.

Knowledge Base:

${faqContext}

Rules:

1. Be helpful and friendly.
2. Give accurate information.
3. Keep answers concise and clear.
4. Do not invent information.
5. Stay within Inquisitors Society topics.
6. If the question is outside the platform scope,
   politely tell the user.
7. Suggest follow-up questions when useful.

Additional context:

${context}
`;


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
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Knowledge base loaded: ${knowledgeBase.faqs.length} FAQs`
        );

    }
);