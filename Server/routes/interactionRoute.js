const express = require('express');
const userInteractionController = require('../controllers/userInteractions');

const router = express.Router();
const passport = require('passport');



router.post('/',passport.authenticate('jwt'), userInteractionController.createInteraction).get('/user/:userId',passport.authenticate('jwt'), userInteractionController.getUserInteractions).get('/product/:productId',passport.authenticate('jwt'), userInteractionController.getProductInteractions).delete('/:id',passport.authenticate('jwt'), userInteractionController.deleteInteraction).get('/user/:userId/week',passport.authenticate('jwt'), userInteractionController.getUserInteractionsForLastWeek).get('/trends',passport.authenticate('jwt'), userInteractionController.getStockTrends);

exports.router = router;
