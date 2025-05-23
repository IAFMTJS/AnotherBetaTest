import { BrowserUtils } from './utils/browser.js';

export class UI {
    constructor(app) {
        this.app = app;
        this.state = {
            initialized: false,
            currentSection: null,
            loading: false,
            theme: 'light'
        };

        this.elements = {
            nav: null,
            tabs: null,
            sections: null,
            themeToggle: null,
            loadingOverlay: null,
            notification: null,
            progressBar: null
        };
    }

    initialize() {
        this.state.initialized = true;
        
        // Wait for DOM to be ready
        BrowserUtils.getGlobal().setTimeout(() => {
            this.cacheElements();
            this.setupUI();
            this.setupNavigation();
            this.updateResponsiveLayout();
            this.updateTheme();
            this.setupEventListeners();
        }, 100); // Small delay to ensure DOM is ready
    }

    get data() {
        return this.app.data;
    }

    updateSections() {
        if (!this.app.data) return;

        // Update quiz section
        const quizContainer = BrowserUtils.getGlobal().document.querySelector('.quiz-container');
        if (quizContainer) {
            quizContainer.innerHTML = this.generateQuizControls();
        }

        // Update flashcards section
        const flashcardsContainer = BrowserUtils.getGlobal().document.querySelector('.flashcards-container');
        if (flashcardsContainer) {
            flashcardsContainer.innerHTML = this.generateFlashcardsControls();
        }

        // Update grammar section
        const grammarContainer = BrowserUtils.getGlobal().document.querySelector('.grammar-container');
        if (grammarContainer) {
            grammarContainer.innerHTML = this.generateGrammarControls();
        }

        // Update listening section
        const listeningContainer = BrowserUtils.getGlobal().document.querySelector('.listening-container');
        if (listeningContainer) {
            listeningContainer.innerHTML = this.generateListeningControls();
        }

        // Update kanji section
        const kanjiContainer = BrowserUtils.getGlobal().document.querySelector('.kanji-container');
        if (kanjiContainer) {
            kanjiContainer.innerHTML = this.app.modules.kanji.initialize();
        }
    }

    cacheElements() {
        // Cache DOM elements
        const doc = BrowserUtils.getGlobal().document;
        this.elements.nav = doc.querySelector('.nav');
        this.elements.tabs = Array.from(doc.querySelectorAll('.nav-tab'));
        this.elements.sections = Array.from(doc.querySelectorAll('.section'));
        this.elements.themeToggle = doc.querySelector('.theme-toggle');
        this.elements.loadingOverlay = doc.querySelector('.loading-overlay');
        this.elements.notification = doc.querySelector('.notification');
        this.elements.progressBar = doc.querySelector('.progress-bar');
    }

    setupUI() {
        // Create main content structure
        const mainContent = BrowserUtils.getGlobal().document.querySelector('.main-content');
        if (!mainContent) {
            console.error('Main content container not found');
            return;
        }

        // Create navigation and sections
        mainContent.innerHTML = `
            <nav class="nav">
                <button class="nav-tab active" data-tab="quiz">Quiz</button>
                <button class="nav-tab" data-tab="flashcards">Flashcards</button>
                <button class="nav-tab" data-tab="kanji">Kanji</button>
                <button class="nav-tab" data-tab="grammar">Grammar</button>
                <button class="nav-tab" data-tab="listening">Listening</button>
            </nav>

            <div class="sections">
                <section class="section active" data-section="quiz">
                    ${this.generateQuizControls()}
                </section>
                <section class="section" data-section="flashcards">
                    ${this.generateFlashcardsControls()}
                </section>
                <section class="section" data-section="kanji">
                    ${this.generateKanjiControls()}
                </section>
                <section class="section" data-section="grammar">
                    <div class="grammar-container">
                        ${this.generateGrammarControls()}
                    </div>
                </section>
                <section class="section" data-section="listening">
                    ${this.generateListeningControls()}
                </section>
            </div>
        `;

        // Cache elements after creating them
        this.cacheElements();

        // Initialize components
        this.updateTheme();
    }

    updateLayout() {
        // Add layout update logic here
    }

    updateTheme() {
        const theme = this.state.theme;
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
    }

    setupNavigation() {
        // Initialize navigation
        this.handleTabClick(this.elements.tabs[0]);
    }

