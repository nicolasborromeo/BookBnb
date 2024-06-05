'use strict';

let options = {}
if(process.env.NODE_ENV ==='production') {
  options.schema = process.env.SCHEMA
}

const { Review } = require('../models')

const reviews = [
  {
    spotId: 1,
    userId: 2,
    review: 'Amazing place, very clean and well-located.',
    stars: 5
  },
  {
    spotId: 2,
    userId: 3,
    review: 'Great stay, host was very accommodating.',
    stars: 4
  },
  {
    spotId: 3,
    userId: 2,
    review: 'Decent place but a bit noisy at night.',
    stars: 3
  },
  {
    spotId: 4,
    userId: 1,
    review: 'Beautiful house, enjoyed our stay very much.',
    stars: 5
  },
  {
    spotId: 5,
    userId: 1,
    review: 'Good value for money, would stay again.',
    stars: 4
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate(reviews, {validate:true})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews'
    const { Op } = require('sequelize')
    await queryInterface.bulkDelete(options, {
      id: {
        [Op.in]: [1, 2, 3, 4, 5]
      }
    }, {});
  }
};
