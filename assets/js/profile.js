document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return;

  fetch(`https://versanainb.temp.swtest.ru/backend/profile/get.php?id=${id}`, {
    credentials: "include"
  })
    .then(r => r.json())
    .then(user => {
      renderProfile(user);
      loadUserPosts(id);
    });
});

function renderProfile(user) {
  const box = document.getElementById("profile");
  box.innerHTML = `
    <div class="profile-card">
      <img src="https://versanainb.temp.swtest.ru/avatar.php?id=${user.id}" class="avatar-large">
      <h2>@${user.username}</h2>
      <p>${user.pronouns}</p>
      <p>${escapeHTML(user.about)}</p>
      ${user.link ? `<p><a href="${user.link}" target="_blank">${user.link}</a></p>` : ""}
    </div>
  `;
}

function loadUserPosts(id) {
  fetch(`https://versanainb.temp.swtest.ru/backend/profile/posts.php?id=${id}`, {
    credentials: "include"
  })
    .then(r => r.json())
    .then(posts => {
      const wrap = document.getElementById("user-posts");
      wrap.innerHTML = "<h3>Посты</h3>";
      posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";
        div.innerHTML = `
          <div class="post-content">${escapeHTML(post.content)}</div>
          <div class="post-time">${new Date(post.created_at).toLocaleString()}</div>
        `;
        wrap.appendChild(div);
      });
    });
}

function escapeHTML(str) {
  return str.replace(/[&<>'\"]/g, tag => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
  })[tag]);
}