var UserModel = require('../models/userModel.js');
var QuestionModel = require('../models/questionModel.js');
var AnswerModel = require('../models/answerModel.js');
/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting users.',
                    error: err
                });
            }

            return res.json(users);
        });
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting users.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such users'
                });
            }

            return res.json(user);
        });
    },

    /**
     * userController.create()
     */
    create: async function (req, res) {

        var user = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            photo_path: req.body.photo_path
        });

        user.save(function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating users',
                    error: err
                });
            }
            return res.render('users/login', {message: "User created successfully!"});
        })
    },

    showLogin: function (req, res) {
        const loggedIn = req.session.userId ? true : false;
        res.render('users/login', {loggedIn: loggedIn});
    },

    showRegister: function (req, res) {
        const loggedIn = req.session.userId ? true : false;
        if (req.session.userId) {
            var err = new Error("You are logged in!");
            err.status = 401;
            return next(err);
        }
        res.render('users/register', {loggedIn: loggedIn});
    },

    login: function (req, res, next) {
        UserModel.authenticate(req.body.username, req.body.password, function (error, user) {
            if (error || !user) {
                var err = new Error("Wrong username or password");
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('profile');
            }
        })
    },

    logout: function (req, res) {
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect('/users/login');
                }
            });
        }
    },

    showProfile: function (req, res, next) {
        const loggedIn = req.session.userId ? true : false;

        UserModel.findById(req.session.userId)
            .exec(async function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user == null) {
                        var err = new Error('Not authorized! Go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        questionCount = await QuestionModel.countDocuments({userid: req.session.userId});
                        answerCount = await AnswerModel.countDocuments({uid: req.session.userId});
                        res.render('users/profile', {
                            user: user,
                            qs: questionCount,
                            loggedIn: loggedIn,
                            as: answerCount
                        });
                    }
                }
            });
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting users',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such users'
                });
            }

            user.username = req.body.username ? req.body.username : user.username;
            user.email = req.body.email ? req.body.email : user.email;
            user.password = req.body.password ? req.body.password : user.password;

            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating users.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the users.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    uploadPhoto: function (req, res) {
        UserModel.findOneAndUpdate({_id: req.session.userId}, {photo_path: req.file.filename}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when updating user',
                    error: err
                });
            }
            return res.redirect('/users/profile');

        });
    }
};
