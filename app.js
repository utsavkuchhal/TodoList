const express = require("express");
const  bodyParser = require("body-parser");
const mongoose = require("mongoose");

let items = ["Cook Food"];
let workItems =["Build Sites"];''

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine","ejs");
app.use(express.static("public"));

const url = "mongodb://localhost:27017/todolistDB";
mongoose.connect(url,{useNewUrlParser: true, useUnifiedTopology: true});

const listSchema = new mongoose.Schema({
	name : String
});

const newlistSchema = new mongoose.Schema({
	name : String,
	newitems : [listSchema]
});

const Listitem = mongoose.model("Listitem", listSchema);
const Newlist = mongoose.model("List", newlistSchema);


const item1 = new Listitem({
	name : "Welcome to the todo List!"
});

const item2 = new Listitem({
	name : "Hit the  + button to add item"
});

const item3 = new Listitem({
	name : "<-- Hit this to delete an item"
});

const dataArray = [item1, item2, item3];

app.get('/', function(req, res){

	Listitem.find({}, function(err, foundItem){
		if (foundItem.length === 0) {
			Listitem.insertMany(dataArray , function(err){
	if (err) {
		console.log(err);
	}else{
		console.log("Data saved Succcussfully");
	}
	res.redirect('/');
});
	}else{
		res.render("list",{kindofday : "Today", 
					   newlistitem : foundItem});
	}
			
	});


});

app.get('/:applistname', function(req,res){
	const applistname =  req.params.applistname;

	Newlist.findOne({name : applistname}, function(err, foundlist){
		if (!err) {
			if (!foundlist) {
					const newlist = new Newlist({
					name : applistname,
					newitems : dataArray 
				});
				newlist.save();
				res.redirect("/" + applistname);
			}else{
				res.render("list",{kindofday : foundlist.name,newlistitem : foundlist.newitems});
			}
		}
	});
});


app.post('/', function(req ,res){
	const item = req.body.todo;
	const listnamak = req.body.button;

	const newItem = new Listitem({
		name : item
	});
	
	if (listnamak === "Today") {
			newItem.save();
			res.redirect('/');
	}else{
		Newlist.findOne({name : listnamak}, function(err, foundedlist){
			foundedlist.newitems.push(newItem);
			foundedlist.save();
			res.redirect("/" + listnamak);
		});
	}

});

app.post('/delete', function(req, res){
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listname;

	if (listName === "Today") {
		Listitem.findByIdAndRemove(checkedItemId, function(err){
		if (err) {
			console.log(err);
		}else{
			res.redirect('/');
		}	
	});
	}else{
		Newlist.findOneAndUpdate({name : listName}, {$pull : {newitems : {_id : checkedItemId}}},function(err,foundlist){
			if (!err) {
				res.redirect("/" + listName);
			}
		});
	}

	
});

app.listen(3000, function(){
	console.log("App is running on  port 3000");
});