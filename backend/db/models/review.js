'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Review.belongsTo(models.Spot);
      Review.belongsTo(models.User)
      Review.hasMany(models.ReviewImage, {foreignKey: 'reviewId', onDelete: 'CASCADE'})

    }
  }
  Review.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spots',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    review: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
