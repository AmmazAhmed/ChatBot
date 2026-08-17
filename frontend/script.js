document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const clearChat = document.getElementById('clearChat');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatBody = document.getElementById('chatBody');

    // Generate a session ID for this chat
    const sessionId =
        localStorage.getItem('inquisitorSessionId') ||
        crypto.randomUUID();

    localStorage.setItem('inquisitorSessionId', sessionId);

    // 1. Toggle Chat Open/Close
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.remove('hidden');
        chatToggle.style.display = 'none';
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        chatToggle.style.display = 'flex';
    });

    // 2. Clear Chat
    clearChat.addEventListener('click', async () => {
        chatBody.innerHTML = '';

        // Clear backend conversation history
        try {
            await fetch(
                `http://localhost:5000/api/chat/history/${sessionId}`,
                {
                    method: 'DELETE'
                }
            );
        } catch (error) {
            console.error('Could not clear server history:', error);
        }

        showInitialMessage();
    });

    // 3. Send Button
    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();

        if (text) {
            sendMessage(text);
        }
    });

    // 4. Enter Key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const text = userInput.value.trim();

            if (text) {
                sendMessage(text);
            }
        }
    });

    // 5. Quick Message Buttons
    window.sendQuickMessage = function (text) {
        sendMessage(text);
    };

    // 6. Initial Chat Message
    function showInitialMessage() {
        const initialMsg = document.createElement('div');

        initialMsg.className = 'message bot-msg';

        initialMsg.innerHTML = `
            👋 Hello! I'm the Inquisitors Society Assistant.<br><br>

            I can help you with:<br><br>

            <button class="quick-btn"
                onclick="sendQuickMessage('Courses & Certificates')">
                📚 Courses & Certificates
            </button><br>

            <button class="quick-btn"
                onclick="sendQuickMessage('Internships')">
                🎯 Internships
            </button><br>

            <button class="quick-btn"
                onclick="sendQuickMessage('Events & Workshops')">
                🏛️ Events & Workshops
            </button><br>

            <button class="quick-btn"
                onclick="sendQuickMessage('Career Development')">
                💼 Career Development
            </button><br>

            <button class="quick-btn"
                onclick="sendQuickMessage('Community Forums')">
                👥 Community Forums
            </button><br>

            <button class="quick-btn"
                onclick="sendQuickMessage('Account & Registration')">
                🔒 Account & Registration
            </button><br><br>

            What would you like to know?
        `;

        chatBody.appendChild(initialMsg);
    }

    // 7. Send Message to Backend
    async function sendMessage(text) {
        // Show user message
        appendMessage(text, 'user-msg');

        // Clear input
        userInput.value = '';

        // Disable input while waiting
        userInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = '...';

        try {
            const response = await fetch(
                'http://localhost:5000/api/chat',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        message: text,
                        sessionId: sessionId,
                        userId: 'guest'
                    })
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Server error: ${response.status}`
                );
            }

            const data = await response.json();

            console.log('Backend response:', data);

            // Display chatbot response
            const botReply =
                data.response ||
                'Sorry, I could not generate a response.';

            appendMessage(botReply, 'bot-msg');

            // Display follow-up questions if available
            if (
                Array.isArray(data.followup) &&
                data.followup.length > 0
            ) {
                appendFollowupButtons(data.followup);
            }

        } catch (error) {
            console.error('Chat error:', error);

            appendMessage(
                '⚠️ Sorry, I couldn\'t connect to the chatbot server. Please make sure the backend is running on port 5000.',
                'bot-msg'
            );
        } finally {
            // Re-enable input
            userInput.disabled = false;
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';

            userInput.focus();
        }
    }

    // 8. Display Message
    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');

        msgDiv.className = `message ${className}`;

        msgDiv.innerHTML = escapeHTML(text)
            .replace(/\n/g, '<br>');

        chatBody.appendChild(msgDiv);

        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // 9. Display Follow-up Buttons
    function appendFollowupButtons(followups) {
        const container = document.createElement('div');

        container.className = 'message bot-msg';

        const title = document.createElement('div');

        title.textContent = 'You can also ask:';

        container.appendChild(title);

        followups.forEach((question) => {
            const button = document.createElement('button');

            button.className = 'quick-btn';

            button.textContent = question;

            button.addEventListener('click', () => {
                sendMessage(question);
            });

            container.appendChild(button);
        });

        chatBody.appendChild(container);

        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // 10. Prevent HTML injection
    function escapeHTML(text) {
        const div = document.createElement('div');

        div.textContent = text;

        return div.innerHTML;
    }

    // Show initial message when page loads
    showInitialMessage();
});