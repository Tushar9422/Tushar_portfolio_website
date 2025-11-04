const APP_VERSION = '1.0.0'; // Update this when making significant changes

// Storage reset utility
const StorageManager = {
    resetStorage() {
        try {
            localStorage.clear();
            // Set version after clearing to prevent infinite reload loop
            localStorage.setItem('app_version', APP_VERSION);
            window.location.reload();
        } catch (error) {
            console.error('Error resetting storage:', error);
            alert('Failed to reset data. Please try again.');
        }
    },
    
    checkVersion() {
        const storedVersion = localStorage.getItem('app_version');
        if (storedVersion !== APP_VERSION) {
            console.log('App version changed, resetting storage...');
            this.resetStorage();
            localStorage.setItem('app_version', APP_VERSION);
        }
    }
};

// Portfolio Website JavaScript
class PortfolioApp {
    constructor() {
        // Check version before loading any data
        StorageManager.checkVersion();
        
        this.isLoggedIn = false;
        this.projects = [];
        this.userProfile = {};
        this.skills = [];
        this.editingProjectId = null;
        this.typingAnimation = null;
        
        this.init();
        // Show initial instruction
        setTimeout(() => {
            this.showResetInstruction();
        }, 1000);
    }

    showResetInstruction() {
        const notification = document.createElement('div');
        notification.className = 'notification notification--info';
        notification.innerHTML = `
            <div class="notification-content">
                <span>👋 Welcome! Please click the "Reset Portfolio" button at the top to start fresh.</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Update notification position to avoid overlap with reset button
        Object.assign(notification.style, {
            position: 'fixed',
            top: '80px',  // Increased to avoid overlap with reset button
            right: '20px',
            background: 'var(--color-info)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: '3000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease-out',
            minWidth: '300px'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        setTimeout(() => {
            this.hideNotification(notification);
        }, 8000);
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.renderInitialContent();
        this.checkAuthStatus();
        this.setupScrollAnimations();
        this.setupResetButton();
    }

    setupResetButton() {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'globalResetBtn';
        resetBtn.className = 'btn btn-reset';
        resetBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Reset Portfolio';
        
        Object.assign(resetBtn.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '1000',
            background: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            animation: 'pulseButton 2s infinite'
        });

        // Add hover effect
        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.style.transform = 'translateX(-50%) scale(1.05)';
            resetBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        });

        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.style.transform = 'translateX(-50%) scale(1)';
            resetBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        });

        // Add pulsing animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulseButton {
                0% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.05); }
                100% { transform: translateX(-50%) scale(1); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(resetBtn);
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset portfolio to default state? This will refresh the page.')) {
                StorageManager.resetStorage();
            }
        });
    }

    // Navigation
    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Authentication
    checkAuthStatus() {
        const session = localStorage.getItem('admin_session');
        if (session) {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            if (sessionData.authenticated && (now - sessionData.timestamp) < 86400000) { // 24 hours
                this.isLoggedIn = true;
                this.showAdminFeatures();
            } else {
                localStorage.removeItem('admin_session');
            }
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.add('show');
        document.querySelector('#loginModal .form-control').focus();
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.remove('show');
        document.getElementById('loginForm').reset();
        const errorDiv = document.getElementById('loginError');
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const res = await fetch('/.netlify/functions/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.ok) {
                this.isLoggedIn = true;
                const sessionData = {
                    authenticated: true,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('admin_session', JSON.stringify(sessionData));
                this.hideLoginModal();
                this.showAdminFeatures();
                this.showNotification('Login successful!', 'success');
            } else {
                errorDiv.textContent = 'Invalid username or password';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.classList.remove('hidden');
            console.error('Login error:', error);
        }
    }

    handleLogout() {
        this.isLoggedIn = false;
        localStorage.removeItem('admin_session');
        this.hideAdminFeatures();
        this.showNotification('Logged out successfully!', 'info');
    }

    showAdminFeatures() {
        document.getElementById('adminLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-flex';
        document.getElementById('addProjectBtn').style.display = 'inline-flex';
        document.getElementById('uploadPhotoBtn').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'block';
        
        document.querySelectorAll('.project-actions').forEach(actions => {
            actions.style.display = 'flex';
        });
        
        this.updateProjectCount();
    }

    hideAdminFeatures() {
        document.getElementById('adminLoginBtn').style.display = 'inline-flex';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('addProjectBtn').style.display = 'none';
        document.getElementById('uploadPhotoBtn').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'none';
        
        document.querySelectorAll('.project-actions').forEach(actions => {
            actions.style.display = 'none';
        });
    }

    // Data Management
    loadData() {
        // Load projects from localStorage or use sample data
        const storedProjects = localStorage.getItem('portfolio_projects');
        if (storedProjects) {
            this.projects = JSON.parse(storedProjects);
        } else {
            // Use sample data and save to localStorage
            this.projects = [
                {
                    id: 1,
                    title: "Multimodal AI Mental Health Assistant (In Progress...)",
                    description: "Built an AI-based system that analyzes voice tone, facial expressions, and text sentiment to assess mental health indicators. (Currently in Progress...",
                    technologies: ["Python", "TensorFlow", "MediaPipe", "Keras", "Streamlit", "Librosa", "Pandas"],
                    imageUrl: "https://as2.ftcdn.net/jpg/08/47/25/53/1000_F_847255336_gCKmHs17GK5Wtje5HKHqLhiKCnpkkzhS.jpg",
                    githubUrl: "https://github.com/Tushar9422/Multimodal_mental_health_ai",
                    liveUrl: "https://github.com/Tushar9422/Multimodal_mental_health_ai",
                    createdAt: "2025-07-15"
                },
                {
                    id: 2,
                    title: "Image style transfer (using CycleGAN)",
                    description: "Developed a real-time artistic image style transfer application using CycleGAN, trained on Monet and photo datasets. Implemented custom loss functions and optimized TensorFlow data pipelines for efficient preprocessing and batching. Deployed the model with a user-friendly Streamlit interface, enabling live transformation of images into Monet-style paintings. Skills utilized include machine learning, deep learning, neural networks, and data processing",
                    technologies: ["Python", "TensorFlow", "Numpy", "Keras", "Streamlit"],
                    imageUrl: "https://res.cloudinary.com/hz3gmuqw6/image/upload/c_fill,q_60,w_750/v1/classpop/blog/banks-of-the-seine-vetheuil-by-claude-monet_6687e3cb48e2b.jpg",
                    githubUrl: "https://github.com/Tushar9422/Image-Style-Transfer-CycleGAN-",
                    liveUrl: "https://github.com/Tushar9422/Image-Style-Transfer-CycleGAN-",
                    createdAt: "2025-01-15"
                },
                {
                    id: 3,
                    title: "Blog Verse – secure blog platform",
                    description: "BlogVerse is an all-in-one blogging platform built with Flask, designed to streamline content creation, user engagement, and content management. It combines modern web development with AI-powered features to enhance the blogging experience.",
                    technologies: ["Python", "Flask", "SQLAlchemy", "Bootstrap", "HTML", "CSS"],
                    imageUrl: "https://media.istockphoto.com/photos/blog-illustration-picture-id480048030?k=6&m=480048030&s=170667a&w=0&h=P-i3fiDpmDBpxWUVDnF0f04VW9bq-yfoBKz--GC8mGU=",
                    githubUrl: "https://github.com/Tushar9422/BlogVerse",
                    liveUrl: "https://github.com/Tushar9422/BlogVerse",
                    createdAt: "2024-08-20"
                },
                {
                    id: 4,
                    title: "SentimentScope",
                    description: "This project applies machine learning to classify text into positive, negative, or neutral sentiments. It features data preprocessing, model training, and evaluation, with results saved in a JSON file and predictions exported to CSV. The model achieves an accuracy of 89%, offering reliable sentiment insights for text data.",
                    technologies: ["Python", "Prompt Engineering", "Numpy", "Pandas", "Scikit-learn"],
                    imageUrl: "https://cdn-thumbnails.huggingface.co/social-thumbnails/spaces/0farah0/SentimentScope.png",
                    githubUrl: "https://github.com/Tushar9422/SentimentScope",
                    liveUrl: "https://github.com/Tushar9422/SentimentScope",
                    createdAt: "2025-07-29"
                },
                {
                    id: 5,
                    title: "Trader Behaviour Analysis",
                    description: "A comprehensive data science project analyzing the relationship between Bitcoin market sentiment and trader performance using real market data. This analysis uncovers hidden patterns in trading behavior and provides actionable insights for smarter trading strategies. 92% accuracy signals identified for extreme greed periods",
                    technologies: ["Python", "Seaborn", "Numpy", "Pandas", "Scikit-learn"],
                    imageUrl: "https://img.freepik.com/premium-photo/stock-trader-flat_1279508-6788.jpg",
                    githubUrl: "https://github.com/Tushar9422/trader-behaviour-analysis",
                    liveUrl: "https://github.com/Tushar9422/trader-behaviour-analysis",
                    createdAt: "2025-07-29"
                }
            ];
            this.saveProjects();
        }

        // Load user profile
        const storedProfile = localStorage.getItem('portfolio_profile');
        if (storedProfile) {
            this.userProfile = JSON.parse(storedProfile);
        } else {
            this.userProfile = {
                name: "Tushar Sharma",
                title: "Data Science And Machine Learning Enthusiast",
                bio: "Passionate data science and machine learning enthusiast skilled in Python and data-driven technologies. Dedicated to solving complex problems and transforming data into insightful, innovative solutions through code.",
                email: "tusharsharma9422@gmail.com",
                github: "https://github.com/Tushar9422",
                linkedin: "https://linkedin.com/in/tushar-squared",
                photo: "./images/profile.jpg" // Updated path with leading ./
            };
            localStorage.setItem('portfolio_profile', JSON.stringify(this.userProfile));
        }

        // Load skills
        this.skills = [
            "Python", "Machine Learning", "PostgreSQL", "TensorFlow", "Scikit-learn", "Pandas", 
            "Flask", "Statistical modelling", "DSA","REST APIs"
        ];
    }

    saveProjects() {
        localStorage.setItem('portfolio_projects', JSON.stringify(this.projects));
    }

    saveProfile() {
        localStorage.setItem('portfolio_profile', JSON.stringify(this.userProfile));
    }

    // Event Binding
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });

        // Admin login
        document.getElementById('adminLoginBtn').addEventListener('click', this.showLoginModal.bind(this));
        document.getElementById('loginForm').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('closeLogin').addEventListener('click', this.hideLoginModal.bind(this));
        document.getElementById('logoutBtn').addEventListener('click', this.handleLogout.bind(this));

        // Project management
        document.getElementById('addProjectBtn').addEventListener('click', () => this.showProjectModal());
        document.getElementById('projectForm').addEventListener('submit', this.handleProjectSubmit.bind(this));
        document.getElementById('closeProject').addEventListener('click', this.hideProjectModal.bind(this));
        document.getElementById('cancelProject').addEventListener('click', this.hideProjectModal.bind(this));

        // Photo upload
        document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
            document.getElementById('photoUpload').click();
        });
        document.getElementById('photoUpload').addEventListener('change', this.handlePhotoUpload.bind(this));

        // Modal close on outside click
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideLoginModal();
            }
        });
        document.getElementById('projectModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideProjectModal();
            }
        });
    }

    // Navigation
    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Authentication
    checkAuthStatus() {
        const session = localStorage.getItem('admin_session');
        if (session) {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            if (sessionData.authenticated && (now - sessionData.timestamp) < 86400000) { // 24 hours
                this.isLoggedIn = true;
                this.showAdminFeatures();
            } else {
                localStorage.removeItem('admin_session');
            }
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.add('show');
        document.querySelector('#loginModal .form-control').focus();
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.remove('show');
        document.getElementById('loginForm').reset();
        const errorDiv = document.getElementById('loginError');
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const res = await fetch('/.netlify/functions/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.ok) {
                this.isLoggedIn = true;
                const sessionData = {
                    authenticated: true,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('admin_session', JSON.stringify(sessionData));
                this.hideLoginModal();
                this.showAdminFeatures();
                this.showNotification('Login successful!', 'success');
            } else {
                errorDiv.textContent = 'Invalid username or password';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.classList.remove('hidden');
            console.error('Login error:', error);
        }
    }

    handleLogout() {
        this.isLoggedIn = false;
        localStorage.removeItem('admin_session');
        this.hideAdminFeatures();
        this.showNotification('Logged out successfully!', 'info');
    }

    showAdminFeatures() {
        document.getElementById('adminLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-flex';
        document.getElementById('addProjectBtn').style.display = 'inline-flex';
        document.getElementById('uploadPhotoBtn').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'block';
        
        document.querySelectorAll('.project-actions').forEach(actions => {
            actions.style.display = 'flex';
        });
        
        this.updateProjectCount();
    }

    hideAdminFeatures() {
        document.getElementById('adminLoginBtn').style.display = 'inline-flex';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('addProjectBtn').style.display = 'none';
        document.getElementById('uploadPhotoBtn').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'none';
        
        document.querySelectorAll('.project-actions').forEach(actions => {
            actions.style.display = 'none';
        });
    }

    // Data Management
    loadData() {
        // Load projects from localStorage or use sample data
        const storedProjects = localStorage.getItem('portfolio_projects');
        if (storedProjects) {
            this.projects = JSON.parse(storedProjects);
        } else {
            // Use sample data and save to localStorage
            this.projects = [
                {
                    id: 1,
                    title: "Multimodal AI Mental Health Assistant (In Progress...)",
                    description: "Built an AI-based system that analyzes voice tone, facial expressions, and text sentiment to assess mental health indicators. (Currently in Progress...",
                    technologies: ["Python", "TensorFlow", "MediaPipe", "Keras", "Streamlit", "Librosa", "Pandas"],
                    imageUrl: "https://as2.ftcdn.net/jpg/08/47/25/53/1000_F_847255336_gCKmHs17GK5Wtje5HKHqLhiKCnpkkzhS.jpg",
                    githubUrl: "https://github.com/Tushar9422/Multimodal_mental_health_ai",
                    liveUrl: "https://github.com/Tushar9422/Multimodal_mental_health_ai",
                    createdAt: "2025-07-15"
                },
                {
                    id: 2,
                    title: "Image style transfer (using CycleGAN)",
                    description: "Developed a real-time artistic image style transfer application using CycleGAN, trained on Monet and photo datasets. Implemented custom loss functions and optimized TensorFlow data pipelines for efficient preprocessing and batching. Deployed the model with a user-friendly Streamlit interface, enabling live transformation of images into Monet-style paintings. Skills utilized include machine learning, deep learning, neural networks, and data processing",
                    technologies: ["Python", "TensorFlow", "Numpy", "Keras", "Streamlit"],
                    imageUrl: "https://res.cloudinary.com/hz3gmuqw6/image/upload/c_fill,q_60,w_750/v1/classpop/blog/banks-of-the-seine-vetheuil-by-claude-monet_6687e3cb48e2b.jpg",
                    githubUrl: "https://github.com/Tushar9422/Image-Style-Transfer-CycleGAN-",
                    liveUrl: "https://github.com/Tushar9422/Image-Style-Transfer-CycleGAN-",
                    createdAt: "2025-01-15"
                },
                {
                    id: 3,
                    title: "Blog Verse – secure blog platform",
                    description: "BlogVerse is an all-in-one blogging platform built with Flask, designed to streamline content creation, user engagement, and content management. It combines modern web development with AI-powered features to enhance the blogging experience.",
                    technologies: ["Python", "Flask", "SQLAlchemy", "Bootstrap", "HTML", "CSS"],
                    imageUrl: "https://media.istockphoto.com/photos/blog-illustration-picture-id480048030?k=6&m=480048030&s=170667a&w=0&h=P-i3fiDpmDBpxWUVDnF0f04VW9bq-yfoBKz--GC8mGU=",
                    githubUrl: "https://github.com/Tushar9422/BlogVerse",
                    liveUrl: "https://github.com/Tushar9422/BlogVerse",
                    createdAt: "2024-08-20"
                },
                {
                    id: 4,
                    title: "SentimentScope",
                    description: "This project applies machine learning to classify text into positive, negative, or neutral sentiments. It features data preprocessing, model training, and evaluation, with results saved in a JSON file and predictions exported to CSV. The model achieves an accuracy of 89%, offering reliable sentiment insights for text data.",
                    technologies: ["Python", "Prompt Engineering", "Numpy", "Pandas", "Scikit-learn"],
                    imageUrl: "https://cdn-thumbnails.huggingface.co/social-thumbnails/spaces/0farah0/SentimentScope.png",
                    githubUrl: "https://github.com/Tushar9422/SentimentScope",
                    liveUrl: "https://github.com/Tushar9422/SentimentScope",
                    createdAt: "2025-07-29"
                },
                {
                    id: 5,
                    title: "Trader Behaviour Analysis",
                    description: "A comprehensive data science project analyzing the relationship between Bitcoin market sentiment and trader performance using real market data. This analysis uncovers hidden patterns in trading behavior and provides actionable insights for smarter trading strategies. 92% accuracy signals identified for extreme greed periods",
                    technologies: ["Python", "Seaborn", "Numpy", "Pandas", "Scikit-learn"],
                    imageUrl: "https://img.freepik.com/premium-photo/stock-trader-flat_1279508-6788.jpg",
                    githubUrl: "https://github.com/Tushar9422/trader-behaviour-analysis",
                    liveUrl: "https://github.com/Tushar9422/trader-behaviour-analysis",
                    createdAt: "2025-07-29"
                }
            ];
            this.saveProjects();
        }

        // Load user profile
        const storedProfile = localStorage.getItem('portfolio_profile');
        if (storedProfile) {
            this.userProfile = JSON.parse(storedProfile);
        } else {
            this.userProfile = {
                name: "Tushar Sharma",
                title: "Data Science And Machine Learning Enthusiast",
                bio: "Passionate data science and machine learning enthusiast skilled in Python and data-driven technologies. Dedicated to solving complex problems and transforming data into insightful, innovative solutions through code.",
                email: "tusharsharma9422@gmail.com",
                github: "https://github.com/Tushar9422",
                linkedin: "https://linkedin.com/in/tushar-squared",
                photo: "./images/profile.jpg" // Updated path with leading ./
            };
            localStorage.setItem('portfolio_profile', JSON.stringify(this.userProfile));
        }

        // Load skills
        this.skills = [
            "Python", "Machine Learning", "PostgreSQL", "TensorFlow", "Scikit-learn", "Pandas", 
            "Flask", "Statistical modelling", "DSA","REST APIs"
        ];
    }

    saveProjects() {
        localStorage.setItem('portfolio_projects', JSON.stringify(this.projects));
    }

    saveProfile() {
        localStorage.setItem('portfolio_profile', JSON.stringify(this.userProfile));
    }

    // Event Binding
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });

        // Admin login
        document.getElementById('adminLoginBtn').addEventListener('click', this.showLoginModal.bind(this));
        document.getElementById('loginForm').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('closeLogin').addEventListener('click', this.hideLoginModal.bind(this));
        document.getElementById('logoutBtn').addEventListener('click', this.handleLogout.bind(this));

        // Project management
        document.getElementById('addProjectBtn').addEventListener('click', () => this.showProjectModal());
        document.getElementById('projectForm').addEventListener('submit', this.handleProjectSubmit.bind(this));
        document.getElementById('closeProject').addEventListener('click', this.hideProjectModal.bind(this));
        document.getElementById('cancelProject').addEventListener('click', this.hideProjectModal.bind(this));

        // Photo upload
        document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
            document.getElementById('photoUpload').click();
        });
        document.getElementById('photoUpload').addEventListener('change', this.handlePhotoUpload.bind(this));

        // Modal close on outside click
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideLoginModal();
            }
        });
        document.getElementById('projectModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideProjectModal();
            }
        });
    }

    // Navigation
    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Authentication
    checkAuthStatus() {
        const session = localStorage.getItem('admin_session');
        if (session) {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            if (sessionData.authenticated && (now - sessionData.timestamp) < 86400000) { // 24 hours
                this.isLoggedIn = true;
                this.showAdminFeatures();
            } else {
                localStorage.removeItem('admin_session');
            }
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.add('show');
        document.querySelector('#loginModal .form-control').focus();
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.remove('show');
        document.getElementById('loginForm').reset();
        const errorDiv = document.getElementById('loginError');
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const res = await fetch('/.netlify/functions/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.ok) {
                this.isLoggedIn = true;
                const sessionData = {
                    authenticated: true,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('admin_session', JSON.stringify(sessionData));
                this.hideLoginModal();
                this.showAdminFeatures();
                this.showNotification('Login successful!', 'success');
            } else {
                errorDiv.textContent = 'Invalid username or password';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.classList.remove('hidden');
            console.error('Login error:', error);
        }
    }

    handleLogout() {
        this.isLoggedIn = false;
        localStorage.removeItem('admin_session');
        this.hideAdminFeatures();
        this.showNotification('Logged out successfully!', 'info');
    }

    showAdminFeatures() {
        document.getElementById('adminLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-flex';
        document.getElementById('addProjectBtn').style.display = 'inline-flex';
        document.getElementById('uploadPhotoBtn').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'block';
        
        document.querySelectorAll('.project-actions').forEach(actions => {
            actions.style.display = 'flex';
        });
        
        this.updateProjectCount();
    }

    hideAdminFeatures() {
        document.getElementById('adminLoginBtn').style.display = 'inline-flex';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('addProjectBtn').style.display = 'none';
        document.getElementById('uploadPhotoBtn').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'none';
        
        document.querySelectorAll('.project-actions').forEach(actions => {
            actions.style.display = 'none';
        });
    }

    // Data Management
    loadData() {
        // Load projects from localStorage or use sample data
        const storedProjects = localStorage.getItem('portfolio_projects');
        if (storedProjects) {
            this.projects = JSON.parse(storedProjects);
        } else {
            // Use sample data and save to localStorage
            this.projects = [
                {
                    id: 1,
                    title: "Multimodal AI Mental Health Assistant (In Progress...)",
                    description: "Built an AI-based system that analyzes voice tone, facial expressions, and text sentiment to assess mental health indicators. (Currently in Progress...",
                    technologies: ["Python", "TensorFlow", "MediaPipe", "Keras", "Streamlit", "Librosa", "Pandas"],
                    imageUrl: "https://as2.ftcdn.net/jpg/08/47/25/53/1000_F_847255336_gCKmHs17GK5Wtje5HKHqLhiKCnpkkzhS.jpg",
                    githubUrl: "https://github.com/Tushar9422/Multimodal_mental_health_ai",
                    liveUrl: "https://github.com/Tushar9422/Multimodal_mental_health_ai",
                    createdAt: "2025-07-15"
                },
                {
                    id: 2,
                    title: "Image style transfer (using CycleGAN)",
                    description: "Developed a real-time artistic image style transfer application using CycleGAN, trained on Monet and photo datasets. Implemented custom loss functions and optimized TensorFlow data pipelines for efficient preprocessing and batching. Deployed the model with a user-friendly Streamlit interface, enabling live transformation of images into Monet-style paintings. Skills utilized include machine learning, deep learning, neural networks, and data processing",
                    technologies: ["Python", "TensorFlow", "Numpy", "Keras", "Streamlit"],
                    imageUrl: "https://res.cloudinary.com/hz3gmuqw6/image/upload/c_fill,q_60,w_750/v1/classpop/blog/banks-of-the-seine-vetheuil-by-claude-monet_6687e3cb48e2b.jpg",
                    githubUrl: "https://github.com/Tushar9422/Image-Style-Transfer-CycleGAN-",
                    liveUrl: "https://github.com/Tushar9422/Image-Style-Transfer-CycleGAN-",
                    createdAt: "2025-01-15"
                },
                {
                    id: 3,
                    title: "Blog Verse – secure blog platform",
                    description: "BlogVerse is an all-in-one blogging platform built with Flask, designed to streamline content creation, user engagement, and content management. It combines modern web development with AI-powered features to enhance the blogging experience.",
                    technologies: ["Python", "Flask", "SQLAlchemy", "Bootstrap", "HTML", "CSS"],
                    imageUrl: "https://media.istockphoto.com/photos/blog-illustration-picture-id480048030?k=6&m=480048030&s=170667a&w=0&h=P-i3fiDpmDBpxWUVDnF0f04VW9bq-yfoBKz--GC8mGU=",
                    githubUrl: "https://github.com/Tushar9422/BlogVerse",
                    liveUrl: "https://github.com/Tushar9422/BlogVerse",
                    createdAt: "2024-08-20"
                },
                {
                    id: 4,
                    title: "SentimentScope",
                    description: "This project applies machine learning to classify text into positive, negative, or neutral sentiments. It features data preprocessing, model training, and evaluation, with results saved in a JSON file and predictions exported to CSV. The model achieves an accuracy of 89%, offering reliable sentiment insights for text data.",
                    technologies: ["Python", "Prompt Engineering", "Numpy", "Pandas", "Scikit-learn"],
                    imageUrl: "https://cdn-thumbnails.huggingface.co/social-thumbnails/spaces/0farah0/SentimentScope.png",
                    githubUrl: "https://github.com/Tushar9422/SentimentScope",
                    liveUrl: "https://github.com/Tushar9422/SentimentScope",
                    createdAt: "2025-07-29"
                },
                {
                    id: 5,
                    title: "Trader Behaviour Analysis",
                    description: "A comprehensive data science project analyzing the relationship between Bitcoin market sentiment and trader performance using real market data. This analysis uncovers hidden patterns in trading behavior and provides actionable insights for smarter trading strategies. 92% accuracy signals identified for extreme greed periods",
                    technologies: ["Python", "Seaborn", "Numpy", "Pandas", "Scikit-learn"],
                    imageUrl: "https://img.freepik.com/premium-photo/stock-trader-flat_1279508-6788.jpg",
                    githubUrl: "https://github.com/Tushar9422/trader-behaviour-analysis",
                    liveUrl: "https://github.com/Tushar9422/trader-behaviour-analysis",
                    createdAt: "2025-07-29"
                }
            ];
            this.saveProjects();
        }

        // Load user profile
        const storedProfile = localStorage.getItem('portfolio_profile');
        if (storedProfile) {
            this.userProfile = JSON.parse(storedProfile);
        } else {
            this.userProfile = {
                name: "Tushar Sharma",
                title: "Data Science And Machine Learning Enthusiast",
                bio: "Passionate data science and machine learning enthusiast skilled in Python and data-driven technologies. Dedicated to solving complex problems and transforming data into insightful, innovative solutions through code.",
                email: "tusharsharma9422@gmail.com",
                github: "https://github.com/Tushar9422",
                linkedin: "https://linkedin.com/in/tushar-squared",
                photo: "./images/profile.jpg" // Updated path with leading ./
            };
            localStorage.setItem('portfolio_profile', JSON.stringify(this.userProfile));
        }

        // Load skills
        this.skills = [
            "Python", "Machine Learning", "PostgreSQL", "TensorFlow", "Scikit-learn", "Pandas", 
            "Flask", "Statistical modelling", "DSA","REST APIs"
        ];
    }

    saveProjects() {
        localStorage.setItem('portfolio_projects', JSON.stringify(this.projects));
    }

    saveProfile() {
        localStorage.setItem('portfolio_profile', JSON.stringify(this.userProfile));
    }

    // Event Binding
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });

        // Admin login
        document.getElementById('adminLoginBtn').addEventListener('click', this.showLoginModal.bind(this));
        document.getElementById('loginForm').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('closeLogin').addEventListener('click', this.hideLoginModal.bind(this));
        document.getElementById('logoutBtn').addEventListener('click', this.handleLogout.bind(this));

        // Project management
        document.getElementById('addProjectBtn').addEventListener('click', () => this.showProjectModal());
        document.getElementById('projectForm').addEventListener('submit', this.handleProjectSubmit.bind(this));
        document.getElementById('closeProject').addEventListener('click', this.hideProjectModal.bind(this));
        document.getElementById('cancelProject').addEventListener('click', this.hideProjectModal.bind(this));

        // Photo upload
        document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
            document.getElementById('photoUpload').click();
        });
        document.getElementById('photoUpload').addEventListener('change', this.handlePhotoUpload.bind(this));

        // Modal close on outside click
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideLoginModal();
            }
        });
        document.getElementById('projectModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideProjectModal();
            }
        });
    }

    // Navigation
    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Authentication
    checkAuthStatus() {
        const session = localStorage.getItem('admin_session');
        if (session) {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            if (sessionData.authenticated && (now - sessionData.timestamp) < 86400000) { // 24 hours
                this.isLoggedIn = true;
                this.showAdminFeatures();
            } else {
                localStorage.removeItem('admin_session');
            }
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.add('show');
        document.querySelector('#loginModal .form-control').focus();
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.remove('show');
        document.getElementById('loginForm').reset();
        const errorDiv = document.getElementById('loginError');
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const res = await fetch('/.netlify/functions/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.ok) {
                this.isLoggedIn = true;
                const sessionData = {
                    authenticated: true,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('admin_session', JSON.stringify(sessionData));
                this.hideLoginModal();
                this.showAdminFeatures();
                this.showNotification('Login successful!', 'success');
            } else {
                errorDiv.textContent = 'Invalid username or password';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.classList.remove('hidden');
            console.error('Login error:', error);
        }
    }

    handleLogout() {
        this.isLoggedIn = false;
        localStorage.removeItem('admin_session');
        this.hideAdminFeatures();
        this.showNotification('Logged out successfully!', 'info');
    }

    showAdminFeatures() {
        document.getElementById('adminLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-flex';
        document.getElementById('addProjectBtn').style.display = 'inline-flex';
        document.getElementById('uploadPhotoBtn').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'block';
        
        document.querySelectorAll('.project-actions').forEach(actions => {
            actions.style.display = 'flex';
        });
        
        this.updateProjectCount();
    }

    hideAdminFeatures() {
        document.getElementById('adminLoginBtn').style.display = 'inline-flex';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('addProjectBtn').style.display = 'none';
        document.getElementById('uploadPhotoBtn').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'none';
        
        document.querySelectorAll('.project-actions').forEach(actions => {
            actions.style.display = 'none';
        });
    }

    // Project Management
    showProjectModal(projectId = null) {
        const modal = document.getElementById('projectModal');
        const form = document.getElementById('projectForm');
        const title = document.getElementById('projectModalTitle');
        
        if (projectId) {
            // Edit mode
            this.editingProjectId = projectId;
            const project = this.projects.find(p => p.id === projectId);
            title.textContent = 'Edit Project';
            
            document.getElementById('projectTitle').value = project.title;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectTechnologies').value = project.technologies.join(', ');
            document.getElementById('projectImage').value = project.imageUrl;
            document.getElementById('projectGithub').value = project.githubUrl || '';
            document.getElementById('projectLive').value = project.liveUrl || '';
        } else {
            // Add mode
            this.editingProjectId = null;
            title.textContent = 'Add Project';
            form.reset();
        }
        
        modal.classList.add('show');
        document.getElementById('projectTitle').focus();
    }

    hideProjectModal() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('show');
        document.getElementById('projectForm').reset();
        this.editingProjectId = null;
    }

    handleProjectSubmit(e) {
        e.preventDefault();
        this.showLoading();
        
        const projectData = {
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDescription').value,
            technologies: document.getElementById('projectTechnologies').value.split(',').map(t => t.trim()),
            imageUrl: document.getElementById('projectImage').value,
            githubUrl: document.getElementById('projectGithub').value || null,
            liveUrl: document.getElementById('projectLive').value || null
        };

        setTimeout(() => {
            if (this.editingProjectId) {
                // Update existing project
                const index = this.projects.findIndex(p => p.id === this.editingProjectId);
                this.projects[index] = { ...this.projects[index], ...projectData };
                this.showNotification('Project updated successfully!', 'success');
            } else {
                // Add new project
                const newProject = {
                    id: Date.now(),
                    ...projectData,
                    createdAt: new Date().toISOString().split('T')[0]
                };
                this.projects.unshift(newProject);
                this.showNotification('Project added successfully!', 'success');
            }
            
            this.saveProjects();
            this.renderProjects();
            this.updateProjectCount();
            this.hideProjectModal();
            this.hideLoading();
        }, 500);
    }

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveProjects();
            this.renderProjects();
            this.updateProjectCount();
            this.showNotification('Project deleted successfully!', 'info');
        }
    }

    // Photo Upload
    handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                document.getElementById('profileImage').src = imageUrl;
                this.userProfile.photo = imageUrl;
                this.saveProfile();
                this.showNotification('Photo updated successfully!', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    // Rendering
    renderInitialContent() {
        this.renderUserProfile();
        this.renderSkills();
        this.renderProjects();
    }

    renderUserProfile() {
        document.getElementById('userName').textContent = this.userProfile.name;
        document.getElementById('userBio').textContent = this.userProfile.bio;
        document.getElementById('profileImage').src = this.userProfile.photo;
        document.getElementById('contactEmail').textContent = this.userProfile.email;
        
        // Initialize typing animation
        this.initTypeAnimation();
        
        // Update social links
        document.getElementById('githubLink').href = this.userProfile.github;
        document.getElementById('linkedinLink').href = this.userProfile.linkedin;
        document.getElementById('emailLink').href = `mailto:${this.userProfile.email}`;
    }

    initTypeAnimation() {
        if (this.typingAnimation) {
            this.typingAnimation.destroy();
        }

        this.typingAnimation = new Typed('#userTitle', {
            strings: [
                'Data Science And Machine Learning Enthusiast',
                'Coder',
                'Student'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 1500,
            loop: true,
            smartBackspace: true
        });
    }

    renderSkills() {
        const skillsGrid = document.getElementById('skillsGrid');
        skillsGrid.innerHTML = this.skills.map(skill => `
            <div class="skill-item">
                <span>${skill}</span>
            </div>
        `).join('');
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        projectsGrid.innerHTML = this.projects.map(project => `
            <div class="project-card">
                <img src="${project.imageUrl}" alt="${project.title}" class="project-image">
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-technologies">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="project-link project-link--outline">
                            <i class="fab fa-github"></i> Code
                        </a>` : ''}
                        ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="project-link project-link--primary">
                            <i class="fas fa-external-link-alt"></i> Live Demo
                        </a>` : ''}
                    </div>
                    <div class="project-actions" style="display: ${this.isLoggedIn ? 'flex' : 'none'};">
                        <button class="action-btn action-btn--edit" onclick="app.showProjectModal(${project.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn action-btn--delete" onclick="app.deleteProject(${project.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateProjectCount() {
        document.getElementById('projectCount').textContent = this.projects.length;
    }

    // Animations and Effects
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0px)';
                }
            });
        }, observerOptions);

        // Observe elements for animation with a delay to ensure they exist
        setTimeout(() => {
            document.querySelectorAll('.project-card, .skill-item').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'all 0.6s ease-out';
                observer.observe(el);
            });
        }, 100);
    }

    // Utility functions
    showLoading() {
        document.getElementById('loadingSpinner').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingSpinner').classList.remove('show');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles for notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? 'var(--color-success)' : 
                       type === 'error' ? 'var(--color-error)' : 
                       'var(--color-info)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: '3000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease-out',
            minWidth: '300px'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Auto hide after 4 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 4000);
    }

    hideNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    static resetData() {
        if (confirm('This will reset all data to default. Continue?')) {
            StorageManager.resetStorage();
        }
    }
}

// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark'; // Changed default from 'light' to 'dark'
        this.toggleBtn = document.getElementById('themeToggleBtn');
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
    }

    bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    applyTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Update toggle button icon
        const icon = this.toggleBtn.querySelector('i');
        if (this.currentTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        
        // Add animation class
        const icon = this.toggleBtn.querySelector('i');
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            icon.style.transform = '';
        }, 500);
    }
}

// Performance Optimizations
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.optimizeScrolling();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    optimizeScrolling() {
        let ticking = false;
        
        function updateScrollPosition() {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelectorAll('.hero-background');
            const speed = 0.5;

            parallax.forEach(element => {
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
    }
}

// Mobile Touch Enhancements
class MobileEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.addTouchFeedback();
        this.optimizeForMobile();
    }

    addTouchFeedback() {
        const buttons = document.querySelectorAll('.btn, .project-card, .skill-item');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }

    optimizeForMobile() {
        // Prevent zoom on input focus
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (window.innerWidth < 768) {
                    document.body.style.zoom = '1';
                }
            });
        });
    }
}

// Mobile Menu Functionality
class MobileMenu {
    constructor() {
        this.menuBtn = document.querySelector('.mobile-menu-btn');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.menuBtn.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !e.target.closest('.nav-menu') && 
                !e.target.closest('.mobile-menu-btn')) {
                this.closeMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.menuBtn.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }

    closeMenu() {
        if (this.isOpen) {
            this.isOpen = false;
            this.menuBtn.classList.remove('active');
            this.navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Initialize the application
let app, themeManager, performanceOptimizer, mobileEnhancements;

document.addEventListener('DOMContentLoaded', function() {
    themeManager = new ThemeManager();
    app = new PortfolioApp();
    performanceOptimizer = new PerformanceOptimizer();
    mobileEnhancements = new MobileEnhancements();
    
    const mobileMenu = new MobileMenu();
    
    // Remove the reset button event listener from here since it's now handled in PortfolioApp
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    if (app) {
        app.showNotification('An error occurred. Please try again.', 'error');
    }
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful');
        }, function(err) {
            console.log('ServiceWorker registration failed');
        });
    });
}