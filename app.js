// Initialize Supabase
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

let currentUser = null;

// --- Authentication ---
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Attempt sign in, if fails, attempt sign up
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        const signUpRes = await supabase.auth.signUp({ email, password });
        data = signUpRes.data;
        if (signUpRes.error) return alert(signUpRes.error.message);
    }
    
    currentUser = data.user;
    toggleDashboard(true);
    initDashboard();
}

async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
}

async function handleLogout() {
    await supabase.auth.signOut();
    toggleDashboard(false);
}

function toggleDashboard(isLoggedIn) {
    document.getElementById('auth-section').classList.toggle('hidden', isLoggedIn);
    document.getElementById('dashboard').classList.toggle('hidden', !isLoggedIn);
}

// --- Dashboard Initialization ---
async function initDashboard() {
    drawEcoAvatar(1); // Default size
    initChart();
    fetchGaiaInsights();
    subscribeToCommunityFeed();
}

// --- Eco Avatar (Canvas) ---
function drawEcoAvatar(growthLevel) {
    const canvas = document.getElementById('ecoAvatar');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple tree drawing that scales with growthLevel
    ctx.fillStyle = '#8b4513'; // Trunk
    ctx.fillRect(90, 120 - (growthLevel * 10), 20, 80 + (growthLevel * 10));
    
    ctx.fillStyle = '#00b894'; // Leaves
    ctx.beginPath();
    ctx.arc(100, 100 - (growthLevel * 15), 40 + (growthLevel * 5), 0, Math.PI * 2);
    ctx.fill();
}

// --- Gamification & Logging ---
async function submitLog() {
    const transport = document.getElementById('transport').value;
    
    await supabase.from('daily_logs').insert([{
        user_id: currentUser.id,
        transport_type: 'car', // Simplification for example
        distance_km: transport
    }]);

    // Update Points locally
    const pointsSpan = document.getElementById('user-points');
    pointsSpan.innerText = `${Math.floor(Math.random() * 50) + 10} EcoPoints`;
    drawEcoAvatar(2); // Grow avatar slightly
    
    // Trigger Realtime feed update
    alert("Log saved! You earned EcoPoints.");
}

// --- Chart.js ---
function initChart() {
    const ctx = document.getElementById('emissionsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'CO₂ Emissions (kg)',
                data: [12, 19, 3, 5, 2, 3, 9], // Mock data
                borderColor: '#00b894',
                tension: 0.4
            }]
        }
    });
}

// --- Gaia AI (OpenAI API) ---
async function fetchGaiaInsights() {
    const prompt = "Act as an environmental coach. Based on a user who drove 30km this week, give one short, encouraging 1-sentence tip on reducing emissions.";
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 50
            })
        });
        const data = await response.json();
        document.getElementById('ai-recommendation').innerText = data.choices[0].message.content;
    } catch (error) {
        console.error("AI Insight Error:", error);
    }
}

// --- Supabase Realtime (Community Feed) ---
function subscribeToCommunityFeed() {
    supabase.channel('public:daily_logs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_logs' }, payload => {
            const li = document.createElement('li');
            li.innerText = `Someone just saved carbon by traveling ${payload.new.distance_km}km! 🌿`;
            document.getElementById('live-feed').prepend(li);
        })
        .subscribe();
}