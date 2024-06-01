'use strict';

let options = {};
options.tableName = 'Users'
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn(options,
      'firstName',
      {
        type: Sequelize.STRING(20),
        allowNull: false,
      }),
    await queryInterface.addColumn(options,
        'lastName',
        {
          type: Sequelize.STRING(20),
          allowNull: false,
        })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(options,
      'firstName', 'lastName')
  }
};
