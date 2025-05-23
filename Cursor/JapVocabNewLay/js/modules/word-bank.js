export const wordBank = {
    // Initialize empty structures
    words: {},
    categories: {},
    levels: {},
    
    // Add methods to interact with the word bank
    addWord(wordId, wordData) {
        this.words[wordId] = wordData;
    },
    
    getWord(wordId) {
        return this.words[wordId];
    },
    
    addCategory(categoryId, categoryData) {
        this.categories[categoryId] = categoryData;
    },
    
    getCategory(categoryId) {
        return this.categories[categoryId];
    },
    
    addLevel(levelId, levelData) {
        this.levels[levelId] = levelData;
    },
    
    getLevel(levelId) {
        return this.levels[levelId];
    },

    // Load word bank data from app data
    loadFromAppData(appData) {
        if (!appData || !appData.vocabulary) {
            console.error('Invalid app data provided to word bank');
            return;
        }

        // Clear existing data
        this.words = {};
        this.categories = {};
        this.levels = {};

        // Load vocabulary data into words
        Object.entries(appData.vocabulary).forEach(([level, categories]) => {
            // Add level
            this.addLevel(level, { name: level });

            // Process each category in the level
            Object.entries(categories).forEach(([category, words]) => {
                // Add category if not exists
                if (!this.categories[category]) {
                    this.addCategory(category, { 
                        name: category,
                        levels: {}
                    });
                }

                // Add category to level
                this.categories[category].levels[level] = words;

                // Add words with unique IDs
                words.forEach((word, index) => {
                    const wordId = `${level}_${category}_${index}`;
                    this.addWord(wordId, {
                        ...word,
                        id: wordId,
                        level,
                        category
                    });
                });
            });
        });

        console.log('Word bank loaded from app data');
    },

    // Get words for quiz
    getWordsForQuiz(category, level, count = 10) {
        if (!this.categories[category] || !this.categories[category].levels[level]) {
            console.error(`No words found for category: ${category}, level: ${level}`);
            return [];
        }

        const words = this.categories[category].levels[level];
        return this.shuffleArray(words).slice(0, count);
    },

    // Get all available categories
    getCategories() {
        return Object.keys(this.categories);
    },

    // Get all available levels
    getLevels() {
        return Object.keys(this.levels);
    },

    // Get words by category and level
    getWordsByCategoryAndLevel(category, level) {
        if (!this.categories[category] || !this.categories[category].levels[level]) {
            return [];
        }
        return this.categories[category].levels[level];
    },

    // Utility method to shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};
