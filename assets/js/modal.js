const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");

function openModal(url) {
  fetch(url)
    .then(r => r.text())
    .then(html => {
      modalContent.innerHTML = html;
      modal.classList.add("active");
      document.body.style.overflow = "hidden"; // отключаем прокрутку фона
    })
    .catch(() => {
      modalContent.innerHTML = "<p>Ошибка загрузки</p>";
      modal.classList.add("active");
    });
}

function closeModal() {
  modal.classList.remove("active");
  modalContent.innerHTML = "";
  document.body.style.overflow = "";
}

// закрытие по клику вне окна
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const postId = params.get("post");
  if (!postId || !document.getElementById("comment-form")) return;

  loadComments(postId);

  document.getElementById("comment-form").addEventListener("submit", e => {
    e.preventDefault();
    const text = e.target.text.value;
    if (text.length < 1) return;

    fetch("https://versanainb.temp.swtest.ru/backend/comments/add.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, text })
    }).then(() => {
      e.target.reset();
      loadComments(postId);
    });
  });
});

function loadComments(postId) {
  const box = document.getElementById("comment-list");
  box.innerHTML = "...";

  fetch(`https://versanainb.temp.swtest.ru/backend/comments/list.php?post_id=${postId}`, {
    credentials: "include"
  })
    .then(r => r.json())
    .then(comments => {
      if (comments.length === 0) {
        box.innerHTML = "<p>Комментариев пока нет.</p>";
        return;
      }

      box.innerHTML = "";
      comments.forEach(c => {
        const div = document.createElement("div");
        div.className = "comment";
        div.innerHTML = `
          <div class="comment-head">
            <img src="https://versanainb.temp.swtest.ru/avatar.php?id=${c.user_id}" class="avatar">
            <a href="/profile.html?id=${c.user_id}">@${c.username}</a>
            <span class="comment-time">${new Date(c.created_at).toLocaleString()}</span>
          </div>
          <div class="comment-text">${escapeHTML(c.text)}</div>
        `;
        box.appendChild(div);
      });
    });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, t => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[t]);
}