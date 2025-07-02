document.addEventListener("DOMContentLoaded", () => {
  // загрузка текущих настроек
  fetch("https://versanainb.temp.swtest.ru/backend/settings/get.php", {
    credentials: "include"
  })
    .then(r => r.json())
    .then(settings => {
      document.getElementById("2fa-toggle").checked = settings["2fa"] === true;
    });
});

function saveChatBackground(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem("chat_bg", reader.result);
    alert("Обои сохранены! Перезагрузите чат.");
  };
  reader.readAsDataURL(file);
}

function clearChatBackground() {
  localStorage.removeItem("chat_bg");
  alert("Обои сброшены!");
}

function logoutAll() {
  fetch("https://versanainb.temp.swtest.ru/backend/auth/logout_all.php", {
    method: "POST",
    credentials: "include"
  }).then(() => {
    alert("Вы вышли из всех сессий.");
    location.href = "/login.html";
  });
}

function toggle2FA(el) {
  fetch("https://versanainb.temp.swtest.ru/backend/settings/2fa.php", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: el.checked })
  });
}