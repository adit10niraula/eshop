const express = require('express');

const router = express.Router();
const passport = require('passport');
const { fetchActivityRecommendation, fetchInteractionRecommendation, fetchSellerInsights, fetchActivityRecommendationML } = require('../controllers/ActivityRecommendation');



router.get('/',passport.authenticate('jwt'), fetchActivityRecommendation).get('/interaction',passport.authenticate('jwt'), fetchInteractionRecommendation).get('/ml',passport.authenticate('jwt'), fetchActivityRecommendationML).get('/seller/:seller',passport.authenticate('jwt'), fetchSellerInsights);

exports.router = router;
