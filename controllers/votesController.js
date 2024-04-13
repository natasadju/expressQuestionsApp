var VotesModel = require('../models/votesModel.js');

/**
 * votesController.js
 *
 * @description :: Server-side logic for managing votess.
 */
module.exports = {

    /**
     * votesController.list()
     */
    list: function (req, res) {
        VotesModel.find(function (err, votess) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting votes.',
                    error: err
                });
            }

            return res.json(votess);
        });
    },

    /**
     * votesController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        VotesModel.findOne({_id: id}, function (err, votes) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting votes.',
                    error: err
                });
            }

            if (!votes) {
                return res.status(404).json({
                    message: 'No such votes'
                });
            }

            return res.json(votes);
        });
    },

    /**
     * votesController.create()
     */
    create: function (req, res) {
        var votes = new VotesModel({
			upvote : req.body.upvote,
            aid : req.body.aid,
            uid : req.body.uid
        });

        votes.save(function (err, votes) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating votes',
                    error: err
                });
            }

            return res.status(201).json(votes);
        });
    },

    /**
     * votesController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        VotesModel.findOne({_id: id}, function (err, votes) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting votes',
                    error: err
                });
            }

            if (!votes) {
                return res.status(404).json({
                    message: 'No such votes'
                });
            }

            votes.upvote = req.body.upvote ? req.body.upvote : votes.upvote;
            votes.aid = req.body.aid ? req.body.aid : votes.aid;
            votes.uid = req.body.uid ? req.body.uid : votes.uid;


            votes.save(function (err, votes) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating votes.',
                        error: err
                    });
                }

                return res.json(votes);
            });
        });
    },

    /**
     * votesController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        VotesModel.findByIdAndRemove(id, function (err, votes) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the votes.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
