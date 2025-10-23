import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { chatWithAI } from "../../utils/groqService";
import { Loader2, Zap, Save, Send } from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const parseQuizText = (text) => {
  const lines = text.split("\n");
  const quiz = [];
  let currentQuestion = null;
  let currentOptions = [];
  let answer = null;

  lines.forEach((line) => {
    line = line.trim();
    if (/^(?:\*\*Question \d+:\*\*|\d+\.)/.test(line)) {
      if (currentQuestion)
        quiz.push({
          question: currentQuestion,
          options: currentOptions,
          answer,
        });
      currentQuestion = line.replace(/^(?:\*\*Question \d+:\*\*|\d+\.)\s*/, "");
      currentOptions = [];
      answer = null;
    } else if (/^[A-Z]\./.test(line)) {
      currentOptions.push(line.replace(/^[A-Z]\.\s*/, ""));
    } else if (/^\*\*Answer:/.test(line)) {
      answer = line.replace(/^\*\*Answer:\s*/, "").trim();
    }
  });

  if (currentQuestion)
    quiz.push({ question: currentQuestion, options: currentOptions, answer });
  return quiz;
};

const GenerateQuestions = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([
    { sender: "ai", text: "👋 Welcome! Ask me anything about quizzes." },
  ]);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (showIntro) setShowIntro(false);
    if (!showToast) setShowToast(true);

    setChat((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setLoading(true);

    const aiMessage = await chatWithAI(input);
    setChat((prev) => [...prev, aiMessage]);
    setLoading(false);
  };

  const handleSave = async (msg) => {
    try {
      await addDoc(collection(db, "savedQuestions"), {
        message: msg.text,
        createdAt: serverTimestamp(),
      });
      alert("Question saved successfully!");
    } catch (err) {
      console.error("Error saving message:", err);
      alert("Failed to save question.");
    }
  };

  return (
    <div className="flex flex-col h-screen relative bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 overflow-hidden font-sans">
      {showToast && (
        <div className="fixed top-14 md:top-10 left-1/2 lg:left-[56%] transform -translate-x-1/2 bg-sky-50/80 backdrop-blur-lg border rounded-full py-2 px-6 shadow-md z-40 flex items-center justify-center">
          <Zap className="w-5 h-5 text-blue-500 mr-2 animate-pulse" />
          <h1 className="font-bold text-blue-700 text-sm sm:text-base">
            Quiz Craze AI Tutor
          </h1>
        </div>
      )}

      {showIntro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-80 z-10">
          <Zap className="w-28 h-28 mb-4 text-blue-400 animate-bounce" />
          <h1 className="text-3xl sm:text-3xl font-extrabold text-blue-600 text-center">
            Welcome to Quiz Craze AI Tutor!
          </h1>
          <p className="text-lg mt-2 text-gray-700 text-center">
            Generate quiz questions instantly. Ask me anything about quizzes!
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 z-10">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`relative max-w-[75%] px-4 py-3 rounded-2xl shadow-md border ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 rounded-br-none transform hover:scale-105 transition"
                  : "bg-white text-gray-900 border-gray-200 rounded-bl-none"
              }`}
            >
              {msg.sender === "ai" && i !== 0 ? (
                <>
                  {parseQuizText(msg.text).length > 0 ? (
                    parseQuizText(msg.text).map((q, idx) => (
                      <div key={idx} className="mb-4">
                        <div className="mb-2 font-semibold text-gray-900">
                          {idx + 1}.{" "}
                          <div>
                            <ReactMarkdown>{q.question}</ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {q.options.map((opt, j) => (
                            <div
                              key={j}
                              className={`p-2 rounded-lg border ${
                                opt === q.answer
                                  ? "bg-green-100 border-green-400 text-green-800 font-semibold"
                                  : "bg-gray-50 border-gray-200 text-gray-800"
                              }`}
                            >
                              <span className="mr-2 font-bold">
                                {String.fromCharCode(65 + j)}.
                              </span>
                              <div>
                                <ReactMarkdown>{opt}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="whitespace-pre-line text-sm sm:text-base">
                      <ReactMarkdown>{msg.text || "..."}</ReactMarkdown>
                    </div>
                  )}
                  <button
                    onClick={() => handleSave(msg)}
                    className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-blue-50 transition"
                    title="Save this question"
                  >
                    <Save className="w-7 h-7 text-blue-500" />
                  </button>
                </>
              ) : (
                <div className="whitespace-pre-line text-sm sm:text-base">
                  <ReactMarkdown>{msg.text || "..."}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 ml-2 animate-pulse text-gray-500 text-sm sm:text-base">
            <Loader2 className="animate-spin w-5 h-5" />
            <span>Quiz Craze AI is responding...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-3 flex gap-2 shadow-inner">
        <input
          type="text"
          placeholder="Type your quiz question..."
          className="flex-1 border rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition text-sm sm:text-base"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <Send className="w-5 h-5 -ml-1" />
          )}
          {loading ? "Responding..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default GenerateQuestions;
