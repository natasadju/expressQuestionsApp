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
        const loggedIn = req.session.userId ? true : false;
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
                return res.render('questions/list', {questions: questions, loggedIn: loggedIn});
            });
    },


    /**
     * questionController.show()
     */
    show: async function (req, res) {
        var id = req.params.id;
        const loggedIn = req.session.userId ? true : false;

        await QuestionModel.findOneAndUpdate({_id: id}, {$inc: {views: 1}})

        const question = await QuestionModel.findOne({_id: id}).populate('userid');
        const answers = await AnswerModel.find({qid: id, chosen: false}).populate('uid');
        const correctAnswer = await AnswerModel.findOne({qid: id, chosen: true}).populate('uid');
        var correctAnswerVotes = [];

        if (correctAnswer) {
            correctAnswerVotes = await VotesModel.find({aid: correctAnswer._id});

            // Check if the logged-in user has already voted positively or negatively on the correct answer
            var votedPositively = correctAnswerVotes.some(vote => vote.uid.toString() === req.session.userId && vote.upvote);
            var votedNegatively = correctAnswerVotes.some(vote => vote.uid.toString() === req.session.userId && !vote.upvote);
            correctAnswer.votedPositively = votedPositively;
            correctAnswer.votedNegatively = votedNegatively;
        }

        var answers2 = []

        for (const answer of answers) {
            var votes = await VotesModel.find({aid: answer._id});

            var answerOwner = answer.uid._id.toString() === req.session.userId;
            var questionOwner = question.userid._id.toString() === req.session.userId;

            var votedPositively = votes.some(vote => vote.uid.toString() === req.session.userId && vote.upvote);
            var votedNegatively = votes.some(vote => vote.uid.toString() === req.session.userId && !vote.upvote);

            answers2.push({
                description: answer.description,
                uid: answer.uid,
                _id: answer._id,
                datetime: answer.datetime,
                upvotes: votes.filter(vote => vote.upvote).length,
                downvotes: votes.filter(vote => !vote.upvote).length,
                comments: answer.comments ? answer.comments : [],
                answerOwner: answerOwner,
                questionOwner: questionOwner,
                loggedIn: loggedIn,
                votedPositively: votedPositively,
                votedNegatively: votedNegatively
            })
        }

        if (!question) {
            return res.status(500).json({
                message: 'Error. Question does not exist!',
                error: ""
            });
        }

        var questionOwner = question.userid._id.toString() === req.session.userId;

        var correctAnswerUPVotes = correctAnswerVotes.filter(vote => vote.upvote).length;
        var correctAnswerDOWNVotes = correctAnswerVotes.filter(vote => !vote.upvote).length;

        return res.render('questions/show', {
            data: question,
            answers: answers2,
            correctAnswer: correctAnswer,
            correctAnswerUPVotes: correctAnswerUPVotes,
            correctAnswerDOWNVotes: correctAnswerDOWNVotes,
            loggedIn: loggedIn,
            questionOwner: questionOwner
        });
    },

    showAddQuestion: function (req, res) {
        const loggedIn = req.session.userId ? true : false;

        return res.render('questions/post', {loggedIn: loggedIn});
    },

    /**
     * questionController.create()
     */
    create: async function (req, res) {
        const loggedIn = req.session.userId ? true : false;

        var question = new QuestionModel({
            title: req.body.title,
            description: req.body.description,
            userid: req.session.userId,
            datetime: new Date(),
            views: req.body.views,
            comments: []
        });

        await question.save();

        return res.render('feedback', {message: "Question posted successfully!", loggedIn: loggedIn});
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
        const loggedIn = req.session.userId ? true : false;

        QuestionModel.findByIdAndRemove(id, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the question.',
                    error: err
                });
            }

            return res.render('feedback', {message: 'Question deleted successfully!', loggedIn: loggedIn});
        });
    },

    myquestions: function (req, res) {
        const loggedIn = req.session.userId ? true : false;
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
                    return res.render('error', {message: 'No posted questions!', error: '', loggedIn: loggedIn});
                }
                return res.render('questions/list', {questions: questions, loggedIn: loggedIn});
            });
    },

    hotquestions: function (req, res) {
        const loggedIn = req.session.userId ? true : false;

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

                return res.render('questions/list', { questions: hotQuestions, loggedIn: loggedIn });
            });
    },



    showPostComment: async function (req, res) {

        var id = req.params.id;
        const loggedIn = req.session.userId ? true : false;
        return res.render('questions/comment', {qid: id, loggedIn: loggedIn})

    },

    postComment: async function (req, res) {
        const loggedIn = req.session.userId ? true : false;
        var id = req.params.id;

        await QuestionModel.findOneAndUpdate({_id: id}, {$push: {comments: req.body.description}});

        return res.render('feedback', {message: "Comment published successfully!", loggedIn: loggedIn})

    },


};
