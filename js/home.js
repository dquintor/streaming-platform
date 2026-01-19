import {
  getSession,
  getLoggedUser,
  getSelectedProfileId,
  clearSession,
  getCatalog,
  seedCatalogIfEmpty,
  updateUser,
} from "./utils/storage.js";

const session = getSession();
if (!session) window.location.href = "../index.html";

const user = getLoggedUser();
if (!user) window.location.href = "../pages/login.html";

const profileId = getSelectedProfileId();
if (!profileId) window.location.href = "../pages/profiles.html";

seedCatalogIfEmpty();
const catalog = getCatalog();

const profile = (user.profiles || []).find((p) => p.id === profileId);
if (!profile) window.location.href = "../pages/profiles.html";

const rowsContainer = document.getElementById("rowsContainer");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");

const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");

const heroMeta = document.getElementById("heroMeta");
const heroTitle = document.getElementById("heroTitle");
const heroDesc = document.getElementById("heroDesc");
const moreInfoBtn = document.getElementById("moreInfoBtn");

const detailsModal = document.getElementById("detailsModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalMeta = document.getElementById("modalMeta");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const toggleFavBtn = document.getElementById("toggleFavBtn");

let currentModalItemId = null;

function getFavoritesArray() {
  if (!user.favorites || typeof user.favorites !== "object") user.favorites = {};
  if (!Array.isArray(user.favorites[profileId])) user.favorites[profileId] = [];
  return user.favorites[profileId];
}

function isFavorite(itemId) {
  return getFavoritesArray().includes(itemId);
}

function toggleFavorite(itemId) {
  const favs = getFavoritesArray();
  const idx = favs.indexOf(itemId);

  if (idx === -1) favs.push(itemId);
  else favs.splice(idx, 1);

  updateUser(user);
}

function groupByCategory(items) {
  const map = {};
  items.forEach((item) => {
    const cat = item?.metadata?.category || "More";
    if (!map[cat]) map[cat] = [];
    map[cat].push(item);
  });
  return map;
}

function openModal(item) {
  currentModalItemId = item.id;

  modalMeta.textContent = `${item.metadata.category} • ${item.metadata.year}`;
  modalTitle.textContent = item.title;
  modalDesc.textContent = item.description;

  toggleFavBtn.textContent = isFavorite(item.id) ? "Remove from My List" : "Add to My List";
  detailsModal.classList.remove("hidden");
}

function closeModal() {
  currentModalItemId = null;
  detailsModal.classList.add("hidden");
}

function renderHero(item) {
  heroMeta.textContent = `${item.metadata.category} • ${item.metadata.year}`;
  heroTitle.textContent = item.title;
  heroDesc.textContent = item.description;
  document.querySelector("section.relative.pt-20").style.backgroundImage =
  `linear-gradient(to bottom, rgba(0,0,0,.75), rgba(0,0,0,.95)), url('${item.image || ""}')`;
    document.querySelector("section.relative.pt-20").style.backgroundSize = "cover";
    document.querySelector("section.relative.pt-20").style.backgroundPosition = "center";


  moreInfoBtn.onclick = () => openModal(item);
}

function renderRows(items) {
  rowsContainer.innerHTML = "";

  const grouped = groupByCategory(items);

  Object.entries(grouped).forEach(([category, list]) => {
    const section = document.createElement("section");

    section.innerHTML = `
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">${category}</h3>
      </div>

      <div class="mt-3 flex gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        ${list
          .map((item) => {
            const fav = isFavorite(item.id);
            const img = item.image

            return `
              <button
                data-id="${item.id}"
                type="button"
                class="group relative h-[140px] min-w-[240px] overflow-hidden rounded-md border border-white/10 bg-white/5 text-left transition hover:z-10 hover:scale-[1.04] hover:border-white/30"
              >
                <img
                  src="${img}"
                  alt="${item.title}"
                  class="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                  loading="lazy"
                />

                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="text-sm font-semibold">${item.title}</div>
                      <div class="text-xs text-white/70">${item.metadata.year}</div>
                    </div>

                    <div class="text-sm ${fav ? "text-red-400" : "text-white/60"}">
                      ${fav ? "♥" : "♡"}
                    </div>
                  </div>
                </div>
              </button>
            `;
          })
          .join("")}
      </div>
    `;

    section.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const item = catalog.find((x) => x.id === id);
        if (item) openModal(item);
      });
    });

    rowsContainer.appendChild(section);
  });
}


   
function applySearch() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  if (!q) {
    renderRows(catalog);
    return;
  }

  const filtered = catalog.filter((item) => {
    const title = item.title.toLowerCase();
    const cat = (item.metadata.category || "").toLowerCase();
    return title.includes(q) || cat.includes(q);
  });

  renderRows(filtered);
}

profileAvatar.textContent = profile.name.trim().charAt(0).toUpperCase();
profileName.textContent = profile.name;

logoutBtn.addEventListener("click", () => {
  clearSession();
  window.location.href = "../index.html";
});

closeModalBtn.addEventListener("click", closeModal);
detailsModal.addEventListener("click", (e) => {
  if (e.target === detailsModal) closeModal();
});

toggleFavBtn.addEventListener("click", () => {
  if (!currentModalItemId) return;
  toggleFavorite(currentModalItemId);
  toggleFavBtn.textContent = isFavorite(currentModalItemId) ? "Remove from My List" : "Add to My List";
  applySearch();
});

if (searchInput) {
  searchInput.addEventListener("input", applySearch);
}

if (catalog.length > 0) renderHero(catalog[0]);
renderRows(catalog);
