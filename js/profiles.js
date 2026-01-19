import {
  getSession,
  getLoggedUser,
  updateUser,
  setSelectedProfile,
  clearSession,
} from "./utils/storage.js";

const MAX_PROFILES = 5;

const session = getSession();
if (!session) window.location.href = "../index.html";

const user = getLoggedUser();
if (!user) window.location.href = "../pages/login.html";

const profilesListEl = document.getElementById("profilesList");
const createFormEl = document.getElementById("createProfileForm");
const profileNameEl = document.getElementById("profileName");
const profilePinEl = document.getElementById("profilePin");
const profileErrorEl = document.getElementById("profileError");
const cancelBtn = document.getElementById("cancelCreateProfile");
const logoutBtn = document.getElementById("logoutBtn");
const actionsEl = document.getElementById("profilesActions");
const manageBtn = document.getElementById("manageProfilesBtn");
const limitMsgEl = document.getElementById("profilesLimitMsg");

const pinModalEl = document.getElementById("pinModal");
const pinModalTitleEl = document.getElementById("pinModalTitle");
const pinFormEl = document.getElementById("pinForm");
const pinInputEl = document.getElementById("pinInput");
const pinErrorEl = document.getElementById("pinError");
const pinCancelBtn = document.getElementById("pinCancelBtn");

let pendingProfile = null;
let isManaging = false;

function showError(message) {
  profileErrorEl.textContent = message;
  profileErrorEl.classList.remove("hidden");
}

function clearError() {
  profileErrorEl.textContent = "";
  profileErrorEl.classList.add("hidden");
}

function showPinError(message) {
  pinErrorEl.textContent = message;
  pinErrorEl.classList.remove("hidden");
}

function clearPinError() {
  pinErrorEl.textContent = "";
  pinErrorEl.classList.add("hidden");
}

function openPinModal(profile) {
  pendingProfile = profile;
  clearPinError();
  pinInputEl.value = "";
  pinModalTitleEl.textContent = `Profile: ${profile.name}`;
  pinModalEl.classList.remove("hidden");
  pinInputEl.focus();
}

function closePinModal() {
  pendingProfile = null;
  pinModalEl.classList.add("hidden");
}

function makeProfileId(name) {
  const safe = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `p_${safe}_${Date.now()}`;
}

function showCreateForm() {
  clearError();
  profilesListEl.classList.add("hidden");
  actionsEl.classList.add("hidden");
  if (limitMsgEl) limitMsgEl.classList.add("hidden");
  createFormEl.classList.remove("hidden");
  profileNameEl.focus();
}

function hideCreateForm() {
  clearError();
  createFormEl.classList.add("hidden");
  profileNameEl.value = "";
  if (profilePinEl) profilePinEl.value = "";

  const profiles = Array.isArray(user.profiles) ? user.profiles : [];
  if (profiles.length > 0) {
    profilesListEl.classList.remove("hidden");
    actionsEl.classList.remove("hidden");
  }
}

function setManageUI() {
  if (!manageBtn) return;
  manageBtn.textContent = isManaging ? "Done" : "Manage Profiles";
}

function deleteProfile(profileId) {
  const profiles = Array.isArray(user.profiles) ? user.profiles : [];
  if (profiles.length <= 1) {
    alert("You must have at least 1 profile.");
    return;
  }

  user.profiles = profiles.filter((p) => p.id !== profileId);

  if (user.favorites && typeof user.favorites === "object") {
    delete user.favorites[profileId];
  }

  updateUser(user);
  renderProfiles();
}

function renameProfile(profileId, newName) {
  const name = newName.trim();
  if (!name) return "Profile name is required.";
  if (name.length < 2) return "Profile name must be at least 2 characters.";
  if (name.length > 20) return "Profile name must be 20 characters or less.";

  const exists = user.profiles.some(
    (p) => p.id !== profileId && p.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) return "That profile name is already in use.";

  const profile = user.profiles.find((p) => p.id === profileId);
  if (!profile) return "Profile not found.";

  profile.name = name;
  updateUser(user);
  renderProfiles();
  return null;
}

function renderAddProfileCard() {
  const card = document.createElement("button");
  card.type = "button";
  card.className =
    "group flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/40 p-4 hover:border-white/30 hover:bg-black/50";
  card.innerHTML = `
    <div class="flex h-20 w-20 items-center justify-center rounded-md bg-white/10 text-4xl font-bold text-white/90 group-hover:text-white">
      +
    </div>
    <span class="text-sm text-white/70 group-hover:text-white">Add Profile</span>
  `;

  card.addEventListener("click", () => {
    isManaging = false;
    setManageUI();
    showCreateForm();
  });

  profilesListEl.appendChild(card);
}

