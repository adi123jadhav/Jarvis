document.addEventListener("DOMContentLoaded", function () {
    const sendButton = document.getElementById("send-btn");
    const userInput = document.getElementById("userInput");
    const chatContainer = document.getElementById("chat");
    const logoutButton = document.getElementById("logout-btn");
    const CHAT_API_ENDPOINT = "/chat";

    // JARVIS responses and functions
    const jarvisFunctions = {
        "hello": "Greetings, Commander. How may I assist you today?",
        "time": `The current time is ${new Date().toLocaleTimeString()}.`,
        "date": `Today's date is ${new Date().toLocaleDateString()}.`,
        "help": "I can assist with various tasks. Try asking about time, date, or just have a conversation.",
        "goodbye": "System signing off. Have a good day, Commander.",
        "jarvis": "At your service, Commander. What do you require?",
        "status": "All systems operational. Ready for your commands."
    };

    const jarvisResponses = [
        "I'm analyzing that now, Commander.",
        "Running diagnostics...",
        "Accessing Stark databases...",
        "That's an interesting query, Commander.",
        "Processing your request...",
        "I suggest we consider all options carefully.",
        "Scanning protocols...",
        "My systems indicate...",
        "According to my calculations...",
        "Let me check the parameters..."
    ];

    // Function to send message to the backend
    async function sendMessageToServer(message) {
        try {
            // Check for local commands first
            const localResponse = checkLocalCommands(message);
            if (localResponse) {
                appendMessage(localResponse, "bot");
                return;
            }

            const loadingId = showLoadingIndicator();
            const sessionId = getOrCreateSessionId();

            const response = await fetch(CHAT_API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    session_id: sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            removeLoadingIndicator(loadingId);
            appendMessage(data.response || getRandomJarvisResponse(), "bot");

        } catch (error) {
            console.error("Error sending message to server:", error);
            removeLoadingIndicator(loadingId);
            appendMessage("System error: Switching to local protocol. " + getRandomJarvisResponse(), "bot");
        }
    }

    // Check for local JARVIS commands
    function checkLocalCommands(message) {
        const lowerMsg = message.toLowerCase();
        for (const [cmd, response] of Object.entries(jarvisFunctions)) {
            if (lowerMsg.includes(cmd)) {
                return response;
            }
        }
        return null;
    }

    function getRandomJarvisResponse() {
        return jarvisResponses[Math.floor(Math.random() * jarvisResponses.length)];
    }

    function appendMessage(message, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
        messageDiv.textContent = message;
        
        chatContainer.appendChild(messageDiv);
        scrollToLatestMessage();
    }

    // Show typing/loading indicator
    function showLoadingIndicator() {
        const id = "typing-" + Date.now();
        const typingDiv = document.createElement("div");
        typingDiv.id = id;
        typingDiv.classList.add("message", "bot-message", "typing-indicator");
        typingDiv.textContent = "...";
        chatContainer.appendChild(typingDiv);
        scrollToLatestMessage();
        return id;
    }

    function removeLoadingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }

    // Session management
    function getOrCreateSessionId() {
        const SESSION_KEY = "jarvis_session_id";
        let sessionId = localStorage.getItem(SESSION_KEY);
        
        if (!sessionId) {
            sessionId = generateSessionId();
            localStorage.setItem(SESSION_KEY, sessionId);
        }
        
        return sessionId;
    }

    function generateSessionId() {
        return "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    }

    function scrollToLatestMessage() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Event handlers
    function handleSendMessage() {
        const message = userInput.value.trim();
        if (message) {
            appendMessage(message, "user");
            sendMessageToServer(message);
            userInput.value = "";
            userInput.focus();
        }
    }

    userInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    });

    sendButton.addEventListener("click", handleSendMessage);

    // Enhanced logout functionality
    logoutButton.addEventListener("click", function() {
        appendMessage("Initiating shutdown sequence. Goodbye, Commander.", "bot");
        
        // Add system shutdown effects
        const header = document.querySelector('.header');
        header.style.animation = "powerOff 1.5s forwards";
        
        setTimeout(() => {
            // Clear session data
            localStorage.removeItem("jarvis_session_id");
            // Redirect to login
            window.location.href = "/login";
        }, 1500);
    });

    // Initial setup
    userInput.focus();
    
    // Add power-off animation to CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes powerOff {
            0% { opacity: 1; }
            70% { opacity: 1; color: #ff0000; text-shadow: 0 0 10px #ff0000; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});