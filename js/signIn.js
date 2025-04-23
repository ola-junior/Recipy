
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getFirestore,collection } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
  import { getAuth,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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
  const colRef = collection(db, "users");
  const auth = getAuth(app);

  signInForm.addEventListener("submit", async (e) =>{
    e.preventDefault();
    const email = signInForm.email.value;
    const password = signInForm.password.value;
    if(email.length === 0 || password.length === 0){
      alert("Please fill in all fields");
      return;
    }
    try{
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);
      alert("Sign in successful!");
      window.location.href = "../index.html";
    }
      catch(error){
      console.log(error.message);
      if (error.message === "Firebase: Error (auth/invalid-credential).") {
        alert("Invalid email or password");
      }
    }
  })