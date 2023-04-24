const express = require("express");
const bodyParser = require("body-parser");

const app = express();

let newListItems=["buy food" , "cook food " , "eat food"];
let workitems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

app.get("/" , function(req , res){
 
 let today = new Date();

 let options = {
  weekday : "long",
  month : "long",
  day : "numeric"
 };

 let day = today.toLocaleDateString("en-us" , options);

 res.render("list" , {listtitle : day , items : newListItems});

});

app.post("/" , function(req,res){
  newListItem = req.body.listItem;
  
  if (req.body.list === "Work List") {
    workitems.push(newListItem);
    res.redirect("/work");
  }else{

    newListItems.push(newListItem);
    res.redirect("/");
  }
 
});

app.get("/work" , function(req,res){
  res.render("list" , {listtitle : "Work List" , items : workitems });
});

app.post("/work" , function(req,res){
  let newListItem = req.body.listItem;

  workitems.push(newListItem);
  res.redirect("/work");
})


app.listen(3000 , function(){
console.log("server started at port 3000");
});