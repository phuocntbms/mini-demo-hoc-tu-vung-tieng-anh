// Categories Management Module
const Categories = {
    // Initialize categories
    init() {
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
    },

    // Show categories management page
    showCategoriesPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mx-auto">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Vocabulary Categories</h1>
                    <button onclick="Categories.showAddModal()" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Add New Category
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="mb-4">
                    <input type="text" id="categorySearch" 
                           class="w-full px-4 py-2 border rounded" 
                           placeholder="Search categories..."
                           oninput="Categories.handleSearch(this.value)">
                </div>

                <!-- Categories Table -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="categoriesTableBody" class="bg-white divide-y divide-gray-200">
                            ${this.renderCategoriesTable()}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="mt-4 flex justify-center">
                    ${this.renderPagination()}
                </div>
            </div>

            <!-- Add/Edit Category Modal -->
            <div id="categoryModal" class="modal fade" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalTitle">Add New Category</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="categoryForm">
                                <input type="hidden" id="categoryId">
                                <div class="mb-3">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-control" id="categoryName" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" id="categoryDescription" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="Categories.saveCategory()">Save</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div id="deleteModal" class="modal fade" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Delete Category</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to delete this category?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" onclick="Categories.confirmDelete()">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize Bootstrap modals
        this.modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        this.deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    },

    // Render categories table
    renderCategoriesTable() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedCategories = this.categories.slice(startIndex, endIndex);

        return paginatedCategories.map(category => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${category.name}</td>
                <td class="px-6 py-4">${category.description || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="Categories.showEditModal(${category.id})" 
                            class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onclick="Categories.showDeleteModal(${category.id})" 
                            class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    },

    // Render pagination
    renderPagination() {
        const totalPages = Math.ceil(this.categories.length / this.itemsPerPage);
        let pagination = '';

        for (let i = 1; i <= totalPages; i++) {
            pagination += `
                <button onclick="Categories.goToPage(${i})" 
                        class="mx-1 px-3 py-1 rounded ${i === this.currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}">
                    ${i}
                </button>
            `;
        }

        return pagination;
    },

    // Show add category modal
    showAddModal() {
        document.getElementById('modalTitle').textContent = 'Add New Category';
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
        this.modal.show();
    },

    // Show edit category modal
    showEditModal(id) {
        const category = this.categories.find(c => c.id === id);
        if (category) {
            document.getElementById('modalTitle').textContent = 'Edit Category';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description || '';
            this.modal.show();
        }
    },

    // Show delete confirmation modal
    showDeleteModal(id) {
        this.categoryToDelete = id;
        this.deleteModal.show();
    },

    // Save category
    saveCategory() {
        const id = document.getElementById('categoryId').value;
        const name = document.getElementById('categoryName').value;
        const description = document.getElementById('categoryDescription').value;

        if (!name) {
            alert('Category name is required');
            return;
        }

        if (id) {
            // Update existing category
            const index = this.categories.findIndex(c => c.id === parseInt(id));
            if (index !== -1) {
                this.categories[index] = { ...this.categories[index], name, description };
            }
        } else {
            // Add new category
            const newCategory = {
                id: Date.now(),
                name,
                description,
                createdAt: new Date().toISOString()
            };
            this.categories.push(newCategory);
        }

        localStorage.setItem('categories', JSON.stringify(this.categories));
        this.modal.hide();
        this.showCategoriesPage();
    },

    // Confirm delete category
    confirmDelete() {
        if (this.categoryToDelete) {
            this.categories = this.categories.filter(c => c.id !== this.categoryToDelete);
            localStorage.setItem('categories', JSON.stringify(this.categories));
            this.deleteModal.hide();
            this.showCategoriesPage();
        }
    },

    // Handle search
    handleSearch(query) {
        const searchTerm = query.toLowerCase();
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.categories = this.categories.filter(category => 
            category.name.toLowerCase().includes(searchTerm) ||
            (category.description && category.description.toLowerCase().includes(searchTerm))
        );
        this.currentPage = 1;
        this.showCategoriesPage();
    },

    // Go to specific page
    goToPage(page) {
        this.currentPage = page;
        this.showCategoriesPage();
    }
}; 