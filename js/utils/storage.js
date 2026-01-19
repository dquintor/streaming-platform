/*****************
   STORAGE LAYER
 *****************/

// Keys used in localStorage (persistent after reload)
const USERS_KEY = "app_users";
const CATALOG_KEY = "app_catalog";

// Keys used in sessionStorage (cleared when the tab/session ends)
const SESSION_KEY = "app_session"; // { email }
const PROFILE_KEY = "app_selectedProfile"; // { id }


function getFromStorage(storage, key, defaultValue) {
  const raw = storage.getItem(key);
  if (!raw) return defaultValue;

  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Writes a JS value to Web Storage using JSON serialization.
 */

function saveToStorage(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}

/* ============================================================
   USERS (localStorage)
   - Stores all registered users.
   - Each user includes: email, password, profiles[], favorites{}
============================================================ */

/** Returns the full users array from localStorage. */
export function getUsers() {
  return getFromStorage(localStorage, USERS_KEY, []);
}

/** Persists the full users array to localStorage. */
export function saveUsers(users) {
  saveToStorage(localStorage, USERS_KEY, users);
}

/** Finds a user by email  */
export function findUser(email) {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Creates and saves a new user
 * Initializes profiles and favorites
 */

export function createUser(email, password) {
  const users = getUsers();

  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { ok: false, message: "Email already registered" };
  }

  const newUser = {
    email,
    password,
    profiles: [],
    favorites: {}, 
  };

  users.push(newUser);
  saveUsers(users);

  return { ok: true, user: newUser };
}

/** Updates an existing user in localStorage (matched by email). */
export function updateUser(updatedUser) {
  const users = getUsers();

  const index = users.findIndex(
    (u) => u.email.toLowerCase() === updatedUser.email.toLowerCase()
  );

  if (index === -1) return;

  users[index] = updatedUser;
  saveUsers(users);
}

/***********************
 CATALOG (localStorage)
 ***********************/

export function getCatalog() {
  return getFromStorage(localStorage, CATALOG_KEY, []);
}

export function saveCatalog(catalog) {
  saveToStorage(localStorage, CATALOG_KEY, catalog);
}

export function seedCatalogIfEmpty() {
  const catalog = getCatalog();
  if (catalog.length > 0) return;

  const initialCatalog = [
    {
      id: "bird-box-2018",
      title: "Bird Box",
      metadata: { year: 2018, category: "Horror Thriller" },
      description:
        "A mother and her children try to survive a deadly force that strikes when you look at it.",
    },
    {
      id: "spenser-confidential-2020",
      title: "Spenser Confidential",
      metadata: { year: 2020, category: "Action Comedy" },
      description: "An ex-cop teams up with a rookie to uncover a citywide conspiracy.",
    },
    {
      id: "enola-holmes-2020",
      title: "Enola Holmes",
      metadata: { year: 2020, category: "Mystery" },
      description:
        "Sherlock Holmes’ younger sister searches for her missing mother and gets pulled into a larger case.",
    },
    {
      id: "hustle-2022",
      title: "Hustle",
      metadata: { year: 2022, category: "Sports Drama" },
      description:
        "A basketball scout discovers a talented player and bets everything on getting him to the NBA.",
    },
    {
      id: "murder-mystery-2019",
      title: "Murder Mystery",
      metadata: { year: 2019, category: "Comedy Mystery" },
      description: "A vacation turns into a whodunit when a billionaire is found dead.",
    },
    {
      id: "to-all-the-boys-ive-loved-before-2018",
      title: "To All the Boys I've Loved Before",
      metadata: { year: 2018, category: "Teen Romantic Comedy" },
      description:
        "A teen’s secret love letters get sent out and her love life turns upside down.",
    },
    {
      id: "set-it-up-2018",
      title: "Set It Up",
      metadata: { year: 2018, category: "Romantic Comedy" },
      description:
        "Two assistants try to set up their bosses and accidentally fall for each other.",
    },
    {
      id: "always-be-my-maybe-2019",
      title: "Always Be My Maybe",
      metadata: { year: 2019, category: "Romantic Comedy" },
      description: "Childhood friends reconnect years later and old feelings resurface.",
    },
    {
      id: "the-kissing-booth-2018",
      title: "The Kissing Booth",
      metadata: { year: 2018, category: "Teen Romantic Comedy" },
      description: "A school fundraiser sparks a romance that complicates friendships.",
    },
    {
      id: "love-hard-2021",
      title: "Love Hard",
      metadata: { year: 2021, category: "Holiday Romantic Comedy" },
      description:
        "A holiday trip to meet an online crush turns into an unexpected romantic mess.",
    },
  ];

  saveCatalog(initialCatalog);
}

/***************************
   SESSION (sessionStorage)
 ***************************/

export function setSession(email) {
  saveToStorage(sessionStorage, SESSION_KEY, { email });
}

export function getSession() {
  return getFromStorage(sessionStorage, SESSION_KEY, null);
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
}

export function getLoggedUser() {
  const session = getSession();
  if (!session) return null;
  return findUser(session.email);
}

/***************************
   PROFILE (sessionStorage)
 ***************************/

export function setSelectedProfile(profileId) {
  saveToStorage(sessionStorage, PROFILE_KEY, { id: profileId });
}

export function getSelectedProfileId() {
  const data = getFromStorage(sessionStorage, PROFILE_KEY, null);
  return data ? data.id : null;
}
