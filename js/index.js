// Theme Toggle Functionality
function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const themeIconMobile = document.getElementById('theme-icon-mobile');

  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (systemDark ? 'dark' : 'light');

  // Apply the current theme
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
    if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    if (themeIconMobile) themeIconMobile.classList.replace('fa-moon', 'fa-sun');
  } else {
    document.documentElement.classList.remove('dark');
    if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
    if (themeIconMobile) themeIconMobile.classList.replace('fa-sun', 'fa-moon');
  }

  // Theme toggle handler
  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    
    if (isDark) {
      if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
      if (themeIconMobile) themeIconMobile.classList.replace('fa-moon', 'fa-sun');
      localStorage.setItem('theme', 'dark');
    } else {
      if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
      if (themeIconMobile) themeIconMobile.classList.replace('fa-sun', 'fa-moon');
      localStorage.setItem('theme', 'light');
    }
  }

  // Add event listeners
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

  // Watch for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.classList.add('dark');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        if (themeIconMobile) themeIconMobile.classList.replace('fa-moon', 'fa-sun');
      } else {
        document.documentElement.classList.remove('dark');
        if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
        if (themeIconMobile) themeIconMobile.classList.replace('fa-sun', 'fa-moon');
      }
    }
  });
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTheme);
// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  
  // Toggle mobile menu function
  function toggleMobileMenu() {
    const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    
    // Toggle menu visibility
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('block');
    
    // Update button attributes
    mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
    
    // Toggle menu icon
    if (isExpanded) {
      menuIcon.classList.replace('fa-times', 'fa-bars');
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    } else {
      menuIcon.classList.replace('fa-bars', 'fa-times');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    }
  }
  
  // Initialize mobile menu button
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuButton.setAttribute('aria-controls', 'mobile-menu');
  
  // Add click event
  mobileMenuButton.addEventListener('click', toggleMobileMenu);
  
  // Close menu when clicking on nav links (optional)
  const navLinks = document.querySelectorAll('#mobile-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!mobileMenu.classList.contains('hidden')) {
        toggleMobileMenu();
      }
    });
  });
  
  // Close menu when clicking outside (optional)
  document.addEventListener('click', function(event) {
    const isClickInside = mobileMenuButton.contains(event.target) || 
                         mobileMenu.contains(event.target);
    
    if (!isClickInside && !mobileMenu.classList.contains('hidden')) {
      toggleMobileMenu();
    }
  });
  
  // Handle keyboard navigation (optional)
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      toggleMobileMenu();
      mobileMenuButton.focus();
    }
  });
});

  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getFirestore,doc,collection,query,getDoc,getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
  import { getAuth,onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDfz_zUIpfOlE6dC-gNXRpUAxa8htAJukM",
    authDomain: "recipe-app-ac623.firebaseapp.com",
    projectId: "recipe-app-ac623",
    storageBucket: "recipe-app-ac623.firebasestorage.app",
    messagingSenderId: "416865671762",
    appId: "1:416865671762:web:4d69c1fe80161d3f8b5d8b"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const publicRef = collection(db, "publicRecipe")
  const colRef = collection(db, "users");



  const recipeGrid = document.getElementById('recipeGrid');

// Format time (minutes to hours + mins)
function formatTime(minutes) {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Create recipe card element
function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition';
  
  card.innerHTML = `
  ${recipe.imageBase64 ? `
    <img 
      src="${recipe.imageBase64}" 
      alt="${recipe.name}" 
      class="w-full h-48 object-cover"
    >
  ` : `
    <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
      <i class="fas fa-utensils text-gray-400 text-4xl"></i>
    </div>
  `}
  <div class="p-4">
    <div class="flex justify-between items-start">
      <h3 class="font-bold text-lg text-gray-800">${recipe.name}</h3>
      ${recipe.tags && recipe.tags.length > 0 ? `
        <span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
          ${recipe.tags[0]}
        </span>
      ` : ''}
    </div>
    <p class="text-gray-600 text-sm mt-1">${recipe.description || 'No description'}</p>
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
    <!-- View Recipe Button -->
    <div class="mt-4">
      <a href="./pages/viewrecipe.html?id=${recipe.id}" class="block w-full text-center bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2 px-4 rounded-md transition-colors duration-200">
        <i class="fas fa-eye mr-2"></i> View Recipe
      </a>
    </div>
  </div>
  `;
  
  // Add click event to view recipe details
  
  return card;
}
  async function loadUserRecipes() {
    const user = auth.currentUser;
  
    try {
      recipeGrid.innerHTML = `
        <div class="text-center py-8 col-span-full">
          <i class="fas fa-spinner fa-spin text-orange-500 text-2xl"></i>
          <p class="mt-2 text-gray-600">Loading recipes...</p>
        </div>
      `;
  
      // Query recipes for the current user
      const querySnapshot = await getDocs(publicRef);
  
      if (querySnapshot.empty) {
        recipeGrid.innerHTML = `
          <div class="text-center py-8 col-span-full">
            <i class="fas fa-book-open text-orange-500 text-2xl"></i>
            <p class="mt-2 text-gray-600">No recipes found. Create your first recipe!</p>
            <a href="./pages/addrecipe.html" class="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition">
              Add Recipe
            </a>
          </div>
        `;
        return;
      }
  
      recipeGrid.innerHTML = '';
      
      querySnapshot.forEach((doc) => {
        const recipe = { id: doc.id, ...doc.data() };
        const card = createRecipeCard(recipe);
        recipeGrid.appendChild(card);
      });
  
    } catch (error) {
      console.error('Error loading recipes:', error);
      recipeGrid.innerHTML = `
        <div class="text-center py-8 col-span-full">
          <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          <p class="mt-2 text-gray-600">Error loading recipes. Please try again.</p>
        </div>
      `;
    }
  }

  loadUserRecipes();
 document.addEventListener("click", async (e) => {
  if (e.target.closest("#logOutBtn")) {
    try {
      await signOut(auth);
      window.location.href = "./index.html";
    } catch (error) {
      console.error("Error signing out:", error);
    }
    
  }
 })
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      profileDisp.innerHTML = ""
        console.log("User is signed in");
        const docRef = await doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const actualData = docSnap.data();
        

        profileDisp.innerHTML = `
          <div class="relative group">
            <!-- Profile Picture -->
            <img src="${actualData.profileImage}" alt="Profile Picture" class="w-10 h-10 rounded-full cursor-pointer">
              
            <!-- Dropdown Menu (hidden by default) -->
            <div class="absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <div class="py-1">
                <a href="./pages/editprofile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Profile</a>
                <a href="./pages/addrecipe.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Recipe</a>
                <a href="./pages/profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Recipes</a>
                <div class="border-t border-gray-100"></div>
                <a href="#" id="logOutBtn" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</a>
              </div>
            </div>
          </div>
        `;
        
    } else {
      console.log("User is signed out");
    }
  });