let tempToken = null;

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value.trim();
  const password = form.password.value;

  const res = await fetch("http://versanainb.temp.swtest.ru/backend/auth/login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const result = await res.json();

  if (res.ok && result.token) {
    // Вход без 2FA
    localStorage.setItem("token", result.token);
    window.location.href = "/feed.html";
  } else if (result.require_2fa && result.temp_token) {
    // Нужно 2FA
    tempToken = result.temp_token;
    document.getElementById("2fa-modal").style.display = "block";
  } else {
    alert(result.error || "Ошибка входа");
  }
});

document.getElementById("2fa-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = e.target.code.value.trim();

  const res = await fetch("http://versanainb.temp.swtest.ru/backend/auth/verify_2fa.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ temp_token: tempToken, code })
  });

  const result = await res.json();

  if (res.ok && result.token) {
    localStorage.setItem("token", result.token);
    window.location.href = "/feed.html";
  } else {
    alert(result.error || "Неверный код");
  }
});