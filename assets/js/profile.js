const token = localStorage.getItem("token");
const params = new URLSearchParams(location.search);
const userId = params.get("id");

const info = document.getElementById("profile-info");
const posts = document.getElementById("user-posts");

async function loadProfile() {
  const res = await fetch(`http://versanainb.temp.swtest.ru/backend/user/profile.php?id=${userId}`, {
    headers: { Authorization: token }
  });
  const data = await res.json();

  if (res.status !== 200) return info.innerHTML = "<b>Пользователь не найден</b>";

  const blocked = await checkBlock();

  info.innerHTML = `
    <div class="profile-header">
      <img src="${data.avatar}" class="avatar large" />
      <div class="profile-meta">
        <h2>${data.username}</h2>
        <p>${data.pronouns || "—"}</p>
        <button onclick="toggleBlock()">
          ${blocked ? "Разблокировать" : "Заблокировать"}
        </button>
      </div>
    </div>
  `;

  loadPosts();
}

async function loadPosts() {
  const res = await fetch(`http://versanainb.temp.swtest.ru/backend/user/post.php?user_id=${userId}`, {
    headers: { Authorization: token }
  });
  const userPosts = await res.json();
  posts.innerHTML = "";

  for (const post of userPosts) {
    const el = document.createElement("div");
    el.className = "post frosty-glass";
    el.innerHTML = `
      <div class="post-content">${post.content}</div>
      <div class="post-meta">❤️ ${post.likes ?? 0}</div>
    `;
    posts.appendChild(el);
  }
}

async function checkBlock() {
  const res = await fetch(`http://versanainb.temp.swtest.ru/backend/api/is_blocked.php?user_id=${userId}`, {
    headers: { Authorization: token }
  });
  const json = await res.json();
  return json.blocked;
}

async function toggleBlock() {
  const blocked = await checkBlock();
  const action = blocked ? "unblock" : "block";

  await fetch(`http://versanainb.temp.swtest.ru/backend/api/block.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ user_id: parseInt(userId), action })
  });

  loadProfile(); // Обновим интерфейс
}

window.onload = loadProfile;