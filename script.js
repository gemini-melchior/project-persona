// This line imports the GoogleGenerativeAI class from the SDK module.
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// --- 1. GET REFERENCES TO OUR HTML ELEMENTS ---
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// --- 2. INITIALIZE THE GEMINI API ---
const API_KEY = "AIzaSyCdZJ2NkDbEmljBA9SQgs7PT6X5wakC_jk"; // <-- PASTE YOUR KEY HERE
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- 3. ADD EVENT LISTENERS ---
// Listen for clicks on the send button
sendBtn.addEventListener("click", handleUserInput);

// Listen for "Enter" keypress in the input field
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleUserInput();
    }
});

// --- 4. DEFINE THE MAIN FUNCTION ---
async function handleUserInput() {
    const userMessage = userInput.value.trim();

    // If the message is empty, do nothing
    if (!userMessage) {
        return;
    }

    // Add the user's message to the chat window
    addMessageToChat("user", userMessage);

    // Clear the input field
    userInput.value = "";

    try {
        // Send the user's message to the Gemini API
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const aiMessage = response.text();

        // Add the AI's response to the chat window
        addMessageToChat("persona", aiMessage);

    } catch (error) {
        console.error("Error fetching AI response:", error);
        addMessageToChat("persona", "Sorry, something went wrong. Please try again.");
    }
}

// --- 5. DEFINE THE HELPER FUNCTION ---
function addMessageToChat(sender, message) {
    // Create a new div element for the message
    const messageElement = document.createElement("div");

    // Add the appropriate classes for styling
    messageElement.classList.add("message", sender === "user" ? "user-message" : "persona-message");

    // Create a paragraph element for the message text
    const messageText = document.createElement("p");
    messageText.textContent = message;

    // Add the text to the message element
    messageElement.appendChild(messageText);

    // Add the message element to the chat window
    chatWindow.appendChild(messageElement);

    // Automatically scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
}