const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

client.connect()
    .then(() => {
        db = client.db('guestbookDB');
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/entries', async (req, res) => {
    try {
        const entries = await db.collection('entries').find().toArray();
        res.json(entries);
    } catch (error) {
        res.status(500).send('Error retrieving entries');
    }
});

app.post('/entries', async (req, res) => {
    const newEntry = {
        name: req.body.name,
        message: req.body.message,
        date: new Date().toISOString()
    };
    try {
        const result = await db.collection('entries').insertOne(newEntry);
        res.status(201).json({ id: result.insertedId, ...newEntry });
    } catch (error) {
        res.status(500).send('Error adding entry');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
