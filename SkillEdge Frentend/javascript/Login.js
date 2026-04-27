window.addEventListener("load", () => document.body.classList.add("loaded"));

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("pass").value.trim();

  if (!email || !pass) {
    msg.style.display = "block";
    msg.textContent = "Please fill all fields.";
    return;
  }

  msg.style.display = "block";
  msg.textContent =
    "✅ Login successful (demo). Backend connect karoge to real login hoga.";
});
