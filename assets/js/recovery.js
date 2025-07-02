document.getElementById("recovery-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value.trim();
  const code = form.code.value.trim();
  const new_password = form.new_password.value;

  const res = await fetch("http://versanainb.temp.swtest.ru/backend/auth/recovery.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, code, new_password })
  });

  const result = await res.json();

  if (res.ok) {
    alert("Пароль успешно сброшен!");
    window.location.href = "/login.html";
  } else {
    alert(result.error || "Ошибка восстановления");
  }
});