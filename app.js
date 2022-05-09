require('dotenv').config()
const axios = require("axios");
const express = require("express");
const fs = require('fs');
const app = express();
const quranApiRootUrl = `https://api.quran.com/api/v4`;

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use("/favorites", express.static("favorites"));


//GEt all the chapters from the quran
app.get("/api/get-chapters", async (req, res) => {
    //Get the language from the query string of the request.
    const { language } = req.query;
    //Get the response for getting chapters.
    const quranChapters = await axios.get(quranApiRootUrl + `/chapters?language=${language}`);
    //End the response by returning a status code of 200 and returning a quranChapters.
    res.status(200).json({quranChapters: quranChapters.data.chapters });
});

//Get all verses based on chapter 
app.get("/api/get-verses/:chapter_id", async (req, res) => {
    //Get the chapter id from the request param
    const { chapter_id } = req.params;
    //Get the response from getting verses 
    const quranVerses = await axios.get(quranApiRootUrl + `/verses/by_chapter/${chapter_id}?language=en&words=true&page=1&per_page=10`);
    res.status(200).json({quranVerses: quranVerses.data.verses});
});

//Get favorite verses via the named volume based on ip address
app.get("/api/get-favorite", async (req, res) => {
    //Get ip address from the query string.
    const { ip_address } = req.query;
    //Get the final file path, in cases when the file exists.
    const finalFilePath = path.join(__dirname, 'favorites', `${ip_address}Favorites.txt`);
    let fileContents;
    fs.exists(finalFilePath, async (exists) => {
        if(exists) {
            fileContents = (await fs.readFile(finalFilePath)).toString();
        }
    })
    if(fileContents) {
        return res.status(200).json({ favorites: fileContents.split("\n") });
    }
    return res.status(404).json({ message: "You don't have favorites yet."});
});

//Add verses to favorites via temporary storage that is stored in a named volume called favorites
app.post('/api/add-favorite', async (req, res) => {
    //Get the ip address and verse and create a file for that ip address in the favorites folder.
    const { ip_address, verse } = req.body;
    //Get the temporary file path, in cases when a file doesn't exist.
    const tempFilePath = path.join(__dirname, 'temp', `${ip_address}Favorites.txt`);
    //Get the final file path, in cases when the file exists.
    const finalFilePath = path.join(__dirname, 'favorites', `${ip_address}Favorites.txt`);
    let verseAddedToExistingFile;
    let verseAddedToNewFile;

    await fs.writeFile(tempFilePath, `${verse} `);
    exists(finalFilePath, async (exists) => {
        if (exists) {
            let fileContents = (await fs.readFile(finalFilePath)).toString();
            fileContents += `\n ${verse}`;
            verseAddedToExistingFile = true;
            //Write to file with new verse.
            await fs.writeFile(finalFilePath, fileContents);
        } else {
            //Ese copy temporary file to final file(found in favorites folder.)
            await fs.copyFile(tempFilePath, finalFilePath);
            //Unlink temporary file from final file(Found in favorites folder.)
            await fs.unlink(tempFilePath);
            verseAddedToNewFile = true;
        }
    });
    if(verseAddedToExistingFile) {
        res.status(201).json({ message: "Favorite Successfully added to your existing file."});
    }
    if(verseAddedToNewFile) {
        res.status(201).json({ message: "Favorite Successfully added to new file."});
    }
});

app.delete("/api/delete-favorite/:verse", async (req, res) => {
    const { verse } = req.params;
    const finalFilePath = path.join(__dirname, 'favorites', `${ip_address}Favorites.txt`);
    let favoriteRemoved;
    exists(finalFilePath, async (exists) => {
        if (exists) {
            let fileContents = (await fs.readFile(finalFilePath)).toString();
            fileContents.replace(`\n ${verse}`, "");
            if(fileContents.includes(verse)) fileContents.replace(`${verse} `);
            await fs.writeFile(finalFilePath, fileContents);
            favoriteRemoved = true;
        } else {
            favoriteRemoved = false;
        }
    });
    if(favoriteRemoved) {
        res.status(204).json({ message: "Favorite removed. "});
    } else {
        res.status(500).json({ message: "Favorite does not exist." });
    }
});

app.listen(process.env.PORT, () => console.log("Listening on port " + process.env.PORT));