function renderProfiles() {
  profilesListEl.innerHTML = "";

  const profiles = Array.isArray(user.profiles) ? user.profiles : [];
  const hasProfiles = profiles.length > 0;

  setManageUI();

  if (!hasProfiles) {
    actionsEl.classList.add("hidden");
    if (limitMsgEl) limitMsgEl.classList.add("hidden");
    showCreateForm();
    return;
  }

  profilesListEl.classList.remove("hidden");
  createFormEl.classList.add("hidden");
  clearError();

  actionsEl.classList.remove("hidden");

  if (limitMsgEl) {
    if (profiles.length >= MAX_PROFILES) limitMsgEl.classList.remove("hidden");
    else limitMsgEl.classList.add("hidden");
  }

  profiles.forEach((profile) => {
    const card = document.createElement("div");
    card.className =
      "rounded-lg border border-white/10 bg-black/50 p-4 hover:border-white/30";

    if (!isManaging) {
      card.innerHTML = `
        <button type="button" class="group w-full text-left">
          <div class="flex flex-col items-center gap-3">
            <div class="flex h-20 w-20 items-center justify-center rounded-md bg-white/10 text-2xl font-bold">
              ${profile.name.trim().charAt(0).toUpperCase()}
            </div>
            <div class="flex flex-col items-center gap-1">
              <span class="text-sm text-white/85 group-hover:text-white">${profile.name}</span>
              ${profile.pin ? `<span class="text-[11px] text-white/50">PIN protected</span>` : ``}
            </div>
          </div>
        </button>
      `;

      const btn = card.querySelector("button");
      btn.addEventListener("click", () => {
        if (profile.pin) {
          openPinModal(profile);
          return;
        }
        setSelectedProfile(profile.id);
        window.location.href = "../pages/home.html";
      });
    } else {
      card.innerHTML = `
        <div class="flex flex-col items-center gap-3">
          <div class="flex h-20 w-20 items-center justify-center rounded-md bg-white/10 text-2xl font-bold">
            ${profile.name.trim().charAt(0).toUpperCase()}
          </div>

          <input
            data-rename
            type="text"
            value="${profile.name}"
            class="h-10 w-full rounded-md border border-white/20 bg-black/40 px-3 text-sm text-white outline-none focus:border-white/50"
          />

          <div class="flex w-full gap-2">
            <button
              data-save
              type="button"
              class="h-10 flex-1 rounded-md bg-red-600 text-sm font-semibold hover:bg-red-500"
            >
              Save
            </button>

            <button
              data-delete
              type="button"
              class="h-10 flex-1 rounded-md border border-white/20 bg-black/40 text-sm font-semibold hover:border-white/40"
            >
              Delete
            </button>
          </div>

          <p data-manage-error class="hidden text-xs text-red-200"></p>
        </div>
      `;

      const input = card.querySelector("[data-rename]");
      const saveBtn = card.querySelector("[data-save]");
      const delBtn = card.querySelector("[data-delete]");
      const errEl = card.querySelector("[data-manage-error]");

      saveBtn.addEventListener("click", () => {
        const msg = renameProfile(profile.id, input.value);
        if (msg) {
          errEl.textContent = msg;
          errEl.classList.remove("hidden");
        }
      });

      delBtn.addEventListener("click", () => {
        deleteProfile(profile.id);
      });
    }

    profilesListEl.appendChild(card);
  });

  if (!isManaging && profiles.length < MAX_PROFILES) {
    renderAddProfileCard();
  }
}

createFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const profiles = Array.isArray(user.profiles) ? user.profiles : [];
  if (profiles.length >= MAX_PROFILES) return showError("You can only have up to 5 profiles.");

  const name = profileNameEl.value.trim();
  const pinRaw = profilePinEl ? profilePinEl.value.trim() : "";
  const pin = pinRaw === "" ? null : pinRaw;

  if (!name) return showError("Profile name is required.");
  if (name.length < 2) return showError("Profile name must be at least 2 characters.");
  if (name.length > 20) return showError("Profile name must be 20 characters or less.");
  if (pin && !/^\d{4}$/.test(pin)) return showError("PIN must be exactly 4 digits (numbers only).");

  if (!Array.isArray(user.profiles)) user.profiles = [];
  if (!user.favorites || typeof user.favorites !== "object") user.favorites = {};

  const nameExists = user.profiles.some((p) => p.name.toLowerCase() === name.toLowerCase());
  if (nameExists) return showError("That profile name is already in use.");

  const profileId = makeProfileId(name);
  const newProfile = { id: profileId, name };
  if (pin) newProfile.pin = pin;

  user.profiles.push(newProfile);
  user.favorites[profileId] = [];

  updateUser(user);
  setSelectedProfile(profileId);
  window.location.href = "../pages/home.html";
});

if (manageBtn) {
  manageBtn.addEventListener("click", () => {
    isManaging = !isManaging;
    renderProfiles();
  });
}

cancelBtn.addEventListener("click", () => {
  const profiles = Array.isArray(user.profiles) ? user.profiles : [];
  if (profiles.length === 0) return showError("You need at least one profile to continue.");
  hideCreateForm();
  renderProfiles();
});

pinFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearPinError();

  if (!pendingProfile) return;

  const entered = pinInputEl.value.trim();
  if (!/^\d{4}$/.test(entered)) return showPinError("Enter a valid 4-digit PIN.");
  if (entered !== pendingProfile.pin) return showPinError("Incorrect PIN. Please try again.");

  setSelectedProfile(pendingProfile.id);
  closePinModal();
  window.location.href = "../pages/home.html";
});

pinCancelBtn.addEventListener("click", () => {
  closePinModal();
});

logoutBtn.addEventListener("click", () => {
  clearSession();
  window.location.href = "../index.html";
});

renderProfiles();
