# Streaming Platform – Netflix-Inspired Web App

A simplified Netflix-inspired streaming platform built with **vanilla JavaScript**, focused on **application logic, data modeling, and client-side persistence** using `localStorage` and `sessionStorage`.

This project simulates the core flow of a streaming service without a backend, emphasizing clean structure, validation, and state management on the front end.

---

## Project Description

This web application allows users to:

- Register and authenticate accounts  
- Log in using stored credentials  
- Create and select viewing profiles  
- Access a home screen with a predefined movie catalog  

All data is handled on the client side, making this project ideal for practicing **JavaScript fundamentals**, **state handling**, and **multi-step user flows**.

---

## Functional Flow

### 1. Landing Page
- Entry point of the platform  
- Brief description of the service  
- Navigation links to **Register** and **Sign In**

### 2. Register
- Registration form to create a new account  
- User inputs:
  - Email  
  - Password  
- Password validation:
  - Minimum **8 characters**
- User data is stored in `localStorage`

### 3. Login
- Login using email and password  
- Credentials are retrieved from `localStorage`  
- Successful authentication creates a session state

### 4. Profiles (Who’s Watching)
- Displays all profiles associated with the account  
- If the user has no profiles:
  - The system requires creating one  
- **Every account must have at least one profile** before continuing

### 5. Home
- Accessible only after profile selection  
- Displays the movie catalog  
- Catalog data is rendered dynamically

---

## Data Models

### User
```js
{
  email: string,                     // User login email
  password: string,                  // User password
  profiles: Profile[],               // Profiles linked to the account
  favorites: {                       // Favorites per profile
    [profileId: string]: string[]    // Array of catalog item IDs
  }
}
```

### Profile
```js
{
  id: string,                // Unique profile identifier
  name: string,              // Profile display name
  pin: string                // Optional security PIN
}

```

### Catalog Item
```js
{
  id: string,                // Unique catalog identifier
  title: string,             // Movie or series title
  description: string,       // Short description
  image: string,             // Poster image path or URL
  metadata: {
    year: number,            // Release year
    category: string         // Genre or category
  }
}

```

---

## Storage Usage

### localStorage
| Key | Purpose |
|---|---|
| `app_users` | Stores all registered users |
| `app_catalog` | Stores the movie catalog |

### sessionStorage
| Key | Purpose |
|---|---|
| `app_selectedProfile` | Stores the currently selected profile |
| `app_session` | Tracks the logged-in user |

---

## How to Run the Project 


### Option 1: Run locally

1. Clone the repository:
```bash
git clone https://github.com/your-username/streaming-platform.git
```

2. Navigate to the project folder:
```bash
cd streaming-platform
```

3. Run the project:
- Open `index.html` directly in your browser  
- **Recommended:** Use **Live Server** in VS Code for proper routing and storage behavior

### Option 2: Run on Github Pages

The project is deployed using GitHub Pages and can be accessed here: [Live Demo ](https://dquintor.github.io/streaming-platform/)


---

## Branching & Commit Strategy

### Branching
- `main` → stable version
- `develop` → development branch
- `feature/*` → new features  

### Commit Convention
This project follows **Conventional Commits**:

- `feat:` new functionality  
- `fix:` bug fixes  
- `style:` CSS or visual changes  
- `refactor:` logic or structure improvements  
- `docs:` documentation updates  

**Example:**
```bash
feat: add profile creation validation
fix: correct login localStorage check
style: improve home layout
```

---

## Author Information

**Daniela Quinto Ríos**  
Software Developer
- Project created for learning and portfolio purposes.
