 'use strict'

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.belongsTo(models.User, {foreignKey:'ownerId'});
      Spot.hasMany(models.SpotImage, {foreignKey:'spotId', onDelete: 'CASCADE'});
      Spot.hasMany(models.Review, {foreignKey: 'spotId', onDelete: 'CASCADE'});
      Spot.hasMany(models.Booking, {foreignKey: 'spotId', onDelete: 'CASCADE'});

    }
  }
  Spot.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    lat:
    {
      type: DataTypes.FLOAT,
      validate: {
        isFloat: true
      }
    },
    lng:
    {
      type: DataTypes.FLOAT,
      validate: {
        isFloat: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price:
    {
      type: DataTypes.FLOAT
    }
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};
