var AnswerModel = require('../models/answerModel.js');
var QuestionModel = require('../models/questionModel.js');
var VotesModel = require('../models/votesModel.js');
/**
 * answerController.js
 *
 * @description :: Server-side logic for managing answers.
 */
module.exports = {

    /**
     * answerController.list()
     */
    list: function (req, res) {
        AnswerModel.find(function (err, answers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer.',
                    error: err
                });
            }

            return res.json(answers);
        });
    },

    /**
     * answerController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        AnswerModel.findOne({_id: id}, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer.',
                    error: err
                });
            }

            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            return res.json(answer);
        });
    },

    /**
     * answerController.create()
     */
    create: async function (req, res) {
        var id = req.params.id;

        var question = await QuestionModel.findOne({_id: id});

        if (!question) {
            return res.status(404).json({
                message: 'Question not found'
            });
        }

        if (question.userid.toString() === req.session.userId.toString()) {
            return res.status(401).json({
                message: 'You cannot answer your own question'
            });
        }

        var answer = new AnswerModel({
            description: req.body.description,
            qid: id,
            uid: req.session.userId,
            chosen: false,
            datetime: new Date(),
            comments: []
        });

        try {
            await answer.save();
            return res.redirect(`/questions/${id}`);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when creating answer',
                error: err
            });
        }
    },

    showAnswerPost: function (req, res) {
        var id = req.params.id;

        return res.render('answers/post', {qid: id});
    },

    /**
     * answerController.update()
     */
    update: async function (req, res) {

        var id = req.params.id;

        var answer = await AnswerModel.findOne({_id: id});

        var question = await QuestionModel.findOne({_id: answer.qid})

        if (question.userid.toString() !== req.session.userId) {
            return res.status(500).json({
                message: 'Error when choosing correct answer. You are not the owner of the Q!',
                error: ""
            });
        }

        await AnswerModel.findOneAndUpdate({chosen: true}, {chosen: false})
        await AnswerModel.findOneAndUpdate({_id: id}, {chosen: true})

        return res.render('feedback', {message: 'Answer chosen successfully!'});


    },

    /**
     * answerController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        AnswerModel.findByIdAndRemove(id, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the answer.',
                    error: err
                });
            }

            return res.render('feedback', {message: 'Answer deleted successfully!'});
        });
    },

    vote: async function (req, res) {
        try {
            var id = req.params.id;
            var vote = req.body.vote;

            var voteDocument = await VotesModel.findOne({aid: id, uid: req.session.userId});

            if (voteDocument) {
                voteDocument.upvote = (vote === 'upvote');
                await voteDocument.save();
            } else {
                var votes = new VotesModel({
                    upvote: vote === 'upvote',
                    aid: id,
                    uid: req.session.userId
                });

                await votes.save();
            }

            // just the same page but with the message voted
            return res.render('feedback', {message: 'Voted successfully!'});
            // return res.redirect(`/questions/show/`);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when voting',
                error: err
            });
        }
    },

    showPostComment: async function (req, res) {

        var id = req.params.id;
        return res.render('answers/comment', {aid: id})

    },

    postComment: async function (req, res) {

        var id = req.params.id;

        await AnswerModel.findOneAndUpdate({_id: id}, {$push: {comments: req.body.description}});

        return res.render('feedback', {message: "Comment published successfully!"})

    },

};
