 
// Import Firebase (v11 modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBQYLpM-1WJnm7_iqq0VBSf-c3fRDLKgAc",
  authDomain: "steganography-b6b82.firebaseapp.com",
  projectId: "steganography-b6b82",
  storageBucket: "steganography-b6b82.firebasestorage.app",
  messagingSenderId: "375823411957",
  appId: "1:375823411957:web:02f6c7d686a11f115fb3bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global state
let currentUser = null;
let userData = null;

// Security alert function
function showSecurityAlert(message, isDanger = true) {
  // Remove any existing alerts first
  const existingAlerts = document.querySelectorAll('.security-alert');
  existingAlerts.forEach(alert => alert.remove());
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `security-alert ${isDanger ? 'alert-danger' : 'alert-success'}`;
  alertDiv.innerHTML = `
    <i class="fas ${isDanger ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
    ${message}
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv);
    }
  }, 5000);
}

// Check authentication state
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        userData = docSnap.data();
        updateUIForLoggedInUser();
      } else {
        showSecurityAlert("User data not found. Please contact support.");
        await signOut(auth);
        currentUser = null;
        userData = null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showSecurityAlert("Error loading user data. Please try again.");
    }
  } else {
    currentUser = null;
    userData = null;
    updateUIForLoggedOutUser();
  }
});

// Update UI for logged in user
function updateUIForLoggedInUser() {
  // Show protected navigation items
  document.getElementById('transaction-nav').style.display = 'block';
  document.getElementById('stego-nav').style.display = 'block';
  
  // Update account badge
  if (userData) {
    document.getElementById('user-account-badge').textContent = userData.accountNumber;
  }
  
  // Switch to transaction view after login
  showModule('transaction');
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
  // Hide protected navigation items
  document.getElementById('transaction-nav').style.display = 'none';
  document.getElementById('stego-nav').style.display = 'none';
  
  // Clear account badge
  document.getElementById('user-account-badge').textContent = '';
  
  // Switch to home view after logout
  showModule('home');
}

// Navigation functionality
document.querySelectorAll('.nav-btn').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-target');
    
    // Check if user is trying to access protected routes without authentication
    if ((target === 'transaction' || target === 'stego') && !currentUser) {
      showSecurityAlert("DANGER! UNKNOWN USER TRYING TO ACCESS PROTECTED AREA");
      showModule('login');
      return;
    }
    
    showModule(target);
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');
  });
});

function showModule(moduleId) {
  // Hide all modules
  document.querySelectorAll('.module').forEach(module => {
    module.classList.remove('active');
  });
  
  // Show the selected module
  document.getElementById(moduleId).classList.add('active');
}

// Transaction type toggle
document.getElementById('transaction-type').addEventListener('change', function() {
  const amountField = document.getElementById('amount-field');
  const recipientField = document.getElementById('recipient-field');
  
  if (this.value === 'balance') {
    amountField.style.display = 'none';
    recipientField.style.display = 'none';
  } else if (this.value === 'transfer') {
    amountField.style.display = 'block';
    recipientField.style.display = 'block';
  } else {
    amountField.style.display = 'block';
    recipientField.style.display = 'none';
  }
});

// Steganography action toggle
document.getElementById('stego-action').addEventListener('change', function() {
  if (this.value === 'encode') {
    document.getElementById('encode-section').style.display = 'block';
    document.getElementById('decode-section').style.display = 'none';
  } else {
    document.getElementById('encode-section').style.display = 'none';
    document.getElementById('decode-section').style.display = 'block';
  }
});

// Image preview for cover image
document.getElementById('cover-image').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = document.getElementById('cover-preview');
      img.src = event.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Image preview for stego image
document.getElementById('stego-image').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = document.getElementById('stego-preview');
      img.src = event.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Registration functionality
document.getElementById("register-btn").addEventListener("click", async () => {
  const fullName = document.getElementById("fullname").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const initialDeposit = document.getElementById("initial-deposit").value;

  if (fullName && email && password && initialDeposit) {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate random account number
      const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

      // Save user data in Firestore
      const userData = {
        uid: user.uid,
        accountNumber,
        fullName,
        email,
        balance: parseFloat(initialDeposit),
        transactions: [{
          date: new Date().toLocaleDateString(),
          type: "Deposit",
          amount: parseFloat(initialDeposit),
          balance: parseFloat(initialDeposit)
        }]
      };

      await setDoc(doc(db, "users", user.uid), userData);

      // Show account info
      document.getElementById("generated-account").textContent = accountNumber;
      document.getElementById("initial-balance").textContent = initialDeposit;
      document.getElementById("account-info").style.display = "block";

      showSecurityAlert("Account created successfully!", false);
    } catch (error) {
      showSecurityAlert("Error: " + error.message);
    }
  } else {
    showSecurityAlert("Please fill all fields");
  }
});

// Login functionality
document.getElementById('login-btn').addEventListener('click', async function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pin').value;

  if (email && password) {
    try {
      // Sign in Firebase user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch data from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        showSecurityAlert(`Login successful! Welcome ${userData.fullName}`, false);
        showModule('transaction');
      } else {
        showSecurityAlert("No user data found!");
      }
    } catch (error) {
      showSecurityAlert("DANGER! UNKNOWN USER TRYING TO HACK THIS FILE");
    }
  } else {
    showSecurityAlert('Please enter email and password');
  }
});

// Transaction functionality
document.getElementById('transaction-btn').addEventListener('click', async function() {
  if (!currentUser) {
    showSecurityAlert("DANGER! UNAUTHORIZED ACCESS ATTEMPT");
    showModule('login');
    return;
  }

  const transactionType = document.getElementById('transaction-type').value;
  const amount = document.getElementById('amount').value;
  const recipient = document.getElementById('recipient').value;
  
  try {
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      showSecurityAlert("User data not found!");
      return;
    }
    
    const userData = docSnap.data();
    let message = '';
    let updatedData = {...userData};
    
    if (transactionType === 'balance') {
      message = `Your account balance is: $${userData.balance}`;
    } else if (transactionType === 'deposit') {
      updatedData.balance += parseFloat(amount);
      updatedData.transactions = arrayUnion({
        date: new Date().toLocaleDateString(),
        type: 'Deposit',
        amount: parseFloat(amount),
        balance: updatedData.balance
      });
      message = `Successfully deposited $${amount}. New balance: $${updatedData.balance}`;
    } else if (transactionType === 'withdraw') {
      if (userData.balance >= parseFloat(amount)) {
        updatedData.balance -= parseFloat(amount);
        updatedData.transactions = arrayUnion({
          date: new Date().toLocaleDateString(),
          type: 'Withdrawal',
          amount: parseFloat(amount),
          balance: updatedData.balance
        });
        message = `Successfully withdrew $${amount}. New balance: $${updatedData.balance}`;
      } else {
        showSecurityAlert('Insufficient funds');
        return;
      }
    } else if (transactionType === 'transfer') {
      if (userData.balance >= parseFloat(amount)) {
        // In a real app, you would also update the recipient's account
        updatedData.balance -= parseFloat(amount);
        updatedData.transactions = arrayUnion({
          date: new Date().toLocaleDateString(),
          type: 'Transfer',
          amount: parseFloat(amount),
          balance: updatedData.balance,
          recipient: recipient
        });
        message = `Successfully transferred $${amount} to account ${recipient}. New balance: $${updatedData.balance}`;
      } else {
        showSecurityAlert('Insufficient funds');
        return;
      }
    }
    
    // Save updated data to Firestore
    await updateDoc(docRef, updatedData);
    
    // Update transaction history
    updateTransactionHistory(updatedData.transactions);
    
    // Show result
    document.getElementById('transaction-details').textContent = message;
    document.getElementById('transaction-result').style.display = 'block';
    
    showSecurityAlert("Transaction completed successfully!", false);
  } catch (error) {
    showSecurityAlert("Transaction error: " + error.message);
  }
});

function updateTransactionHistory(transactions) {
  const tableBody = document.getElementById('transaction-table');
  tableBody.innerHTML = '';
  
  if (transactions.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No transactions yet</td></tr>';
    return;
  }
  
  // Show latest 5 transactions
  const recentTransactions = transactions.slice(-5).reverse();
  
  recentTransactions.forEach(transaction => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${transaction.type}</td>
      <td>$${transaction.amount}</td>
      <td>$${transaction.balance}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Encryption function using Web Crypto API
async function encryptMessage(message, password) {
  // Convert password to key
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Hash the password to get a 256-bit key
  const passwordHash = await crypto.subtle.digest('SHA-256', passwordData);
  
  // Generate a random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Import the key
  const key = await crypto.subtle.importKey(
    'raw',
    passwordHash,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Encrypt the message
  const encodedMessage = encoder.encode(message);
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encodedMessage
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  // Return as base64 for easy storage
  return btoa(String.fromCharCode.apply(null, combined));
}

// Decryption function using Web Crypto API
async function decryptMessage(encryptedBase64, password) {
  try {
    // Convert base64 back to bytes
    const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes)
    const iv = encryptedData.slice(0, 12);
    
    // Extract actual encrypted data (after first 12 bytes)
    const data = encryptedData.slice(12);
    
    // Convert password to key
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Hash the password to get a 256-bit key
    const passwordHash = await crypto.subtle.digest('SHA-256', passwordData);
    
    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      passwordHash,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt the message
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );
    
    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error('Decryption failed. Wrong key or corrupted data.');
  }
}

// Steganography functionality
document.getElementById('encode-btn').addEventListener('click', async function() {
  if (!currentUser) {
    showSecurityAlert("DANGER! UNAUTHORIZED ACCESS ATTEMPT");
    showModule('login');
    return;
  }

  const message = document.getElementById('secret-message').value;
  const key = document.getElementById('encryption-key').value;
  const fileInput = document.getElementById('cover-image');
  
  if (!fileInput.files.length) {
    showSecurityAlert('Please select an image file');
    return;
  }
  
  if (!key || key.length < 8) {
    showSecurityAlert('Please enter an encryption key with at least 8 characters');
    return;
  }
  
  if (message && key) {
    try {
      // Show loading state
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting...';
      this.disabled = true;
      
      // Encrypt the message first
      const encryptedMessage = await encryptMessage(message, key);
      const fullMessage = encryptedMessage + "###"; // ### as end marker
      
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = async function(event) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.getElementById('encode-canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas dimensions to match the image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);
          
          // Get the image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Convert message to binary
          const binaryMessage = textToBinary(fullMessage);
          
          // Check if message fits in the image
          if (binaryMessage.length > data.length * 4) {
            showSecurityAlert('Message is too long for this image. Please use a larger image or shorter message.');
            return;
          }
          
          // Encode the message in the image LSB
          let messageIndex = 0;
          for (let i = 0; i < data.length; i += 4) {
            // For each pixel (R, G, B, A)
            for (let j = 0; j < 3; j++) { // Only modify R, G, B (not A)
              if (messageIndex < binaryMessage.length) {
                // Replace the LSB with the message bit
                data[i + j] = (data[i + j] & 0xFE) | parseInt(binaryMessage[messageIndex]);
                messageIndex++;
              }
            }
          }
          
          // Put the modified image data back to the canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Show the canvas
          canvas.style.display = 'block';
          
          // Show download button
          document.getElementById('encode-result').style.display = 'block';
          
          // Reset button
          document.getElementById('encode-btn').innerHTML = 'Encrypt & Encode Message';
          document.getElementById('encode-btn').disabled = false;
          
          showSecurityAlert("Message encrypted and encoded successfully!", false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showSecurityAlert('Error: ' + error.message);
      document.getElementById('encode-btn').innerHTML = 'Encrypt & Encode Message';
      document.getElementById('encode-btn').disabled = false;
    }
  } else {
    showSecurityAlert('Please enter a message and encryption key');
  }
});

// Download stego image
document.getElementById('download-btn').addEventListener('click', function() {
  const canvas = document.getElementById('encode-canvas');
  const link = document.createElement('a');
  link.download = 'secure-stego-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Decode functionality
document.getElementById('decode-btn').addEventListener('click', async function() {
  if (!currentUser) {
    showSecurityAlert("DANGER! UNAUTHORIZED ACCESS ATTEMPT");
    showModule('login');
    return;
  }

  const key = document.getElementById('decryption-key').value;
  const fileInput = document.getElementById('stego-image');
  
  if (!fileInput.files.length) {
    showSecurityAlert('Please select an image file');
    return;
  }
  
  if (key) {
    try {
      // Show loading state
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Decrypting...';
      this.disabled = true;
      
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas dimensions to match the image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);
          
          // Get the image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Extract the LSBs from the image
          let binaryMessage = '';
          for (let i = 0; i < data.length; i += 4) {
            // For each pixel (R, G, B, A)
            for (let j = 0; j < 3; j++) { // Only read R, G, B (not A)
              // Get the LSB
              binaryMessage += (data[i + j] & 1).toString();
            }
          }
          
          // Convert binary to text
          const message = binaryToText(binaryMessage);
          
          // Check for end marker
          const endMarker = message.indexOf('###');
          if (endMarker !== -1) {
            // Extract the encrypted message (before the ### marker)
            const encryptedMessage = message.substring(0, endMarker);
            
            // Decrypt the message
            decryptMessage(encryptedMessage, key)
              .then(decryptedMessage => {
                // Display the decoded message
                document.getElementById('decoded-message').value = decryptedMessage;
                document.getElementById('decode-result').style.display = 'block';
                
                // Reset button
                document.getElementById('decode-btn').innerHTML = 'Decode & Decrypt Message';
                document.getElementById('decode-btn').disabled = false;
                
                showSecurityAlert("Message decoded and decrypted successfully!", false);
              })
              .catch(error => {
                showSecurityAlert("DANGER! UNAUTHORIZED DECODE ATTEMPT. INCORRECT PASSWORD.");
                document.getElementById('decode-btn').innerHTML = 'Decode & Decrypt Message';
                document.getElementById('decode-btn').disabled = false;
              });
          } else {
            showSecurityAlert("DANGER! UNAUTHORIZED DECODE ATTEMPT. INCORRECT PASSWORD.");
            document.getElementById('decode-btn').innerHTML = 'Decode & Decrypt Message';
            document.getElementById('decode-btn').disabled = false;
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showSecurityAlert('Error: ' + error.message);
      document.getElementById('decode-btn').innerHTML = 'Decode & Decrypt Message';
      document.getElementById('decode-btn').disabled = false;
    }
  } else {
    showSecurityAlert('Please enter a decryption key');
  }
});

// Helper function to convert text to binary
function textToBinary(text) {
  return text.split('').map(char => {
    const binary = char.charCodeAt(0).toString(2);
    return '0'.repeat(8 - binary.length) + binary;
  }).join('');
}

// Helper function to convert binary to text
function binaryToText(binary) {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    if (byte.length === 8) {
      text += String.fromCharCode(parseInt(byte, 2));
    }
  }
  return text;
}

// Logout functionality
function setupLogout() {
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'nav-btn';
  logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showSecurityAlert("Logged out successfully", false);
    } catch (error) {
      showSecurityAlert("Error during logout: " + error.message);
    }
  });
  
  document.querySelector('nav').appendChild(logoutBtn);
}

// Initialize with some demo transaction data if none exists
window.addEventListener('load', function() {
  setupLogout();
  
  const accountNumber = '1234567890';
  if (!localStorage.getItem(accountNumber)) {
    const demoData = {
      accountNumber: accountNumber,
      fullName: 'Demo User',
      balance: 5000,
      transactions: [
        {
          date: new Date().toLocaleDateString(),
          type: 'Deposit',
          amount: 5000,
          balance: 5000
        }
      ]
    };
    localStorage.setItem(accountNumber, JSON.stringify(demoData));
    updateTransactionHistory(demoData.transactions);
  } else {
    const userData = JSON.parse(localStorage.getItem(accountNumber));
    updateTransactionHistory(userData.transactions);
  }
});

