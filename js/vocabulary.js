// Vocabulary Management Module
const Vocabulary = {
    // Initialize vocabulary
    init() {
        this.vocabulary = JSON.parse(localStorage.getItem('vocabulary')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentCategory = null;
    },

    // Show vocabulary management page
    showVocabularyPage(categoryId = null) {
        this.currentCategory = categoryId;
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Vocabulary Words</h1>
                    <button onclick="Vocabulary.showAddModal()" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Add New Word
                    </button>
                </div>

                <!-- Category Filter -->
                <div class="mb-4">
                    <select id="categoryFilter" class="w-full px-4 py-2 border rounded" onchange="Vocabulary.filterByCategory(this.value)">
                        <option value="">All Categories</option>
                        ${this.categories.map(category => `
                            <option value="${category.id}" ${this.currentCategory === category.id ? 'selected' : ''}>
                                ${category.name}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Search Bar -->
                <div class="mb-4">
                    <input type="text" id="vocabularySearch" 
                           class="w-full px-4 py-2 border rounded" 
                           placeholder="Search vocabulary..."
                           oninput="Vocabulary.handleSearch(this.value)">
                </div>

                <!-- Vocabulary Table -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meaning</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="vocabularyTableBody" class="bg-white divide-y divide-gray-200">
                            ${this.renderVocabularyTable()}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="mt-4 flex justify-center">
                    ${this.renderPagination()}
                </div>
            </div>

            <!-- Add/Edit Word Modal -->
            <div id="vocabularyModal" class="modal fade" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalTitle">Add New Word</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="vocabularyForm">
                                <input type="hidden" id="wordId">
                                <div class="mb-3">
                                    <label class="form-label">Word</label>
                                    <input type="text" class="form-control" id="word" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Meaning</label>
                                    <textarea class="form-control" id="meaning" rows="3" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Category</label>
                                    <select class="form-control" id="category" required>
                                        <option value="">Select Category</option>
                                        ${this.categories.map(category => `
                                            <option value="${category.id}">${category.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="Vocabulary.saveWord()">Save</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div id="deleteModal" class="modal fade" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Delete Word</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to delete this word?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" onclick="Vocabulary.confirmDelete()">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize Bootstrap modals
        this.modal = new bootstrap.Modal(document.getElementById('vocabularyModal'));
        this.deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    },

    // Render vocabulary table
    renderVocabularyTable() {
        let filteredVocabulary = this.vocabulary;
        
        // Filter by category if selected
        if (this.currentCategory) {
            filteredVocabulary = filteredVocabulary.filter(word => word.categoryId === this.currentCategory);
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedVocabulary = filteredVocabulary.slice(startIndex, endIndex);

        return paginatedVocabulary.map(word => {
            const category = this.categories.find(c => c.id === word.categoryId);
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${word.word}</td>
                    <td class="px-6 py-4">${word.meaning}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${category ? category.name : 'Uncategorized'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button onclick="Vocabulary.showEditModal(${word.id})" 
                                class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button onclick="Vocabulary.showDeleteModal(${word.id})" 
                                class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Render pagination
    renderPagination() {
        let filteredVocabulary = this.vocabulary;
        if (this.currentCategory) {
            filteredVocabulary = filteredVocabulary.filter(word => word.categoryId === this.currentCategory);
        }
        
        const totalPages = Math.ceil(filteredVocabulary.length / this.itemsPerPage);
        let pagination = '';

        for (let i = 1; i <= totalPages; i++) {
            pagination += `
                <button onclick="Vocabulary.goToPage(${i})" 
                        class="mx-1 px-3 py-1 rounded ${i === this.currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}">
                    ${i}
                </button>
            `;
        }

        return pagination;
    },

    // Show add word modal
    showAddModal() {
        document.getElementById('modalTitle').textContent = 'Add New Word';
        document.getElementById('vocabularyForm').reset();
        document.getElementById('wordId').value = '';
        this.modal.show();
    },

    // Show edit word modal
    showEditModal(id) {
        const word = this.vocabulary.find(w => w.id === id);
        if (word) {
            document.getElementById('modalTitle').textContent = 'Edit Word';
            document.getElementById('wordId').value = word.id;
            document.getElementById('word').value = word.word;
            document.getElementById('meaning').value = word.meaning;
            document.getElementById('category').value = word.categoryId;
            this.modal.show();
        }
    },

    // Show delete confirmation modal
    showDeleteModal(id) {
        this.wordToDelete = id;
        this.deleteModal.show();
    },

    // Save word
    saveWord() {
        const id = document.getElementById('wordId').value;
        const word = document.getElementById('word').value;
        const meaning = document.getElementById('meaning').value;
        const categoryId = document.getElementById('category').value;

        if (!word || !meaning || !categoryId) {
            alert('All fields are required');
            return;
        }

        if (id) {
            // Update existing word
            const index = this.vocabulary.findIndex(w => w.id === parseInt(id));
            if (index !== -1) {
                this.vocabulary[index] = { ...this.vocabulary[index], word, meaning, categoryId };
            }
        } else {
            // Add new word
            const newWord = {
                id: Date.now(),
                word,
                meaning,
                categoryId: parseInt(categoryId),
                createdAt: new Date().toISOString()
            };
            this.vocabulary.push(newWord);
        }

        localStorage.setItem('vocabulary', JSON.stringify(this.vocabulary));
        this.modal.hide();
        this.showVocabularyPage(this.currentCategory);
    },

    // Confirm delete word
    confirmDelete() {
        if (this.wordToDelete) {
            this.vocabulary = this.vocabulary.filter(w => w.id !== this.wordToDelete);
            localStorage.setItem('vocabulary', JSON.stringify(this.vocabulary));
            this.deleteModal.hide();
            this.showVocabularyPage(this.currentCategory);
        }
    },

    // Filter by category
    filterByCategory(categoryId) {
        this.currentCategory = categoryId ? parseInt(categoryId) : null;
        this.currentPage = 1;
        this.showVocabularyPage(this.currentCategory);
    },

    // Handle search
    handleSearch(query) {
        const searchTerm = query.toLowerCase();
        this.vocabulary = JSON.parse(localStorage.getItem('vocabulary')) || [];
        this.vocabulary = this.vocabulary.filter(word => 
            word.word.toLowerCase().includes(searchTerm) ||
            word.meaning.toLowerCase().includes(searchTerm)
        );
        this.currentPage = 1;
        this.showVocabularyPage(this.currentCategory);
    },

    // Go to specific page
    goToPage(page) {
        this.currentPage = page;
        this.showVocabularyPage(this.currentCategory);
    }
}; 