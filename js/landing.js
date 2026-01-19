import { seedCatalogIfEmpty,getSession, getSelectedProfileId } from "./utils/storage.js"

seedCatalogIfEmpty()

const  session = getSession()

if(session){
    const profileId = getSelectedProfileId()
    window.location.href = profileId ? "./pages/home.html": "./pages/profiles.html"
}