document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

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
            downloadLink: 'downloads/jr-lang.zip'
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
            downloadLink: 'downloads/jr-browse.zip'
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
            downloadLink: 'https://ai.jrofficial.org'
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
            downloadLink: 'downloads/jr-cloud.zip'
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

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('docs-btn') || 
                e.target.classList.contains('download-btn') ||
                e.target.closest('.docs-btn') || 
                e.target.closest('.download-btn')) {
                return;
            }

            const projectId = card.getAttribute('data-project');
            const projectData = projectsData[projectId];
            
            modalLogo.src = projectData.logo;
            modalLogo.alt = `${projectData.name} Logo`;
            modalTitle.textContent = projectData.name;
            modalDescription.textContent = projectData.description;
            
            modalFeaturesList.innerHTML = '';
            projectData.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                modalFeaturesList.appendChild(li);
            });
            
            modalTechTags.innerHTML = '';
            projectData.technologies.forEach(tech => {
                const span = document.createElement('span');
                span.className = 'tech-tag';
                span.textContent = tech;
                modalTechTags.appendChild(span);
            });
            
            modalDocsLink.href = projectData.docsLink;
            modalDownloadLink.href = projectData.downloadLink;
            
            if (projectId === 'jr-ai') {
                modalDownloadLink.textContent = 'Use';
            } else {
                modalDownloadLink.textContent = 'Download';
            }
            
            document.querySelector('.modal-content').style.borderColor = '#5638E5';
            document.querySelector('.modal-content').style.boxShadow = '0 0 30px rgba(86, 56, 229, 0.7)';
            document.getElementById('modal-title').style.color = '#6f54f8';
            document.querySelectorAll('.modal-features h3, .modal-tech h3').forEach(el => {
                el.style.color = '#6f54f8';
            });
            document.getElementById('modal-docs-link').style.borderColor = '#5638E5';
            document.getElementById('modal-docs-link').style.backgroundColor = '#0E0634';
            document.getElementById('modal-download-link').style.backgroundColor = '#5638E5';
            
            document.querySelectorAll('.tech-tag').forEach(tag => {
                tag.style.backgroundColor = '#1a1045';
                tag.style.color = 'white';
            });

            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    closeBtn.addEventListener('click', () => {
        closeModal();
    });
    
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    const modalContent = document.querySelector('.modal-content');
    modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            console.log('Download started for:', button.getAttribute('href'));
        });
    });
});