var express = require('express');
var router = express.Router();
var answerController = require('../controllers/answerController.js');

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
router.get('/', answerController.list);
router.get('/:id/post', requiresLogin, answerController.showAnswerPost);
router.get('/:id', answerController.show);
router.get('/:id/comment', requiresLogin, answerController.showPostComment);

/*
 * GET
 */


/*
 * POST
 */
// router.post('/', answerController.create);
router.post('/:id/post', requiresLogin, answerController.create);
/*
 * PUT
 */
router.put('/:id', answerController.update);
router.post('/:id/update', requiresLogin, answerController.update);
router.post('/:id/vote', requiresLogin, answerController.vote);
router.post('/:id/comment', requiresLogin, answerController.postComment);

/*
 * DELETE
 */
router.post('/:id/delete', answerController.remove);

module.exports = router;
