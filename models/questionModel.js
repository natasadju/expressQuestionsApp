var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var questionSchema = new Schema({
	'title' : String,
	'description' : String,
	'userid' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'datetime' : Date,
	'views' : Number,
	'comments' : Array
});

module.exports = mongoose.model('question', questionSchema);
