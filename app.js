document.addEventListener('DOMContentLoaded', () => {

    // ---- STATE MANAGEMENT ----
    const state = {
        userLocation: 'Main Stage',
        locations: {
            'Main Stage': { capacity: 85, people: 4500, waitTime: 25 },
            'Food Court A': { capacity: 65, people: 850, waitTime: 15 },
            'Tech Expo Hall': { capacity: 45, people: 1200, waitTime: 5 },
            'North Gate': { capacity: 15, people: 120, waitTime: 0 },
            'South Gate': { capacity: 20, people: 200, waitTime: 2 },
            'East Gate': { capacity: 5, people: 10, waitTime: 0 },
            'Food Court B': { capacity: 20, people: 300, waitTime: 5 },
            'East Restrooms': { capacity: 10, people: 8, waitTime: 0 }
        }
    };

    // User Location Tracking
    const locationSelect = document.getElementById('user-location-select');
    if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            state.userLocation = e.target.value;
            generateRoutes(); // Recalculate routes when location changes
            renderBestOptions(); // Recalculate best options
        });
    }

    // ---- HEADER TIME LOGIC ----
    const timeElement = document.getElementById('current-time');

    function updateTime() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    updateTime();
    setInterval(updateTime, 60000);

    // ---- DASHBOARD RENDERING ----
    const metricsGrid = document.getElementById('metrics-grid');
    const bestOptionsGrid = document.getElementById('best-options-grid');

    function getStatusForCapacity(capacity) {
        if (capacity >= 80) return { badge: 'danger', text: 'High', fill: 'danger-fill' };
        if (capacity >= 60) return { badge: 'warning', text: 'Busy', fill: 'warning-fill' };
        if (capacity >= 30) return { badge: 'info', text: 'Moderate', fill: 'info-fill' };
        return { badge: 'success', text: 'Clear', fill: 'success-fill' };
    }

    function renderDashboard() {
        if (!metricsGrid) return;
        metricsGrid.innerHTML = ''; // clear

        // Define which locations to show on dashboard broadly
        const dashboardLocations = ['Main Stage', 'Food Court A', 'Tech Expo Hall', 'North Gate'];

        dashboardLocations.forEach(locName => {
            const locData = state.locations[locName];
            if (!locData) return;

            const status = getStatusForCapacity(locData.capacity);
            const waitText = locData.waitTime > 0 ? `~${locData.waitTime}m wait` : 'No wait';

            const card = document.createElement('div');
            card.className = 'metric-card';
            card.innerHTML = `
                <div class="metric-header">
                    <h3>${locName}</h3>
                    <span class="badge ${status.badge}">${status.text}</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill ${status.fill}" style="width: ${locData.capacity}%;"></div>
                </div>
                <div class="metric-footer">
                    <span><i class="fa-solid fa-users"></i> ${locData.people.toLocaleString()} people</span>
                    <span><i class="fa-regular fa-clock"></i> ${waitText}</span>
                </div>
            `;
            metricsGrid.appendChild(card);
        });
    }

    function renderBestOptions() {
        if (!bestOptionsGrid) return;

        // 1. Best Food Spot
        const foodSpots = ['Food Court A', 'Food Court B'];
        let bestFood = foodSpots[0];
        if (state.locations['Food Court B'].waitTime < state.locations['Food Court A'].waitTime) {
            bestFood = 'Food Court B';
        }

        // 2. Least Crowded Area (Focusing on main hubs)
        let leastCrowded = 'Main Stage';
        let lowestCap = 100;
        Object.entries(state.locations).forEach(([loc, data]) => {
            if (!loc.includes('Gate') && !loc.includes('Restroom') && !loc.includes('Food')) {
                if (data.capacity < lowestCap) {
                    lowestCap = data.capacity;
                    leastCrowded = loc;
                }
            }
        });

        // 3. Best Route
        // Simple heuristic: from current location to the least crowded area.
        let bestRoute = `${state.userLocation} ➔ ${leastCrowded}`;
        if (state.userLocation === leastCrowded) {
            bestRoute = `${state.userLocation} ➔ ${bestFood}`;
        }

        bestOptionsGrid.innerHTML = `
            <div class="best-option-card">
                <div class="best-option-icon"><i class="fa-solid fa-utensils"></i></div>
                <div class="best-option-content">
                    <h4>Best Food Spot</h4>
                    <p>${bestFood}</p>
                </div>
            </div>
            <div class="best-option-card">
                <div class="best-option-icon"><i class="fa-solid fa-route"></i></div>
                <div class="best-option-content">
                    <h4>Best Route</h4>
                    <p>${bestRoute}</p>
                </div>
            </div>
            <div class="best-option-card">
                <div class="best-option-icon"><i class="fa-solid fa-peace"></i></div>
                <div class="best-option-content">
                    <h4>Least Crowded</h4>
                    <p>${leastCrowded}</p>
                </div>
            </div>
        `;
    }

    renderDashboard();
    renderBestOptions();

    // ---- SIMULATION ENGINE ----
    // Periodically adjust crowds mathematically to make it alive
    setInterval(() => {
        Object.keys(state.locations).forEach(loc => {
            let locData = state.locations[loc];
            let change = Math.floor(Math.random() * 5) - 2;

            if (loc === 'Main Stage' && Math.random() > 0.7) change -= 2;
            if (loc === 'Food Court A' && Math.random() > 0.7) change += 2;

            let newCapacity = Math.max(5, Math.min(locData.capacity + change, 95));
            locData.capacity = newCapacity;

            const maxCap = locData.people / (locData.capacity > 0 ? (locData.capacity / 100) : 1);
            locData.people = Math.floor(maxCap * (newCapacity / 100));
            locData.waitTime = Math.max(0, Math.floor((newCapacity - 40) / 2));
        });

        renderDashboard();
        generateRoutes();
        renderBestOptions();
    }, 5000);

    // ---- DYNAMIC ROUTING ----
    const routeList = document.getElementById('route-list');
    const refreshBtn = document.getElementById('refresh-routes');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const routeIcon = refreshBtn.querySelector('i');
            routeIcon.classList.add('fa-spin');
            generateRoutes();
            setTimeout(() => {
                routeIcon.classList.remove('fa-spin');
            }, 1000);
        });
    }

    function generateRoutes() {
        if (!routeList) return;
        routeList.innerHTML = '';

        const loc = state.userLocation;

        // 1. Generate an Alert if near a crowded area
        const mainStageCap = state.locations['Main Stage'].capacity;
        if (mainStageCap > 80 && loc !== 'Main Stage') {
            routeList.innerHTML += `
                <div class="route-item alert-route">
                    <div class="route-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="route-content">
                        <h4>Crowd Alert: Main Stage</h4>
                        <p>Currently at ${mainStageCap}% capacity. Expect delays if heading there.</p>
                    </div>
                </div>
            `;
        }

        // 2. Suggest best route to Food based on crowds
        const foodACap = state.locations['Food Court A'].capacity;
        const targetFood = foodACap > 70 ? 'Food Court B' : 'Food Court A';
        const foodWait = state.locations[targetFood].waitTime;

        routeList.innerHTML += `
            <div class="route-item best-route">
                <div class="route-icon"><i class="fa-solid fa-bolt"></i></div>
                <div class="route-content">
                    <div class="route-top">
                        <h4>${loc} ➔ ${targetFood}</h4>
                        <span class="time-saved">Optimal</span>
                    </div>
                    <p>Current wait: ${foodWait}m. Avoiding congested areas.</p>
                </div>
            </div>
        `;

        // 3. Alternative route (e.g. to Restrooms)
        routeList.innerHTML += `
            <div class="route-item alt-route">
                <div class="route-icon"><i class="fa-solid fa-person-walking"></i></div>
                <div class="route-content">
                    <div class="route-top">
                        <h4>${loc} ➔ East Restrooms</h4>
                        <span class="time-saved">Fast</span>
                    </div>
                    <p>Via Service Hallway • Low foot traffic</p>
                </div>
            </div>
        `;
    }

    generateRoutes();

    // ---- CONTEXT-AWARE CHATBOT LOGIC ----
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    function generateAIResponse(text) {
        const lower = text.toLowerCase();

        // Dynamic Food Logic
        if (lower.includes('ticket')) {
            return "Tickets can be accessed via the main gate kiosks or your mobile app QR code.";
        }

        if (lower.includes('parking')) {
            return "Parking is available near South Gate. It’s currently low traffic.";
        }

        if (lower.includes('emergency')) {
            return "For emergencies, head to the nearest help desk or contact staff immediately.";
        }
        if (lower.includes('food') || lower.includes('eat') || lower.includes('hungry')) {
            const foodACap = state.locations['Food Court A'].capacity;
            const foodBCap = state.locations['Food Court B'].capacity;
            const myLoc = state.userLocation;

            let rec = foodACap > foodBCap ? 'Food Court B' : 'Food Court A';
            let avoid = foodACap > foodBCap ? 'Food Court A' : 'Food Court B';

            return `Since you are at the ${myLoc}, I recommend heading to ${rec}. ${avoid} is quite busy right now (${state.locations[avoid].waitTime}m wait), but ${rec} should be much faster.`;
        }

        // Dynamic Crowd Logic
        if (lower.includes('crowd') || lower.includes('busy')) {
            let crowdedPlaces = Object.entries(state.locations)
                .filter(([name, data]) => data.capacity >= 75)
                .map(([name]) => name);

            if (crowdedPlaces.length > 0) {
                return `Right now, ${crowdedPlaces.join(' and ')} are experiencing heavy traffic. If you want to relax, Tech Expo Hall is a great quieter spot.`;
            } else {
                return 'Crowds are actually pretty manageable everywhere right now! Its a great time to visit the Main Stage.';
            }
        }

        // Location Awareness
        if (lower.includes('where am i') || lower.includes('my location') || lower.includes('where is this')) {
            return `You are currently near the ${state.userLocation}. Let me know where you'd like to go next!`;
        }

        // Standard Fallbacks
        const intents = {
            'bathroom': "The closest restrooms are located in the North Hall, and there's another set near the East Gate.",
            'schedule': 'The keynote is ongoing at the Main Stage. Next up is the Tech Panel in Expo Hall B at 1:00 PM.',
            'lost': "Lost and Found is located at the Main Registration desk at the South Entrance. I hope you find your item!",
            'ticket': 'You can manage tickets at the Kiosks near the South Gate Registration area.',
            'parking': 'All-day parking is available in the West Garage for $15. Shuttles run every 10 minutes from the North Gate.',
            'gate': 'The North Gate is currently the fastest way in or out. The South Gate and East Gate are also open.',
            'emergency': 'For emergencies, contact staff immediately or visit First Aid at the South Gate. Call 911 if critical.',
            'help': "I'm your AI guide! Ask me about food, crowds, schedules, or locations. For example: 'Where should I get food?'",
            'hi': "Hello! I'm here to help you navigate the event. What do you need assistance with today?",
            'hello': "Hi there! I am your AI event assistant. How can I help make your day better?"
        };
        for (const [key, val] of Object.entries(intents)) {
            if (lower.includes(key)) return val;
        }

        return "I'm not exactly sure, but you can always ask the Help Desk near the South Gate for more info!";
    }

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
        if (typingDiv) typingDiv.remove();
    }
    /*
        function handleUserInput() {
            const text = chatInput.value.trim();
            if (!text) return;
    
            addMessage(text, true);
            chatInput.value = '';
    
            const response = generateAIResponse(text);
    
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                addMessage(response);
            }, 1000 + Math.random() * 1000);
        }
    */
    //-----------------------------------------------------------------------------
    function handleUserInput() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        chatInput.value = '';

        showTypingIndicator();

        fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: text })
        })
            .then(res => res.json())
            .then(data => {
                removeTypingIndicator();
                addMessage(data.reply || "No response from AI");
            })
            .catch(err => {
                removeTypingIndicator();
                addMessage("Server error. Make sure backend is running.");
                console.error(err);
            });
    }
    //-----------------------------------------------------------------------------

    if (sendBtn) sendBtn.addEventListener('click', handleUserInput);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserInput();
        });
    }

});
