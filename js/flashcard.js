// Flashcard Learning Module
const Flashcard = {
    // Initialize flashcard
    init() {
        this.vocabulary = JSON.parse(localStorage.getItem('vocabulary')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentCategory = null;
        this.learnedWords = JSON.parse(localStorage.getItem('learnedWords')) || [];
    },

    // Show flashcard page
    showFlashcardPage(categoryId = null) {
        this.currentCategory = categoryId;
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Flashcard Learning</h1>
                </div>

                <!-- Category Filter -->
                <div class="mb-4">
                    <select id="categoryFilter" class="w-full px-4 py-2 border rounded" onchange="Flashcard.filterByCategory(this.value)">
                        <option value="">All Categories</option>
                        ${this.categories.map(category => `
                            <option value="${category.id}" ${this.currentCategory === category.id ? 'selected' : ''}>
                                ${category.name}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Flashcard Container -->
                <div class="max-w-2xl mx-auto">
                    <div class="flashcard mb-8" onclick="Flashcard.flipCard()">
                        <div class="flashcard-inner">
                            <div class="flashcard-front bg-white p-8 rounded-lg shadow-lg">
                                <h2 class="text-3xl font-bold text-center" id="cardWord">Loading...</h2>
                            </div>
                            <div class="flashcard-back bg-gray-50 p-8 rounded-lg shadow-lg">
                                <h2 class="text-3xl font-bold text-center" id="cardMeaning">Loading...</h2>
                            </div>
                        </div>
                    </div>

                    <!-- Controls -->
                    <div class="flex justify-center space-x-4">
                        <button onclick="Flashcard.previousCard()" 
                                class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Previous
                        </button>
                        <button onclick="Flashcard.markAsLearned()" 
                                class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                            Mark as Learned
                        </button>
                        <button onclick="Flashcard.nextCard()" 
                                class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Next
                        </button>
                    </div>

                    <!-- Progress -->
                    <div class="mt-8">
                        <div class="flex justify-between mb-2">
                            <span>Progress</span>
                            <span id="progressText">0/0</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-blue-600 h-2.5 rounded-full" id="progressBar" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <!-- Word List -->
                <div class="mt-8">
                    <h2 class="text-xl font-bold mb-4">Word List</h2>
                    <div class="bg-white rounded-lg shadow overflow-hidden">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meaning</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody id="wordListBody" class="bg-white divide-y divide-gray-200">
                                ${this.renderWordList()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.currentIndex = 0;
        this.updateCard();
    },

    // Get filtered vocabulary
    getFilteredVocabulary() {
        let filtered = this.vocabulary;
        if (this.currentCategory) {
            filtered = filtered.filter(word => word.categoryId === this.currentCategory);
        }
        return filtered;
    },

    // Update current card
    updateCard() {
        const filteredVocabulary = this.getFilteredVocabulary();
        if (filteredVocabulary.length === 0) {
            document.getElementById('cardWord').textContent = 'No words available';
            document.getElementById('cardMeaning').textContent = 'Add some words to get started';
            return;
        }

        const word = filteredVocabulary[this.currentIndex];
        document.getElementById('cardWord').textContent = word.word;
        document.getElementById('cardMeaning').textContent = word.meaning;
        this.updateProgress();
    },

    // Update progress
    updateProgress() {
        const filteredVocabulary = this.getFilteredVocabulary();
        const total = filteredVocabulary.length;
        const learned = filteredVocabulary.filter(word => 
            this.learnedWords.includes(word.id)
        ).length;
        
        const progress = (learned / total) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${learned}/${total}`;
    },

    // Flip card
    flipCard() {
        const card = document.querySelector('.flashcard');
        card.classList.toggle('flipped');
    },

    // Previous card
    previousCard() {
        const filteredVocabulary = this.getFilteredVocabulary();
        this.currentIndex = (this.currentIndex - 1 + filteredVocabulary.length) % filteredVocabulary.length;
        this.updateCard();
    },

    // Next card
    nextCard() {
        const filteredVocabulary = this.getFilteredVocabulary();
        this.currentIndex = (this.currentIndex + 1) % filteredVocabulary.length;
        this.updateCard();
    },

    // Mark word as learned
    markAsLearned() {
        const filteredVocabulary = this.getFilteredVocabulary();
        const currentWord = filteredVocabulary[this.currentIndex];
        
        if (!this.learnedWords.includes(currentWord.id)) {
            this.learnedWords.push(currentWord.id);
            localStorage.setItem('learnedWords', JSON.stringify(this.learnedWords));
            this.updateProgress();
            this.renderWordList();
        }
    },

    // Render word list
    renderWordList() {
        const filteredVocabulary = this.getFilteredVocabulary();
        return filteredVocabulary.map(word => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${word.word}</td>
                <td class="px-6 py-4">${word.meaning}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${this.learnedWords.includes(word.id) 
                        ? '<span class="text-green-600">Learned</span>' 
                        : '<span class="text-gray-600">Not Learned</span>'}
                </td>
            </tr>
        `).join('');
    },

    // Filter by category
    filterByCategory(categoryId) {
        this.currentCategory = categoryId ? parseInt(categoryId) : null;
        this.currentIndex = 0;
        this.showFlashcardPage(this.currentCategory);
    }
}; 