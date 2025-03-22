// Quiz Module
const Quiz = {
    // Initialize quiz
    init() {
        this.vocabulary = JSON.parse(localStorage.getItem('vocabulary')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.currentCategory = null;
        this.currentQuestion = 0;
        this.score = 0;
        this.quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
    },

    // Show quiz page
    showQuizPage(categoryId = null) {
        this.currentCategory = categoryId;
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Vocabulary Quiz</h1>
                    <button onclick="Quiz.startQuiz()" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Start Quiz
                    </button>
                </div>

                <!-- Category Filter -->
                <div class="mb-4">
                    <select id="categoryFilter" class="w-full px-4 py-2 border rounded" onchange="Quiz.filterByCategory(this.value)">
                        <option value="">All Categories</option>
                        ${this.categories.map(category => `
                            <option value="${category.id}" ${this.currentCategory === category.id ? 'selected' : ''}>
                                ${category.name}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Quiz Container -->
                <div id="quizContainer" class="hidden">
                    <!-- Progress Bar -->
                    <div class="mb-8">
                        <div class="flex justify-between mb-2">
                            <span>Progress</span>
                            <span id="quizProgress">0/0</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-blue-600 h-2.5 rounded-full" id="quizProgressBar" style="width: 0%"></div>
                        </div>
                    </div>

                    <!-- Question -->
                    <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <h2 class="text-2xl font-bold mb-4" id="questionText"></h2>
                        <div id="optionsContainer" class="space-y-4">
                            <!-- Options will be dynamically inserted here -->
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="flex justify-between">
                        <button onclick="Quiz.previousQuestion()" 
                                class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Previous
                        </button>
                        <button onclick="Quiz.nextQuestion()" 
                                class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Next
                        </button>
                    </div>
                </div>

                <!-- Results Container -->
                <div id="resultsContainer" class="hidden">
                    <div class="bg-white rounded-lg shadow-lg p-8 text-center">
                        <h2 class="text-2xl font-bold mb-4">Quiz Results</h2>
                        <div class="text-4xl font-bold mb-4" id="finalScore"></div>
                        <p class="mb-4" id="scoreMessage"></p>
                        <button onclick="Quiz.startQuiz()" 
                                class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                            Try Again
                        </button>
                    </div>
                </div>

                <!-- Quiz History -->
                <div class="mt-8">
                    <h2 class="text-xl font-bold mb-4">Quiz History</h2>
                    <div class="bg-white rounded-lg shadow overflow-hidden">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                </tr>
                            </thead>
                            <tbody id="quizHistoryBody" class="bg-white divide-y divide-gray-200">
                                ${this.renderQuizHistory()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // Start quiz
    startQuiz() {
        this.questions = this.generateQuestions();
        this.currentQuestion = 0;
        this.score = 0;
        this.userAnswers = new Array(this.questions.length).fill(null);

        document.getElementById('quizContainer').classList.remove('hidden');
        document.getElementById('resultsContainer').classList.add('hidden');
        this.showQuestion();
    },

    // Generate questions
    generateQuestions() {
        let filteredVocabulary = this.vocabulary;
        if (this.currentCategory) {
            filteredVocabulary = filteredVocabulary.filter(word => word.categoryId === this.currentCategory);
        }

        // Shuffle vocabulary
        const shuffled = [...filteredVocabulary].sort(() => Math.random() - 0.5);
        const questions = [];

        for (let i = 0; i < Math.min(10, shuffled.length); i++) {
            const correctWord = shuffled[i];
            const options = this.generateOptions(shuffled, correctWord);
            questions.push({
                word: correctWord.word,
                meaning: correctWord.meaning,
                options,
                correctIndex: Math.floor(Math.random() * 4)
            });
        }

        return questions;
    },

    // Generate options for a question
    generateOptions(vocabulary, correctWord) {
        const options = [correctWord.meaning];
        const otherWords = vocabulary.filter(word => word.id !== correctWord.id);

        // Shuffle other words and take 3
        const shuffled = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
        options.push(...shuffled.map(word => word.meaning));

        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    },

    // Show current question
    showQuestion() {
        const question = this.questions[this.currentQuestion];
        document.getElementById('questionText').textContent = `What is the meaning of "${question.word}"?`;
        
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <div class="quiz-option p-4 border rounded cursor-pointer hover:bg-gray-50"
                 onclick="Quiz.selectOption(${index})"
                 data-index="${index}">
                ${option}
            </div>
        `).join('');

        // Highlight previously selected answer
        if (this.userAnswers[this.currentQuestion] !== null) {
            this.highlightOption(this.userAnswers[this.currentQuestion]);
        }

        this.updateProgress();
    },

    // Select option
    selectOption(index) {
        this.userAnswers[this.currentQuestion] = index;
        this.highlightOption(index);
    },

    // Highlight selected option
    highlightOption(index) {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.classList.remove('bg-blue-100', 'bg-green-100', 'bg-red-100');
        });

        const selectedOption = options[index];
        const question = this.questions[this.currentQuestion];
        
        if (index === question.correctIndex) {
            selectedOption.classList.add('bg-green-100');
            this.score++;
        } else {
            selectedOption.classList.add('bg-red-100');
            options[question.correctIndex].classList.add('bg-green-100');
        }
    },

    // Update progress
    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('quizProgressBar').style.width = `${progress}%`;
        document.getElementById('quizProgress').textContent = `${this.currentQuestion + 1}/${this.questions.length}`;
    },

    // Previous question
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion();
        }
    },

    // Next question
    nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            this.showQuestion();
        } else {
            this.showResults();
        }
    },

    // Show results
    showResults() {
        const percentage = (this.score / this.questions.length) * 100;
        const category = this.categories.find(c => c.id === this.currentCategory);
        
        // Save to history
        this.quizHistory.push({
            date: new Date().toISOString(),
            category: category ? category.name : 'All Categories',
            score: percentage
        });
        localStorage.setItem('quizHistory', JSON.stringify(this.quizHistory));

        // Show results
        document.getElementById('quizContainer').classList.add('hidden');
        document.getElementById('resultsContainer').classList.remove('hidden');
        document.getElementById('finalScore').textContent = `${percentage}%`;
        document.getElementById('scoreMessage').textContent = 
            `You got ${this.score} out of ${this.questions.length} questions correct!`;
    },

    // Render quiz history
    renderQuizHistory() {
        return this.quizHistory
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(quiz => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${new Date(quiz.date).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${quiz.category}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${quiz.score.toFixed(1)}%</td>
                </tr>
            `).join('');
    },

    // Filter by category
    filterByCategory(categoryId) {
        this.currentCategory = categoryId ? parseInt(categoryId) : null;
        this.showQuizPage(this.currentCategory);
    }
}; 