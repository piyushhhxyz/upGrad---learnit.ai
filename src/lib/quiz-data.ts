export interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: QuizOption[];
    explanation?: string;
}

export const pythonQuizData: QuizQuestion = {
    id: "1",
    question: "What is the correct way to create a list in Python?",
    options: [
        {
            id: "a",
            text: "list = []",
            isCorrect: false
        },
        {
            id: "b",
            text: "my_list = []",
            isCorrect: true
        },
        {
            id: "c",
            text: "array = []",
            isCorrect: false
        },
        {
            id: "d",
            text: "var = []",
            isCorrect: false
        }
    ],
    explanation: "In Python, you can create a list using square brackets []. While 'list' is a built-in type name, it's better practice to use descriptive variable names like 'my_list' to avoid confusion with the built-in list type."
};
