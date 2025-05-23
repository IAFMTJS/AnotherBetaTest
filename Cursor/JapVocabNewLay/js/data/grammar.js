export const grammar = {
    beginner: [
        {
            id: '1',
            topic: 'Introductions',
            difficulty: 'beginner',
            content: [
                {
                    title: 'Basic Greetings',
                    examples: [
                        {
                            japanese: 'こんにちは (konnichiwa)',
                            meaning: 'Hello'
                        },
                        {
                            japanese: 'こんばんは (konbanwa)',
                            meaning: 'Good evening'
                        },
                        {
                            japanese: 'おはよう (ohayou)',
                            meaning: 'Good morning'
                        }
                    ]
                },
                {
                    title: 'Basic Self-Introduction',
                    examples: [
                        {
                            japanese: '私は (watashi wa)',
                            meaning: 'I am'
                        },
                        {
                            japanese: '私の名前は (watashi no namae wa)',
                            meaning: 'My name is'
                        }
                    ]
                }
            ]
        },
        {
            id: '2',
            topic: 'Basic Questions',
            difficulty: 'beginner',
            content: [
                {
                    title: 'Yes/No Questions',
                    examples: [
                        {
                            japanese: 'ですか (desu ka)',
                            meaning: 'Is it?'
                        },
                        {
                            japanese: 'ますか (masu ka)',
                            meaning: 'Do you?'
                        }
                    ]
                },
                {
                    title: 'Question Words',
                    examples: [
                        {
                            japanese: '何 (nani)',
                            meaning: 'What'
                        },
                        {
                            japanese: '誰 (dare)',
                            meaning: 'Who'
                        },
                        {
                            japanese: 'どこ (doko)',
                            meaning: 'Where'
                        }
                    ]
                }
            ]
        },
        {
            id: '3',
            topic: 'Adjectives',
            difficulty: 'beginner',
            content: [
                {
                    title: 'い-adjectives',
                    examples: [
                        {
                            japanese: '大きい (ookii)',
                            meaning: 'Big'
                        },
                        {
                            japanese: '小さい (chiisai)',
                            meaning: 'Small'
                        },
                        {
                            japanese: '高い (takai)',
                            meaning: 'Tall/Expensive'
                        }
                    ]
                },
                {
                    title: 'な-adjectives',
                    examples: [
                        {
                            japanese: '静かな (shizukana)',
                            meaning: 'Quiet'
                        },
                        {
                            japanese: '元気な (genki na)',
                            meaning: 'Energetic'
                        },
                        {
                            japanese: '新しい (atarashii)',
                            meaning: 'New'
                        }
                    ]
                }
            ]
        }
    ],
    intermediate: [
        {
            id: '4',
            topic: 'Verb Conjugations',
            difficulty: 'intermediate',
            content: [
                {
                    title: 'て-form',
                    examples: [
                        {
                            japanese: '食べる (taberu) → 食べて (tabete)',
                            meaning: 'to eat → eating'
                        },
                        {
                            japanese: '見る (miru) → 見て (mite)',
                            meaning: 'to see → seeing'
                        },
                        {
                            japanese: 'する (suru) → して (shite)',
                            meaning: 'to do → doing'
                        }
                    ]
                },
                {
                    title: 'て-form Uses',
                    examples: [
                        {
                            japanese: '食事をしてから寝ます (shokuji wo shite kara nemasu)',
                            meaning: 'I eat and then sleep'
                        },
                        {
                            japanese: '友達に会ってから帰ります (tomodachi ni atte kara kaerimasu)',
                            meaning: 'I meet my friend and then return'
                        }
                    ]
                }
            ]
        },
        {
            id: '5',
            topic: 'Conditional Forms',
            difficulty: 'intermediate',
            content: [
                {
                    title: 'ば-form',
                    examples: [
                        {
                            japanese: '早く起きれば、電車に間に合う (hayaku okireba, densha ni maniau)',
                            meaning: 'If I wake up early, I\'ll catch the train'
                        },
                        {
                            japanese: '勉強すれば、試験に合格できる (benkyou sureba, shiken ni gokaku dekiru)',
                            meaning: 'If I study, I can pass the exam'
                        }
                    ]
                },
                {
                    title: 'たら-form',
                    examples: [
                        {
                            japanese: '学校に着いたら、友達に会った (gakkou ni tsuitara, tomodachi ni atta)',
                            meaning: 'When I arrived at school, I met my friend'
                        },
                        {
                            japanese: '試験が終わったら、友達と遊んだ (shiken ga owattara, tomodachi to asonda)',
                            meaning: 'After the exam ended, I played with my friend'
                        }
                    ]
                }
            ]
        }
    ],
    advanced: [
        {
            id: '6',
            topic: 'Advanced Sentence Patterns',
            difficulty: 'advanced',
            content: [
                {
                    title: 'Advanced Conditional Patterns',
                    examples: [
                        {
                            japanese: '～と (to)',
                            meaning: 'When/If'
                        },
                        {
                            japanese: '～なら (nara)',
                            meaning: 'If (with a condition)'
                        },
                        {
                            japanese: '～たら (tara)',
                            meaning: 'When/If (past)'
                        },
                        {
                            japanese: '～ば (ba)',
                            meaning: 'If (with a condition)'
                        }
                    ]
                },
                {
                    title: 'Advanced Expressions',
                    examples: [
                        {
                            japanese: '～つつ (ttsu)',
                            meaning: 'While'
                        },
                        {
                            japanese: '～ながら (nagara)',
                            meaning: 'While'
                        },
                        {
                            japanese: '～つつも (ttsu mo)',
                            meaning: 'Although'
                        },
                        {
                            japanese: '～ながらも (nagara mo)',
                            meaning: 'Although'
                        }
                    ]
                }
            ]
        },
        {
            id: '7',
            topic: 'Potential Forms',
            difficulty: 'advanced',
            content: [
                {
                    title: 'Potential Form of る-verbs',
                    examples: [
                        {
                            japanese: '見る (miru) → 見られる (mirareru)',
                            meaning: 'can see'
                        },
                        {
                            japanese: '食べる (taberu) → 食べられる (taberareru)',
                            meaning: 'can eat'
                        },
                        {
                            japanese: '話す (hanasu) → 話せる (hanaseru)',
                            meaning: 'can speak'
                        }
                    ]
                },
                {
                    title: 'Potential Form of う-verbs',
                    examples: [
                        {
                            japanese: '書く (kaku) → 書ける (kakeru)',
                            meaning: 'can write'
                        },
                        {
                            japanese: '泳ぐ (oyogu) → 泳げる (oyogeru)',
                            meaning: 'can swim'
                        },
                        {
                            japanese: '歩く (aruku) → 歩ける (arukeru)',
                            meaning: 'can walk'
                        }
                    ]
                }
            ]
        }
    ]
};
