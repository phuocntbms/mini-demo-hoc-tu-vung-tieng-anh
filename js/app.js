// Main Application Module
const App = {
    // Initialize application
    init() {
        // Initialize all modules
        Auth.init();
        Categories.init();
        Vocabulary.init();
        Flashcard.init();
        Quiz.init();

        // Set up routing
        this.setupRouting();

        // Start URL monitoring
        this.startUrlMonitoring();

        // Handle initial route
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.handleRoute(hash);
    },

    // Start URL monitoring
    startUrlMonitoring() {
        let previousUrl = window.location.href;
        
        // Function to check URL changes
        const checkUrl = () => {
            const currentUrl = window.location.href;
            if (currentUrl !== previousUrl) {
                console.log('URL changed:', currentUrl);
                previousUrl = currentUrl;
                // Reload data when URL changes
                // this.reloadData();
                window.location.reload();
            }
            // Continue monitoring
            setTimeout(checkUrl, 100);
        };

        // Start monitoring
        checkUrl();
    },

    // Reload data from localStorage
    reloadData() {
        // Reload categories
        Categories.categories = JSON.parse(localStorage.getItem('categories')) || [];
        
        // Reload vocabulary
        Vocabulary.vocabulary = JSON.parse(localStorage.getItem('vocabulary')) || [];
        
        // Reload quiz history
        Quiz.quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
        
        // Reload learned words
        Flashcard.learnedWords = JSON.parse(localStorage.getItem('learnedWords')) || [];
    },

    // Set up routing
    setupRouting() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.handleRoute(hash);
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.handleRoute(hash);
        });
    },

    // Handle routing
    handleRoute(route) {
        // Prevent default hash behavior
        if (route !== 'login' && route !== 'register' && !Auth.currentUser) {
            window.location.href = '#login';
            return;
        }

        // Update active navigation item
        this.updateActiveNav(route);

        // Reload data before showing page
        this.reloadData();

        // Handle route
        switch (route) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'categories':
                Categories.showCategoriesPage();
                break;
            case 'vocabulary':
                Vocabulary.showVocabularyPage();
                break;
            case 'flashcard':
                Flashcard.showFlashcardPage();
                break;
            case 'quiz':
                Quiz.showQuizPage();
                break;
            case 'login':
                Auth.showLoginForm();
                break;
            case 'register':
                Auth.showRegisterForm();
                break;
            default:
                window.location.href = '#dashboard';
        }
    },

    // Update active navigation item
    updateActiveNav(route) {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${route}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    // Navigate to a route
    navigate(route) {
        window.location.href = `#${route}`;
        console.log('Navigating to:', route);
        window.location.reload();
    },

    // Show dashboard
    showDashboard() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto">
                <h1 class="text-3xl font-bold mb-8">Welcome, ${Auth.currentUser.firstName}!</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Categories Card -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold mb-4">Categories</h2>
                        <p class="text-gray-600 mb-4">Manage your vocabulary categories</p>
                        <a href="#categories" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Go to Categories
                        </a>
                    </div>

                    <!-- Vocabulary Card -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold mb-4">Vocabulary</h2>
                        <p class="text-gray-600 mb-4">Manage your vocabulary words</p>
                        <a href="#vocabulary" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Go to Vocabulary
                        </a>
                    </div>

                    <!-- Flashcard Card -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold mb-4">Flashcards</h2>
                        <p class="text-gray-600 mb-4">Practice with flashcards</p>
                        <a href="#flashcard" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Start Learning
                        </a>
                    </div>

                    <!-- Quiz Card -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold mb-4">Quiz</h2>
                        <p class="text-gray-600 mb-4">Test your knowledge</p>
                        <a href="#quiz" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Take Quiz
                        </a>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="mt-8">
                    <h2 class="text-2xl font-bold mb-4">Recent Quiz Results</h2>
                    <div class="bg-white rounded-lg shadow overflow-hidden">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${this.renderRecentQuizzes()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // Render recent quizzes
    renderRecentQuizzes() {
        const recentQuizzes = Quiz.quizHistory
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        return recentQuizzes.map(quiz => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${new Date(quiz.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${quiz.category}</td>
                <td class="px-6 py-4 whitespace-nowrap">${quiz.score.toFixed(1)}%</td>
            </tr>
        `).join('');
    }
};

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    App.init();
}); 