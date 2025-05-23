import { BrowserUtils } from './utils/browser.js';

export default class Grammar {
    constructor(app) {
        this.app = app;
        this.state = {
            exercises: [],
            currentExercise: null,
            category: 'all',
            level: 'beginner',
            initialized: false,
            categorySelect: null,
            levelSelect: null
        };
    }

    initialize() {
        // Check if container exists
        const container = document.querySelector('.grammar-container');
        if (!container) {
            BrowserUtils.getSafeConsole().error('Grammar container not found');
            return;
        }

        // Initialize HTML content
        container.innerHTML = this.getHtmlContent();
        
        // Cache DOM elements
        this.state.categorySelect = container.querySelector('.category-select');
        this.state.levelSelect = container.querySelector('.level-select');
        
        if (!this.state.categorySelect || !this.state.levelSelect) {
            BrowserUtils.getSafeConsole().error('Category or level selector not found');
            return;
        }

        // Load initial exercises
        this.loadExercises();

        // Add event listeners
        this.state.categorySelect.addEventListener('change', () => {
            this.state.category = this.state.categorySelect.value;
            this.loadExercises();
        });

        this.state.levelSelect.addEventListener('change', () => {
            this.state.level = this.state.levelSelect.value;
            this.loadExercises();
        });

        this.state.initialized = true;
    }

    getHtmlContent() {
        return `
            <div class="grammar-container">
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
            </div>
        `;
    }

    loadExercises() {
        // Get exercises from data
        const data = this.app.data;
        if (!data) {
            BrowserUtils.getSafeConsole().error('Data not initialized');
            return;
        }

        // Map category to grammar data
        const categoryMap = {
            'all': 'all',
            'numbers': 'numbers',
            'animals': 'animals',
            'food': 'food',
            'colors': 'colors',
            'phrases': 'phrases'
        };

        // Get mapped category
        const mappedCategory = categoryMap[this.state.category] || 'all';
        
        // Get exercises from grammar data
        let exercises = mappedCategory === 'all' 
            ? Object.values(data.grammar).flat()
            : data.grammar[mappedCategory] || [];
        
        // Apply level filtering if level is not 'all'
        if (this.state.level !== 'all') {
            this.state.exercises = exercises.filter(exercise => 
                exercise.level === this.state.level
            );
        } else {
            this.state.exercises = exercises;
        }

        // Log the loaded exercises for debugging
        BrowserUtils.getSafeConsole().log(`Loaded ${this.state.exercises.length} exercises for category: ${this.state.category}, level: ${this.state.level}`);

        // Show a notification if no exercises are found
        if (this.state.exercises.length === 0) {
            BrowserUtils.getSafeConsole().warn(`No exercises found for category: ${this.state.category}, level: ${this.state.level}`);
        }
    }

    startPractice() {
        // Check if module is initialized
        if (!this.state.initialized) {
            BrowserUtils.getSafeConsole().error('Grammar module not initialized');
            return;
        }

        // Get current category and level from cached selectors
        const categorySelect = this.state.categorySelect;
        const levelSelect = this.state.levelSelect;
        
        if (!categorySelect || !levelSelect) {
            BrowserUtils.getSafeConsole().error('Category or level selector not found');
            return;
        }

        const category = categorySelect.value;
        const level = levelSelect.value;

        // Load exercises for the selected category and level
        this.state.category = category;
        this.state.level = level;
        this.loadExercises();

        // Start practice session
        if (this.state.exercises.length === 0) {
            BrowserUtils.getSafeConsole().error('No exercises available for selected category and level');
            return;
        }

        // Start with the first exercise
        this.state.currentExercise = this.state.exercises[0];
        this.showTopicDetails(this.state.currentExercise);
    }

    setupEventListeners() {
        // Add event listeners for grammar interactions
    }

    loadTopics() {
        // Load grammar topics
    }

    showTopicDetails(topic) {
        if (!topic) return;

        this.state.currentTopic = topic;
        
        // Get container safely
        const container = document.querySelector('.grammar-container');
        if (container) {
            // Clear existing content
            const details = container.querySelector('.topic-details');
            if (details) details.remove();

            container.innerHTML += `
                <div class="topic-details">
                    <h3>${topic.title}</h3>
                    <p class="explanation">${topic.explanation}</p>
                    <div class="examples">
                        ${topic.examples.map(example => `
                            <div class="example-sentence">
                                <p class="japanese">${example.japanese}</p>
                                <p class="translation">${example.translation}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    showExamples() {
        // Display example sentences
    }
}
