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

        // Show initial page based on auth state
        if (Auth.currentUser) {
            this.showDashboard();
        } else {
            Auth.showLoginForm();
        }
    },

    // Set up routing
    setupRouting() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.handleRoute(hash);
        });
    },

    // Handle routing
    handleRoute(route) {
        if (!Auth.currentUser && route !== 'login' && route !== 'register') {
            Auth.showLoginForm();
            return;
        }

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
                this.showDashboard();
        }
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