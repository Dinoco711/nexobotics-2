class ChatbotWidget {
    constructor(serverUrl = 'https://pdf-rag-1-production.up.railway.app/chat') {
        this.serverUrl = serverUrl;
        this.isOpen = false;
        this.messages = [];
        this.isLoading = false;
        this.hasGreeted = false; // Add this line
        
        // Updated colors with better contrast
        this.colors = {
            primary: '#6B46C1',
            secondary: '#553C9A',
            light: '#E9D8FD',
            background: '#FAF5FF',
            text: '#2D3748',
            muted: '#A0AEC0'
        };

        this.loadMarkedJS();
        this.init();
    }

    loadMarkedJS() {
        if (!document.querySelector('script[src*="marked.min.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            script.onload = () => {
                // Configure marked options
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    headerIds: false,
                    mangle: false,
                    sanitize: true
                });
            };
            document.head.appendChild(script);
        }
    }

    init() {
        this.createStyles();
        this.createElements();
        this.attachEventListeners();
        document.body.appendChild(this.container);
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chatbot-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .chatbot-bubble {
                width: 60px;
                height: 60px;
                background: ${this.colors.primary};
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                box-shadow: 0 4px 12px rgba(107, 70, 193, 0.3);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .chatbot-bubble:hover {
                transform: scale(1.1);
                background: ${this.colors.secondary};
                box-shadow: 0 6px 16px rgba(107, 70, 193, 0.4);
            }

            .chatbot-window {
                position: absolute;
                bottom: 84px; /* Above the bubble */
                right: 0;
                width: 360px;
                height: 520px;
                background: ${this.colors.background};
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid ${this.colors.light};
            }
            .chatbot-window.open {
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            .chatbot-header {
                background: ${this.colors.primary};
                color: white;
                padding: 12px 16px;
                border-radius: 16px 16px 0 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .header-left {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .bot-avatar {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                object-fit: cover;
            }
            .online-indicator {
                width: 10px;
                height: 10px;
                background: #48BB78;
                border-radius: 50%;
                margin-left: 8px;
                box-shadow: 0 0 0 2px ${this.colors.primary};
            }

            .chatbot-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.8;
                transition: opacity 0.2s ease;
            }
            .chatbot-close:hover {
                opacity: 1;
            }

            .chatbot-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                scroll-behavior: smooth;
                background: linear-gradient(to bottom, ${this.colors.light} 0%, ${this.colors.background} 20%);
            }
            .message-bubble {
                max-width: 80%;
                padding: 10px 14px;
                margin: 8px 0;
                border-radius: 12px;
                font-size: 14px;
                line-height: 1.5;
                word-break: break-word;
                animation: slideIn 0.2s ease-out;
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .user-message {
                background: ${this.colors.secondary};
                color: white;
                margin-left: auto;
                box-shadow: 0 2px 6px rgba(85, 60, 154, 0.2);
            }
            .bot-message {
                background: white;
                color: ${this.colors.text};
                margin-right: auto;
                border: 1px solid ${this.colors.light};
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            }
            .typing-indicator {
                color: ${this.colors.muted};
                font-style: italic;
            }

            .chatbot-input {
                padding: 16px;
                border-top: 1px solid ${this.colors.light};
                background: ${this.colors.background};
                border-radius: 0 0 16px 16px;
                display: flex;
                gap: 12px;
            }
            .chatbot-input-field {
                flex: 1;
                padding: 10px 14px;
                border: none;
                border-radius: 8px;
                outline: none;
                resize: none;
                font-size: 14px;
                color: ${this.colors.text};
                background: none;
                transition: border-color 0.2s ease;
                max-height: 100px;
                overflow-y: auto;
            }
            .chatbot-input-field:focus {
                border-color: ${this.colors.primary};
                box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
            }
            .chatbot-send-btn {
                background: ${this.colors.primary};
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
            }
            .chatbot-send-btn:hover {
                background: ${this.colors.secondary};
                transform: translateY(-1px);
            }
            .chatbot-send-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .welcome-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 20px 0;
                animation: fadeIn 0.5s ease-out;
            }
            .welcome-avatar {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                margin-bottom: 16px;
                // border: 3px solid ${this.colors.primary};
                // box-shadow: 0 4px 12px rgba(8, 177, 255, 0.2);
                object-fit: cover;
                filter: drop-shadow(0 0 0.75rem #4259EF)
            }
            .welcome-message {
                color: ${this.colors.text};
                font-size: 16px;
                font-weight: 500;
                text-align: center;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    createWelcomeMessage() {
        const welcomeContainer = document.createElement('div');
        welcomeContainer.className = 'welcome-container';

        const welcomeAvatar = document.createElement('img');
        welcomeAvatar.className = 'welcome-avatar';
        welcomeAvatar.src = './assets/n_short_logo.png';

        const welcomeText = document.createElement('div');
        welcomeText.className = 'welcome-message';
        welcomeText.textContent = 'How may I assist you?';

        welcomeContainer.append(welcomeAvatar, welcomeText);
        this.messagesContainer.appendChild(welcomeContainer);
    }

    createElements() {
        this.container = document.createElement('div');
        this.container.className = 'chatbot-container';

        this.bubble = document.createElement('div');
        this.bubble.className = 'chatbot-bubble';
        this.bubble.innerHTML = `
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
        `;

        this.window = document.createElement('div');
        this.window.className = 'chatbot-window';

        this.header = document.createElement('div');
        this.header.className = 'chatbot-header';
        
        const headerLeft = document.createElement('div');
        headerLeft.className = 'header-left';
        
        const botAvatar = document.createElement('img');
        botAvatar.className = 'bot-avatar';
        botAvatar.src = './assets/n_black_logo.png'; // You can replace this with your bot image URL
        
        this.title = document.createElement('span');
        this.title.textContent = 'Nexobot';
        
        const onlineIndicator = document.createElement('div');
        onlineIndicator.className = 'online-indicator';
        
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'chatbot-close';
        this.closeButton.textContent = '×';

        headerLeft.append(botAvatar, this.title, onlineIndicator);
        this.header.append(headerLeft, this.closeButton);

        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'chatbot-messages';

        this.inputContainer = document.createElement('div');
        this.inputContainer.className = 'chatbot-input';

        this.input = document.createElement('textarea');
        this.input.className = 'chatbot-input-field';
        this.input.placeholder = 'Type a message...';
        this.input.rows = 1;

        this.sendButton = document.createElement('button');
        this.sendButton.className = 'chatbot-send-btn';
        this.sendButton.textContent = 'Send';

        this.header.append(headerLeft, this.closeButton);
        this.inputContainer.append(this.input, this.sendButton);
        this.window.append(this.header, this.messagesContainer, this.inputContainer);
        this.container.append(this.bubble, this.window);
        this.createWelcomeMessage();
    }

    attachEventListeners() {
        this.bubble.addEventListener('click', () => this.toggleChat());
        this.closeButton.addEventListener('click', () => this.toggleChat());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = `${Math.min(this.input.scrollHeight, 100)}px`;
        });
    }

    async sendInitialGreeting() {
        if (this.hasGreeted) return;
        
        this.hasGreeted = true;
        await this.sendMessage('/start', true);
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('open', this.isOpen);
        this.bubble.style.opacity = this.isOpen ? '0' : '1';
        if (this.isOpen) {
            this.input.focus();
            this.scrollToBottom();
            this.sendInitialGreeting(); // Add this line
        }
    }

    addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${isUser ? 'user-message' : 'bot-message'}`;
        
        if (!isUser && content === 'Typing...') {
            messageDiv.classList.add('typing-indicator');
            messageDiv.textContent = content;
        } else if (!isUser) {
            // For bot messages, parse markdown
            try {
                // Sanitize and parse markdown
                const sanitizedContent = this.sanitizeMarkdown(content);
                messageDiv.innerHTML = marked.parse(sanitizedContent);
                
                // Add styles for markdown elements
                this.addMarkdownStyles();
            } catch (error) {
                messageDiv.textContent = content;
            }
        } else {
            // User messages remain as plain text
            messageDiv.textContent = content;
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.messages.push({ content, isUser });
        this.scrollToBottom();
    }

    sanitizeMarkdown(content) {
        // Basic sanitization of markdown content
        return content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<[^>]*>/g, ''); // Remove HTML tags
    }

    addMarkdownStyles() {
        if (!document.getElementById('markdown-styles')) {
            const style = document.createElement('style');
            style.id = 'markdown-styles';
            style.textContent = `
                .bot-message {
                    overflow-x: auto;
                }
                .bot-message code {
                    background: rgba(0,0,0,0.05);
                    padding: 2px 4px;
                    border-radius: 3px;
                    font-family: monospace;
                    font-size: 0.9em;
                }
                .bot-message pre {
                    background: rgba(0,0,0,0.05);
                    padding: 10px;
                    border-radius: 5px;
                    overflow-x: auto;
                }
                .bot-message pre code {
                    background: none;
                    padding: 0;
                }
                .bot-message a {
                    color: ${this.colors.primary};
                    text-decoration: none;
                }
                .bot-message a:hover {
                    text-decoration: underline;
                }
                .bot-message ul, .bot-message ol {
                    padding-left: 20px;
                    margin: 8px 0;
                }
                .bot-message p {
                    margin: 8px 0;
                }
                .bot-message table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 8px 0;
                }
                .bot-message th, .bot-message td {
                    border: 1px solid ${this.colors.light};
                    padding: 6px;
                    text-align: left;
                }
                .bot-message blockquote {
                    border-left: 3px solid ${this.colors.primary};
                    margin: 8px 0;
                    padding-left: 10px;
                    color: ${this.colors.muted};
                }
            `;
            document.head.appendChild(style);
        }
    }

    showLoading() {
        this.isLoading = true;
        this.sendButton.disabled = true;
        this.addMessage('Typing...', false);
    }

    hideLoading() {
        if (this.isLoading) {
            const lastMessage = this.messagesContainer.lastChild;
            if (lastMessage && lastMessage.textContent === 'Typing...') {
                this.messagesContainer.removeChild(lastMessage);
                this.messages.pop();
            }
            this.isLoading = false;
            this.sendButton.disabled = false;
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async sendMessage(message = null, isInitial = false) {
        const messageText = message || this.input.value.trim();
        if ((!messageText || this.isLoading) && !isInitial) return;

        if (!isInitial) {
            this.input.value = '';
            this.input.style.height = 'auto';
        }
        
        if (!isInitial) {
            this.addMessage(messageText, true);
        }
        
        this.showLoading();

        try {
            const response = await fetch(this.serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.response) {
                throw new Error('Invalid response format');
            }

            this.hideLoading();
            this.addMessage(data.response, false);

        } catch (error) {
            this.hideLoading();
            let errorMessage = 'Sorry, something went wrong. Please try again.';
            if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.message.includes('Server error')) {
                errorMessage = 'Server unavailable. Please try again later.';
            }
            this.addMessage(errorMessage, false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new ChatbotWidget();
});
