const express = require('express');
const fs = require('fs').promises;
const app = express();
const filePath = './info.json';

app.use(express.json());

const port = process.env.PORT || 8080;

app.post('/write', async (req, res) => {
    const content = req.body;

    if (typeof content === 'object' && Object.keys(content).length === 0) {
        return res.status(400).send('No content to write');
    }

    try {
        let data;

        try {
            data = await fs.readFile(filePath, 'utf8');
        } catch (err) {
            if (err.code === 'ENOENT') {
                data = '[]';
            } else {
                return res.status(500).send('Error reading file: ' + err.message);
            }
        }

        let newData;
        if (data.trim() === '' || data === '[]') {
            newData = '[' + JSON.stringify(content, null, 5) + ']';
        } else {
            newData = data.slice(0, -1) + ',' + JSON.stringify(content, null, 5) + ']';
        }

        await fs.writeFile(filePath, newData);
        return res.status(200).send('Content written to the file.');
    } catch (err) {
        return res.status(500).send('Error writing to the file: ' + err.message);
    }
});

app.get('/read', async (req, res) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.status(200).send(data.trim() === '' ? [] : JSON.parse(data));
    } catch (err) {
        return res.status(500).send('Error reading file: ' + err.message);
    }
});

app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;

    try {

        const data = await fs.readFile(filePath, 'utf8');
        let items = JSON.parse(data);

        const index = items.findIndex((item) => item.id === Number.parseInt(id));

        if (index !== -1) {

            const removedItem = items.splice(index, 1)[0];

            await fs.writeFile(filePath, JSON.stringify(items, null, 5));
            return res.status(200).send(removedItem);
        } else {
            return res.status(404).send('Data not found.');
        }
    } catch (err) {
        return res.status(500).send('Error processing request: ' + err.message);
    }
});

app.put('/update/:id', async (req, res) => {
    const id = req.params.id;

    try {

        const data = await fs.readFile(filePath, 'utf8');
        let items = JSON.parse(data);

        const index = items.findIndex((item) => item.id === Number.parseInt(id));

        if (index !== -1) {

            items[index].name = req.body.name !== undefined ? req.body.name : items[index].name;
            items[index].email = req.body.email !== undefined ? req.body.email : items[index].email;
            items[index].profession = req.body.profession !== undefined ? req.body.profession : items[index].profession;
            items[index].experience = req.body.experience !== undefined ? req.body.experience : items[index].experience;
            items[index].salary = req.body.salary !== undefined ? req.body.salary : items[index].salary;
            items[index].hike = req.body.hike !== undefined ? req.body.hike : items[index].hike;
            items[index].salary_after_hike = req.body.salary_after_hike !== undefined ? req.body.salary_after_hike : items[index].salary_after_hike;

            await fs.writeFile(filePath, JSON.stringify(items, null, 5));
            return res.status(200).send(items[index]);
        } else {
            return res.status(404).send('Data not found.');
        }
    } catch (err) {

        return res.status(500).send('Error processing request: ' + err.message);
    }
});

app.listen(port, () => {
    console.log('Server listening on port:', port);
});
