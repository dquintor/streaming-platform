import { seedCatalogIfEmpty, createUser, setSession, getSession, getSelectedProfileId } from "./utils/storage.js"

seedCatalogIfEmpty()

const session = getSession()
if (session){
    const profileId = getSelectedProfileId()
    window.location.href = profileId ? "../pages/home.html" : "../pages/profiles.html"
}


//DOM elements 
const form = document.getElementById("registerForm")
const emailInput = document.getElementById("email")
const passwordInput = document.getElementById("password")
const confirmInput = document.getElementById("confirm")
const errorBox = document.getElementById("registerError")


//UI helpers 
function showError(message){
    errorBox.textContent = message
    errorBox.classList.remove("hidden")
}


function clearError(){
    errorBox.textContent = ""
    errorBox.classList.add("hidden")
}

form.addEventListener("submit", (event) => {
    event.preventDefault()
    clearError()

    const email = emailInput.value.trim()
    const password = passwordInput.value
    const confirm = confirmInput.value


if (!email || !password || !confirm) return showError("All fields are required")
if (!email.includes("@")) return showError ("Please enter a valid email")
if (password.length < 8 ) return showError ("Password must be at least 8 characters")
if (password !== confirm) return showError ("Passwords do not match")


const result = createUser(email, password)
if (!result.ok) return showError(result.message)

setSession(email)

window.location.href = "../pages/profiles.html"

}) 
