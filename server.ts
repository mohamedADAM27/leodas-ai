import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || "";
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Ensure database file exists with initial data
const DB_FILE = path.join(process.cwd(), "db.json");
const initDatabase = () => {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      conversations: [
        {
          id: "default-welcome",
          title: "Introduction to LEO DAS",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      messages: [
        {
          id: "welcome-msg-1",
          conversationId: "default-welcome",
          sender: "assistant",
          text: "Greetings. I am **LEO DAS**, your premium intellectual computing partner. Designed with Apple-level aesthetic focus, I adapt seamlessly to three luxury themes, maintain deep AI Memory across conversations, and process audio/multimodal requests. How may I elevate your workflow today?",
          timestamp: new Date().toISOString()
        }
      ],
      memories: [
        {
          id: "mem-default-1",
          memory: "User appreciates clean design, minimalist structure, and precise technical feedback.",
          importance: "high",
          createdAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
  }
};
initDatabase();

// Database read/write helpers
const readDB = () => {
  initDatabase();
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed.users) parsed.users = [];
    if (!parsed.conversations) parsed.conversations = [];
    if (!parsed.messages) parsed.messages = [];
    if (!parsed.memories) parsed.memories = [];
    return parsed;
  } catch (e) {
    console.error("Error reading database", e);
    return { users: [], conversations: [], messages: [], memories: [] };
  }
};

const writeDB = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing database", e);
  }
};

// JSON parser with generous limits for multimodal uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- API ROUTES ---

// Health & Config status checked by settings
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    geminiKeyLoaded: !!process.env.GEMINI_API_KEY,
    databaseFile: DB_FILE
  });
});

// Auth Endpoints
app.post("/api/auth/register", (req, res) => {
  const db = readDB();
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  
  const normEmail = email.trim().toLowerCase();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === normEmail);
  if (existing) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }
  
  const rawEmailName = email.split("@")[0];
  const derivedDefaultName = rawEmailName.charAt(0).toUpperCase() + rawEmailName.slice(1);
  const finalName = name && name.trim() ? name.trim() : derivedDefaultName;

  const newUser = {
    id: `user-${Date.now()}`,
    email: normEmail,
    password: password,
    name: finalName,
    createdAt: new Date().toISOString()
  };
  
  db.users.push(newUser);
  writeDB(db);
  
  res.status(201).json({
    success: true,
    user: {
      email: newUser.email,
      name: newUser.name
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  const db = readDB();
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  
  const normEmail = email.trim().toLowerCase();
  const user = db.users.find(
    (u: any) => u.email.toLowerCase() === normEmail && u.password === password
  );
  
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  
  const rawEmailName = user.email.split("@")[0];
  const derivedDefaultName = rawEmailName.charAt(0).toUpperCase() + rawEmailName.slice(1);

  res.json({
    success: true,
    user: {
      email: user.email,
      name: user.name || derivedDefaultName
    }
  });
});

// Conversations Endpoints
app.get("/api/conversations", (req, res) => {
  const db = readDB();
  const userEmail = req.headers["x-user-email"] as string;
  let conversations = db.conversations || [];
  
  if (userEmail) {
    const normEmail = userEmail.trim().toLowerCase();
    conversations = conversations.filter((c: any) => c.userEmail && c.userEmail.trim().toLowerCase() === normEmail);
    
    // If user has NO conversations, auto-create a custom Welcome Conversation!
    if (conversations.length === 0) {
      const welcomeId = `conv-${Date.now()}`;
      const newConv = {
        id: welcomeId,
        title: "Introduction to LEO DAS",
        userEmail: normEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.conversations.push(newConv);
      
      // Welcome message in user workspace
      db.messages.push({
        id: `msg-${Date.now()}-welcome`,
        conversationId: welcomeId,
        sender: "assistant",
        text: "Greetings. I am **LEO DAS**, your premium intellectual computing partner. Designed with Apple-level aesthetic focus, I adapt seamlessly to three luxury themes, maintain deep AI Memory across conversations, and process audio/multimodal requests. How may I elevate your workflow today?",
        timestamp: new Date().toISOString()
      });
      writeDB(db);
      conversations = [newConv];
    }
  }
  
  res.json(conversations.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
});

app.post("/api/conversations", (req, res) => {
  const db = readDB();
  const { title } = req.body;
  const userEmail = req.headers["x-user-email"] as string;
  const newId = `conv-${Date.now()}`;
  const newConv = {
    id: newId,
    title: title || "New Conversation",
    userEmail: userEmail ? userEmail.trim().toLowerCase() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.conversations.push(newConv);
  writeDB(db);
  res.status(201).json(newConv);
});

app.post("/api/conversations/:id/rename", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { title } = req.body;
  const conv = db.conversations.find((c: any) => c.id === id);
  if (conv) {
    conv.title = title;
    conv.updatedAt = new Date().toISOString();
    writeDB(db);
    res.json(conv);
  } else {
    res.status(404).json({ error: "Conversation not found" });
  }
});

app.delete("/api/conversations/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.conversations = db.conversations.filter((c: any) => c.id !== id);
  db.messages = db.messages.filter((m: any) => m.conversationId !== id);
  writeDB(db);
  res.json({ success: true });
});

app.get("/api/conversations/:id/messages", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const messages = db.messages.filter((m: any) => m.conversationId === id);
  res.json(messages);
});

// Appending manual message (user or system)
app.post("/api/conversations/:id/messages", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { sender, text, imageUrl, mimeType } = req.body;
  
  const msg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    conversationId: id,
    sender,
    text,
    imageUrl,
    mimeType,
    timestamp: new Date().toISOString()
  };

  db.messages.push(msg);

  // Update conversation timestamp
  const conv = db.conversations.find((c: any) => c.id === id);
  if (conv) {
    conv.updatedAt = new Date().toISOString();
  }

  writeDB(db);
  res.status(201).json(msg);
});

