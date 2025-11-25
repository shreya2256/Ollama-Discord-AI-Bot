# 🚀 Ollama-Discord-AI-Bot

A powerful Discord bot that connects Discord.js with Ollama to generate AI responses directly inside your server.
Supports Node.js 22+, slash commands, environment variables, and modular bot structure.

📌 Features

🤖 Connects Discord bot with Ollama (local AI models)

⚡ Slash command: /ask → ask anything

🧠 Works with any Ollama model (LLaMA, Mistral, Deepseek, Gemma, etc.)

🔒 Secure .env setup

🏗️ Tech Stack

Component	Technology

Bot Framework	Discord.js (v14+) check this link "https://discord.js.org/docs/packages/discord.js/14.25.1"

AI	Ollama (local models) check this link "https://github.com/ollama/ollama"

Runtime	Node.js 22+

Environment	dotenv

📁 Project Structure

discord-ai-bot/

│── index.js

│── package.json

│── .env

└── README.md

🔧 Installation & Setup

1️⃣ Clone the repository

git clone https://github.com/shreya2256/Ollama-Discord-AI-Bot.git

cd discord-ai-bot

2️⃣ Install dependencies

npm install discord.js dotenv

(Node 22+ already supports fetch, so no need for node-fetch)

🔒 3️⃣ Create .env file

DISCORD_TOKEN=your_discord_bot_token

DISCORD_CLIENT_ID=your_client_id

DISCORD_GUILD_ID=your_guild_id   

OLLAMA_URL=http://localhost:11434/api/generate

🤖 4️⃣ Run Ollama

Make sure Ollama is installed and running:ollama serve

Pull a model: ollama pull llama3

▶️ 5️⃣ Start the bot

node index.js

# Your bot should now be online in your Discord server! 🎉

📝 Available Commands

/ask

Ask anything, bot replies using Ollama model.

🛠️ Customize the model

model: "llama3",

to any model you installed:

1.mistral

2.gemma

3.phi3

4.deepseek-r1

5.llama3.1

6.qwen2

🤝 Contributing

Pull requests are welcome!

Feel free to add new slash commands or AI features.
