import express from 'express';
import path from 'path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoint to get slide data
app.get('/api/slide/:lesson/:type', (req, res) => {
    const { lesson, type } = req.params;
    
    try {
        // Generate slide data based on lesson and type
        const slideData = generateSlideData(lesson, type);
        res.json(slideData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get lesson information
app.get('/api/lesson/:lesson', (req, res) => {
    const { lesson } = req.params;
    
    try {
        const lessonData = getLessonData(lesson);
        res.json(lessonData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get all available lessons
app.get('/api/lessons', (req, res) => {
    try {
        const lessons = getAllLessons();
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the main interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function generateSlideData(lesson, type) {
    const lessonData = getLessonData(lesson);
    
    const slideData = {
        type: type,
        title: lessonData.title,
        content: lessonData.topics.slice(0, 4),
        timestamp: Date.now()
    };

    if (type === 'chart') {
        slideData.chartData = [
            { label: 'Family of 1', value: 35000 },
            { label: 'Family of 2', value: 40000 },
            { label: 'Family of 3', value: 45000 },
            { label: 'Family of 4', value: 50000 }
        ];
    }

    if (type === 'process') {
        slideData.processSteps = lessonData.topics.slice(0, 5);
    }

    return slideData;
}

function getLessonData(lessonKey) {
    const lessons = {
        'welcome': {
            title: 'Welcome to HCV Training',
            description: 'Introduction to Housing Choice Voucher program',
            topics: [
                'What is HCV and why it exists',
                'Who administers the program',
                'Basic program overview'
            ]
        },
        'eligibility': {
            title: 'HCV Eligibility Requirements',
            description: 'Understanding who qualifies for HCV assistance',
            topics: [
                'Income limits and calculations',
                'Family composition requirements',
                'Citizenship and immigration status',
                'Background check requirements'
            ]
        },
        'application': {
            title: 'Application Process',
            description: 'How to apply for HCV assistance',
            topics: [
                'Finding your local PHA',
                'Required documents',
                'Waiting list process',
                'Application timeline'
            ]
        },
        'income': {
            title: 'Income and Asset Calculations',
            description: 'Understanding HCV income calculations',
            topics: [
                'Annual income definition',
                'Asset calculations',
                'Income exclusions',
                'Reporting requirements'
            ]
        },
        'payment': {
            title: 'Payment Standards and Rent',
            description: 'How HCV rent calculations work',
            topics: [
                'Payment standards',
                'Utility allowances',
                'Rent calculation methods',
                'Minimum rent requirements'
            ]
        },
        'voucher': {
            title: 'Voucher Process',
            description: 'Using your HCV voucher',
            topics: [
                'Voucher issuance',
                'Housing search process',
                'HQS inspections',
                'Lease requirements'
            ]
        },
        'rights': {
            title: 'Tenant Rights and Responsibilities',
            description: 'Understanding your HCV obligations',
            topics: [
                'Tenant responsibilities',
                'Landlord obligations',
                'Program violations',
                'Appeal processes'
            ]
        }
    };
    
    return lessons[lessonKey] || { title: lessonKey, description: '', topics: [] };
}

function getAllLessons() {
    return {
        'welcome': getLessonData('welcome'),
        'eligibility': getLessonData('eligibility'),
        'application': getLessonData('application'),
        'income': getLessonData('income'),
        'payment': getLessonData('payment'),
        'voucher': getLessonData('voucher'),
        'rights': getLessonData('rights')
    };
}

app.listen(PORT, () => {
    console.log(`🚀 HCV Training Visual Interface running on http://localhost:${PORT}`);
    console.log(`📚 Visual slides available for all HCV lessons`);
    console.log(`🎤 Connect this to your LiveKit agent for full voice + visual experience`);
});

export default app;
