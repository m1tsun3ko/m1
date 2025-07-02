// /assets/js/register.js
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const username = form.username.value.trim();
  const password = form.password.value;
  const confirm = form.confirm.value;
  const enable_2fa = form.enable_2fa.checked;

  if (password !== confirm) {
    alert("Пароли не совпадают");
    return;
  }

  const res = await fetch("http://versanainb.temp.swtest.ru/backend/auth/register.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, enable_2fa })
  });

  const result = await res.json();

  if (res.ok && result.recovery_code) {
    const blob = new Blob([`Ваш код восстановления:\n\n${result.recovery_code}`], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "recovery_code.txt";
    link.click();
    alert("Регистрация успешна! Скачан recovery_code.txt");
    window.location.href = "/login.html";
  } else {
    alert(result.error || "Ошибка регистрации");
  }
});