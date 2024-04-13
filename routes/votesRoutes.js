var express = require('express');
var router = express.Router();
var votesController = require('../controllers/votesController.js');

/*
 * GET
 */
router.get('/', votesController.list);

/*
 * GET
 */
router.get('/:id', votesController.show);

/*
 * POST
 */
router.post('/', votesController.create);

/*
 * PUT
 */
router.put('/:id', votesController.update);

/*
 * DELETE
 */
router.delete('/:id', votesController.remove);

module.exports = router;