    setupEventListeners() {
        // Add event listeners for navigation
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.handleTabClick(tab));
        });

        // Add event listeners for theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.switchTheme());
        }

        // Add event listeners for window resize
        BrowserUtils.getGlobal().window.addEventListener('resize', () => this.updateResponsiveLayout());

        // Add event listeners for quiz controls
        BrowserUtils.getGlobal().document.querySelectorAll('.start-quiz').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.app.modules.quiz.startQuiz(type);
            });
        });

        // Add event listeners for flashcards controls
        BrowserUtils.getGlobal().document.querySelectorAll('.start-flashcards').forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.closest('.section');
                if (!section) return;
                
                // Get current category and mode
                const categorySelect = section.querySelector('.category-select');
                const modeSelect = section.querySelector('.mode-select');
                
                if (categorySelect && modeSelect) {
                    const category = categorySelect.value;
                    const mode = modeSelect.value;
                    
                    // Update flashcards state
                    this.app.modules.flashcards.state.category = category;
                    this.app.modules.flashcards.state.mode = mode;
                    
                    // Start practice
                    this.app.modules.flashcards.startPractice();
                }
            });
        });

        // Add event listeners for grammar controls
        BrowserUtils.getGlobal().document.querySelectorAll('.start-grammar').forEach(button => {
            button.addEventListener('click', () => {
                this.app.modules.grammar.startPractice();
            });
        });

        // Add event listeners for kanji controls
        BrowserUtils.getGlobal().document.querySelectorAll('.start-kanji').forEach(button => {
            button.addEventListener('click', () => {
                this.app.modules.kanji.startPractice();
            });
        });

        // Add event listeners for listening controls
        BrowserUtils.getGlobal().document.querySelectorAll('.start-listening').forEach(button => {
            button.addEventListener('click', () => {
                this.app.modules.listening.startPractice();
            });
        });

        // Add event listeners for category and mode selectors
        BrowserUtils.getGlobal().document.querySelectorAll('.category-select, .mode-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const section = e.target.closest('.section');
                if (!section) return;

                const sectionId = section.id;
                const value = e.target.value;
                const type = e.target.classList.contains('category-select') ? 'category' : 'mode';

                // Update module state based on section
                switch(sectionId) {
                    case 'flashcards':
                        this.app.modules.flashcards.state[type] = value;
                        break;
                    case 'quiz':
                        this.app.modules.quiz.state[type] = value;
                        break;
                    case 'grammar':
                        this.app.modules.grammar.state[type] = value;
                        break;
                }
            });
        });
    }

    handleTabClick(tab) {
        if (!tab) return;
        
        const tabId = tab.getAttribute('data-tab');
        if (!tabId) return;

        const section = BrowserUtils.getGlobal().document.querySelector('[data-section="' + tabId + '"]');
        if (!section) return;

        // Update active states
        if (this.elements.tabs) {
            this.elements.tabs.forEach(t => t.classList.remove('active'));
        }
        if (this.elements.sections) {
            this.elements.sections.forEach(s => s.classList.remove('active'));
        }

        tab.classList.add('active');
        section.classList.add('active');

        // Update ARIA labels
        tab.setAttribute('aria-selected', 'true');
        section.setAttribute('aria-hidden', 'false');

        // Announce section change for screen readers
        this.announce(section);
    }

    announce(element, politeness = 'polite') {
        const announcement = BrowserUtils.getGlobal().document.createElement('div');
        announcement.setAttribute('aria-live', politeness);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.clip = 'rect(0 0 0 0)';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.style.whiteSpace = 'nowrap';
        announcement.style.border = '0';
        announcement.style.padding = '0';
        announcement.style.margin = '-1px';
        announcement.textContent = element.getAttribute('aria-label') || element.textContent;
        BrowserUtils.getGlobal().document.body.appendChild(announcement);
        BrowserUtils.getGlobal().setTimeout(() => announcement.remove(), 0);
    }

    updateProgress(progress) {
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = progress + '%';
        }
    }

    closeActiveElements() {
        // Close any open modals or dropdowns
        BrowserUtils.getGlobal().document.querySelectorAll('.modal').forEach(modal => {
            if (!modal.classList.contains('closed')) {
                modal.classList.add('closed');
                modal.style.display = 'none';
            }
        });
    }

    showHelp() {
        const helpModal = BrowserUtils.getGlobal().document.getElementById('helpModal');
        if (helpModal) {
            helpModal.setAttribute('aria-hidden', 'false');
            helpModal.style.display = 'block';
        }
    }

    closeModal(modalId) {
        const modal = BrowserUtils.getGlobal().document.getElementById(modalId);
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
            modal.style.display = 'none';
        }
    }

    updateResponsiveLayout() {
        const width = BrowserUtils.getGlobal().window.innerWidth;
        
        // Update responsive classes
        BrowserUtils.getGlobal().document.body.classList.toggle('mobile', width < 768);
        BrowserUtils.getGlobal().document.body.classList.toggle('tablet', width >= 768 && width < 1024);
        BrowserUtils.getGlobal().document.body.classList.toggle('desktop', width >= 1024);
    }

    initializeTheme() {
        const savedTheme = BrowserUtils.getGlobal().localStorage.getItem('theme');
        if (savedTheme) {
            this.state.theme = savedTheme;
        }
        BrowserUtils.getGlobal().document.documentElement.setAttribute('data-theme', this.state.theme);
    }

    switchTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        BrowserUtils.getGlobal().document.documentElement.setAttribute('data-theme', this.state.theme);
        BrowserUtils.getGlobal().localStorage.setItem('theme', this.state.theme);
        const root = BrowserUtils.getGlobal().document.documentElement;
        if (this.state.theme === 'dark') {
            root.classList.add('dark-mode');
        } else {
            root.classList.remove('dark-mode');
        }
    }

    displayLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.add('active');
        }
    }

    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.remove('active');
        }
    }

    displayNotification(message, type = 'info') {
        if (this.elements.notification) {
            this.elements.notification.textContent = message;
            this.elements.notification.classList.add('notification-' + type);
            this.elements.notification.classList.add('active');

            BrowserUtils.createTimeout(() => {
                this.elements.notification.classList.remove('active');
            }, 3000);
        }
    }

    // Generate controls for each section
    generateQuizControls() {
        return `
            <h2>Quiz</h2>
            <div class="quiz-controls">
                <button class="start-quiz" data-type="multiple-choice">
                    <span class="icon">🎯</span>
                    Multiple Choice
                </button>
                <button class="start-quiz" data-type="fill-in">
                    <span class="icon">📝</span>
                    Fill in the Blanks
                </button>
                <button class="start-quiz" data-type="matching">
                    <span class="icon">🔄</span>
                    Matching
                </button>
            </div>
            <div class="quiz-settings">
                <div class="category-selector">
                    <label>Category:</label>
                    <select class="category-select">
                        <option value="all">All Categories</option>
                        <option value="numbers">Numbers</option>
                        <option value="animals">Animals</option>
                        <option value="food">Food</option>
                        <option value="colors">Colors</option>
                        <option value="phrases">Phrases</option>
                    </select>
                </div>
                <div class="difficulty-selector">
                    <label>Difficulty:</label>
                    <select class="difficulty-select">
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div class="questions-selector">
                    <label>Questions:</label>
                    <select class="questions-select">
                        <option value="5">5 Questions</option>
                        <option value="10">10 Questions</option>
                        <option value="15">15 Questions</option>
                    </select>
                </div>
            </div>
        `;
    }

    // Generate flashcards controls
    generateFlashcardsControls() {
        return `
            <h2>Flashcards</h2>
            <div class="flashcards-controls">
                <button class="start-flashcards">
                    <span class="icon">🎴</span>
                    Start Practice
                </button>
            </div>
            <div class="flashcards-settings">
                <div class="category-selector">
                    <label>Category:</label>
                    <select class="category-select">
                        <option value="all">All Categories</option>
                        <option value="numbers">Numbers</option>
                        <option value="animals">Animals</option>
                        <option value="food">Food</option>
                        <option value="colors">Colors</option>
                        <option value="phrases">Phrases</option>
                    </select>
                </div>
                <div class="mode-selector">
                    <label>Mode:</label>
                    <select class="mode-select">
                        <option value="kanji">Kanji → Reading</option>
                        <option value="reading">Reading → Kanji</option>
                        <option value="meaning">Kanji → Meaning</option>
                    </select>
                </div>
            </div>
        `;
    }

    // Generate grammar controls
    generateGrammarControls() {
        return `
            <h2>Grammar</h2>
            <div class="grammar-controls">
                <button class="start-grammar">
                    <span class="icon">📝</span>
                    Start Practice
                </button>
            </div>
            <div class="grammar-settings">
                <div class="level-selector">
                    <label>Level:</label>
                    <select class="level-select">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                <div class="category-selector">
                    <label>Category:</label>
                    <select class="category-select">
                        <option value="all">All Categories</option>
                        <option value="numbers">Numbers</option>
                        <option value="animals">Animals</option>
                        <option value="food">Food</option>
                        <option value="colors">Colors</option>
                        <option value="phrases">Phrases</option>
                    </select>
                </div>
            </div>
        `;
    }

    // Generate kanji controls
    generateKanjiControls() {
        return `
            <h2>Kanji</h2>
            <div class="kanji-controls">
                <button class="start-kanji">
                    <span class="icon">KANJI</span>
                    Start Kanji Practice
                </button>
            </div>
        `;
    }

    // Generate listening controls
    generateListeningControls() {
        return `
            <h2>Listening</h2>
            <div class="listening-controls">
                <button class="start-listening">
                    <span class="icon">🔊</span>
                    Start Practice
                </button>
            </div>
            <div class="listening-settings">
                <div class="category-selector">
                    <label>Category:</label>
                    <select class="category-select">
                        <option value="all">All Categories</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                <div class="level-selector">
                    <label>Level:</label>
                    <select class="level-select">
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
            </div>
        `;
    }

}
