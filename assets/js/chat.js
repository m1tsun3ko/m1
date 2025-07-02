const API_BASE = "https://versanainb.temp.swtest.ru/backend";

let currentChatId = null;
let replyTo = null;
let forwardedMsg = null;

async function loadChats() {
  const res = await fetch(`${API_BASE}/chat/load_chat_list.php`, {
    headers: { Authorization: localStorage.token }
  });
  const chats = await res.json();
  const chatList = document.getElementById("chat-list");
  chatList.innerHTML = "";
  chats.forEach(chat => {
    const el = document.createElement("div");
    el.className = "chat-item";
    el.onclick = () => openChat(chat.id, chat.username);
    el.innerHTML = `
      <img src="${chat.avatar}" class="chat-avatar">
      <div class="chat-info">
        <div class="chat-name">@${chat.username}</div>
        <div class="chat-preview">...</div>
      </div>
    `;
    if (chat.user_id === 1) {
      el.classList.add("highlight-admin");
      el.querySelector(".chat-name").innerHTML += ` <span class="chat-role">support</span>`;
    }
    chatList.appendChild(el);
  });
}

async function openChat(id, name) {
  currentChatId = id;
  document.getElementById("chat-title").innerText = "@" + name;
  loadMessages();

}

async function loadMessages() {
  const res = await fetch(`${API_BASE}/chat/load_chat.php?chat_id=${currentChatId}`, {
    headers: { Authorization: localStorage.token }
  });
  const messages = await res.json();
  const container = document.getElementById("chat-messages");
  container.innerHTML = "";

  messages.forEach(msg => {
    const el = document.createElement("div");
    el.className = "msg";
    if (msg.sender_id == localStorage.userId) el.classList.add("own");

    let fwd = "";
    if (msg.forwarded_from) {
      fwd = `<div class="forwarded">
        <b>@${msg.forwarded_from.username}</b>: ${msg.forwarded_from.message}
      </div>`;
    }

    let img = "";
    if (msg.image_path) {
      img = `<img src="${msg.image_path}" class="msg-img">`;
    }

    el.innerHTML = `
      ${fwd}
      <div class="msg-body">${msg.message || ""}</div>
      ${img}
    `;
    container.appendChild(el);
  });

  container.scrollTop = container.scrollHeight;
}

document.getElementById("send-form").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  data.append("chat_id", currentChatId);
  if (replyTo) {
    data.append("reply_to_id", replyTo.id);
    data.append("reply_to_preview", replyTo.text);
    data.append("reply_from_user", replyTo.user);
  }
  if (forwardedMsg) {
    data.append("forwarded_id", forwardedMsg.id);
  }

  const res = await fetch(`${API_BASE}/api/send_message.php`, {
    method: "POST",
    headers: { Authorization: localStorage.token },
    body: data
  });

  if (res.ok) {
    form.reset();
    replyTo = null;
    forwardedMsg = null;
    loadMessages();
  }
});

document.getElementById('send-btn').onclick = sendMessage;

document.getElementById('message-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
    const formData = new FormData();
formData.append("chat_id", currentChatId);
formData.append("message", messageInput.value);

// Если это reply — добавим доп. поля
if (replyTo) {
  formData.append("reply_to_id", replyTo.id);
  formData.append("reply_to_preview", replyTo.preview);
  formData.append("reply_from_user", replyTo.user);
}
  }
});

async function sendMessage() {
  const input = document.getElementById('message-input');
  const media = document.getElementById('media-input').files[0];
  const text = input.value.trim();
  const chatId = window.currentChatId; // тебе нужно задать этот ID из контекста

  if (!text && !media) return;

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("message", text);
  if (media) form.append("media", media);

  const token = localStorage.getItem("token");

  const res = await fetch("https://versanainb.temp.swtest.ru/backend/api/send_message.php", {
    method: "POST",
    headers: {
      Authorization: token
    },
    body: form
  });

  if (res.ok) {
    input.value = "";
    document.getElementById('media-input').value = "";
    loadMessages(chatId); // обнови чат
  } else {
    const err = await res.text();
    alert("Ошибка: " + err);
  }
}

