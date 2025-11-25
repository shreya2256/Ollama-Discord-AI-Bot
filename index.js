import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';

// ⬅️ REMOVED: import fetch from 'node-fetch';

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID, // optional
  OLLAMA_BASE = 'http://localhost:11434',
  OLLAMA_MODEL = 'llama3.2'
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env');
  process.exit(1);
}

/* ---------- Slash Command (/ask) ---------- */
const commands = [
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the local Ollama model a question')
    .addStringOption(opt =>
      opt.setName('prompt').setDescription('Your question').setRequired(true)
    )
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log('Registering slash commands...');

    if (DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
        { body: commands }
      );
      console.log('Guild commands registered!');
    } else {
      await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID),
        { body: commands }
      );
      console.log('Global commands registered! (May take time)');
    }

  } catch (err) {
    console.error('Command registration failed:', err);
  }
}

/* ---------- Call Ollama (OpenAI compatible) ---------- */
async function callOllamaChat(prompt, systemPrompt = null) {
  const url = `${OLLAMA_BASE}/v1/chat/completions`;

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const body = {
    model: OLLAMA_MODEL,
    messages,
    max_tokens: 1024
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Ollama API error ${res.status}: ${txt}`);
  }

  const data = await res.json();

  const content =
    data?.choices?.[0]?.message?.content ||
    data?.response ||
    data?.output ||
    "";

  return Array.isArray(content) ? content.join("") : content;
}

/* ---------- Discord Bot ---------- */
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ask') {
      const prompt = interaction.options.getString('prompt', true);

      await interaction.deferReply();

      const systemPrompt = "You are a helpful and concise assistant.";

      let reply;
      try {
        reply = await callOllamaChat(prompt, systemPrompt);
      } catch (err) {
        await interaction.editReply(`❌ Ollama error: ${err.message}`);
        return;
      }

      const out = reply.trim() || "No response";

      if (out.length > 1900) {
        const chunks = out.match(/[\s\S]{1,1900}/g);
        for (let i = 0; i < chunks.length; i++) {
          if (i === 0) await interaction.editReply(chunks[i]);
          else await interaction.followUp(chunks[i]);
        }
      } else {
        await interaction.editReply(out);
      }
    }
  } catch (err) {
    console.error("Handler error:", err);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply("⚠ Internal bot error.");
    } else {
      await interaction.reply({ content: "⚠ Internal error.", ephemeral: true });
    }
  }
});

/* ---------- Start ---------- */
(async () => {
  await registerCommands();
  await client.login(DISCORD_TOKEN);
})();
