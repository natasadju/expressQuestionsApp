var QuestionModel = require('../models/questionModel.js');
var AnswerModel = require('../models/answerModel.js');
var VotesModel = require('../models/votesModel.js');
/**
 * questionController.js
 *
 * @description :: Server-side logic for managing questions.
 */
module.exports = {

    /**
     * questionController.list()
     */
    list: function (req, res) {
        QuestionModel.find()
            .populate('userid')
            .sort({datetime: 'desc'})
            .exec(function (err, questions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting question.',
                        error: err
                    });
                }
                return res.render('questions/list', {questions: questions});
            });
    },


    /**
     * questionController.show()
     */
    show: async function (req, res) {
        const questionId = req.params.id;
        const userLoggedIn = req.session.userId ? true : false;

        await QuestionModel.findOneAndUpdate({_id: questionId}, {$inc: {views: 1}});

        const question = await QuestionModel.findOne({_id: questionId}).populate('userid');
        if (!question) {
            return res.status(500).json({
                message: 'Error. Question does not exist!',
                error: ""
            });
        }

        const answers = await AnswerModel.find({qid: questionId, chosen: false}).populate('uid');
        const correctAnswer = await AnswerModel.findOne({qid: questionId, chosen: true}).populate('uid');

        async function getVotes(answer) {
            const votes = await VotesModel.find({aid: answer._id});
            return {
                votes,
                votedPositively: votes.some(vote => vote.uid.toString() === req.session.userId && vote.upvote),
                votedNegatively: votes.some(vote => vote.uid.toString() === req.session.userId && !vote.upvote)
            };
        }

        const enhancedAnswers = await Promise.all(answers.map(async answer => {
            const {votes, votedPositively, votedNegatively} = await getVotes(answer);
            return {
                description: answer.description,
                uid: answer.uid,
                _id: answer._id,
                datetime: answer.datetime,
                upvotes: votes.filter(vote => vote.upvote).length,
                downvotes: votes.filter(vote => !vote.upvote).length,
                comments: answer.comments ? answer.comments : [],
                answerOwner: answer.uid._id.toString() === req.session.userId,
                questionOwner: question.userid._id.toString() === req.session.userId,
                loggedIn: userLoggedIn,
                votedPositively,
                votedNegatively
            };
        }));

        let correctAnswerVotes = [];
        let correctAnswerUPVotes = 0;
        let correctAnswerDOWNVotes = 0;

        if (correctAnswer) {
            correctAnswerVotes = await getVotes(correctAnswer);
            correctAnswerUPVotes = correctAnswerVotes.votes.filter(vote => vote.upvote).length;
            correctAnswerDOWNVotes = correctAnswerVotes.votes.filter(vote => !vote.upvote).length;
        }

        const questionOwner = question.userid._id.toString() === req.session.userId;

        return res.render('questions/show', {
            data: question,
            answers: enhancedAnswers,
            correctAnswer,
            correctAnswerUPVotes,
            correctAnswerDOWNVotes,
            loggedIn: userLoggedIn,
            questionOwner
        });
    },


    showAddQuestion: function (req, res) {

        return res.render('questions/post');
    },

    /**
     * questionController.create()
     */
    create: async function (req, res) {

        var question = new QuestionModel({
            title: req.body.title,
            description: req.body.description,
            userid: req.session.userId,
            datetime: new Date(),
            views: req.body.views,
            comments: []
        });

        await question.save();

        return res.render('feedback', {message: "Question posted successfully!"});
    },

    /**
     * questionController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        QuestionModel.findOne({_id: id}, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question',
                    error: err
                });
            }

            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }

            question.title = req.body.title ? req.body.title : question.title;
            question.description = req.body.description ? req.body.description : question.description;
            question.datetime = req.body.datetime ? req.body.datetime : question.datetime;
            question.views = req.body.views ? req.body.views : question.views;
            question.comments = req.body.comments ? req.body.comments : question.comments;

            question.save(function (err, question) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating question.',
                        error: err
                    });
                }

                return res.json(question);
            });
        });
    },

    /**
     * questionController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        QuestionModel.findByIdAndRemove(id, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the question.',
                    error: err
                });
            }

            return res.render('feedback', {message: 'Question deleted successfully!'});
        });
    },

    myquestions: function (req, res) {
        var query = {userid: req.session.userId};
        QuestionModel.find(query)
            .populate('userid')
            .sort({datetime: 'desc'})
            .exec(function (err, questions) {
                if (err) {
                    return res.render('error', {
                        message: 'Error when getting questions.',
                        error: err
                    });
                }
                if (questions.length === 0) {
                    return res.render('error', {message: 'No posted questions!', error: ''});
                }
                return res.render('questions/list', {questions: questions});
            });
    },

    hotquestions: function (req, res) {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);

        var hotQuestionsQuery = {
            $or: [
                { updatedAt: { $gte: dayAgo } },
                { 'answers.updatedAt': { $gte: dayAgo } }
            ]
        };

        QuestionModel.find(hotQuestionsQuery)
            .sort({ views: 'desc' }) // Sort by views in descending order
            .populate('userid')
            .exec(function (err, hotQuestions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting hot questions.',
                        error: err
                    });
                }

                return res.render('questions/list', { questions: hotQuestions});
            });
    },



    showPostComment: async function (req, res) {

        var id = req.params.id;
        return res.render('questions/comment', {qid: id})

    },

    postComment: async function (req, res) {
        var id = req.params.id;

        await QuestionModel.findOneAndUpdate({_id: id}, {$push: {comments: req.body.description}});

        return res.render('feedback', {message: "Comment published successfully!"})

    },


};
