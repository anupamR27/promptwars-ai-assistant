document.addEventListener('DOMContentLoaded', () => {
    // ---- HEADER TIME LOGIC ----
    const timeElement = document.getElementById('current-time');
    
    function updateTime() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    updateTime();
    setInterval(updateTime, 60000);

    // ---- CHATBOT LOGIC ----
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Simple mock intent matching
    const aiResponses = {
        'bathroom': 'The closest restrooms are located in the North Hall, just past the Main Stage, and the East Wing near the elevators.',
        'schedule': 'The keynote starts at 11:00 AM at the Main Stage. Next up is the Tech Panel in Expo Hall B at 1:00 PM.',
        'food': 'Food Court A is currently busy (15m wait), but Food Court B on the second floor only has a 5m wait. They have pizza, tacos, and vegan options.',
        'crowd': 'The Main Stage is currently at high capacity. I recommend visiting the Tech Expo Hall if you want to avoid the crowds.',
        'lost': 'Lost and Found is located at the Main Registration desk at the South Entrance.',
        'default': "I'm not exactly sure about that, but you can find more information at the Help Desk near the entrance."
    };

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        let avatarHTML = isUser 
            ? `<img src="https://ui-avatars.com/api/?name=User&background=00F2FE&color=fff&bold=true" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="User">` 
            : `<i class="fa-solid fa-sparkles"></i>`;
            
        let avatarClass = isUser ? 'user-avatar' : 'ai-avatar';
        
        msgDiv.innerHTML = `
            <div class="avatar ${avatarClass}">${avatarHTML}</div>
            <div class="bubble">${text}</div>
        `;
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = `message ai-message typing-indicator`;
        typingDiv.id = 'typing';
        typingDiv.innerHTML = `
            <div class="avatar ai-avatar"><i class="fa-solid fa-sparkles"></i></div>
            <div class="bubble">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    function handleUserInput() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add User Message
        addMessage(text, true);
        chatInput.value = '';

        // Determine AI response
        const lowerText = text.toLowerCase();
        let response = aiResponses.default;
        
        for (const [key, value] of Object.entries(aiResponses)) {
            if (lowerText.includes(key)) {
                response = value;
                break;
            }
        }

        // Simulate network delay
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            addMessage(response);
        }, 1000 + Math.random() * 1000);
    }

    sendBtn.addEventListener('click', handleUserInput);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    // ---- LIVE DASHBOARD SIMULATION MOCK ----
    // Periodically slightly adjust the progress bars to make the dashboard look "alive"
    const progressBars = document.querySelectorAll('.progress-fill');
    
    // An optional visual touch to simulate live data changes
    setInterval(() => {
        progressBars.forEach(bar => {
            // Get current width as integer
            let currentWidth = parseInt(bar.style.width);
            
            // Randomly change width by -2 to +2 percent
            let change = Math.floor(Math.random() * 5) - 2;
            let newWidth = currentWidth + change;
            
            // Clamp between 5 and 95
            newWidth = Math.max(5, Math.min(newWidth, 95));
            
            bar.style.width = `${newWidth}%`;
        });
    }, 5000);

    // Refresh Routes button animation
    const refreshBtn = document.getElementById('refresh-routes');
    const routeIcon = refreshBtn.querySelector('i');
    
    refreshBtn.addEventListener('click', () => {
        routeIcon.classList.add('fa-spin');
        setTimeout(() => {
            routeIcon.classList.remove('fa-spin');
        }, 1000);
    });
});
