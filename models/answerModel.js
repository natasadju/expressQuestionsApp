var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var answerSchema = new Schema({
	'description' : String,
	'qid' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'question'
	},
	'uid' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'chosen' : Boolean,
	'datetime' : Date,
	'comments' : Array
});

module.exports = mongoose.model('answer', answerSchema);
