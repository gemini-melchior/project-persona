import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// --- 1. GET REFERENCES TO OUR HTML ELEMENTS ---
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");
const avatarContainer = document.getElementById("avatar-container");
const avatarImg = document.getElementById("avatar-img");
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const avatarPrompt = document.getElementById("avatar-prompt");
const generateAvatarBtn = document.getElementById("generate-avatar-btn");

// --- 2. INITIALIZE APIS ---
const GEMINI_API_KEY = "AIzaSyCdZJ2NkDbEmljBA9SQgs7PT6X5wakC_jk"; // <-- Paste your Gemini key here
const STABILITY_API_KEY = "sk-KY4iJe2dJi4vplfDy2ILm52FvEqb87rvPeoNZCbIJwUSYmrf"; // <-- Paste your Stability AI key here

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- 3. SPEECH SYNTHESIS & RECOGNITION SETUP ---
// (This section is unchanged)
let availableVoices = [];
function loadVoices() {
    availableVoices = window.speechSynthesis.getVoices();
}
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();
// ... (rest of speech setup code)


// --- 4. ADD EVENT LISTENERS ---
// (This section is unchanged)
sendBtn.addEventListener("click", handleUserInput);
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleUserInput();
});
micBtn.addEventListener("click", () => { /* ... */ });
settingsBtn.addEventListener("click", () => settingsPanel.classList.add("visible"));
closeSettingsBtn.addEventListener("click", () => settingsPanel.classList.remove("visible"));
generateAvatarBtn.addEventListener("click", handleAvatarGeneration);


// --- 5. DEFINE THE MAIN FUNCTIONS ---

// ** THIS IS THE UPDATED FUNCTION **
async function handleAvatarGeneration() {
    const promptText = avatarPrompt.value.trim();
    if (!promptText) {
        alert("Please enter a description for your avatar.");
        return;
    }

    generateAvatarBtn.textContent = "Generating...";
    generateAvatarBtn.disabled = true;

    // Create a FormData object, which is required for the new API
    const formData = new FormData();
    formData.append('prompt', `a vibrant, high-quality, Ghibli-style anime avatar of ${promptText}`);
    formData.append('output_format', 'webp');

    try {
        const response = await fetch(
            `https://api.stability.ai/v2beta/stable-image/generate/core`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${STABILITY_API_KEY}`,
                    'Accept': 'image/*' // We expect an image in response
                },
                body: formData // Send the FormData object as the body
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // The response is the image file itself, so we read it as a Blob
        const imageBlob = await response.blob();
        
        // Create a temporary URL for the Blob to display it in the <img> tag
        const imageUrl = URL.createObjectURL(imageBlob);
        
        avatarImg.src = imageUrl;

        settingsPanel.classList.remove("visible");

    } catch (error) {
        console.error("Error generating avatar:", error);
        alert("Sorry, there was an error generating the avatar. Please try again.");
    } finally {
        generateAvatarBtn.textContent = "Generate";
        generateAvatarBtn.disabled = false;
    }
}


// --- All other functions remain the same ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleUserInput();
    };
    recognition.onend = () => avatarContainer.classList.remove("listening");
    recognition.onerror = (event) => console.error("Speech recognition error:", event.error);
} else {
    micBtn.style.display = 'none';
}

micBtn.addEventListener("click", () => {
    if (recognition) {
        avatarContainer.classList.add("listening");
        recognition.start();
    }
});

function speakMessage(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        const googleVoice = availableVoices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en'));
        if (googleVoice) utterance.voice = googleVoice;
        window.speechSynthesis.speak(utterance);
    }
}

async function handleUserInput() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;
    addMessageToChat("user", userMessage);
    userInput.value = "";
    try {
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const aiMessage = response.text();
        addMessageToChat("persona", aiMessage);
        speakMessage(aiMessage);
    } catch (error) {
        console.error("Error fetching AI response:", error);
        addMessageToChat("persona", "Sorry, something went wrong.");
    }
}

function addMessageToChat(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender === "user" ? "user-message" : "persona-message");
    const messageText = document.createElement("p");
    messageText.textContent = message;
    messageElement.appendChild(messageText);
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}