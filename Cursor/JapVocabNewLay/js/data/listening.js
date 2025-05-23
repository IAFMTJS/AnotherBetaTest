/* eslint-env es6 */
/* eslint-disable no-undef */

// Create and export the exercises object
const exercises = {
    beginner: [
        {
            id: '1',
            title: 'Introduction',
            difficulty: 'beginner',
            audioFile: 'audio/beginner/intro.mp3',
            transcript: 'こんにちは。私の名前は田中です。',
            translation: 'Hello. My name is Tanaka.',
            questions: [
                {
                    id: '1.1',
                    question: 'What is the speaker\'s name?',
                    options: ['田中', '山田', '佐藤', '鈴木'],
                    correctAnswer: '田中'
                },
                {
                    id: '1.2',
                    question: 'What is the speaker saying?',
                    options: ['Goodbye', 'Hello', 'Thank you', 'Sorry'],
                    correctAnswer: 'Hello'
                }
            ]
        },
        {
            id: '2',
            title: 'Basic Greetings',
            difficulty: 'beginner',
            audioFile: 'audio/beginner/greetings.mp3',
            transcript: 'こんにちは。元気ですか？はい、元気です。',
            translation: 'Hello. How are you? Yes, I\'m fine.',
            questions: [
                {
                    id: '2.1',
                    question: 'What is the speaker asking?',
                    options: ['How are you?', 'What is your name?', 'Where are you from?', 'What time is it?'],
                    correctAnswer: 'How are you?'
                },
                {
                    id: '2.2',
                    question: 'How is the speaker?',
                    options: ['元気', '忙しい', '疲れた', '悲しい'],
                    correctAnswer: '元気'
                }
            ]
        }
    ],
    intermediate: [
        {
            id: '3',
            title: 'Restaurant Conversation',
            difficulty: 'intermediate',
            audioFile: 'audio/intermediate/restaurant.mp3',
            transcript: 'すみません、このメニューをください。はい、これでよろしいですか？',
            translation: 'Excuse me, may I have this menu? Yes, would this be okay?',
            questions: [
                {
                    id: '3.1',
                    question: 'What is the speaker asking for?',
                    options: ['Menu', 'Bill', 'Water', 'Noodles'],
                    correctAnswer: 'Menu'
                },
                {
                    id: '3.2',
                    question: 'What is the speaker confirming?',
                    options: ['Time', 'Order', 'Price', 'Location'],
                    correctAnswer: 'Order'
                }
            ]
        },
        {
            id: '4',
            title: 'Train Station Conversation',
            difficulty: 'intermediate',
            audioFile: 'audio/intermediate/train.mp3',
            transcript: 'この電車は新宿行きですか？はい、新宿行きです。',
            translation: 'Is this train going to Shinjuku? Yes, it\'s going to Shinjuku.',
            questions: [
                {
                    id: '4.1',
                    question: 'What destination is being asked about?',
                    options: ['新宿', '渋谷', '池袋', '上野'],
                    correctAnswer: '新宿'
                },
                {
                    id: '4.2',
                    question: 'What is the speaker confirming?',
                    options: ['Train time', 'Train destination', 'Train price', 'Train seat'],
                    correctAnswer: 'Train destination'
                }
            ]
        }
    ],
    advanced: [
        {
            id: '5',
            title: 'Business Meeting',
            difficulty: 'advanced',
            audioFile: 'audio/advanced/meeting.mp3',
            transcript: 'このプロジェクトについて、詳しく説明してください。はい、このプロジェクトの目的は...',
            translation: 'Please explain about this project in detail. Yes, the purpose of this project is...',
            questions: [
                {
                    id: '5.1',
                    question: 'What is being requested?',
                    options: ['Project details', 'Personal information', 'Travel plans', 'Menu choice'],
                    correctAnswer: 'Project details'
                },
                {
                    id: '5.2',
                    question: 'What is the speaker discussing?',
                    options: ['Project purpose', 'Personal hobbies', 'Weekend plans', 'Restaurant menu'],
                    correctAnswer: 'Project purpose'
                }
            ]
        },
        {
            id: '6',
            title: 'University Lecture',
            difficulty: 'advanced',
            audioFile: 'audio/advanced/lecture.mp3',
            transcript: 'この研究の重要なポイントは、新しい発見です。',
            translation: 'The important point of this research is the new discovery.',
            questions: [
                {
                    id: '6.1',
                    question: 'What is the main point of the lecture?',
                    options: ['New discovery', 'Historical event', 'Economic theory', 'Literary analysis'],
                    correctAnswer: 'New discovery'
                },
                {
                    id: '6.2',
                    question: 'What is being discussed?',
                    options: ['Research', 'Personal story', 'Travel experience', 'Cooking recipe'],
                    correctAnswer: 'Research'
                }
            ]
        }
    ]
};

// Export the exercises object
export const listening = exercises;
window.listeningExercises = exercises;
