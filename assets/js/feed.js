const token = localStorage.getItem("token");
const feed = document.getElementById("feed-container");

async function loadFeed() {
  const res = await fetch("http://versanainb.temp.swtest.ru/backend/user/post.php", {
    headers: { Authorization: token }
  });
  const posts = await res.json();
  feed.innerHTML = "";

  for (const post of posts) {
    const el = document.createElement("div");
    el.className = "post frosty-glass animated";

    el.innerHTML = `
      <div class="post-header">
        <img src="${post.avatar}" class="avatar">
        <div>
          <b><a href="/profile.html?id=${post.user_id}">${post.username}</a></b>
          <div class="pronouns">${post.pronouns ?? ""}</div>
        </div>
      </div>
      <div class="post-content">${post.content}</div>
      <div class="post-actions">
        <button onclick="likePost(${post.id}, this)">❤️ ${post.likes || 0}</button>
        <button onclick="commentPost(${post.id})">💬 Комментарии</button>
      </div>
    `;
    feed.appendChild(el);
  }
}

async function createPost() {
  const content = document.getElementById("new-post-text").value.trim();
  if (content.length < 1 || content.length > 1000) return alert("Невалидная длина");

  const res = await fetch("http://versanainb.temp.swtest.ru/backend/user/post.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ content })
  });

  const result = await res.json();
  if (result.success) {
    document.getElementById("new-post-text").value = "";
    loadFeed();
  } else {
    alert(result.error || "Ошибка публикации");
  }
}

async function likePost(id, btn) {
  const res = await fetch("http://versanainb.temp.swtest.ru/backend/api/like_post.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ post_id: id })
  });

  const result = await res.json();
  if (res.ok) {
    let text = btn.textContent.match(/\d+/)?.[0] ?? "0";
    let count = parseInt(text);
    btn.innerHTML = result.liked ? `❤️ ${count + 1}` : `❤️ ${count - 1}`;
  }
}

window.onload = loadFeed;