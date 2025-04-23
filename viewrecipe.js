// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDfz_zUIpfOlE6dC-gNXRpUAxa8htAJukM",
    authDomain: "recipe-app-ac623.firebaseapp.com",
    projectId: "recipe-app-ac623",
    messagingSenderId: "416865671762",
    appId: "1:416865671762:web:4d69c1fe80161d3f8b5d8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get recipe ID and user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');
const userId = urlParams.get('uid'); // Add this to your links when navigating

// Helper functions
function formatTime(minutes) {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Main function to load and display recipe
async function loadRecipe() {
    if (!recipeId || !userId) {
        alert("Recipe information missing");
        window.location.href = "../index.html";
        return;
    }

    try {
        // Reference to the specific recipe document in user's subcollection
        const recipeRef = doc(db, "users", userId, "recipe", recipeId);
        const recipeSnap = await getDoc(recipeRef);
        
        if (!recipeSnap.exists()) {
            throw new Error("Recipe not found");
        }

        // Combine document ID with data
        const recipe = {
            id: recipeSnap.id,
            userId: userId, // Store the user ID for ownership check
            ...recipeSnap.data()
        };

        renderRecipe(recipe);
        
        // Check if current user is the author to show edit button
        const user = auth.currentUser;
        if (user && user.uid === userId) {
            document.getElementById('editBtn').classList.remove('hidden');
        }

    } catch (error) {
        console.error("Error loading recipe:", error);
        alert("Error loading recipe: " + error.message);
        window.location.href = "../index.html";
    }
}

// Render recipe to the page
function renderRecipe(recipe) {
    // Basic recipe info
    document.getElementById('recipeTitle').textContent = recipe.name;
    document.getElementById('recipeDescription').textContent = recipe.description || 'No description';
    
    // Metadata
    document.getElementById('totalTime').textContent = formatTime(recipe.prepTime + recipe.cookTime);
    document.getElementById('servings').textContent = recipe.servings || 1;
    document.getElementById('difficulty').textContent = recipe.difficulty || 'Not specified';
    document.getElementById('rating').textContent = recipe.rating || 'N/A';
    document.getElementById('postDate').textContent = formatDate(recipe.createdAt);
    
    // Image handling
    const recipeImage = document.getElementById('recipeImage');
    if (recipe.imageBase64) {
        recipeImage.src = recipe.imageBase64;
        recipeImage.classList.remove('hidden');
    } else {
        document.getElementById('imagePlaceholder').classList.remove('hidden');
    }
    
    // Ingredients list
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = recipe.ingredients?.length > 0 
        ? recipe.ingredients.map((ingredient, index) => `
            <li class="flex items-start">
                <span class="inline-block w-5 h-5 bg-amber-100 text-amber-800 rounded-full text-center mr-3 mt-0.5 flex-shrink-0">${index + 1}</span>
                <span>${ingredient}</span>
            </li>
        `).join('')
        : '<li class="text-gray-500">No ingredients listed</li>';
    
    // Instructions list
    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = recipe.instructions?.length > 0
        ? recipe.instructions.map((instruction, index) => `
            <li class="flex">
                <span class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold mr-4">${index + 1}</span>
                <div>
                    <p class="text-gray-700">${instruction}</p>
                </div>
            </li>
        `).join('')
        : '<li class="text-gray-500">No instructions provided</li>';
    
    // Tags
    const tagsContainer = document.getElementById('tags-container');
    tagsContainer.innerHTML = recipe.tags?.length > 0
        ? recipe.tags.map(tag => `
            <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">${tag}</span>
        `).join('')
        : '';
    
    // Set up edit button
    const editBtn = document.getElementById('editBtn');
    editBtn.addEventListener('click', () => {
        window.location.href = `editrecipe.html?id=${recipe.id}&uid=${recipe.userId}`;
    });
    
    // Author info (placeholder - you would fetch this from users collection)
    document.getElementById('authorName').textContent = "Chef"; 
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        loadRecipe(); // Load recipe regardless of auth state
    });
});