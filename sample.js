const express = require("express");

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Server is running"
    });
});

app.get("/hello", (req, res) => {
    res.json({
        message: "Hello World"
    });
});

app.get("/date", (req, res) => {
    const currentDate = Date.now();

    res.json({
        timestamp: currentDate,
        readable: new Date(currentDate).toISOString()
    });
});

// Count words in request body
app.post("/word-count", (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({
            error: "Please provide 'text' in the request body"
        });
    }

    const wordCount = text.trim().split(/\s+/).length;

    res.json({
        text: text,
        wordCount: wordCount
    });
});

app.post("/data", (req, res) => {
    const requestData = req.body;
    res.json({
        message: `You sent: ${JSON.stringify(requestData)}`
    });
});

// Echo endpoint - returns the data sent
app.post("/echo", (req, res) => {
    res.json({
        echo: req.body
    });
});

// Character count endpoint
app.post("/char-count", (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({
            error: "Please provide 'text' in the request body"
        });
    }

    res.json({
        text: text,
        characterCount: text.length,
        characterCountWithoutSpaces: text.replace(/\s/g, '').length
    });
});

// Simple calculation endpoint
app.post("/add", (req, res) => {
    const { a, b } = req.body;

    if (a === undefined || b === undefined) {
        return res.status(400).json({
            error: "Please provide 'a' and 'b' in the request body"
        });
    }

    res.json({
        a: a,
        b: b,
        sum: a + b
    });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});