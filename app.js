const express = require('express');
const fs = require('fs');
const app = express();
const filePath = './info.json';
const datajson = require(filePath);

app.use(express.json());

const port = process.env.PORT || 8080;

app.post('/write', (req, res) => {
    const content = JSON.stringify(req.body,null,5);
    if (!content) {
        return res.status(400).send('No content to write');
    }

    
    fs.exists(filePath, (exists) => {
        if (!exists) {    
            fs.writeFile(filePath, '[' + content + ']', (err) => {
                if (err) {
                    return res.status(500).send('Error writing to the file.');
                }
                return res.status(200).send('Content written to the file.');
            });
        } else {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return res.status(500).send('Error reading file.');
                }

                if (data.trim() === '' || data === '[]') {
                    fs.writeFile(filePath, '[' + content + ']', (err) => {
                        if (err) {
                            return res.status(500).send('Error writing to the file.');
                        }
                        return res.status(200).send('Content written to the file.');
                    });
                }  
                else {
                    const newData = data.slice(0, -1) + ',' + content + ']';
                    fs.writeFile(filePath, newData, (err) => {
                        if (err) {
                            return res.status(500).send('Error writing to the file.');
                        }
                        return res.status(200).send('Content written to the file.');
                    });
                }
            });
        }
    });
});

app.get('/read', (req, res) => {

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return res.status(500).send('Error reading file.');
                }
        
                res.status(200).send(data.trim() === '' ? [] : JSON.parse(data));
            });
        });
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file.');
        }

        let items = [];
        try {
            items = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).send('Error parsing JSON.');
        }

        const index = items.findIndex((item) => item.id === Number.parseInt(id));

        if (index !== -1) {

            const removedItem = items.splice(index, 1)[0];

            fs.writeFile(filePath, JSON.stringify(items, null, 5), (err) => {
                if (err) {
                    return res.status(500).send('Error writing to the file.');
                }

                res.status(200).send(removedItem);
            });
        } else {
            res.status(404).send('Data not found.');
        }
    });
});

app.put('/update/:id', (req, res) => {
    const id = req.params.id;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file.');
        }

        let items = [];
        try {
            items = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).send('Error parsing JSON.');
        }

        const index = items.findIndex((item) => item.id === Number.parseInt(id));

        if (index !== -1) {

            items[index].name = req.body.name !== undefined ? req.body.name : items[index].name;
            items[index].email = req.body.email !== undefined ? req.body.email : items[index].email;
            items[index].profession = req.body.profession !== undefined ? req.body.profession : items[index].profession;
            items[index].experience = req.body.experience !== undefined ? req.body.experience : items[index].experience;
            items[index].salary = req.body.salary !== undefined ? req.body.salary : items[index].salary;
            items[index].hike = req.body.hike !== undefined ? req.body.hike : items[index].hike;
            items[index].salary_after_hike = req.body.salary_after_hike !== undefined ? req.body.salary_after_hike : items[index].salary_after_hike;

            fs.writeFile(filePath, JSON.stringify(items, null, 5), (err) => {
                if (err) {
                    return res.status(500).send('Error writing to the file.');
                }

                res.status(200).send(items[index]); 
            });
        } else {
            res.status(404).send('Data not found.');
        }
    });
});



app.listen(port, () => {
    console.log('Server listening on port:', port);
});
