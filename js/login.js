import { findUser, setSession, getSelectedProfileId } from "./utils/storage.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorEl = document.getElementById("loginError");

const togglePasswordBtn = document.getElementById("togglePasswordBtn");

if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePasswordBtn.textContent = isHidden ? "Hide" : "Show";
  });
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function clearError() {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) return showError("All fields are required.");
  if (!isValidEmail(email)) return showError("Please enter a valid email.");

  const user = findUser(email);
  if (!user) return showError("Invalid email or password.");

  if (user.password !== password) return showError("Invalid email or password.");

  setSession(user.email);

  const hasProfiles = Array.isArray(user.profiles) && user.profiles.length > 0;
  if (!hasProfiles) {
    window.location.href = "../pages/profiles.html";
    return;
  }

  const selected = getSelectedProfileId();
  if (!selected) {
    window.location.href = "../pages/profiles.html";
    return;
  }

  window.location.href = "../pages/home.html";
});
