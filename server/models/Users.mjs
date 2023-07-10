import { sequelize, DISABLE_SEQUELIZE_DEFAULTS } from '../db/sequelizeSetup.mjs'
import Sequelize from 'sequelize'

const { DataTypes } = Sequelize

export const Users = sequelize.define(
  'users',
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email_address: { type: DataTypes.STRING, allowNull: false },
    user_name: { type: DataTypes.STRING },
    last_login_date: { type: DataTypes.DATE },
    // created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    // updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  DISABLE_SEQUELIZE_DEFAULTS
)
