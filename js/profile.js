import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc,
  collection,
  query,
  getDocs
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

// DOM Elements
const recipeGrid = document.getElementById('recipeGrid');
const profileContainer = document.querySelector('.profile-container');

// Utility Functions
const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return 'N/A';
  return timestamp.toDate().toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
};

const formatTime = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Create Recipe Card
const createRecipeCard = (recipe, userId) => {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition';
  
  card.innerHTML = `
    ${recipe.imageBase64 ? `
      <img src="${recipe.imageBase64}" 
           alt="${recipe.name}" 
           class="w-full h-48 object-cover"
           loading="lazy"
           onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=Recipe+Image'">
    ` : `
      <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
        <i class="fas fa-utensils text-gray-400 text-4xl"></i>
      </div>
    `}
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="font-bold text-lg text-gray-800 truncate">${recipe.name}</h3>
        ${recipe.tags?.[0] ? `
          <span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
            ${recipe.tags[0]}
          </span>
        ` : ''}
      </div>
      <p class="text-gray-600 text-sm mt-1 line-clamp-2">${recipe.description || 'No description'}</p>
      <div class="flex items-center justify-between mt-3">
        <div class="text-sm text-gray-500">
          <i class="fas fa-clock mr-1"></i> ${formatTime(recipe.prepTime + recipe.cookTime)}
          <span class="mx-2">•</span>
          <i class="fas fa-utensils mr-1"></i> ${recipe.servings || 1} serving${recipe.servings !== 1 ? 's' : ''}
        </div>
        <div class="flex items-center text-sm text-gray-500">
          <i class="fas fa-star text-yellow-400 mr-1"></i> ${recipe.rating || 'N/A'}
        </div>
      </div>
      <div class="mt-4">
        <a href="../pages/viewrecipe.html?id=${recipe.id}&uid=${userId}" 
           class="block w-full text-center bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2 px-4 rounded-md transition-colors duration-200">
          <i class="fas fa-eye mr-2"></i> View Recipe
        </a>
      </div>
    </div>
  `;
  
  return card;
};

// Load User Profile
// Update the DOM selectors to match your HTML:
const loadUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDocSnap.data();
    
    // Update Profile UI - MATCHING HTML IDs
    document.getElementById('profileImageDisplay').src = 
      userData.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
    
    document.getElementById('userName').textContent = 
      [userData.firstName, userData.lastName].filter(Boolean).join(' ') || 'User';
    
    document.getElementById('userMeta').innerHTML = `
      <i class="fas fa-map-marker-alt mr-1"></i> ${userData.location || 'Location not set'}
      <span class="mx-2">•</span> 
      Member since ${formatDate(userData.createdAt)}
    `;
    
    document.getElementById('userBio').textContent = 
      userData.bio || 'No bio yet. Tell us about yourself!';
    
    // Update Social Links - Add this container to your HTML
    const socialContainer = document.createElement('div');
    socialContainer.className = 'flex space-x-4 mt-3';
    
    const socials = [
      { platform: 'instagram', icon: 'fab fa-instagram', color: 'hover:text-pink-600' },
      { platform: 'tiktok', icon: 'fab fa-tiktok', color: 'hover:text-black' }
    ];
    
    socials.forEach(({platform, icon, color}) => {
      if (userData.social?.[platform]) {
        socialContainer.innerHTML += `
          <a href="https://${platform}.com/${userData.social[platform]}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="text-gray-500 ${color}">
            <i class="${icon} text-lg"></i>
          </a>
        `;
      }
    });

    // Insert social links after bio
    document.getElementById('userBio').after(socialContainer);

    // Get Recipe Count
    const recipesQuery = query(collection(db, 'users', userId, 'recipe'));
    const recipesSnapshot = await getDocs(recipesQuery);
    
    // Update Stats - MATCHING HTML IDs
    document.getElementById('recipeCount').textContent = recipesSnapshot.size;
    document.getElementById('followerCount').textContent = userData.followersCount || '0';
    document.getElementById('followingCount').textContent = userData.followingCount || '0';

  } catch (error) {
    console.error('Profile load error:', error);
    document.getElementById('userName').textContent = 'Error loading profile';
    document.getElementById('userBio').textContent = error.message;
  }
};

// Load User Recipes
const loadUserRecipes = async (userId) => {
  try {
    recipeGrid.innerHTML = `
      <div class="text-center py-8 col-span-full">
        <i class="fas fa-spinner fa-spin text-orange-500 text-2xl"></i>
        <p class="mt-2 text-gray-600">Loading recipes...</p>
      </div>
    `;

    const recipesQuery = query(collection(db, 'users', userId, 'recipe'));
    const querySnapshot = await getDocs(recipesQuery);

    if (querySnapshot.empty) {
      recipeGrid.innerHTML = `
        <div class="text-center py-8 col-span-full">
          <i class="fas fa-book-open text-orange-500 text-2xl"></i>
          <p class="mt-2 text-gray-600">No recipes found</p>
          <a href="../pages/addrecipe.html" 
             class="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition">
            Add Recipe
          </a>
        </div>
      `;
      return;
    }

    recipeGrid.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const recipe = { 
        id: doc.id,
        ...doc.data() 
      };
      recipeGrid.appendChild(createRecipeCard(recipe, userId));
    });

  } catch (error) {
    console.error('Recipes load error:', error);
    recipeGrid.innerHTML = `
      <div class="text-center py-8 col-span-full">
        <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
        <p class="mt-2 text-gray-600">Error loading recipes</p>
        <button onclick="loadUserRecipes('${userId}')" 
                class="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md">
          Try Again
        </button>
      </div>
    `;
  }
};

// Initialize Page
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = '../pages/signIn.html';
    return;
  }

  loadUserProfile(user.uid);
  loadUserRecipes(user.uid);
});