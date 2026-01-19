import {
  getSession,
  getLoggedUser,
  updateUser,
  setSelectedProfile,
  clearSession,
} from "./utils/storage.js";

const session = getSession();
if (!session) window.location.href = "../index.html";

const user = getLoggedUser();
if (!user) window.location.href = "../pages/login.html";

// DOM
const profilesListEl = document.getElementById("profilesList");
const createFormEl = document.getElementById("createProfileForm");
const profileNameEl = document.getElementById("profileName");
const profileErrorEl = document.getElementById("profileError");
const cancelBtn = document.getElementById("cancelCreateProfile");
const logoutBtn = document.getElementById("logoutBtn");
const actionsEl = document.getElementById("profilesActions");
const addProfileBtn = document.getElementById("addProfileBtn");

// UI helpers
function showError(message) {
  profileErrorEl.textContent = message;
  profileErrorEl.classList.remove("hidden");
}

function clearError() {
  profileErrorEl.textContent = "";
  profileErrorEl.classList.add("hidden");
}

function makeProfileId(name) {
  const safe = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `p_${safe}_${Date.now()}`;
}

/**
 * SHOW CREATE MODE:
 * - Show the form
 * - Hide profiles list + add button
 */
function showCreateForm() {
  clearError();

  // hide list mode
  profilesListEl.classList.add("hidden");
  actionsEl.classList.add("hidden");

  // show form
  createFormEl.classList.remove("hidden");
  profileNameEl.focus();
}

/**
 * SHOW LIST MODE:
 * - Hide the form
 * - Show profiles list + add button (only if profiles exist)
 */
function hideCreateForm() {
  clearError();

  // hide form
  createFormEl.classList.add("hidden");
  profileNameEl.value = "";

  // show list mode only if there are profiles
  const profiles = Array.isArray(user.profiles) ? user.profiles : [];
  if (profiles.length > 0) {
    profilesListEl.classList.remove("hidden");
    actionsEl.classList.remove("hidden");
  }
}

function renderProfiles() {
  profilesListEl.innerHTML = "";

  const profiles = Array.isArray(user.profiles) ? user.profiles : [];
  const hasProfiles = profiles.length > 0;

  // If no profiles -> force create form and hide "Add Profile" button
  if (!hasProfiles) {
    actionsEl.classList.add("hidden");
    showCreateForm();
    return;
  }

  // If profiles exist -> show profiles list + add button and hide form
  profilesListEl.classList.remove("hidden"); 
  actionsEl.classList.remove("hidden");
  createFormEl.classList.add("hidden");
  clearError();

  profiles.forEach((profile) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "group flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-black/50 p-4 hover:border-white/30";
    btn.innerHTML = `
      <div class="flex h-20 w-20 items-center justify-center rounded-md bg-white/10 text-2xl font-bold">
        ${profile.name.trim().charAt(0).toUpperCase()}
      </div>
      <span class="text-sm text-white/85 group-hover:text-white">${profile.name}</span>
    `;

    btn.addEventListener("click", () => {
      setSelectedProfile(profile.id);
      window.location.href = "../pages/home.html";
    });

    profilesListEl.appendChild(btn);
  });
}

// Create profile submit
createFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const name = profileNameEl.value.trim();

  if (!name) return showError("Profile name is required.");
  if (name.length < 2) return showError("Profile name must be at least 2 characters.");
  if (name.length > 20) return showError("Profile name must be 20 characters or less.");

  if (!Array.isArray(user.profiles)) user.profiles = [];
  if (!user.favorites || typeof user.favorites !== "object") user.favorites = {};

  const nameExists = user.profiles.some((p) => p.name.toLowerCase() === name.toLowerCase());
  if (nameExists) return showError("That profile name is already in use.");

  const profileId = makeProfileId(name);
  user.profiles.push({ id: profileId, name });
  user.favorites[profileId] = [];

  updateUser(user);
  setSelectedProfile(profileId);
  window.location.href = "../pages/home.html";
});

// Add profile -> show only the form
addProfileBtn.addEventListener("click", () => {
  showCreateForm();
});

// Cancel create profile -> show profiles again
cancelBtn.addEventListener("click", () => {
  const profiles = Array.isArray(user.profiles) ? user.profiles : [];
  if (profiles.length === 0) {
    showError("You need at least one profile to continue.");
    return;
  }
  hideCreateForm();
});

// Logout
logoutBtn.addEventListener("click", () => {
  clearSession();
  window.location.href = "../index.html";
});

// Initial render
renderProfiles();
