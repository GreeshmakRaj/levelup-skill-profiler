// Mock data for demo purposes — shaped to match the real backend response structure.
// Replace with real API calls once VITE_QUIZ_API_URL is wired up.

export const mockAssessments = [
  {
    id: "a-python-fundamentals",
    title: "Python Fundamentals",
    description: "Core language features, data types, and OOP basics.",
    module_id: "mod-python-basics",
    question_count: 10,
    status: "not_started", // "not_started" | "in_progress" | "completed"
    last_score: null,
  },
];

// Exact structure as provided by the backend team.
export const mockQuestions = {
  "a-python-fundamentals": [
    {
      id: "q-546b29e3",
      sequence_number: 1,
      question_text: "Which of the following Python data types is immutable?",
      question_type: "MCQ",
      options: {
        a: "list",
        b: "dictionary",
        c: "tuple",
        d: "set",
      },
    },
    {
      id: "q-a453ae76",
      sequence_number: 2,
      question_text: "What is true about Python dictionaries?",
      question_type: "MCQ",
      options: {
        a: "Keys must be mutable objects",
        b: "Order of items is guaranteed since Python 3.6",
        c: "They can contain duplicate keys",
        d: "Values are required to be unique",
      },
    },
    {
      id: "q-018352b5",
      sequence_number: 3,
      question_text: "The Singleton design pattern primarily ensures that:",
      question_type: "MCQ",
      options: {
        a: "Only one instance of a class can be created",
        b: "Objects are created without using a constructor",
        c: "All subclasses share the same state",
        d: "Methods are executed in a single thread",
      },
    },
    {
      id: "q-d612fc9e",
      sequence_number: 4,
      question_text:
        "Which design pattern is best suited for creating families of related objects without specifying their concrete classes?",
      question_type: "MCQ",
      options: {
        a: "Builder",
        b: "Factory Method",
        c: "Abstract Factory",
        d: "Prototype",
      },
    },
    {
      id: "q-967be8ff",
      sequence_number: 5,
      question_text: "In Python, the else clause of a while loop executes when:",
      question_type: "MCQ",
      options: {
        a: "The loop condition becomes false",
        b: "A break statement is encountered",
        c: "An exception is raised inside the loop",
        d: "The loop runs exactly once",
      },
    },
    {
      id: "q-f7cb8a75",
      sequence_number: 6,
      question_text:
        "Which loop construct can iterate over a sequence while also providing the index without using the enumerate function?",
      question_type: "MCQ",
      options: {
        a: "for item in sequence",
        b: "while sequence",
        c: "for i in range(len(sequence))",
        d: "for i, item in enumerate(sequence)",
      },
    },
    {
      id: "q-d18a5635",
      sequence_number: 7,
      question_text: "Which statement about method overriding in Python classes is correct?",
      question_type: "MCQ",
      options: {
        a: "The overriding method must have the same name but can have a different number of parameters",
        b: "The overriding method must be declared with the same signature as the method in the base class",
        c: "Method overriding works only for static methods",
        d: "Python does not support method overriding",
      },
    },
    {
      id: "q-d10ea9f0",
      sequence_number: 8,
      question_text: "What is the purpose of the __init__ method in a Python class?",
      question_type: "MCQ",
      options: {
        a: "To create a new class object",
        b: "To initialize instance attributes when an object is created",
        c: "To define a class-level constant",
        d: "To delete an instance when it goes out of scope",
      },
    },
    {
      id: "q-63c626c8",
      sequence_number: 9,
      question_text: "True or False: In Python, functions are first class objects.",
      question_type: "MCQ",
      options: {
        a: "True",
        b: "False",
      },
    },
    {
      id: "q-166bf70e",
      sequence_number: 10,
      question_text: "Which of the following are built-in mutable data types in Python?",
      question_type: "MCQ",
      options: {
        a: "list",
        b: "tuple",
        c: "dict",
        d: "frozenset",
      },
    },
  ],
};
