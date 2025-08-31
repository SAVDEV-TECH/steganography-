   
        // Navigation functionality
        document.querySelectorAll('.nav-btn').forEach(button => {
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-target');
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
        document.getElementById('register-btn').addEventListener('click', function() {
            const fullName = document.getElementById('fullname').value;
            const initialDeposit = document.getElementById('initial-deposit').value;
            
            if (fullName && initialDeposit) {
                // Generate random account number
                const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
                
                // Show account info
                document.getElementById('generated-account').textContent = accountNumber;
                document.getElementById('initial-balance').textContent = initialDeposit;
                document.getElementById('account-info').style.display = 'block';
                
                // Simulate saving to database
                const userData = {
                    accountNumber: accountNumber,
                    fullName: fullName,
                    balance: parseFloat(initialDeposit),
                    transactions: [{
                        date: new Date().toLocaleDateString(),
                        type: 'Deposit',
                        amount: parseFloat(initialDeposit),
                        balance: parseFloat(initialDeposit)
                    }]
                };
                
                localStorage.setItem(accountNumber, JSON.stringify(userData));
                
                alert('Account created successfully! Your account number is: ' + accountNumber);
            } else {
                alert('Please fill all fields');
            }
        });
        
        // Login functionality
        document.getElementById('login-btn').addEventListener('click', function() {
            const accountNumber = document.getElementById('login-account').value;
            const pin = document.getElementById('login-pin').value;
            
            if (accountNumber && pin) {
                // In a real application, verify credentials with server
                const userData = JSON.parse(localStorage.getItem(accountNumber));
                
                if (userData) {
                    alert('Login successful! Welcome ' + userData.fullName);
                    showModule('transaction');
                } else {
                    alert('Invalid account number or PIN');
                }
            } else {
                alert('Please enter account number and PIN');
            }
        });
        
        // Transaction functionality
        document.getElementById('transaction-btn').addEventListener('click', function() {
            const transactionType = document.getElementById('transaction-type').value;
            const amount = document.getElementById('amount').value;
            const recipient = document.getElementById('recipient').value;
            
            // For demo purposes, we'll use a hardcoded account
            const accountNumber = '1234567890';
            const userData = JSON.parse(localStorage.getItem(accountNumber)) || {
                accountNumber: accountNumber,
                fullName: 'Demo User',
                balance: 5000,
                transactions: []
            };
            
            let message = '';
            
            if (transactionType === 'balance') {
                message = `Your account balance is: $${userData.balance}`;
            } else if (transactionType === 'deposit') {
                userData.balance += parseFloat(amount);
                userData.transactions.push({
                    date: new Date().toLocaleDateString(),
                    type: 'Deposit',
                    amount: parseFloat(amount),
                    balance: userData.balance
                });
                message = `Successfully deposited $${amount}. New balance: $${userData.balance}`;
            } else if (transactionType === 'withdraw') {
                if (userData.balance >= parseFloat(amount)) {
                    userData.balance -= parseFloat(amount);
                    userData.transactions.push({
                        date: new Date().toLocaleDateString(),
                        type: 'Withdrawal',
                        amount: parseFloat(amount),
                        balance: userData.balance
                    });
                    message = `Successfully withdrew $${amount}. New balance: $${userData.balance}`;
                } else {
                    message = 'Insufficient funds';
                }
            }
            
            // Save updated data
            localStorage.setItem(accountNumber, JSON.stringify(userData));
            
            // Update transaction history
            updateTransactionHistory(userData.transactions);
            
            // Show result
            document.getElementById('transaction-details').textContent = message;
            document.getElementById('transaction-result').style.display = 'block';
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
            const message = document.getElementById('secret-message').value;
            const key = document.getElementById('encryption-key').value;
            const fileInput = document.getElementById('cover-image');
            
            if (!fileInput.files.length) {
                alert('Please select an image file');
                return;
            }
            
            if (!key || key.length < 8) {
                alert('Please enter an encryption key with at least 8 characters');
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
                                alert('Message is too long for this image. Please use a larger image or shorter message.');
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
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    alert('Error: ' + error.message);
                    document.getElementById('encode-btn').innerHTML = 'Encrypt & Encode Message';
                    document.getElementById('encode-btn').disabled = false;
                }
            } else {
                alert('Please enter a message and encryption key');
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
            const key = document.getElementById('decryption-key').value;
            const fileInput = document.getElementById('stego-image');
            
            if (!fileInput.files.length) {
                alert('Please select an image file');
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
                                    })
                                    .catch(error => {
                                        alert('Decryption failed: ' + error.message);
                                        document.getElementById('decode-btn').innerHTML = 'Decode & Decrypt Message';
                                        document.getElementById('decode-btn').disabled = false;
                                    });
                            } else {
                                alert('No hidden message found or incorrect encryption key');
                                document.getElementById('decode-btn').innerHTML = 'Decode & Decrypt Message';
                                document.getElementById('decode-btn').disabled = false;
                            }
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    alert('Error: ' + error.message);
                    document.getElementById('decode-btn').innerHTML = 'Decode & Decrypt Message';
                    document.getElementById('decode-btn').disabled = false;
                }
            } else {
                alert('Please enter a decryption key');
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
        
        // Initialize with some demo transaction data if none exists
        window.addEventListener('load', function() {
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
