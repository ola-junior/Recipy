
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getAuth,createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  import { getFirestore, collection, doc,setDoc} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
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
  const colRef = collection(db, "users");

  signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signUpForm.email.value;
    const password = signUpForm.password.value;
    const username = signUpForm.username.value;
    const name = signUpForm.name.value;
    const policyCheck = signUpForm.terms.checked;
    const emailRegex =/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    ;
    if (!passwordRegex.test(password)) {
      // alert("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      alert("Password must be at least  At least one uppercase, one lowercase, and one number");
      return;
    }

    if (!email || !password || !username || !name || !policyCheck) {
      alert("Please fill in all fields");
      return;
    }
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }
    const userDetails = {
      email: email,
      username: username,
      name: name,
      createdAt: new Date()
    };
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDocRef = doc(colRef, user.uid);
      const docRef = await setDoc(userDocRef, userDetails);
      console.log(docRef);
      alert("Sign up successful!");
      location.href = "../pages/signIn.html";
    } catch (error) {
      console.error(error);
      if (error.message === "Firebase: Error (auth/email-already-in-use).") {
        alert("Email already in use. Please use a different email.");
      }
    }
  })