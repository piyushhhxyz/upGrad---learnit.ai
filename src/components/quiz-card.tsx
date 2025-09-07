import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

// shadcn/ui components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
        {children}
    </div>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-1.5 p-6 pb-4 ${className}`}>{children}</div>
);

const Button = ({
    children,
    onClick,
    variant = 'default',
    size = 'default',
    disabled = false,
    className = ''
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    disabled?: boolean;
    className?: string;
}) => {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground'
    };

    const sizes = {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

const RadioGroup = ({ children, onValueChange, value, className = '' }: {
    children: React.ReactNode;
    onValueChange: (value: string) => void;
    value: string;
    className?: string;
}) => (
    <div className={`grid gap-2 ${className}`} role="radiogroup">
        {React.Children.map(children, (child) =>
            React.cloneElement(child as React.ReactElement, {
                onValueChange,
                checked: value === (child as React.ReactElement).props.value,
                name: 'quiz-option'
            })
        )}
    </div>
);

const RadioGroupItem = ({
    value,
    onValueChange,
    checked,
    disabled = false,
    className = ''
}: {
    value: string;
    id?: string;
    onValueChange?: (value: string) => void;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
}) => (
    <button
        type="button"
        role="radio"
        aria-checked={checked}
        onClick={() => !disabled && onValueChange?.(value)}
        disabled={disabled}
        className={`h-4 w-4 rounded-full border-2 shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${checked
            ? 'border-slate-900 bg-slate-900'
            : 'border-slate-400 bg-white hover:border-slate-600'
            } ${className}`}
    >
        {checked && (
            <div className="flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
            </div>
        )}
    </button>
);

const Label = ({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
        {children}
    </label>
);

interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface QuizQuestion {
    id: string;
    question: string;
    options: QuizOption[];
    explanation?: string;
}

interface QuizCardProps {
    quizData: QuizQuestion;
    onCorrectAnswer: () => void;
    onWrongAnswer: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quizData, onCorrectAnswer, onWrongAnswer }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleAnswerSelect = (optionId: string) => {
        if (isSubmitted) return; // Don't allow changes after submission

        setSelectedAnswer(optionId);
        setIsSubmitted(true);
        setShowExplanation(true);

        const selectedOption = quizData.options.find(opt => opt.id === optionId);
        if (selectedOption?.isCorrect) {
            console.log('✅ Correct Answer!', {
                question: quizData.question,
                selectedAnswer: selectedOption.text,
                isCorrect: true
            });
            onCorrectAnswer();
        } else {
            console.log('❌ Wrong Answer!', {
                question: quizData.question,
                selectedAnswer: selectedOption?.text,
                correctAnswer: quizData.options.find(opt => opt.isCorrect)?.text,
                isCorrect: false
            });
            onWrongAnswer();
        }
    };

    const handleReset = () => {
        setSelectedAnswer('');
        setIsSubmitted(false);
        setShowExplanation(false);
    };

    const selectedOption = quizData.options.find(opt => opt.id === selectedAnswer);
    const correctOption = quizData.options.find(opt => opt.isCorrect);
    const isCorrect = selectedOption?.isCorrect || false;

    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <Card className="w-full max-w-2xl border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-medium text-slate-600">Question {quizData.id}</span>
                        </div>
                        {isSubmitted && (
                            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reset
                            </Button>
                        )}
                    </div>

                    <h2 className="text-xl font-semibold text-slate-900 leading-relaxed">
                        {quizData.question}
                    </h2>
                </CardHeader>

                <CardContent className="space-y-6">
                    <RadioGroup
                        value={selectedAnswer}
                        onValueChange={setSelectedAnswer}
                        className="space-y-3"
                    >
                        {quizData.options.map((option) => {
                            const isSelected = selectedAnswer === option.id;
                            const showCorrect = isSubmitted && option.isCorrect;
                            const showWrong = isSubmitted && isSelected && !option.isCorrect;

                            return (
                                <div key={option.id} className="group">
                                    <div
                                        className={`flex items-start space-x-3 rounded-lg border p-4 transition-all duration-200 cursor-pointer ${!isSubmitted ? (isSelected
                                            ? 'border-slate-300 bg-slate-50 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                        ) : showCorrect
                                            ? 'border-emerald-200 bg-emerald-50/50 shadow-sm'
                                            : showWrong
                                                ? 'border-red-200 bg-red-50/50 shadow-sm'
                                                : 'border-slate-200 bg-slate-50/30'
                                            }`}
                                        onClick={() => handleAnswerSelect(option.id)}
                                    >
                                        <div className="flex items-center pt-0.5">
                                            <RadioGroupItem
                                                value={option.id}
                                                id={option.id}
                                                disabled={isSubmitted}
                                                className={
                                                    showCorrect
                                                        ? 'border-emerald-500 bg-emerald-500'
                                                        : showWrong
                                                            ? 'border-red-500 bg-red-500'
                                                            : ''
                                                }
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <Label
                                                htmlFor={option.id}
                                                className={`cursor-pointer block leading-relaxed ${showCorrect
                                                    ? 'text-emerald-900'
                                                    : showWrong
                                                        ? 'text-red-900'
                                                        : 'text-slate-700'
                                                    }`}
                                            >
                                                {option.text}
                                            </Label>
                                        </div>

                                        {isSubmitted && (
                                            <div className="flex-shrink-0">
                                                {showCorrect && (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                )}
                                                {showWrong && (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </RadioGroup>


                    {isSubmitted && (
                        <div className="space-y-4 pt-2 border-t border-slate-200/60">
                            <div className={`flex items-center space-x-2 text-sm font-medium ${isCorrect ? 'text-emerald-700' : 'text-red-700'
                                }`}>
                                {isCorrect ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Correct! Well done.</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4" />
                                        <span>Incorrect. The correct answer is &quot;{correctOption?.text}&quot;</span>
                                    </>
                                )}
                            </div>

                            {quizData.explanation && showExplanation && (
                                <div className="rounded-lg bg-slate-50/50 border border-slate-200/60 p-4">
                                    <h4 className="text-sm font-medium text-slate-900 mb-2">Explanation</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {quizData.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizCard;
