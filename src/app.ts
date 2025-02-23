import express, { Request, Response } from "express";
import { integrationSpecSettings } from "./slang_interpreter";
import dotenv from "dotenv";
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("SLANG INTERPRETER");
});

// Endpoint to return integration settings (for testing or public access)
app.get("/integration-settings", (req: Request, res: Response) => {
  res.json(integrationSpecSettings);
});

// Telex webhook endpoint that processes incoming messages
app.post("/webhook", (req: Request, res: Response) => {
  try {
  const { message, user } = req.body;
  
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "No valid message provided" });
  }
  
  // Example slang dictionary for translation
  const slangDictionary: Record<string, string> = {
    "brb": "be right back",
    "idk": "I don't know",
    "lol": "laughing out loud",
    "omw": "on my way",
    "grwm": "get ready with me",
    "fr": "for real",
    "wagwan": "what's going on",
    "smh": "shaking my head"
  };

  console.log(`Received message: "${message}"`);

  // Replace slang words with their full forms while preserving trailing punctuation
  const translatedMessage = message.split(/\s+/)
    .map(word => {
    // This regex seperates a word from any trailing punctuation
    const match = word.match(/^(\w+)([.,!?]*$/);
    if (match) {
      const [, core, punctuation] = match;
      const lower = core.toLowerCase();
      const translation = slangDictionary[lower] || core;
      return translation + punctuation;
    }
    return word;
  })
  .join("");
  console.log(`Received message: ${message}`);
  
  console.log(`Translated message: ${translatedMessage}`);

  // Return the translated message
  res.json({
    originalMessage: message,
    translatedMessage,
    user: user || null
  });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Express is listening at http://localhost:${PORT}`);
});
