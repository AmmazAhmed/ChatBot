// DOM Elements
const chatWindow = document.getElementById('chatWindow');
const chatBody = document.getElementById('chatBody');
const userInput = document.getElementById('userInput');
const typingIndicator = document.getElementById('typingIndicator');
const notifBadge = document.getElementById('notifBadge');

// Knowledge Base Responses
const botKnowledge = {
    courses: "📚 **Courses & Certificates**\nWe offer specialized tracks in Full-Stack Web Development, AI/ML Essentials, and Cloud Computing. You can earn verified certificates upon completing track projects!",
    internships: "💼 **Internship Portal**\nWe partner with top technology firms! Applications for the upcoming Summer Engineering Track open soon. Keep your resume ready!",
    events: "🎯 **Events & Workshops**\nOur next virtual Tech Talk on *Modern Web Architecture* is happening this Saturday at 5:00 PM. Registration is open to all members!",
    certificates: "🏆 **Certificates Verification**\nYou can download or verify your issued certificates directly through your Inquisitors Student Dashboard using your unique Student ID.",
    profile: "✏️ **Account & Profile**\nTo update your email, bio, or privacy settings, navigate to your Student Portal profile settings tab.",
    default: "🤖 I'm here to assist with courses, internships, events, and certificates! Select one of the quick topics or ask a specific question."
};

// Initialize Chat
document.addEventListener('DOMContentLoaded', () => {
    sendBotInitialGreeting();
});

// Markdown Parser Helper
function parseMarkdown(text) {
    let formatted = text;
    // Bold parsing (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic parsing (*text*)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Bullet points parsing (- or •)
    formatted = formatted.replace(/(?:^|\n)[•\-]\s?(.*?)(?=\n|$)/g, '<li>$1</li>');
    if (formatted.includes('<li>')) {
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

// Toggle Chat Visibility
function toggleChat() {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
        if (notifBadge) notifBadge.style.display = 'none';
        userInput.focus();
    }
}

function openChat() {
    chatWindow.classList.remove('hidden');
    if (notifBadge) notifBadge.style.display = 'none';
    userInput.focus();
}

// Get Time String
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Send Initial Welcome Message
function sendBotInitialGreeting() {
    const welcomeText = "🤖 Hello! I'm the **Inquisitors Assistant**.\n\nHow can I help you today?";
    appendMessage(welcomeText, 'bot');

    // Add Interactive Quick Action Buttons
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quick-options';
    optionsDiv.innerHTML = `
        <button class="quick-opt-btn" onclick="handleQuickSelect('Courses')">📚 Courses & Certificates</button>
        <button class="quick-opt-btn" onclick="handleQuickSelect('Internships')">💼 Internships</button>
        <button class="quick-opt-btn" onclick="handleQuickSelect('Events')">🎯 Events & Workshops</button>
        <button class="quick-opt-btn" onclick="handleQuickSelect('Profile')">✏️ Profile & Settings</button>
    `;
    chatBody.appendChild(optionsDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Append Message Bubble
function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'user' ? 'user-msg' : 'bot-msg');
    
    const parsedText = parseMarkdown(text);
    const timeSpan = `<span class="msg-time">${getCurrentTime()}</span>`;
    
    msgDiv.innerHTML = parsedText + timeSpan;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Handle User Input
function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    userInput.value = '';

    showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();
        processBotReply(text);
    }, 800);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Quick Select Handler
function handleQuickSelect(category) {
    openChat();
    appendMessage(category, 'user');
    showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();
        const key = category.toLowerCase();
        const response = botKnowledge[key] || botKnowledge.default;
        appendMessage(response, 'bot');
    }, 600);
}

// Process Bot Logic
function processBotReply(query) {
    const lower = query.toLowerCase();
    let reply = botKnowledge.default;

    if (lower.includes('course') || lower.includes('class') || lower.includes('learn')) {
        reply = botKnowledge.courses;
    } else if (lower.includes('intern') || lower.includes('job') || lower.includes('work')) {
        reply = botKnowledge.internships;
    } else if (lower.includes('event') || lower.includes('workshop') || lower.includes('meetup')) {
        reply = botKnowledge.events;
    } else if (lower.includes('certif') || lower.includes('verify')) {
        reply = botKnowledge.certificates;
    } else if (lower.includes('profile') || lower.includes('account') || lower.includes('setting')) {
        reply = botKnowledge.profile;
    } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        reply = "👋 Hello there! What topic would you like assistance with today?";
    }

    appendMessage(reply, 'bot');
}

// Indicator Logic
function showTypingIndicator() {
    typingIndicator.classList.remove('hidden');
    chatBody.scrollTop = chatBody.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.classList.add('hidden');
}

// Clear Chat Function
function clearChat() {
    chatBody.innerHTML = '';
    sendBotInitialGreeting();
}