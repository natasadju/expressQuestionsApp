var express = require('express');
var router = express.Router();
var questionController = require('../controllers/questionController.js');

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error("You must be logged in to view this page!");
        err.status = 401;
        return next(err);
    }
}

/*
 * GET
 */
router.get('/', questionController.list);
router.get('/myquestions', requiresLogin, questionController.myquestions);
router.get('/hotquestions', questionController.hotquestions);
router.get('/post', requiresLogin, questionController.showAddQuestion);
router.get('/:id', questionController.show);
router.get('/:id/comment', requiresLogin, questionController.showPostComment);

/*
 * POST
 */
router.post('/post', questionController.create);
router.post('/:id/comment', requiresLogin, questionController.postComment);

/*
 * PUT
 */
router.put('/:id', questionController.update);

/*
 * DELETE
 */
router.post('/:id/delete', questionController.remove);


module.exports = router;
