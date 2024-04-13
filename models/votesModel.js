var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var votesSchema = new Schema({
	'upvote' : Boolean,
	'aid' : {
		type: Schema.Types.ObjectId,
		ref: 'answer'
	},
	'uid' : {
		type: Schema.Types.ObjectId,
		ref: 'user'
	}
});

module.exports = mongoose.model('votes', votesSchema);
