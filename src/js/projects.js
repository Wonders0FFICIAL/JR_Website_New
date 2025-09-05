document.addEventListener('DOMContentLoaded', () => {
    function createStars() {
        const starsContainer = document.getElementById('stars');
        const starsCount = 150;

        for (let i = 0; i < starsCount; i++) {
            const star = document.createElement('div');
            star.classList.add('star');

            const size = Math.random() * 2 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;

            const duration = Math.random() * 3 + 2;
            star.style.animationDuration = `${duration}s`;

            starsContainer.appendChild(star);
        }
    }

    createStars();

    const projectsData = {
        'jr-lang': {
            name: 'JR. Lang',
            logo: '../assets/images/JR. Lang Logo.png',
            description: 'JR. Lang is a modern programming language designed for efficiency, readability, and performance. Built from the ground up to address the shortcomings of existing languages, JR. Lang offers intuitive syntax, powerful features, and excellent integration capabilities for today\'s development needs.',
            features: [
                'Intuitive syntax that promotes clean, maintainable code',
                'Robust type system with inference capabilities',
                'Native concurrency and parallelism support',
                'Comprehensive standard library',
                'Cross-platform compatibility',
                'Memory-safe design without sacrificing performance'
            ],
            technologies: ['Compiler', 'Runtime', 'Cross-platform', 'High Performance', 'Low-level', 'Memory-safe'],
            docsLink: 'docs/jr-lang',
            downloadLink: 'downloads/jr-lang.zip',
            category: 'development'
        },
        'jr-browse': {
            name: 'JR. Browse',
            logo: '../assets/images/JR. Browse Logo.png',
            description: 'JR. Browse is a lightweight, privacy-focused web browser built for the modern internet. Designed with speed and security in mind, it gives users complete control over their browsing experience while protecting their personal data from trackers and unwanted advertisements.',
            features: [
                'Optimized rendering engine for faster page loads',
                'Built-in ad and tracker blocking',
                'Enhanced privacy mode with fingerprint protection',
                'Customizable user interface',
                'Cross-device synchronization',
                'Minimal resource usage for better performance'
            ],
            technologies: ['Web', 'Privacy', 'Security', 'Lightweight', 'Cross-platform', 'Chromium'],
            docsLink: 'docs/jr-browse',
            downloadLink: 'downloads/jr-browse.zip',
            category: 'browser'
        },
        'jr-ai': {
            name: 'JR. AI',
            logo: '../assets/images/JR. AI Logo.png',
            description: 'JR. AI is our advanced artificial intelligence platform providing powerful machine learning solutions for developers and businesses. From natural language processing to computer vision, JR. AI offers state-of-the-art models that can be easily integrated into your applications.',
            features: [
                'Pre-trained models for common AI tasks',
                'API for easy integration into existing applications',
                'Custom model training capabilities',
                'Real-time inference with optimized performance',
                'Support for multiple programming languages',
                'On-device AI processing for edge computing'
            ],
            technologies: ['Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Neural Networks', 'Edge AI', 'Cloud AI'],
            docsLink: 'docs/jr-ai',
            downloadLink: 'https://ai.jrofficial.org',
            category: 'ai'
        },
        'jr-cloud': {
            name: 'JR. Cloud',
            logo: '../assets/images/JR. Cloud Logo.png',
            description: 'JR. Cloud provides secure, scalable infrastructure for your applications. Our cloud platform is built to handle everything from small personal projects to enterprise-level applications, offering reliable performance, robust security, and intuitive management tools.',
            features: [
                'Elastic compute resources that scale with your needs',
                'Global CDN for fast content delivery',
                'Managed database services',
                'Serverless function execution',
                'Enterprise-grade security with encryption at rest and in transit',
                'Comprehensive monitoring and analytics tools'
            ],
            technologies: ['Cloud Computing', 'IaaS', 'PaaS', 'Serverless', 'Containers', 'Microservices'],
            docsLink: 'docs/jr-cloud',
            downloadLink: 'downloads/jr-cloud.zip',
            category: 'cloud'
        }
    };

    const modal = document.getElementById('project-modal');
    const closeBtn = document.querySelector('.close-btn');
    const modalLogo = document.getElementById('modal-logo-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalFeaturesList = document.getElementById('modal-features-list');
    const modalTechTags = document.getElementById('modal-tech-tags');
    const modalDocsLink = document.getElementById('modal-docs-link');
    const modalDownloadLink = document.getElementById('modal-download-link');
    const projectSearch = document.getElementById('project-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectsContainer = document.getElementById('projects-container');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            filterProjects(filter);
        });
    });

    projectSearch.addEventListener('input', () => {
        const searchTerm = projectSearch.value.toLowerCase();
        filterProjects('all', searchTerm);
    });

    function filterProjects(filter, searchTerm = '') {
        let visibleCount = 0;

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const name = card.querySelector('.project-name').textContent.toLowerCase();
            const desc = card.querySelector('.project-desc').textContent.toLowerCase();

            const matchesCategory = filter === 'all' || category === filter;
            const matchesSearch = searchTerm === '' ||
                name.includes(searchTerm) ||
                desc.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        let noResults = document.querySelector('.no-results');
        if (visibleCount === 0) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `
  <i class="fas fa-search"></i>
  <p>No projects found matching your criteria</p>
  <button class="filter-btn" id="reset-filters" style="margin-top: 20px;">Reset Filters</button>
`;
                projectsContainer.appendChild(noResults);

                document.getElementById('reset-filters').addEventListener('click', () => {
                    filterButtons.forEach(btn => {
                        if (btn.getAttribute('data-filter') === 'all') {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                    projectSearch.value = '';
                    filterProjects('all');
                    projectsContainer.removeChild(noResults);
                });
            }
        } else if (noResults) {
            projectsContainer.removeChild(noResults);
        }
    }

    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('docs-btn') ||
                e.target.classList.contains('download-btn') ||
                e.target.closest('.docs-btn') ||
                e.target.closest('.download-btn')) {
                return;
            }

            const projectId = card.getAttribute('data-project');
            const project = projectsData[projectId];

            if (project) {
                modalLogo.src = project.logo;
                modalTitle.textContent = project.name;
                modalDescription.textContent = project.description;

                modalFeaturesList.innerHTML = '';
                project.features.forEach(feature => {
                    const li = document.createElement('li');
                    li.textContent = feature;
                    modalFeaturesList.appendChild(li);
                });

                modalTechTags.innerHTML = '';
                project.technologies.forEach(tech => {
                    const span = document.createElement('span');
                    span.className = 'tech-tag';
                    span.textContent = tech;
                    modalTechTags.appendChild(span);
                });

                modalDocsLink.href = project.docsLink;
                modalDownloadLink.href = project.downloadLink;

                if (projectId === 'jr-ai') {
                    modalDownloadLink.innerHTML = '<i class="fas fa-external-link-alt"></i> Use';
                } else {
                    modalDownloadLink.innerHTML = '<i class="fas fa-download"></i> Download';
                }

                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
});