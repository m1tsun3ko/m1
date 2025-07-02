document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("edit-form");

  fetch("https://versanainb.temp.swtest.ru/backend/profile/me.php", {
    credentials: "include"
  })
    .then(r => r.json())
    .then(user => {
      form.username.value = user.username;
      form.about.value = user.about || "";
      form.link.value = user.link || "";
      form.pronouns.value = user.pronouns || "they/them";
    });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    fetch("https://versanainb.temp.swtest.ru/backend/profile/update.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) alert("Профиль обновлён!");
        else alert("Ошибка: " + res.error);
      });
  });
});

function uploadAvatar(input) {
  const file = input.files[0];
  if (!file || file.size > 5 * 1024 * 1024) {
    alert("Файл слишком большой (максимум 5MB)");
    return;
  }

  const form = new FormData();
  form.append("avatar", file);

  fetch("https://versanainb.temp.swtest.ru/backend/profile/upload_avatar.php", {
    method: "POST",
    credentials: "include",
    body: form
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        alert("Аватар обновлён!");
        location.reload();
      } else {
        alert("Ошибка: " + res.error);
      }
    });
}