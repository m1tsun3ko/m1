document.addEventListener("DOMContentLoaded", () => {
  loadNotifications();
});

function loadNotifications() {
  const ul = document.getElementById("notifications-list");
  if (!ul) return;

  fetch("https://versanainb.temp.swtest.ru/backend/notifications/get.php", {
    credentials: "include"
  })
    .then(r => r.json())
    .then(list => {
      ul.innerHTML = "";
      if (list.length === 0) {
        ul.innerHTML = "<li>Уведомлений нет</li>";
        return;
      }

      list.forEach(n => {
        const li = document.createElement("li");
        li.innerHTML = formatNotification(n);
        ul.appendChild(li);
      });
    });
}

function formatNotification(n) {
  switch (n.type) {
    case "like":
      return `❤️ <a href="/post.html?id=${n.post_id}">@${n.from}</a> понравился ваш пост`;
    case "comment":
      return `💬 <a href="/post.html?id=${n.post_id}">@${n.from}</a> оставил(а) комментарий`;
    case "login":
      return `🔐 Новый вход с IP: ${n.ip}`;
    case "message":
      return `📨 Сообщение от <a href="/chat.html?with=${n.user_id}">@${n.from}</a>`;
    case "ban":
      return `🚫 Вы были временно заблокированы`;
    default:
      return `🔔 ${n.text}`;
  }
}