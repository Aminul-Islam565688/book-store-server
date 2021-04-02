const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 7897;
const admin = require("firebase-admin");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// .env
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const database = process.env.DB_DATABASE;

//Firebase Authentication

const serviceAccount = require("./PrivateKey/book-store-1856c-firebase-adminsdk-ccivo-8b8de2455b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
  const orderCollection = client.db(database).collection("BookOrders");

  //adding Book To The Database
  app.post("/addBooksData", (req, res) => {
    const booksData = req.body;
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
  //Order Add to Server
  app.post("/addOrder", (req, res) => {
    const orderData = req.body;
    orderCollection.insertOne(orderData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  //Recent Orders and Verification Token
  app.get("/recentOrders", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      // idToken comes from the client app
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if (tokenEmail == req.query.email) {
            orderCollection
              .find({ email: req.query.email })
              .toArray((err, document) => {
                res.send(document);
              });
          }
        })
        .catch((error) => {
          // Handle error
        });
    }
  });

  console.log("DATABASE Connected");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