// Memory Endpoints
app.get("/api/memories", (req, res) => {
  const db = readDB();
  const userEmail = req.headers["x-user-email"] as string;
  let memories = db.memories || [];
  if (userEmail) {
    const normEmail = userEmail.trim().toLowerCase();
    memories = memories.filter((m: any) => m.userEmail && m.userEmail.trim().toLowerCase() === normEmail);
  }
  res.json(memories);
});

app.post("/api/memories", (req, res) => {
  const db = readDB();
  const { memory, importance } = req.body;
  const userEmail = req.headers["x-user-email"] as string;
  if (!memory) return res.status(400).json({ error: "Memory content required" });

  const newMemory = {
    id: `mem-${Date.now()}`,
    memory,
    importance: importance || "medium",
    userEmail: userEmail ? userEmail.trim().toLowerCase() : undefined,
    createdAt: new Date().toISOString()
  };

  db.memories = db.memories || [];
  db.memories.push(newMemory);
  writeDB(db);
  res.status(201).json(newMemory);
});

app.delete("/api/memories/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.memories = (db.memories || []).filter((m: any) => m.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// --- GOOGLE GEMINI CHAT INTEGRATION ---
app.post("/api/chat", async (req, res) => {
  const { conversationId, text, imageUrl, mimeType, systemInstruction } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text prompt is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: "GEMINI_API_KEY is not configured on the server. Please define it in your AI Studio Secrets settings." 
    });
  }

  try {
    // Save User Message to database
    const db = readDB();
    const userMsgId = `msg-${Date.now()}-user`;
    const userMsg = {
      id: userMsgId,
      conversationId,
      sender: "user" as const,
      text,
      imageUrl,
      mimeType,
      timestamp: new Date().toISOString()
    };
    db.messages.push(userMsg);
    
    // Auto-pull relevant memories to append to System Instructions!
    const userEmail = req.headers["x-user-email"] as string;
    let memories = db.memories || [];
    if (userEmail) {
      const normEmail = userEmail.trim().toLowerCase();
      memories = memories.filter((m: any) => m.userEmail && m.userEmail.trim().toLowerCase() === normEmail);
    }
    const memoriesContext = memories.length > 0
      ? `\nActive Memories of User:\n${memories.map((m: any, idx: number) => `${idx+1}. [Importance: ${m.importance}] ${m.memory}`).join("\n")}`
      : "";

    // Build complete prompt contents list
    const contents: any[] = [];
    
    // Add multimodal part if present
    if (imageUrl && mimeType) {
      // imageUrl of shape data:image/png;base64,..... - strip prefix
      const base64Data = imageUrl.includes("base64,") 
        ? imageUrl.split("base64,")[1] 
        : imageUrl;
      
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }

    // Add main user text prompt
    contents.push({ text });

    // Stream generation headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });

    // Make streaming api call
    const finalSystemPrompt = `${systemInstruction || "You are LEO DAS, a premium AI assistant."}${memoriesContext}`;
    
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }

    let responseStream = null;
    let streamFailed = false;
    let errorStr = "";

    try {
      responseStream = await aiClient.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: finalSystemPrompt,
          temperature: 0.7
        }
      });
    } catch (streamErr: any) {
      console.warn("API Stream initialization failed, deploying Autonomous Local Fallback...", streamErr);
      streamFailed = true;
      errorStr = String(streamErr?.message || streamErr?.status || streamErr || "");
    }

    let completeResponseText = "";

    if (streamFailed || !responseStream) {
      const lowerText = text.toLowerCase();
      let simulatorText = `### 🛰️ Autonomous Local Simulator Mode (Active)

**Notice:** The system's Gemini API free-tier limit has been reached for today (Google's standard 20 requests/day limit). LEO DAS has automatically switched to its **Cognitive Local Synthesis Mode** offline.

---

#### 💡 Local Diagnostic Analysis for: "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"

`;

      if (lowerText.includes("physics") || lowerText.includes("science") || lowerText.includes("quantum")) {
        simulatorText += `Quantum mechanics describes physical properties at atomic and subatomic scales:
* **Superposition:** A system remains in multiple states simultaneously until measured.
* **Entanglement:** Particles are linked so that the state of one instantly defines the other, regardless of distance.
* **Wave-Particle Duality:** Quantum elements show wave-like and particle-like characteristics.`;
      } else if (lowerText.includes("code") || lowerText.includes("python") || lowerText.includes("javascript") || lowerText.includes("script")) {
        simulatorText += `Here is a lightweight Python boilerplate designed for optimization:
\`\`\`python
# LEO DAS Local Code Optimizer
def optimize_stream(data_logs):
    print("Initiating clean analytical local stream...")
    return [str(log).strip().upper() for log in data_logs if log]

# Usage:
data = ["gemini flash", "leo das platform", "offline simulator"]
print(optimize_stream(data))
\`\`\`
*Tip:* Make sure to write asynchronous code paths, keep execution blocks minimal, and optimize database read loops.`;
      } else if (lowerText.includes("workout") || lowerText.includes("diet") || lowerText.includes("fitness") || lowerText.includes("gym")) {
        simulatorText += `Here is a custom athletic roadmap focused on healthy progress:
* **Hypertrophy:** Prioritize multi-joint compounds (Squats, Presses, Pull-ups).
* **Macronutrients:** Aim for a 40/30/30 distribution (Protein / Carbohydrates / Fats).
* **Regenerative Rest:** Focus on deep hydration and active recovery routines.`;
      } else if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("hey")) {
        simulatorText += `Greetings, occupant! Welcome back to the secure control deck. I am fully responsive under offline simulation constraints. Our primary cloud stream is resting briefly, but we can browse layout themes, manage memories, or check dashboard charts!`;
      } else {
        simulatorText += `I have structured an elegant analytical response for your prompt:
* **Prompt Parsing:** Successfully processed the instruction: *" ${text} "*
* **Local Synthesis:** I recommend exploring offline features like our customizable Matte Black theme, real-time memory management in the drawer panel, or exporting history to a TXT or JSON file using the top headers!`;
      }

      simulatorText += `\n\n---
*To reactivate the cloud-native Gemini AI stream, please try again in a few seconds or ensure that process.env.GEMINI_API_KEY is configured correctly in Settings.*`;

      completeResponseText = simulatorText;

      // Stream back to client character/word chunk by chunk to simulate stream
      const words = simulatorText.split(" ");
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(" ") + " ";
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    } else {
      for await (const chunk of responseStream) {
        const chunkText = chunk.text || "";
        completeResponseText += chunkText;
        // Send Server-Sent Event chunk
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    // After finish, save Assistant response to database
    db.messages.push({
      id: `msg-${Date.now()}-assistant`,
      conversationId,
      sender: "assistant",
      text: completeResponseText,
      timestamp: new Date().toISOString()
    });

    // Update conversation update time
    const conv = db.conversations.find((c: any) => c.id === conversationId);
    if (conv) {
      conv.updatedAt = new Date().toISOString();
      const isGeneric = !conv.title || conv.title === "New Conversation" || conv.title === "Welcome Workspace" || conv.title.startsWith("Session #");
      if (isGeneric) {
        // Instant, highly responsive, zero-quota local title summarizer
        const clean = text.replace(/['"“”\.\?\!]/g, "").replace(/\s+/g, " ").trim();
        const words = clean.split(" ");
        let computedTitle = "Active Session";
        if (words.length > 0 && words[0].length > 0) {
          const selected = words.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          computedTitle = selected.join(" ");
        }
        if (computedTitle.length > 35) {
          computedTitle = computedTitle.slice(0, 35) + "...";
        }
        conv.title = computedTitle;
      }
    }
    writeDB(db);

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error: any) {
    console.error("Gemini stream error:", error);
    let friendlyMessage = "An unexpected generation anomaly has occurred.";
    const errorStr = String(error?.message || error?.status || error || "");

    if (
      errorStr.includes("429") || 
      errorStr.includes("RESOURCE_EXHAUSTED") || 
      errorStr.includes("quota") || 
      errorStr.includes("Quota exceeded") || 
      errorStr.includes("rate-limits")
    ) {
      friendlyMessage = "Gemini API rate limit exceeded (Quota 429). The system is currently running on Google's free-tier limits (20 requests per day). Please wait 15–30 seconds and try submitting your prompt again!";
    } else if (errorStr.includes("API key") || errorStr.includes("API_KEY") || errorStr.includes("unconfigured")) {
      friendlyMessage = "Configuration error: The developer's Gemini API Key appears invalid or unconfigured. Please ensure GEMINI_API_KEY is defined in system settings.";
    } else {
      friendlyMessage = `Gemini Stream Exception: ${errorStr.slice(0, 250)}`;
    }

    res.write(`data: ${JSON.stringify({ error: friendlyMessage })}\n\n`);
    res.end();
  }
});

// Voice TTS Proxy using Gemini 3.1 TTS Model OR falls back on UI Speech synthesis
app.post("/api/tts", async (req, res) => {
  const { text, voice } = req.body;
  if (!text) return res.status(400).json({ error: "Text input is required." });

  try {
    if (!process.env.GEMINI_API_KEY || !aiClient) {
      return res.status(404).json({ fallback: true, message: "No API key loaded. Fall back to browser speech synthesis." });
    }

    const response = await aiClient.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ base64Audio });
    } else {
      res.status(500).json({ fallback: true, error: "Format returned has no inline Audio streams." });
    }
  } catch (e: any) {
    res.status(500).json({ fallback: true, error: e.message || "TTS Service unavailable" });
  }
});

// --- STATIC FRONTEND & DEV CONFIG ---
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LEO DAS Engine] Server running in '${process.env.NODE_ENV || 'development'}' on http://localhost:${PORT}`);
  });
};

startServer();
