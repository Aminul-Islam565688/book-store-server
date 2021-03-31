const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 7897;

app.use(cors());
app.use(bodyParser.json());
// .env
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const database = process.env.DB_DATABASE;

//MongoDB

const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("bson");
const uri = ` mongodb+srv://${user}:${password}@cluster0.aifw0.mongodb.net/${database}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const booksCollection = client.db(database).collection("BooksDataBase");

  //adding Book To The Database
  app.post("/addBooksData", (req, res) => {
    const booksData = req.body;
    console.log(booksData);
    booksCollection.insertOne(booksData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //Getting Book Data From Database
  app.get("/getBooksData", (req, res) => {
    booksCollection.find().toArray((err, books) => {
      res.send(books);
    });
  });
  //Deleting Items From Database
  app.delete("/delete/:id", (req, res) => {
    booksCollection
      .deleteOne({
        _id: ObjectId(req.params.id),
      })
      .then((err, result) => {
        res.send(err.deleteCount > 0);
      });
  });

  console.log("DATABASE Connected");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
