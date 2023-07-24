import {
  FoodFacts,
  FavouriteFoods,
  ConsumptionLogs,
  WaterConsumptions,
  WeightLogs,
  Users,
} from '../models/associations.mjs'
import Sequelize, { Op } from 'sequelize'
import { sequelize } from '../db/sequelizeSetup.mjs'
import { toSnakeCase } from '../schema/DatabaseUtils.mjs'

export async function getUserInfo(emailAddress) {
  try {
    // Retrieve user details
    let user = await Users.findOne({ where: { email_address: emailAddress } })

    // If user does not exist, create a new user
    if (!user) {
      user = await Users.create({ email_address: emailAddress })
    }

    return user
  } catch (error) {
    console.error('getUserInfo, error:' + error)
    throw error
  }
}

export async function getConsumptionLogWithFoodFacts(consumptionDate, userId) {
  try {
    console.log(
      'getConsumptionLogWithFoodFacts, consumptionDate:' +
        consumptionDate +
        ', userId:' +
        userId
    )

    const consumptionLogs = await ConsumptionLogs.findAll({
      where: {
        // consumption_date: consumptionDate,
        user_id: userId,
      },
      include: [
        {
          model: FoodFacts,
          attributes: [
            'food_name',
            'public_food_key',
            'carbohydrates',
            'energy',
            'fat_total',
            'protein',
            'sodium',
            'total_dietary_fibre',
            'total_sugars',
          ],
        },
      ],
      attributes: [
        'consumption_log_id',
        'consumption_date',
        'food_facts_id',
        'user_id',
      ],
    })

    const result = consumptionLogs.map((log) => {
      return {
        consumption_log_id: log.consumption_log_id,
        consumption_date: log.consumption_date,
        food_facts_id: parseInt(log.food_facts_id, 10),
        food_name: log.food_fact.food_name,
        public_food_key: log.food_fact.public_food_key,
        carbohydrates: log.food_fact.carbohydrates,
        energy: log.food_fact.energy,
        fat_total: log.food_fact.fat_total,
        protein: log.food_fact.protein,
        sodium: log.food_fact.sodium,
        total_dietary_fibre: log.food_fact.total_dietary_fibre,
        total_sugars: log.food_fact.total_sugars,
        user_id: log.food_fact.user_id,
      }
    })

    return result
  } catch (error) {
    console.error('Error fetching  consumptionLogs with food facts:', error)
    throw error
  }
}

export async function getAllFoodFacts(userId) {
  try {
    const allFoodFacts = await FoodFacts.findAll({
      raw: true,
      include: {
        model: FavouriteFoods,
        as: 'favouriteFoods',
        where: { user_id: userId },
        required: false,
      },
      // Customize the returned data using a map function
      attributes: {
        include: [
          [
            // Use Sequelize.literal to check if favourite_foods_id is null or not
            Sequelize.literal(`(
              CASE
                WHEN "favouriteFoods"."favourite_foods_id" IS NOT NULL THEN true
                ELSE false
              END
            )`),
            'isFavourite',
          ],
        ],
      },
    })

    return allFoodFacts
  } catch (error) {
    console.error('getAllFoodFacts, error:' + error)
  }
}

export async function getWaterConsumptions(userId) {
  try {
    const waterConsumptions = await WaterConsumptions.findAll({
      where: { user_id: userId },
      attributes: [
        'water_consumptions_id',
        'user_id',
        'consumption_date',
        'litre_amount',
      ],
    })

    return waterConsumptions
  } catch (error) {
    console.error('getWaterConsumptions, error:' + error)
  }
}

export async function getWeightLogs(userId) {
  try {
    const weightLogs = await WeightLogs.findAll({
      where: { user_id: userId },
      attributes: [
        'weight_logs_id',
        'user_id',
        'weigh_in_timestamp',
        'kg_amount',
      ],
    })

    return weightLogs
  } catch (error) {
    console.error('getWeightLogs, error:' + error)
  }
}

export async function fillFoodFacts() {
  try {
    // In case the tables have been deleted, sync will create them
    // await sequelize.sync()

    FoodFacts.bulkCreate(
      [
        {
          subHeading: 'Units',
          helpText: `Do you weigh yourself in pounds?  Stones and Pounds?  Kg?  Specify that on this page!\n\n\nDo you measure your height in cm (metric) or feet and inches (imperial)?\n\n\nSpecify here and we'll stick to that unless you change it here...\n`,
          References: [
            {
              shortTitle: null,
              title: null,
              link: null,
            },
          ],
        },
      ],
      {
        include: [References],
      }
    ).then((newFoodFacts) => {
      return newFoodFacts
    })
  } catch (error) {
    console.error('fillFoodFacts, error:' + error)
  }
}

