// Chatbot Widget Implementation
class ChatbotWidget {
    constructor(serverUrl = 'https://nexobotics-2-chatbot.onrender.com/chat') {
        this.serverUrl = serverUrl;
        this.initialize();
    }

    initialize() {
        this.createStyles();
        this.createWidget();
        this.attachEventListeners();
        // Add initial greeting
        setTimeout(() => {
            this.addMessage('Hello! How can I assist you today?', 'bot');
        }, 500);
    }

    createStyles() {
        const styles = `
            .chatbot-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                font-family: Arial, sans-serif;
            }

            .chatbot-bubble {
                width: 60px;
                height: 60px;
                background-color: #6B46C1;
                border-radius: 50%;
                box-shadow: 0 2px 10px rgba(107, 70, 193, 0.3);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .chatbot-bubble:hover {
                transform: scale(1.1);
                background-color: #553C9A;
            }

            .chatbot-bubble i {
                color: white;
                font-size: 24px;
            }

            .chatbot-container {
                position: fixed;
                bottom: 90px;
                right: 3vw;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(107, 70, 193, 0.2);
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: slideIn 0.3s ease;
            }


            @keyframes slideIn {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .chatbot-header {
                background: #6B46C1;
                color: white;
                padding: 15px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chatbot-close {
                cursor: pointer;
                font-size: 20px;
                transition: color 0.3s ease;
            }

            .chatbot-close:hover {
                color: #E9D8FD;
            }

            .chatbot-messages {
                flex: 1;
                 padding: 15px;
                 overflow-y: auto;
                 overflow-x: hidden;  /* Ensures horizontal scrolling doesn’t break layout */
                 background: #FAF5FF;
                 max-height: 400px;  /* Adjust if needed */
            }

            .message {
                margin: 8px 0;
                padding: 12px;
                border-radius: 15px;
                max-width: 80%;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.4;
                overflow-wrap: break-word;
            }

            .message ul {
                padding-left: 20px;  /* Ensures bullet points are inside the container */
                margin: 0;
            }

            .message ol {
                padding-left: 20px;  /* Ensures bullet points are inside the container */
                margin: 0;
            }

            .message li {
                word-wrap: break-word;  /* Prevents text from overflowing */
                overflow-wrap: break-word;
            }

            .user-message {
                background: #6B46C1;
                color: white;
                margin-left: auto;
                box-shadow: 0 2px 5px rgba(107, 70, 193, 0.1);
            }

            .bot-message {
                background: white;
                margin-right: auto;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                border: 1px solid #E9D8FD;
            }

            .chatbot-input {
                display: flex;
                padding: 15px;
                border-top: 1px solid #E9D8FD;
                background: white;
            }

            .chatbot-input input {
                flex: 1;
                padding: 12px;
                border: 1px solid #E9D8FD;
                border-radius: 25px;
                margin-right: 10px;
                outline: none;
                transition: border-color 0.3s ease;
            }

            .chatbot-input input:focus {
                border-color: #6B46C1;
            }

            .chatbot-input button {
                background: #6B46C1;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
            }

            .chatbot-input button:hover {
                background: #553C9A;
                transform: translateY(-1px);
            }

            .error-message {
                color: #E53E3E;
                font-size: 12px;
                margin-top: 5px;
                text-align: center;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createWidget() {
        // Create main widget container
        const widget = document.createElement('div');
        widget.className = 'chatbot-widget';

        // Create chat bubble
        const bubble = document.createElement('div');
        bubble.className = 'chatbot-bubble';
        bubble.innerHTML = '<i>💬</i>';

        // Create chat container
        const container = document.createElement('div');
        container.className = 'chatbot-container';
        container.innerHTML = `
            <div class="chatbot-header">
                <span>Chat with AI Assistant</span>
                <span class="chatbot-close">×</span>
            </div>
            <div class="chatbot-messages"></div>
            <div class="chatbot-input">
                <input type="text" placeholder="Type your message...">
                <button>Send</button>
            </div>
        `;

        widget.appendChild(bubble);
        widget.appendChild(container);
        document.body.appendChild(widget);

        this.elements = {
            container,
            bubble,
            messages: container.querySelector('.chatbot-messages'),
            input: container.querySelector('input'),
            sendButton: container.querySelector('button'),
            closeButton: container.querySelector('.chatbot-close')
        };
    }

    attachEventListeners() {
        // Toggle chat container
        this.elements.bubble.addEventListener('click', () => {
            this.elements.container.style.display = 'flex';
            this.elements.bubble.style.display = 'none';
        });

        // Close chat container
        this.elements.closeButton.addEventListener('click', () => {
            this.elements.container.style.display = 'none';
            this.elements.bubble.style.display = 'flex';
        });

        // Send message
        const sendMessage = async () => {
            const message = this.elements.input.value.trim();
            if (!message) return;

            // Add user message to chat
            this.addMessage(message, 'user');
            this.elements.input.value = '';
            
            try {
                // Show loading message
                const loadingId = Date.now();
                this.addMessage('Typing...', 'bot', false, loadingId);
                
                const response = await this.sendToServer(message);
                
                // Remove loading message and add response
                const loadingMsg = document.getElementById(`msg-${loadingId}`);
                if (loadingMsg) loadingMsg.remove();
                
                this.addMessage(response, 'bot');
            } catch (error) {
                console.error('Chat error:', error);
                this.addMessage(error.message || 'Sorry, I encountered an error. Please try again.', 'bot', true);
            }
        };

        // Send button click
        this.elements.sendButton.addEventListener('click', sendMessage);

        // Enter key press
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    addMessage(text, sender, isError = false, messageId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message ${isError ? 'error-message' : ''}`;
        if (messageId) {
            messageDiv.id = `msg-${messageId}`;
        }
    
        // ✅ Use Marked.js only for bot messages to parse Markdown into HTML
        if (sender === 'bot') {
            messageDiv.innerHTML = marked.parse(text);
        } else {
            messageDiv.textContent = text; // Keep user messages plain
        }
    
        this.elements.messages.appendChild(messageDiv);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
    

    async sendToServer(message) {
        try {
            const response = await fetch(this.serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message
                }),
                mode: 'cors',
                credentials: 'omit'
            });

            if (!response.ok) {
                console.error('Server error:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error details:', errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Server response:', data);

            if (!data || typeof data.response === 'undefined') {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format from server');
            }

            return data.response;
        } catch (error) {
            console.error('Detailed error:', error);
            
            if (!navigator.onLine) {
                throw new Error('Please check your internet connection.');
            }
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to the chatbot server. Please check if the server is running.');
            }
            
            throw new Error(`${error.message}. Please try again.`);
        }
    }

    updateServerUrl(newUrl) {
        this.serverUrl = newUrl;
    }
}

// Initialize the chatbot widget when the script loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotWidget = new ChatbotWidget();
});
