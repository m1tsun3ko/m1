document.addEventListener("DOMContentLoaded", () => {
  loadFeed();
});

function loadFeed() {
  fetch("https://versanainb.temp.swtest.ru/backend/feed/get.php", {
    credentials: "include"
  })
    .then(r => r.json())
    .then(posts => {
      const container = document.getElementById("feed-container");
      container.innerHTML = "";

      posts.forEach(post => {
        container.appendChild(renderPost(post));
      });
    })
    .catch(err => {
      console.error("Ошибка ленты:", err);
    });
}

function renderPost(post) {
  const div = document.createElement("div");
  div.className = "post";

  const userLink = `<a href="/profile.html?id=${post.user_id}">@${post.username}</a>`;
  const time = new Date(post.created_at).toLocaleString();

  div.innerHTML = `
    <div class="post-header">
      <img src="https://versanainb.temp.swtest.ru/avatar.php?id=${post.user_id}" class="avatar">
      <div class="post-info">
        <div class="user">${userLink}</div>
        <div class="time">${time}</div>
      </div>
    </div>

    <div class="post-content">${escapeHTML(post.content)}</div>

    <div class="post-actions">
      <button onclick="likePost(${post.id}, this)">
        ❤️ <span>${post.likes}</span>
      </button>
      <button onclick="openModal('/comments.html?post=${post.id}')">💬 Комментарии</button>
      <button onclick="copyLink(${post.id})">🔗</button>
    </div>
  `;

  return div;
}

function likePost(id, btn) {
  fetch("https://versanainb.temp.swtest.ru/backend/feed/like.php", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        const countSpan = btn.querySelector("span");
        countSpan.textContent = parseInt(countSpan.textContent) + 1;
      }
    });
}

function copyLink(postId) {
  const url = `https://m1.m1tsun3ko.lol/post.html?id=${postId}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("Ссылка скопирована!");
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'\"]/g, tag => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
  })[tag]);
}