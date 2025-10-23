const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const analyzeWithGroq = async (messages) => {
  if (!GROQ_API_KEY || GROQ_API_KEY === "undefined") {
    console.warn("No API key, using fallback response");
    return { content: "🤖 Groq API key not configured." };
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API request failed: ${errText}`);
    }

    const data = await response.json();

    // Groq response returns message content in data.choices[0].message
    return data.choices?.[0]?.message || { content: "No response" };
  } catch (err) {
    console.error("Groq API error:", err);
    return { content: "❌ Something went wrong." };
  }
};

let chatHistory = [
  {
    role: "system",
    content: `
You are a friendly Quiz AI Tutor. 
- Answer students' questions clearly and concisely.
- If the user asks for a quiz, generate a multiple-choice question (A-D) with instructions.
- Provide hints or short explanations naturally when requested.
- Always respond in a student-friendly manner.
`,
  },
];

export const chatWithAI = async (userMessage) => {
  try {
    // Add user message to chat context
    chatHistory.push({ role: "user", content: userMessage });

    // Limit chatHistory to last 15 messages to avoid overload
    if (chatHistory.length > 15) {
      chatHistory = [chatHistory[0], ...chatHistory.slice(-14)];
    }

    const result = await analyzeWithGroq(chatHistory);
    const text = result.content || "🤖 I have no answer right now.";

    // Add AI response to chat context
    chatHistory.push({ role: "assistant", content: text });

    return { sender: "ai", text };
  } catch (err) {
    console.error(err);
    return { sender: "ai", text: "❌ Something went wrong. Try again later." };
  }
};

export const resetChat = () => {
  chatHistory = [
    {
      role: "system",
      content: `
You are a friendly Quiz AI Tutor. 
- Answer students' questions clearly and concisely.
- If the user asks for a quiz, generate a multiple-choice question (A-D) with instructions.
- Provide hints or short explanations naturally when requested.
- Always respond in a student-friendly manner.
`,
    },
  ];
};
