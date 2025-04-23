import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc,
  collection
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { 
  getAuth,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfz_zUIpfOlE6dC-gNXRpUAxa8htAJukM",
  authDomain: "recipe-app-ac623.firebaseapp.com",
  projectId: "recipe-app-ac623",
  messagingSenderId: "416865671762",
  appId: "1:416865671762:web:4d69c1fe80161d3f8b5d8b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get IDs from URL
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');
const userId = urlParams.get('uid'); // Added user ID from URL

// Load recipe for editing
async function loadRecipeForEditing() {
  if (!recipeId || !userId) {
    alert("Missing recipe information");
    window.location.href = "../index.html";
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in to edit recipes");
    window.location.href = "../pages/signIn.html";
    return;
  }

  try {
    // Reference to the recipe in user's subcollection
    const recipeRef = doc(db, "users", userId, "recipe", recipeId);
    const recipeSnap = await getDoc(recipeRef);
    
    if (!recipeSnap.exists()) {
      throw new Error("Recipe not found");
    }

    const recipe = {
      id: recipeSnap.id,
      ...recipeSnap.data()
    };

    // Verify ownership
    if (recipe.userId !== user.uid) {
      alert("You can only edit your own recipes");
      window.location.href = `../index.html`;
      return;
    }

    populateEditForm(recipe);
    
  } catch (error) {
    console.error("Error loading recipe:", error);
    alert("Error loading recipe: " + error.message);
    window.location.href = "../index.html";
  }
}

// Populate form fields
function populateEditForm(recipe) {
  // Basic info
  document.getElementById('recipeName').value = recipe.name || '';
  document.getElementById('description').value = recipe.description || '';
  document.getElementById('prepTime').value = recipe.prepTime || 0;
  document.getElementById('cookTime').value = recipe.cookTime || 0;
  document.getElementById('servings').value = recipe.servings || 1;
  document.getElementById('difficulty').value = recipe.difficulty || 'Medium';

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  if (recipe.ingredients?.length > 0) {
    recipe.ingredients.forEach(ing => {
      addIngredientField(ing);
    });
  }

  // Instructions
  const instructionsList = document.getElementById('instructions-list');
  instructionsList.innerHTML = '';
  if (recipe.instructions?.length > 0) {
    recipe.instructions.forEach((inst, i) => {
      addInstructionField(inst);
    });
  }

  // Tags
  const tagsContainer = document.getElementById('tags-container');
  tagsContainer.innerHTML = '';
  if (recipe.tags?.length > 0) {
    recipe.tags.forEach(tag => {
      addTag(tag);
    });
  }

  // Image
  if (recipe.imageBase64) {
    document.getElementById('imagePreview').src = recipe.imageBase64;
    document.getElementById('imagePreview').classList.remove('hidden');
  }
}

// Form submission
document.getElementById('recipeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    alert("Authentication error");
    window.location.href = "../pages/signIn.html";
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Updating...';

  try {
    // Get form values
    const updatedRecipe = {
      name: document.getElementById('recipeName').value,
      description: document.getElementById('description').value,
      prepTime: parseInt(document.getElementById('prepTime').value) || 0,
      cookTime: parseInt(document.getElementById('cookTime').value) || 0,
      servings: parseInt(document.getElementById('servings').value) || 1,
      difficulty: document.getElementById('difficulty').value,
      ingredients: Array.from(document.querySelectorAll('.ingredient-input'))
                     .map(el => el.value.trim())
                     .filter(Boolean),
      instructions: Array.from(document.querySelectorAll('.instruction-input'))
                       .map(el => el.value.trim())
                       .filter(Boolean),
      tags: Array.from(document.querySelectorAll('#tags-container span'))
               .map(el => el.dataset.tag),
      updatedAt: new Date().toISOString()
    };

    // Handle image
    const fileInput = document.getElementById('coverImage');
    if (fileInput.files[0]) {
      updatedRecipe.imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
      });
    } else if (document.getElementById('imagePreview').src) {
      updatedRecipe.imageBase64 = document.getElementById('imagePreview').src;
    }

    // Update in user's subcollection
    const recipeRef = doc(db, "users", userId, "recipe", recipeId);
    await updateDoc(recipeRef, updatedRecipe);

    alert('Recipe updated successfully!');
    window.location.href = `../pages/viewrecipe.html?id=${recipeId}&uid=${userId}`;
    
  } catch (error) {
    console.error("Update error:", error);
    alert("Error updating recipe: " + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Update Recipe';
  }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadRecipeForEditing();
    } else {
      window.location.href = '../pages/signIn.html';
    }
  });
});

// Helper functions for dynamic fields (keep your existing implementations)
function addIngredientField(value = '') {
  const list = document.getElementById('ingredients-list');
  const div = document.createElement('div');
  div.className = 'flex gap-2';
  div.innerHTML = `
    <input type="text" value="${value}" 
           class="flex-1 px-4 py-2 border border-gray-300 rounded-lg ingredient-input"
           placeholder="e.g., 1 cup flour">
    <button type="button" class="text-red-500 hover:text-red-700" 
            onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  list.appendChild(div);
}

function addInstructionField(value = '') {
  const list = document.getElementById('instructions-list');
  const count = list.children.length + 1;
  const div = document.createElement('div');
  div.className = 'flex gap-2';
  div.innerHTML = `
    <span class="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mt-2 flex-shrink-0">
      ${count}
    </span>
    <textarea class="flex-1 px-4 py-2 border border-gray-300 rounded-lg instruction-input"
              placeholder="Step ${count}..." rows="2">${value}</textarea>
    <button type="button" class="text-red-500 hover:text-red-700 mt-2"
            onclick="this.parentElement.remove(); updateStepNumbers()">
      <i class="fas fa-times"></i>
    </button>
  `;
  list.appendChild(div);
}

function addTag(tag) {
  const container = document.getElementById('tags-container');
  const span = document.createElement('span');
  span.className = 'bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center';
  span.dataset.tag = tag;
  span.innerHTML = `
    ${tag}
    <button class="ml-1 text-orange-500 hover:text-orange-700" 
            onclick="this.parentElement.remove()">
      <i class="fas fa-times text-xs"></i>
    </button>
  `;
  container.appendChild(span);
}

function updateStepNumbers() {
  const steps = document.querySelectorAll('#instructions-list div');
  steps.forEach((step, index) => {
    const numSpan = step.querySelector('span');
    const textarea = step.querySelector('textarea');
    if (numSpan) numSpan.textContent = index + 1;
    if (textarea) textarea.placeholder = `Step ${index + 1}...`;
  });
}