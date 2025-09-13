 
// Initialize Firebase
 

// =============================
// NAVIGATION (Routing)
// =============================
// document.querySelectorAll(".nav-btn").forEach(button => {
//   button.addEventListener("click", () => {
//     const target = button.getAttribute("data-target");
//     showModule(target);

//     document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
//     button.classList.add("active");
//   });
// });

// function showModule(moduleId) {
//   document.querySelectorAll(".module").forEach(module => module.classList.remove("active"));
//   document.getElementById(moduleId).classList.add("active");
// }

// =============================
// REGISTER
// =============================
 

// =============================
// LOGIN
// =============================
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (email && password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const userData = docSnap.data();
        alert("Welcome " + userData.fullName + "! Your balance is ₦" + userData.balance);
        showModule("transaction");
      } else {
        alert("No user data found.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  } else {
    alert("Please enter email and password");
  }
});
