// Test script for quiz and word bank synchronization
import { wordBank } from './js/modules/word-bank.js';
import { vocabulary } from './js/data/vocabulary.js';

// Initialize test data
const testData = {
    vocabulary: vocabulary
};

// Load data into word bank
wordBank.loadFromAppData(testData);

// Test getting words for quiz
console.log('Testing word bank functionality:');

// Test 1: Get words for beginner numbers
const beginnerNumbers = wordBank.getWordsForQuiz('numbers', 'beginner', 5);
console.log('\nTest 1 - Beginner Numbers:');
console.log(`Found ${beginnerNumbers.length} words`);
console.log(beginnerNumbers);

// Test 2: Get words for intermediate animals
const intermediateAnimals = wordBank.getWordsForQuiz('animals', 'intermediate', 3);
console.log('\nTest 2 - Intermediate Animals:');
console.log(`Found ${intermediateAnimals.length} words`);
console.log(intermediateAnimals);

// Test 3: Get all categories
const categories = wordBank.getCategories();
console.log('\nTest 3 - Available Categories:');
console.log(categories);

// Test 4: Get all levels
const levels = wordBank.getLevels();
console.log('\nTest 4 - Available Levels:');
console.log(levels);

// Test 5: Get words by category and level
const advancedFood = wordBank.getWordsByCategoryAndLevel('food', 'advanced');
console.log('\nTest 5 - Advanced Food Words:');
console.log(`Found ${advancedFood.length} words`);
console.log(advancedFood); 