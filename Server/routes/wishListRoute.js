const mongoose = require('mongoose');
const express = require('express');
const { createNewWishList, deleteWishList, resetWishlistController, getUserWishList } = require('../controllers/WishlistController');

const router = express.Router();
const passport = require('passport');


router.get('/',passport.authenticate('jwt'),getUserWishList).post('/', passport.authenticate('jwt'), createNewWishList).post('/reset',resetWishlistController).delete('/:id', deleteWishList);
exports.router = router;