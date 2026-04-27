window.addEventListener("load", () => document.body.classList.add("loaded"));

const form = document.getElementById("signupForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("pass").value.trim();
  const cpass = document.getElementById("cpass").value.trim();

  if (!name || !mobile || !email || !pass || !cpass) {
    msg.style.display = "block";
    msg.textContent = "Please fill all fields.";
    return;
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    msg.style.display = "block";
    msg.textContent = "❌ Please enter a valid 10 digit mobile number.";
    return;
  }

  if (pass !== cpass) {
    msg.style.display = "block";
    msg.textContent = "❌ Password and Confirm Password must match.";
    return;
  }

  msg.style.display = "block";
  msg.textContent =
    "✅ Account created (demo). Backend connect karoge to real signup hoga.";
});
