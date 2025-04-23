const firebaseConfig = {
  apiKey: "AIzaSyDfz_zUIpfOlE6dC-gNXRpUAxa8htAJukM",
  authDomain: "recipe-app-ac623.firebaseapp.com",
  projectId: "recipe-app-ac623",
  messagingSenderId: "416865671762",
  appId: "1:416865671762:web:4d69c1fe80161d3f8b5d8b"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM elements
const profileForm = document.getElementById('profileForm');
const profileImage = document.getElementById('profileImage');
const avatarUpload = document.getElementById('avatar-upload');
let imageBase64 = '';

// Handle image upload and preview
avatarUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      profileImage.src = event.target.result;
      imageBase64 = event.target.result; // Store base64 string
    };
    reader.readAsDataURL(file);
  }
});

// Load current user data
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      // Populate form fields
      document.getElementById('firstName').value = userData.firstName || '';
      document.getElementById('lastName').value = userData.lastName || '';
      document.getElementById('username').value = userData.username || '';
      document.getElementById('bio').value = userData.bio || '';
      document.getElementById('location').value = userData.location || 'London, UK';
      document.getElementById('instagram').value = userData.social?.instagram || '';
      document.getElementById('tiktok').value = userData.social?.tiktok || '';
      document.getElementById('privateRecipes').checked = userData.privacy?.privateRecipes || false;
      document.getElementById('allowMessages').checked = userData.privacy?.allowMessages || false;
      
      // Set profile image if exists
      if (userData.profileImage) {
        profileImage.src = userData.profileImage;
        imageBase64 = userData.profileImage;
      }
    }
  } else {
    window.location.href = '../pages/signUp.html';
  }
});

// Handle form submission
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const user = auth.currentUser;
  if (!user) {
    alert('Please sign in to update your profile');
    return;
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Saving...';

  try {
    const userData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      username: document.getElementById('username').value,
      bio: document.getElementById('bio').value,
      location: document.getElementById('location').value,
      social: {
        instagram: document.getElementById('instagram').value,
        tiktok: document.getElementById('tiktok').value
      },
      privacy: {
        privateRecipes: document.getElementById('privateRecipes').checked,
        allowMessages: document.getElementById('allowMessages').checked
      },
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Only add profileImage if a new one was uploaded
    if (imageBase64) {
      userData.profileImage = imageBase64;
    }

    // Update user document in Firestore
    await db.collection('users').doc(user.uid).set(userData, { merge: true });
    
    alert('Profile updated successfully!');
    window.location.href = '../pages/profile.html';
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Error updating profile: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Save Changes';
  }
});