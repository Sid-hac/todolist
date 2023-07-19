const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const mongoose = require('mongoose');
const _=require("lodash");

const app = express();

let port = process.env.PORT || 5000 ;


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));



// Connection URI
const uri = 'mongodb://0.0.0.0:27017/todolistDB';

// Connect to the MongoDB server
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({

   name : String
});

const listSchema = new mongoose.Schema({
  name : String,
  listItem : [itemSchema]
});

// Define a model based on the schema
const Item = mongoose.model('item', itemSchema);
const List = mongoose.model('list' , listSchema);

// Insert a document

const item1 = new Item(
  {
  name: 'buy food',
}
);
const item2 = new Item(
  {
  name: 'cook food',
}
);
const item3 = new Item(
  {
  name: 'eat food',
}
);

const defaultItems = [item1 , item2 , item3];



app.get("/" , function(req , res){

    // Find documents
    Item.find()
    .then((foundItems) => {
      
       if (foundItems.length === 0) {
           Item.insertMany(defaultItems)
               .then(docs => {
               // Handle successful insertion
                console.log("insert success");
            })
             .catch(err => {
            // Handle error
            console.log(err);
           });
         res.redirect("/");
       }else{
        res.render("list" , {listtitle : "Today" , items : foundItems});
       }
       
    })
    .catch((error) => {
      console.error('Error finding documents:', error);
    });
});
app.get("/:customListName" , function(req , res){

  const customListName = _.capitalize( req.params.customListName);
  

  List.findOne({name : customListName})
      .then(foundList => {
         if(!foundList){

          const list = new List({
     
            name: customListName,
            listItem: defaultItems
          });
        
          list.save();
         
          res.redirect("/" + customListName);
         }else{
          res.render("list" , {listtitle : customListName , items : foundList.listItem});
         }
        
      })
      .catch(err => {
       // Handle error
       console.log(err);
      });


  

});


app.post("/" , function(req,res){

  const itemName = req.body.listItem;
  const listName = req.body.list;

  const item = new Item(
    {
    name: itemName
  }
  );

  if (listName === "Today") {
    
    item.save();
    res.redirect("/");
  }else{

    List.findOne({name : listName})
     .then(foundlistname =>{

      foundlistname.listItem.push(item);
      foundlistname.save();
      res.redirect("/" + listName);
     })
  }
  

});

app.post("/delete" , function(req , res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.Listname;

  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId)
    .then(deletedItem =>{

     
     console.log("delete success" , deletedItem);
    })
    .catch(err =>{

     console.log(err);
    });
    res.redirect("/");
    
  }else{

    List.findOneAndUpdate({name : listName} , {$pull : {listItem : {_id : checkedItemId}}})
      .then(deleteItem => {

        res.redirect("/" + listName);
      })
      .catch(err =>{
        console.log(err);
      });
  }

 
       
});



 


app.listen(port , function(){
console.log(`server started at port ${port}`);
});