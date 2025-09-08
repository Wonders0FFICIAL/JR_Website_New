let allArticles = [];
let currentCategory = 'All';

function initCategoryFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.textContent;
            filterArticles();
        });
    });
}

function initSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-bar button');

    searchInput.addEventListener('input', () => {
        filterArticles();
    });

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            filterArticles();
            searchInput.focus();
        } else {
            showAllArticles();
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBtn.click();
        }
    });
}

function collectAllArticles() {
    allArticles = [];

    const featuredMain = document.querySelector('.featured-main');
    if (featuredMain) {
        const title = featuredMain.querySelector('h2').textContent;
        const content = featuredMain.querySelector('p').textContent;
        const tags = Array.from(featuredMain.querySelectorAll('.tag')).map(tag => tag.textContent);
        allArticles.push({
            element: featuredMain,
            title,
            content,
            tags,
            type: 'featured-main'
        });
    }

    const sidebarPosts = document.querySelectorAll('.sidebar-post');
    sidebarPosts.forEach(post => {
        const title = post.querySelector('h3').textContent;
        const content = post.querySelector('p').textContent;
        const dateAuthorText = post.querySelector('.post-date').textContent;
        const author = dateAuthorText.split('•')[1] ? dateAuthorText.split('•')[1].trim() : '';

        allArticles.push({
            element: post,
            title,
            content,
            author,
            tags: [],
            type: 'sidebar'
        });
    });

    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        const content = card.querySelector('p').textContent;
        const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent);
        allArticles.push({
            element: card,
            title,
            content,
            tags,
            type: 'blog-card'
        });
    });
}

function filterArticles() {
    const query = document.querySelector('.search-bar input').value.toLowerCase().trim();
    let visibleCount = 0;

    allArticles.forEach(article => {
        const matchesSearch = !query ||
            article.title.toLowerCase().includes(query) ||
            article.content.toLowerCase().includes(query) ||
            (article.author && article.author.toLowerCase().includes(query)) ||
            article.tags.some(tag => tag.toLowerCase().includes(query));

        const matchesCategory = currentCategory === 'All' ||
            article.tags.some(tag => tag.toLowerCase() === currentCategory.toLowerCase()) ||
            (currentCategory.toLowerCase() === 'tutorials' && article.tags.some(tag => tag.toLowerCase() === 'tutorial'));

        const shouldShow = matchesSearch && matchesCategory;

        if (shouldShow) {
            article.element.style.display = '';
            article.element.style.animation = 'fadeIn 0.3s ease-in-out';
            visibleCount++;
        } else {
            article.element.style.display = 'none';
        }
    });

    updateSectionVisibility();
    showSearchResults(query, visibleCount);
}

function updateSectionVisibility() {
    const featuredSection = document.querySelector('.featured-section');
    const featuredVisible = allArticles.some(article =>
        article.type !== 'blog-card' && article.element.style.display !== 'none'
    );
    featuredSection.style.display = featuredVisible ? '' : 'none';

    const recentSection = document.querySelector('.recent-section');
    const recentVisible = allArticles.some(article =>
        article.type === 'blog-card' && article.element.style.display !== 'none'
    );
    recentSection.style.display = recentVisible ? '' : 'none';
}

function showSearchResults(query, count) {
    const existingMessage = document.querySelector('.search-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    if (query || currentCategory !== 'All') {
        const message = document.createElement('div');
        message.className = 'search-results-message';
        message.style.cssText = `
                    text-align: center;
                    padding: 20px 40px;
                    color: #ccc;
                    font-size: 1.1rem;
                    background: rgba(86, 56, 229, 0.1);
                    border: 1px solid rgba(86, 56, 229, 0.3);
                    border-radius: 10px;
                    margin: 0 40px 30px;
                `;

        let messageText = '';
        if (query && currentCategory !== 'All') {
            messageText = `Found ${count} article${count !== 1 ? 's' : ''} matching "${query}" in category "${currentCategory}"`;
        } else if (query) {
            messageText = `Found ${count} article${count !== 1 ? 's' : ''} matching "${query}"`;
        } else if (currentCategory !== 'All') {
            messageText = `Showing ${count} article${count !== 1 ? 's' : ''} in category "${currentCategory}"`;
        }

        if (count === 0) {
            messageText = query ?
                `No articles found matching "${query}"${currentCategory !== 'All' ? ` in category "${currentCategory}"` : ''}. Try different keywords or browse all articles.` :
                `No articles found in category "${currentCategory}". Try a different category.`;
            message.style.borderColor = 'rgba(255, 100, 100, 0.3)';
            message.style.backgroundColor = 'rgba(255, 100, 100, 0.1)';
        }

        message.innerHTML = `<i class="fas fa-search" style="margin-right: 10px;"></i>${messageText}`;

        const categoryFilter = document.querySelector('.category-filter');
        categoryFilter.parentNode.insertBefore(message, categoryFilter.nextSibling);
    }
}

function showAllArticles() {
    allArticles.forEach(article => {
        article.element.style.display = '';
        article.element.style.animation = 'fadeIn 0.3s ease-in-out';
    });
    updateSectionVisibility();

    const existingMessage = document.querySelector('.search-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

const style = document.createElement('style');
style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    collectAllArticles();
    initCategoryFilter();
    initSearch();
});