import * as supabase from "./supabase.js";

/* Chat persistence backed by Supabase (lib/supabase.js). Every row is
   scoped by the Firebase uid the server derived from a verified ID token;
   the client never supplies user_id. Ephemeral chats (memory OFF) live in
   RAM only and are never written to the database. */

const ephemeral = new Map();

const MAX_DOC_TEXT = 150000;
const MAX_DOCS = 5;

function sanitizeDocuments(documents) {
  if (!Array.isArray(documents)) return [];
  const out = [];
  for (const d of documents.slice(0, MAX_DOCS)) {
    const name = typeof d?.name === "string" ? d.name.slice(0, 255) : "document";
    let text = typeof d?.text === "string" ? d.text : "";
    if (text.length > MAX_DOC_TEXT) text = text.slice(0, MAX_DOC_TEXT);
    if (!text.trim()) continue;
    out.push({ name, text, size: text.length, addedAt: new Date().toISOString() });
  }
  return out;
}

function summarize(chat) {
  return {
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}

function ephemeralChats(ownerId) {
  return [...ephemeral.values()].filter((c) => c.ownerId === ownerId);
}

export async function listChats(ownerId = null) {
  const persisted = await supabase.listChats(ownerId);
  return [...persisted, ...ephemeralChats(ownerId).map(summarize)].sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))
  );
}

export async function getChat(id, ownerId = null) {
  const persisted = await supabase.getChat(ownerId, id);
  if (persisted) return persisted;
  return ephemeralChats(ownerId).find((c) => c.id === id) || null;
}

export async function createChat({ ownerId = null, title, documents, messages, ephemeral: isEphemeral = false }) {
  if (isEphemeral || !ownerId) {
    const now = new Date().toISOString();
    const chat = {
      id: crypto.randomUUID(),
      ownerId,
      title: title || "New conversation",
      documents: sanitizeDocuments(documents),
      messages: Array.isArray(messages) ? messages : [],
      ephemeral: true,
      createdAt: now,
      updatedAt: now,
    };
    ephemeral.set(chat.id, chat);
    return chat;
  }
  return supabase.createChat({
    uid: ownerId,
    title,
    messages: Array.isArray(messages) ? messages : [],
    documents: sanitizeDocuments(documents),
  });
}

function nextTitle(chat, content) {
  if (chat.title && chat.title !== "New conversation") return chat.title;
  return content.length > 34 ? `${content.slice(0, 34)}…` : content;
}

export async function pushUserMessage(id, content, image, { ownerId = null } = {}) {
  const chat = await getChat(id, ownerId);
  if (!chat) return null;
  const msg = { role: "user", content };
  if (image) msg.image = image;
  const messages = [...(chat.messages || []), msg];
  const title = nextTitle(chat, content);
  if (chat.ephemeral) {
    chat.messages = messages;
    chat.title = title;
    chat.updatedAt = new Date().toISOString();
    return chat;
  }
  return supabase.saveChat(ownerId, id, { messages, title });
}

export async function appendAssistantMessage(id, content, { ownerId = null } = {}) {
  const chat = await getChat(id, ownerId);
  if (!chat) return;
  const messages = [...(chat.messages || []), { role: "assistant", content }];
  if (chat.ephemeral) {
    chat.messages = messages;
    chat.updatedAt = new Date().toISOString();
    return;
  }
  await supabase.saveChat(ownerId, id, { messages });
}

export async function addDocuments(id, documents, { ownerId = null } = {}) {
  const chat = await getChat(id, ownerId);
  if (!chat) return null;
  const docs = [...(chat.documents || []), ...sanitizeDocuments(documents)];
  if (chat.ephemeral) {
    chat.documents = docs;
    chat.updatedAt = new Date().toISOString();
    return chat;
  }
  return supabase.saveChat(ownerId, id, { documents: docs });
}

export async function deleteChat(id, ownerId = null) {
  for (const [key, chat] of ephemeral) {
    if (chat.id === id && chat.ownerId === ownerId) ephemeral.delete(key);
  }
  await supabase.deleteChat(ownerId, id);
}

export async function clearChats(ownerId = null) {
  for (const [key, chat] of ephemeral) {
    if (chat.ownerId === ownerId) ephemeral.delete(key);
  }
  await supabase.clearChats(ownerId);
}
