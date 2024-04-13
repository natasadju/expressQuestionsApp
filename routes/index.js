var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    const loggedIn = req.session.userId ? true : false;
    res.render('index', {
        title: 'Express Questions App',
        text: 'App for posting questions. You can post your question and get answers from other users. You can also answer questions posted by other users, and choose the best answer for your question. There is also a possibility of voting on the answers.' +
            'You can also comment on the questions and answers.',
        loggedIn: loggedIn
    });
});

module.exports = router;
