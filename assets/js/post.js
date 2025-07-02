document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return;

  fetch(`https://versanainb.temp.swtest.ru/backend/feed/one.php?id=${id}`, {
    credentials: "include"
  })
    .then(r => r.json())
    .then(post => renderPost(post))
    .catch(() => {
      document.getElementById("post-container").innerHTML = "<p>Пост не найден</p>";
    });
});

function renderPost(post) {
  const container = document.getElementById("post-container");
  container.innerHTML = `
    <div class="post">
      <div class="post-header">
        <img src="https://versanainb.temp.swtest.ru/avatar.php?id=${post.user_id}" class="avatar">
        <div>
          <a href="/profile.html?id=${post.user_id}">@${post.username}</a><br>
          <span>${new Date(post.created_at).toLocaleString()}</span>
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
    </div>
  `;
}

function likePost(id, btn) {
  fetch("https://versanainb.temp.swtest.ru/backend/feed/like.php", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  }).then(() => {
    const span = btn.querySelector("span");
    span.textContent = parseInt(span.textContent) + 1;
  });
}

function copyLink(id) {
  const url = `https://m1.m1tsun3ko.lol/post.html?id=${id}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("Ссылка скопирована!");
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'\"]/g, tag => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
  })[tag]);
}