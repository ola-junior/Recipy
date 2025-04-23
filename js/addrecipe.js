
  // Firebase imports
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
  import { getFirestore, collection, addDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
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
  const publicRef = collection(db, "publicRecipe");

  // Image preview
  const coverImageInput = document.getElementById('coverImage');
  const imagePreview = document.createElement('img');
  imagePreview.className = 'mt-2 max-h-48 rounded-lg hidden';
  coverImageInput.parentNode.appendChild(imagePreview);

  coverImageInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        imagePreview.src = event.target.result;
        imagePreview.classList.remove('hidden');
        document.getElementById('imageFileName').textContent = file.name;
        document.getElementById('imageFileName').classList.remove('hidden');
      };
      reader.onerror = function () {
        alert("Error reading image file.");
      };
      reader.readAsDataURL(file);
    }
  });

  // Dynamic fields
  function addIngredientField() {
    const list = document.getElementById('ingredients-list');
    const div = document.createElement('div');
    div.className = 'flex gap-2';
    div.innerHTML = `
      <input type="text" placeholder="e.g., 1 tbsp olive oil" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg ingredient-input">
      <button type="button" class="text-red-500 hover:text-red-700" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>`;
    list.appendChild(div);
  }

  function addInstructionField() {
    const list = document.getElementById('instructions-list');
    const count = list.children.length + 1;
    const div = document.createElement('div');
    div.className = 'flex gap-2';
    div.innerHTML = `
      <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center mt-2 flex-shrink-0">${count}</span>
      <textarea placeholder="Step ${count}..." rows="2" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg instruction-input"></textarea>
      <button type="button" class="text-red-500 hover:text-red-700 mt-2" onclick="this.parentElement.remove(); updateStepNumbers()">
        <i class="fas fa-times"></i>
      </button>`;
    list.appendChild(div);
  }

  function updateStepNumbers() {
    const steps = document.querySelectorAll('#instructions-list div');
    steps.forEach((step, index) => {
      const span = step.querySelector('span');
      const textarea = step.querySelector('textarea');
      if (span) span.textContent = index + 1;
      if (textarea) textarea.placeholder = `Step ${index + 1}...`;
    });
  }

  // Tags
  document.getElementById('addTagBtn').addEventListener('click', function () {
    const tagInput = document.getElementById('tagInput');
    const tag = tagInput.value.trim();

    if (tag) {
      const tagsContainer = document.getElementById('tags-container');
      const tagElement = document.createElement('span');
      tagElement.className = 'bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center';
      tagElement.dataset.tag = tag;
      tagElement.innerHTML = `
        ${tag}
        <button class="ml-1 text-orange-500 hover:text-orange-700" onclick="this.parentElement.remove()">
          <i class="fas fa-times text-xs"></i>
        </button>`;
      tagsContainer.appendChild(tagElement);
      tagInput.value = '';
    }
  });

  // Form submission
  document.getElementById('recipeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to add a recipe");
      window.location.href = "../pages/signIn.html";
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Publishing...';

    try {
      // Get form data
      const recipeName = document.getElementById('recipeName').value;
      const description = document.getElementById('description').value;
      const prepTime = document.getElementById('prepTime').value;
      const cookTime = document.getElementById('cookTime').value;
      const servings = document.getElementById('servings').value;
      const difficulty = document.getElementById('difficulty').value;

      const ingredients = Array.from(document.querySelectorAll('.ingredient-input'))
        .map(input => input.value.trim())
        .filter(val => val);

      const instructions = Array.from(document.querySelectorAll('.instruction-input'))
        .map(input => input.value.trim())
        .filter(val => val);

      const tags = Array.from(document.querySelectorAll('#tags-container span'))
        .map(tag => tag.dataset.tag);

      let imageBase64 = '';
      const file = coverImageInput.files[0];
      if (file) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject("Image read error");
          reader.readAsDataURL(file);
        });
      }

      const recipe = {
        name: recipeName,
        description,
        ingredients,
        instructions,
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1,
        difficulty,
        tags,
        imageBase64,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        likes: 0,
        saves: 0
      };

     const docRef = await doc(collection(db, "users"), user.uid);
     const docMain = await collection(docRef, "recipe");
     await addDoc(docMain, recipe)
     await addDoc(publicRef, recipe)
     

      alert('Recipe published successfully!');
      window.location.href = "../pages/profile.html";

    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Error publishing recipe: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Publish Recipe';
    }
  });

  // Auth guard
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = '../pages/signIn.html';
    }
  });

  // Add dynamic field listeners on page load
  document.addEventListener('DOMContentLoaded', function () {
    const addIngredientBtn = document.querySelector('[onclick="addIngredientField()"]');
    if (addIngredientBtn) addIngredientBtn.addEventListener('click', addIngredientField);

    const addStepBtn = document.querySelector('[onclick="addInstructionField()"]');
    if (addStepBtn) addStepBtn.addEventListener('click', addInstructionField);

    document.querySelectorAll('#ingredients-list button').forEach(btn => {
      btn.addEventListener('click', function () {
        this.parentElement.remove();
      });
    });

    document.querySelectorAll('#instructions-list button').forEach(btn => {
      btn.addEventListener('click', function () {
        this.parentElement.remove();
        updateStepNumbers();
      });
    });
  });
