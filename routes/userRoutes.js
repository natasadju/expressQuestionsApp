var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var multer = require('multer');
var upload = multer({dest: 'public/images/'});

function requiresLogin(req, res, next) {
    console.log("Checking if user is logged in");
    if (req.session && req.session.userId) {
        console.log("User is logged in");
        return next();
    } else {
        console.log("User is not logged in");
        var err = new Error("You must be logged in to view this page!");
        err.status = 401;
        return next(err);
    }
}

/*
 * GET
 */
router.get('/', userController.list);
router.get('/login', userController.showLogin);
router.get('/register', userController.showRegister);
router.get('/logout', userController.logout);
/*
 * GET
 */
router.get('/:username', userController.showProfile);

/*
 * POST
 */
router.post('/login', userController.login);
router.post('/register', userController.create);
router.post('/:id/uploadPhoto', upload.single('photo'), userController.uploadPhoto);
/*
 * PUT
 */
router.put('/:id', userController.update);

/*
 * DELETE
 */
router.delete('/:id', userController.remove);

module.exports = router;

