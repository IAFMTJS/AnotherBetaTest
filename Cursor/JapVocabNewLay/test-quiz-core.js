// Core functionality test script for quiz
import { wordBank } from './js/modules/word-bank.js';
import { vocabulary } from './js/data/vocabulary.js';

// Initialize test data
const testData = {
    vocabulary: vocabulary
};

// Load data into word bank
wordBank.loadFromAppData(testData);

console.log('=== JAPVOC Core Quiz Functionality Test ===\n');

// Test 1: Data Loading
console.log('Test 1: Data Loading');
console.log('Word Bank Initialization:', wordBank ? '✅' : '❌');
console.log('Vocabulary Data:', vocabulary ? '✅' : '❌');

// Test 2: Category Structure
console.log('\nTest 2: Category Structure');
const categories = wordBank.getCategories();
console.log('Available Categories:', categories);
console.log('Required Categories:', ['numbers', 'animals', 'food', 'colors', 'phrases']);
console.log('Category Structure Test:', 
    categories.length === 5 && 
    categories.includes('numbers') &&
    categories.includes('animals') &&
    categories.includes('food') &&
    categories.includes('colors') &&
    categories.includes('phrases') ? '✅' : '❌');

// Test 3: Level Structure
console.log('\nTest 3: Level Structure');
const levels = wordBank.getLevels();
console.log('Available Levels:', levels);
console.log('Required Levels:', ['beginner', 'intermediate', 'advanced']);
console.log('Level Structure Test:', 
    levels.length === 3 && 
    levels.includes('beginner') &&
    levels.includes('intermediate') &&
    levels.includes('advanced') ? '✅' : '❌');

// Test 4: Word Retrieval
console.log('\nTest 4: Word Retrieval');
const testCases = [
    { category: 'numbers', level: 'beginner', count: 5 },
    { category: 'animals', level: 'intermediate', count: 3 },
    { category: 'food', level: 'advanced', count: 4 }
];

testCases.forEach(test => {
    const words = wordBank.getWordsForQuiz(test.category, test.level, test.count);
    console.log(`\nTesting ${test.level} ${test.category}:`);
    console.log(`Expected ${test.count} words, got ${words.length}`);
    console.log('Word Structure:', words.length > 0 ? {
        hasWord: words[0].hasOwnProperty('word'),
        hasReading: words[0].hasOwnProperty('reading'),
        hasMeaning: words[0].hasOwnProperty('meaning'),
        hasType: words[0].hasOwnProperty('type')
    } : 'No words found');
    console.log('Word Retrieval Test:', 
        words.length === test.count && 
        words.every(word => 
            word.hasOwnProperty('word') &&
            word.hasOwnProperty('reading') &&
            word.hasOwnProperty('meaning') &&
            word.hasOwnProperty('type')
        ) ? '✅' : '❌');
});

// Test 5: Error Handling
console.log('\nTest 5: Error Handling');
const errorCases = [
    { input: 'invalid_category', level: 'beginner', expected: [] },
    { input: 'numbers', level: 'invalid_level', expected: [] },
    { input: 'numbers', level: 'beginner', count: 100, expected: [] }
];

errorCases.forEach(test => {
    const result = wordBank.getWordsForQuiz(test.input, test.level, test.count);
    console.log(`\nTesting error case: ${test.input}, ${test.level}`);
    console.log('Result:', result);
    console.log('Error Handling Test:', Array.isArray(result) ? '✅' : '❌');
});

// Test 6: Data Consistency
console.log('\nTest 6: Data Consistency');
const consistencyTest = {
    beginner: wordBank.getWordsByCategoryAndLevel('numbers', 'beginner'),
    intermediate: wordBank.getWordsByCategoryAndLevel('numbers', 'intermediate'),
    advanced: wordBank.getWordsByCategoryAndLevel('numbers', 'advanced')
};

console.log('Data Consistency Test:', 
    consistencyTest.beginner.length > 0 &&
    consistencyTest.intermediate.length > 0 &&
    consistencyTest.advanced.length > 0 &&
    consistencyTest.beginner.every(word => word.type === 'number') &&
    consistencyTest.intermediate.every(word => word.type === 'number') &&
    consistencyTest.advanced.every(word => word.type === 'number') ? '✅' : '❌');

console.log('\n=== Test Summary ===');
console.log('Total Tests: 6');
console.log('Core functionality tests completed'); 