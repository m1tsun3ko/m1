let activeChatId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadChats();

  const form = document.getElementById("chat-form");
  form.addEventListener("submit", sendMessage);

  document.getElementById("message").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  });

  document.getElementById("image").addEventListener("change", sendMedia);
});

function loadChats() {
  fetch("https://versanainb.temp.swtest.ru/backend/chat/list.php", { credentials: "include" })
    .then(r => r.json())
    .then(list => {
      const wrap = document.getElementById("chat-list");
      wrap.innerHTML = "";
      list.forEach(chat => {
        const div = document.createElement("div");
        div.className = "chat-item";
        div.innerHTML = `
          <img src="https://versanainb.temp.swtest.ru/avatar.php?id=${chat.user_id}" class="avatar">
          <div>
            <div class="chat-name">@${chat.username} ${chat.user_id == 1 ? '<span class=\"support-label\">support</span>' : ""}</div>
            <div class="chat-status">${chat.online ? "🟢 онлайн" : "был(а) в " + chat.last}</div>
          </div>
        `;
        div.onclick = () => openChat(chat.chat_id, chat.username, chat.user_id);
        wrap.appendChild(div);
      });
    });
}

function openChat(chatId, username, userId) {
  activeChatId = chatId;
  document.getElementById("chat-header").innerHTML = `
    <div class="chat-title">
      <img src="https://versanainb.temp.swtest.ru/avatar.php?id=${userId}" class="avatar">
      <div>
        <div>@${username} ${userId == 1 ? '<span class=\"support-label\">support</span>' : ""}</div>
        <a href="/profile.html?id=${userId}">Открыть профиль</a>
      </div>
    </div>
  `;
  loadMessages(chatId);
}

function loadMessages(chatId) {
  fetch("https://versanainb.temp.swtest.ru/backend/chat/load.php?chat_id=" + chatId, { credentials: "include" })
    .then(r => r.json())
    .then(msgs => {
      const box = document.getElementById("chat-messages");
      box.innerHTML = "";
      msgs.reverse().forEach(msg => {
        const div = document.createElement("div");
        div.className = "msg" + (msg.me ? " me" : "");
        div.innerHTML = `
          ${msg.image ? `<img src="https://versanainb.temp.swtest.ru/uploads/${msg.image}" class="msg-img">` : ""}
          <div class="msg-text">${msg.deleted ? "<i>message was deleted</i>" : escapeHTML(msg.text)}</div>
          <div class="msg-meta">${new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}${msg.read ? " ✓✓" : ""}</div>
          ${msg.me && !msg.deleted ? `<button onclick="deleteMessage(${msg.id})" class="del-btn">✖</button>` : ""}
          ${msg.forwarded_id ? `<div class="forward">↩ переслано</div>` : ""}
        `;
        box.appendChild(div);
      });
      box.scrollTop = box.scrollHeight;
    });
}

function sendMessage(e) {
  e.preventDefault();
  const text = document.getElementById("message").value.trim();
  if (!text || !activeChatId) return;
  fetch("https://versanainb.temp.swtest.ru/backend/chat/send.php", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: activeChatId, message: text })
  }).then(() => {
    document.getElementById("message").value = "";
    loadMessages(activeChatId);
  });
}

function sendMedia(e) {
  const file = e.target.files[0];
  if (!file || !activeChatId) return;
  const formData = new FormData();
  formData.append("chat_id", activeChatId);
  formData.append("image", file);
  fetch("https://versanainb.temp.swtest.ru/backend/chat/send_media.php", {
    method: "POST",
    credentials: "include",
    body: formData
  }).then(() => {
    loadMessages(activeChatId);
  });
}

function deleteMessage(id) {
  if (!confirm("Удалить сообщение?")) return;
  fetch("https://versanainb.temp.swtest.ru/backend/chat/delete.php", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  }).then(() => loadMessages(activeChatId));
}

function escapeHTML(str) {
  return str.replace(/[&<>'\"]/g, tag => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
  })[tag]);
}

let replyTo = null;

function forwardMessage(messageId, fromChatId) {
  fetch(`/backend/messages/get_one.php?id=${messageId}`)
    .then(r => r.json())
    .then(msg => {
      replyTo = {
        id: messageId,
        from: msg.sender_username,
        text: msg.message.slice(0, 80) // preview
      };
      document.querySelector("#message-input").focus();
      showReplyBox(replyTo);
    });
}

function sendMessage() {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (text.length < 1) return;

  const data = {
    chat_id: currentChatId,
    message: text,
    reply_to_id: replyTo?.id || null,
    reply_to_preview: replyTo?.text || null,
    reply_from_user: replyTo?.from || null
  };

  fetch("/backend/messages/send.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  }).then(() => {
    input.value = "";
    replyTo = null;
    hideReplyBox();
    loadMessages();
  });
}

function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = "message";

  if (msg.chat_id == -1 || msg.sender_id == 0) {
    div.classList.add("system-message");
    div.innerHTML = `<div class="sys">🔔 ${msg.message}</div>`;
  } else {
    div.innerHTML = `
      ${msg.reply_from_user ? `<div class="reply">@${msg.reply_from_user}: "${msg.reply_to_preview}"</div>` : ""}
      <div class="text">${escapeHTML(msg.message)}</div>
    `;
  }

  return div;
}