async function loadMessages(chatId) {
  window.currentChatId = chatId;

  const token = localStorage.getItem("token");
  const res = await fetch(`https://versanainb.temp.swtest.ru/backend/chat/load_chat.php?chat_id=${chatId}`, {
    headers: { Authorization: token }
  });

  const messages = await res.json();
  const container = document.getElementById("chat-container");
  container.innerHTML = "";

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message" + (msg.sender_id == localStorage.getItem("user_id") ? " own" : "");
    div.addEventListener("dblclick", () => {
  replyTo = {
    id: msg.id,
    preview: msg.message.slice(0, 100),
    user: msg.username
  };
  const previewBox = document.getElementById("reply-preview");
  previewBox.style.display = "block";
  previewBox.textContent = `↪ ${msg.username}: ${msg.message.slice(0, 100)}`;
});

    const username = document.createElement("span");
    username.className = "sender";
    username.textContent = msg.username;
    username.onclick = () => window.location.href = `/profile.html?id=${msg.sender_id}`;
    div.appendChild(username);

    // Переслано
    if (msg.forwarded_from) {
      const fwd = document.createElement("div");
      fwd.className = "forwarded";
      fwd.innerHTML = `Переслано от <a href="/profile.html?id=${msg.forwarded_from.user_id}">${msg.forwarded_from.username}</a>: «${msg.forwarded_from.message.slice(0, 100)}»`;
      div.appendChild(fwd);
    }

    // Ответ
    if (msg.reply_to_preview) {
      const reply = document.createElement("div");
      reply.className = "forwarded";
      reply.textContent = `↪ ${msg.reply_from_user || "Пользователь"}: ${msg.reply_to_preview}`;
      div.appendChild(reply);
    }

    // Основной текст
    const text = document.createElement("div");
    text.textContent = msg.message;
    div.appendChild(text);

    // Медиа
    if (msg.image_path) {
      const media = document.createElement("img");
      media.src = `https://versanainb.temp.swtest.ru/backend${msg.image_path}`;
      media.style.maxWidth = "100%";
      media.style.marginTop = "8px";
      div.appendChild(media);
    }

    // Время
    const time = document.createElement("time");
    time.textContent = new Date(msg.created_at).toLocaleTimeString();
    div.appendChild(time);

    container.appendChild(div);
  });

  // Скролл вниз
  container.scrollTop = container.scrollHeight;
}

let replyTo = null;
let forwardMsgId = null;

document.getElementById("send-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("msg").value;
  const media = document.getElementById("media").files[0];

  if (!msg.trim() && !media) return;

  const formData = new FormData();
  formData.append("chat_id", window.currentChatId);
  formData.append("message", msg);

  if (replyTo) {
    formData.append("reply_to_id", replyTo.id);
    formData.append("reply_to_preview", replyTo.preview);
    formData.append("reply_from_user", replyTo.user);
  }

  if (forwardMsgId) {
    formData.append("forwarded_id", forwardMsgId);
  }

  if (media) {
    formData.append("media", media);
  }

  const res = await fetch("https://versanainb.temp.swtest.ru/backend/api/send_message.php", {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token")
    },
    body: formData
  });

  const result = await res.json();
  if (result.success) {
    document.getElementById("msg").value = "";
    document.getElementById("media").value = "";
    clearReply();
    await loadMessages(window.currentChatId);
    messageElement.dataset.msgId = msg.id;
    if (msg.reply_to_id) {
  const replyBlock = document.createElement("div");
  replyBlock.className = "reply-block";
  replyBlock.innerHTML = `
    <div class="reply-user">@${msg.reply_from_user}</div>
    <div class="reply-preview">↪ ${msg.reply_to_preview}</div>
  `;
  messageElement.appendChild(replyBlock);
  if (msg.reply_to_id) {
  const replyBlock = document.createElement("div");
  replyBlock.className = "reply-block";
  replyBlock.innerHTML = `
    <div class="reply-user">@${msg.reply_from_user}</div>
    <div class="reply-preview">↪ ${msg.reply_to_preview}</div>
  `;

  replyBlock.style.cursor = "pointer";

  replyBlock.addEventListener("click", () => {
    const target = document.querySelector(`[data-msg-id="${msg.reply_to_id}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("highlighted");
      setTimeout(() => target.classList.remove("highlighted"), 1500);
    }
  });

  messageElement.appendChild(replyBlock);
}
}
  }
});

fetch("https://versanainb.temp.swtest.ru/backend/api/send_message.php", {
  method: "POST",
  headers: {
    Authorization: localStorage.getItem("token")
  },
  body: formData
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    messageInput.value = "";
    replyTo = null;
    document.getElementById("reply-preview").style.display = "none";
    loadChat(currentChatId); // обновим чат
  }
});

function cancelReply() {
  replyTo = null;
  document.getElementById("reply-preview").style.display = "none";
}