// Authentication Module
const Auth = {
    // Initialize auth state
    init() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.updateNavigation();
    },

    // Update navigation based on auth state
    updateNavigation() {
        const navItems = document.getElementById('navItems');
        if (this.currentUser) {
            navItems.innerHTML = `
                <div class="flex items-center space-x-4">
                    <span class="text-gray-700">Welcome, ${this.currentUser.firstName}</span>
                    <button onclick="Auth.logout()" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Logout
                    </button>
                </div>
            `;
        } else {
            navItems.innerHTML = `
                <div class="flex items-center space-x-4">
                    <button onclick="Auth.showLoginForm()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Login
                    </button>
                    <button onclick="Auth.showRegisterForm()" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Register
                    </button>
                </div>
            `;
        }
    },

    // Show login form
    showLoginForm() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 mb-2">Email</label>
                        <input type="email" id="loginEmail" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">Password</label>
                        <input type="password" id="loginPassword" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                        Login
                    </button>
                </form>
                <div id="loginError" class="mt-4 text-red-500 text-center"></div>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
    },

    // Show register form
    showRegisterForm() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
                <form id="registerForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 mb-2">First Name</label>
                        <input type="text" id="firstName" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">Last Name</label>
                        <input type="text" id="lastName" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">Email</label>
                        <input type="email" id="email" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">Password</label>
                        <input type="password" id="password" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">Confirm Password</label>
                        <input type="password" id="confirmPassword" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <button type="submit" class="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
                        Register
                    </button>
                </form>
                <div id="registerError" class="mt-4 text-red-500 text-center"></div>
            </div>
        `;

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
    },

    // Validate password
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
    },

    // Register new user
    register() {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorDiv = document.getElementById('registerError');

        // Validation
        if (!firstName || !lastName) {
            errorDiv.textContent = 'First Name and Last Name are required';
            return;
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errorDiv.textContent = 'Please enter a valid email address';
            return;
        }

        if (this.users.some(user => user.email === email)) {
            errorDiv.textContent = 'Email already exists';
            return;
        }

        if (!this.validatePassword(password)) {
            errorDiv.textContent = 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers';
            return;
        }

        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            return;
        }

        // Create new user
        const newUser = {
            firstName,
            lastName,
            email,
            password // In a real app, this should be hashed
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        // Show success message and redirect to login
        alert('Registration successful! Please login.');
        this.showLoginForm();
    },

    // Login user
    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateNavigation();
            // Redirect to dashboard
            window.location.href = '#dashboard';
        } else {
            errorDiv.textContent = 'Invalid email or password';
        }
    },

    // Logout user
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.updateNavigation();
            this.showLoginForm();
        }
    }
};

// Initialize auth when the page loads
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
}); 