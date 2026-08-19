document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const clearChat = document.getElementById('clearChat');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');
    
    // Landing page actions
    const startExploringBtn = document.getElementById('startExploringBtn');
    const activateChatBtn = document.getElementById('activateChatBtn');
    const tracksSection = document.getElementById('tracksSection');

    // Theme Toggle Elements
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    // Modal Elements
    const detailsModal = document.getElementById('detailsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    // Generate/retrieve sessionId for session persistence
    const sessionId =
        localStorage.getItem('inquisitorSessionId') ||
        crypto.randomUUID();

    localStorage.setItem('inquisitorSessionId', sessionId);

    // ==========================================
    // Light/Dark Theme Controller (Default: Light)
    // ==========================================
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (isDark) {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    });

    // ==========================================
    // Interactive Pillar Details Modals Data
    // ==========================================
    const pillarData = {
        courses: {
            title: "📚 Courses & Certificates",
            items: [
                { name: "Web Development Bootcamp", desc: "Full-stack HTML, CSS, JavaScript, Node.js & React course. Includes certified project build." },
                { name: "Python for AI & Data Science", desc: "Learn logic, pandas, numpy, and machine learning fundamentals using Python." },
                { name: "IELTS Preparation Masterclass", desc: "Intensive 4-week workshop covering all 4 modules (Listening, Reading, Writing, Speaking)." },
                { name: "CSS/PMS General Preparation", desc: "Weekly orientation and discussions for CSS and competitive examinations." }
            ]
        },
        internships: {
            title: "🎯 Active Internship Openings",
            items: [
                { name: "Frontend Developer Intern", desc: "Company: CodeCrafters | Duration: 3 months | Stack: React, Tailwind CSS | Paid stipend." },
                { name: "AI & ML Development Intern", desc: "Company: BrainWave AI | Duration: 6 months | Stack: Python, Ollama, PyTorch." },
                { name: "UI/UX Product Designer", desc: "Company: Innovate Studio | Duration: 4 months | Focus: Figma wireframes, prototype design." },
                { name: "Technical Project Lead (Society)", desc: "Internal Role | Inquisitors Society platform maintenance, student mentor facilitation." }
            ]
        },
        events: {
            title: "🏛️ Upcoming Events & Workshops",
            items: [
                { name: "Weekly Mock Interview Session", desc: "Date: Friday, 4:00 PM | Venue: UET Seminar Hall. Real-time feedback from alumni mentors." },
                { name: "UET Annual Hackathon 2026", desc: "Registration open. 48-hour prototype challenge with industry cash prizes." },
                { name: "CSS Crackers Bootcamp", desc: "Free CSS essay writing evaluation session hosted by current senior officers." }
            ]
        },
        career: {
            title: "💼 Career Development Tools",
            items: [
                { name: "Interactive CV/Resume Builder", desc: "Generate professional ATS-friendly PDFs with AI content suggestions." },
                { name: "Student Showcase Portfolio", desc: "Create a beautiful personal website to showcase academic projects and certifications." },
                { name: "Mentor Matchmaking Program", desc: "Connect directly with UET Alumni working in top multinational tech firms." }
            ]
        }
    };

    function openPillarModal(category) {
        const data = pillarData[category];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalBody.innerHTML = '';

        data.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'modal-list-item';
            div.innerHTML = `
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
            `;
            modalBody.appendChild(div);
        });

        detailsModal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => {
        detailsModal.classList.add('hidden');
    });

    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.classList.add('hidden');
        }
    });

    // Wire up landing card clicks
    const cards = document.querySelectorAll('.track-card');
    if (cards.length >= 4) {
        cards[0].querySelector('.card-btn').setAttribute('onclick', '');
        cards[0].querySelector('.card-btn').addEventListener('click', () => openPillarModal('courses'));

        cards[1].querySelector('.card-btn').setAttribute('onclick', '');
        cards[1].querySelector('.card-btn').addEventListener('click', () => openPillarModal('internships'));

        cards[2].querySelector('.card-btn').setAttribute('onclick', '');
        cards[2].querySelector('.card-btn').addEventListener('click', () => openPillarModal('events'));

        cards[3].querySelector('.card-btn').setAttribute('onclick', '');
        cards[3].querySelector('.card-btn').addEventListener('click', () => openPillarModal('career'));
    }

    // Landing Button Handlers
    if (startExploringBtn && tracksSection) {
        startExploringBtn.addEventListener('click', () => {
            tracksSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (activateChatBtn) {
        activateChatBtn.addEventListener('click', () => {
            chatWindow.classList.remove('hidden');
            chatToggle.style.opacity = '0';
            chatToggle.style.pointerEvents = 'none';
            userInput.focus();
        });
    }

    // ==========================================
    // Chat Event Handlers
    // ==========================================
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.remove('hidden');
        chatToggle.style.opacity = '0';
        chatToggle.style.pointerEvents = 'none';
        userInput.focus();
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        chatToggle.style.opacity = '1';
        chatToggle.style.pointerEvents = 'auto';
    });

    clearChat.addEventListener('click', async () => {
        chatBody.innerHTML = '';

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

    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text) {
            sendMessage(text);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const text = userInput.value.trim();
            if (text) {
                sendMessage(text);
            }
        }
    });

    window.sendQuickMessage = function (text) {
        if (chatWindow.classList.contains('hidden')) {
            chatWindow.classList.remove('hidden');
            chatToggle.style.opacity = '0';
            chatToggle.style.pointerEvents = 'none';
        }
        sendMessage(text);
    };

    function showInitialMessage() {
        const initialMsg = document.createElement('div');
        initialMsg.className = 'message bot-msg';
        initialMsg.innerHTML = `
            👋 Hello! I'm the Inquisitors Society Assistant.<br><br>
            I can help you with:<br>
            <button class="quick-btn" onclick="sendQuickMessage('Courses & Certificates')">📚 Courses & Certificates</button>
            <button class="quick-btn" onclick="sendQuickMessage('Internships')">🎯 Internships</button>
            <button class="quick-btn" onclick="sendQuickMessage('Events & Workshops')">🏛️ Events & Workshops</button>
            <button class="quick-btn" onclick="sendQuickMessage('Career Development')">💼 Career Development</button>
            <button class="quick-btn" onclick="sendQuickMessage('Community Forums')">👥 Community Forums</button>
            <button class="quick-btn" onclick="sendQuickMessage('Account & Registration')">🔒 Account & Registration</button><br>
            What would you like to know?
        `;
        chatBody.appendChild(initialMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    async function sendMessage(text) {
        appendMessage(text, 'user-msg');
        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;
        
        if (typingIndicator) {
            chatBody.appendChild(typingIndicator);
            typingIndicator.classList.remove('hidden');
            chatBody.scrollTop = chatBody.scrollHeight;
        }

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
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (typingIndicator) {
                typingIndicator.classList.add('hidden');
            }

            const botReply = data.response || 'Sorry, I could not generate a response.';
            appendMessage(botReply, 'bot-msg');

            if (Array.isArray(data.followup) && data.followup.length > 0) {
                appendFollowupButtons(data.followup);
            }

        } catch (error) {
            console.error('Chat error:', error);
            if (typingIndicator) {
                typingIndicator.classList.add('hidden');
            }

            appendMessage(
                '⚠️ Sorry, I couldn\'t connect to the chatbot server. Please make sure the backend is running on port 5000.',
                'bot-msg'
            );
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        
        let formattedText = escapeHTML(text)
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
        msgDiv.innerHTML = formattedText;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function appendFollowupButtons(followups) {
        const container = document.createElement('div');
        container.className = 'message bot-msg';
        container.innerHTML = '<div>You can also ask:</div>';

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

    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showInitialMessage();
});