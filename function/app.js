const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js"); // our create module
var _ = require("lodash");
const serverless = require("serverless-http");

const router = express.Router();
const app = express();
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

//mongodb connection
mongoose.connect(
  "mongodb+srv://vaibhavbakhal:<password>@cluster0.g79enud.mongodb.net/todolistDB"
);
const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({ name: "Welcome to your todolist" });
const item2 = new Item({ name: "Hit the + button to add s new item" });
const item3 = new Item({ name: "<-- hit this to delete an item." });
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

// variables

// routing pages

router.get("/", function (req, res) {
  Item.find({})
    .then((elements) => {
      if (elements.length == 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            res.redirect("/");
          })
          .catch(function (err) {
            console.log(err);
          });
      } else {
        res.render("list", { listTitle: "Today", newListItems: elements });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then((elements) => {
    if (!elements) {
      //create a new list
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      //Show an existing List
      res.render("list", {
        listTitle: elements.name,
        newListItems: elements.items,
      });
    }
  });
});
router.post("/", function (req, res) {
  let itemname = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemname });

  if (listName === "Today") {
    Item.insertMany(item)
      .then(() => {
        res.redirect("/");
      })
      .catch((errr) => {
        console.log(errr);
      });
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

router.post("/delete", function (req, res) {
  const deleteID = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndDelete({ _id: deleteID })
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: deleteID } } }
    )
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.get("/about", function (req, res) {
  res.render("about", { listTitle: "ABOUT" });
});

app.use("/api/", router);
module.exports = app;
module.exports.handler = serverless(app);
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(port);
});