export async function getAllConsumptionLog() {
  try {
    const allConsumptionLog = await ConsumptionLogs.findAll()

    return allConsumptionLog
  } catch (error) {
    console.error('getAllConsumptionLog, error:' + error)
  }
}

export async function replaceConsumptionLogs(
  addedItems,
  dayToUpdate,
  toBeDeleted,
  toBeInserted
) {
  let t
  try {
    console.log(
      'replaceConsumptionLogs called, addedItems: ',
      JSON.stringify(addedItems)
    )
    console.log('replaceConsumptionLogs called, toBeDeleted: ', toBeDeleted)

    t = await ConsumptionLogs.sequelize.transaction()

    // Delete records if needed/specified
    if (toBeDeleted) {
      const foodFactsIdsToDelete = addedItems.map((log) => log.foodFactsId)
      console.log('foodFactsIdsToDelete:' + foodFactsIdsToDelete)

      await ConsumptionLogs.destroy({
        where: {
          consumption_date: {
            [Op.eq]: dayToUpdate,
          },
          food_facts_id: {
            [Op.in]: foodFactsIdsToDelete,
          },
        },
        transaction: t,
      })
    }

    // Insert new records
    let newConsumptionAddedItems = []
    if (toBeInserted) {
      const snakeCasedAddedItems = addedItems.map(toSnakeCase)
      console.log(
        'snakeCasedAddedItems:' + JSON.stringify(snakeCasedAddedItems)
      )
      newConsumptionAddedItems = await ConsumptionLogs.bulkCreate(
        snakeCasedAddedItems,
        {
          transaction: t,
        }
      )
    }

    await t.commit()

    return newConsumptionAddedItems
  } catch (error) {
    // Handle error and maybe rollback the transaction
    if (t) {
      await t.rollback()
    }
    console.error('Error replacing consumption addedItems:', error)
    throw error
  }
}

export async function setAllFoodFacts(newFoodFacts) {
  try {
  } catch (error) {
    console.error('setAllFoodFacts, error:' + error)
  }
}

export async function setFavouriteFoodsDB(favouriteFoods, userId) {
  try {
    const transaction = await sequelize.transaction()

    try {
      let createdFavouriteFood = null
      // Delete existing favorite foods
      await FavouriteFoods.destroy({
        where: {
          user_id: userId,
          food_facts_id: favouriteFoods[0].foodFactsId,
        },
        transaction,
      })
      console.log(
        'favouriteFoods[0].is_favourite:' + favouriteFoods[0].isFavourite
      )
      if (favouriteFoods[0].isFavourite) {
        console.log('Preparing new record:')
        // Prepare new record
        const newFavouriteFood = {
          food_facts_id: favouriteFoods[0].foodFactsId,
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        }

        createdFavouriteFood = await FavouriteFoods.create(newFavouriteFood, {
          transaction,
        })
        // const createdFavouriteFood = await FavouriteFoods.create(
        //   newFavouriteFoods,
        //   { transaction }
        // )
      }
      await transaction.commit()

      return createdFavouriteFood
    } catch (error) {
      console.error('Error while setting favorite food:', error)
      throw error
    }
  } catch (error) {
    // Rollback if errors
    await transaction.rollback()
    console.error('Error starting transaction:', error)
    throw error
  }
}

export async function setWaterConsumptions(waterConsumptions) {
  try {
    const result = []
    for (let waterConsumptionEntry of waterConsumptions) {
      const [waterConsumptionRecord, created] = await WaterConsumptions.upsert(
        waterConsumptionEntry,
        {
          returning: true,
          where: {
            user_id: waterConsumptionEntry.userId,
            consumption_date: waterConsumptionEntry.consumptionDate,
          },
        }
      )
      console.log(
        'waterConsumptionRecord created or updated:',
        waterConsumptionRecord.dataValues
      )
      result.push(waterConsumptionRecord.dataValues)
    }
    return result
  } catch (error) {
    console.error('setWaterConsumption, error:', error)
  }
}

export async function setWeightLogs(weightLogs) {
  try {
    const result = []
    for (let weightLog of weightLogs) {
      const [weightLogRecord, created] = await WeightLogs.upsert(weightLog, {
        returning: true,
        where: {
          user_id: weightLog.userId,
          consumption_date: weightLog.consumptionDate,
        },
      })
      console.log('WeightLog created or updated:', weightLogRecord.dataValues)
      result.push(weightLogRecord.dataValues)
    }
    return result
  } catch (error) {
    console.error('setWeightLogs, error:', error)
  }
}
