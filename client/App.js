import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import axios from 'axios'
import Svg from 'react-native-svg'
import Animated from 'react-native-reanimated'
import Lottie from 'lottie-react-native'
import SearchScreen from './screens/SearchScreen'
import KetoTrackerScreen from './screens/KetoTrackerScreen'
import KetoLimitScreen from './screens/KetoLimitScreen'
import HelpScreen from './screens/HelpScreen'

import { TrackerProvider } from './state/TrackerContext'

import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { AnimatedTabBar } from './tabbar/AnimatedTabBar'

import SplashScreen from 'react-native-splash-screen'

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'black',
    notification: 'blue',
  },
}
const Tab = createBottomTabNavigator()
export const AnimatedSvg = Animated.createAnimatedComponent(Svg)

export default function App() {
  const [trackerItems, setTrackerItems] = useState([])
  const [totalCarbs, setTotalCarbs] = useState(0)
  const [totalGILoad, setTotalGILoad] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [itemsForSelectedDate, setItemsForSelectedDate] = useState([])
  const [foodData, setFoodData] = useState()

  const getTotalCarbsForSpecificDay = () => {
    // const { trackerItems, setTotalCarbs, selectedDate } =
    //   useContext(TrackerContext)
    let carbsForDayAmt = 0

    trackerItems.map((item) => {
      const itemDate = new Date(item.consumptionDate)

      if (
        itemDate.getFullYear() === selectedDate.getFullYear() &&
        itemDate.getMonth() === selectedDate.getMonth() &&
        itemDate.getDate() === selectedDate.getDate()
      ) {
        carbsForDayAmt = carbsForDayAmt + item.carbAmt
        console.log(
          'getTotalCarbsForSpecificDay, carbsForDayAmt:' + carbsForDayAmt
        )
      }
    })
    setTotalCarbs(carbsForDayAmt)
    // setFocused(!focused)
    return carbsForDayAmt
  }

  const handleNextDay = () => {
    console.log('handleNextDay, selectedDate:' + selectedDate.toDateString())
    setSelectedDate(
      (prevDate) => new Date(prevDate.setDate(prevDate.getDate() + 1))
    )
    getTotalCarbsForSpecificDay()
  }

  const handlePrevDay = () => {
    console.log('handlePrevDay, selectedDate:' + selectedDate.toDateString())
    setSelectedDate(
      (prevDate) => new Date(prevDate.setDate(prevDate.getDate() - 1))
    )
    getTotalCarbsForSpecificDay()
  }

  const value = {
    trackerItems,
    setTrackerItems,
    totalCarbs,
    setTotalCarbs,
    totalGILoad,
    setTotalGILoad,
    selectedDate,
    setSelectedDate,
    itemsForSelectedDate,
    setItemsForSelectedDate,
    handlePrevDay,
    handleNextDay,
    foodData,
  }

  useEffect(() => {
    console.log('App, useEffect')
    const getFoodFacts = async () => {
      try {
        const foodFactsResponse = await axios({
          url: 'http://localhost:4001/pete-graphql',
          method: 'post',
          data: {
            query: `
              query {
                allFoodFacts {
                  foodFactsId: food_facts_id
                  foodName: food_name
                  publicFoodKey: public_food_key
                  calcium
                  carbohydrates
                  classification
                  energy
                  fatTotal: fat_total
                  iodine
                  magnesium
                  potassium
                  protein
                  saturatedFat: saturated_fat
                  sodium
                  totalDietaryFibre: total_dietary_fibre
                  totalSugars: total_sugars
                  creationTs: creation_ts
                  lastModifiedTs: last_modified_ts
                }
              }
            `,
          },
        })

        setFoodData(foodFactsResponse.data.data.allFoodFacts)
        return foodFactsResponse.data.data.allFoodFacts
      } catch (error) {
        console.error('Error fetching food facts:', error)
      }
    }

    getFoodFacts()

    const getConsumptionLogs = async () => {
      try {
        const consumptionResponse = await axios({
          url: 'http://localhost:4001/pete-graphql',
          method: 'post',
          data: {
            query: `
            query {
              consumptionLogWithFoodFacts(
                consumptioninput: {
                  userId: "peteburquette@gmail.com",
                  consumptionDate: "2023-06-24"
                }
              ) {
                consumption_log_id
                consumption_date
                food_facts_id
                food_name
                public_food_key
                carbohydrates
                energy
                fat_total
                protein
                sodium
                total_dietary_fibre
                total_sugars
              }
            }
            `,
          },
        })

        if (
          consumptionResponse &&
          consumptionResponse.data &&
          consumptionResponse.data.data
        ) {
          const consumptionLogWithFoodFacts =
            consumptionResponse.data.data.consumptionLogWithFoodFacts

          if (Array.isArray(consumptionLogWithFoodFacts)) {
            setTrackerItems(
              consumptionLogWithFoodFacts.map((item) => {
                return {
                  id: item.consumption_log_id.toString(),
                  foodFactsId: item.food_facts_id.toString(),
                  description: item.food_name,
                  carbAmt: item.carbohydrates,
                  giAmt: 30, // Placeholder value as giAmt is not available in the response
                  glAmt: 30, // Placeholder value as glAmt is not available in the response
                  fiberAmt: item.total_dietary_fibre,
                  proteinAmt: item.protein,
                  fatAmt: item.fat_total,
                  energyAmt: item.energy,
                  sugarsAmt: item.total_sugars,
                  sodiumAmt: item.sodium,
                  giBackgroundColor: '#350244', // Placeholder value as giBackgroundColor is not available in the response
                  glBackgroundColor: '#350244', // Placeholder value as glBackgroundColor is not available in the response
                  carbBackgroundColor:
                    item.carbohydrates > 22
                      ? '#1A0546'
                      : item.carbohydrates > 11
                      ? '#5C6500'
                      : '#350244',
                  portionAmount: 0, // Placeholder value as portionAmount is not available in the response
                  consumptionDate: new Date(
                    parseInt(item.consumption_date, 10)
                  ),
                }
              })
            )
          }
        }

        return consumptionResponse.data
      } catch (error) {
        console.error('Error fetching consumption:', error)
      }
    }

    getConsumptionLogs()

    // do stuff while splash screen is shown
    // After having done stuff (such as async tasks) hide the splash screen
    SplashScreen.hide()
  }, []) //selectedDate

  return (
    <TrackerProvider value={value}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Tab.Navigator
            tabBar={(props) => <AnimatedTabBar {...props} />}
            // screenOptions={({ route }) => {
            //   return {
            //     tabBarIcon: ({ focused, color, size }) => {
            //       let iconName
            //       // Define icon based on the route name
            //       switch (route.name) {
            //         case 'Food Search':
            //           iconName = 'search'
            //           break
            //         case 'Keto Tracker':
            //           iconName = 'utensils'
            //           break
            //         case 'Keto Limit':
            //           iconName = 'ban'
            //           break
            //         case 'Help':
            //           iconName = 'book'
            //           break
            //         default:
            //           iconName = 'search'
            //       }

            //       return (
            //         <FontAwesome5
            //           name={iconName}
            //           size={focused ? 40 : 36}
            //           // color={focused ? '#6E7B69' : '#3F5147'}   // monochromatic UI scheme
            //           // color={focused ? '#350244' : '#735C84'} // Complementary UI scheme
            //           color={focused ? '#2196F3' : '#527AB3'} // Analogous UI scheme
            //         />
            //       )
            //     },
            //     cardStyle: {
            //       backgroundColor: 'black',
            //     },
            //     tabBarShowLabel: false,
            //     tabBarActiveTintColor: 'yellow', // color of text and icon when tab is active
            //     tabBarInactiveTintColor: 'orange', // color of text and icon when tab is inactive
            //   }
            // }}
          >
            <Tab.Screen
              name="Food Search"
              component={SearchScreen}
              initialParams={{
                itemId: 42,
                itemId2: 67,
              }}
              options={{
                // tabBarIcon: ({ color, size }) => (
                //   <FontAwesome5 name="search" size={36} color="orange" />
                // ),
                tabBarIcon: ({ ref }) => (
                  <Lottie
                    ref={ref}
                    loop={false}
                    source={require('../assets/lottie/125888-avocado-fruit-exercise-animation.json')}
                    style={styles.icon}
                  />
                ),
                headerTitleStyle: {
                  color: 'rgb(124, 131, 134)',
                  fontSize: 44,
                  fontWeight: '200',
                },
                headerStyle: {
                  backgroundColor: '#1A0546',
                },
                // tabBarItemStyle: {
                //   backgroundColor: 'rgba(59, 73, 55, 1)', // "#1b1344",
                // },
              }}
            />
            <Tab.Screen
              name="Keto Tracker"
              component={KetoTrackerScreen}
              options={{
                // tabBarIcon: ({ color, size }) => (
                //   <FontAwesome5 name="utensils" size={36} color="orange" />
                // ),
                tabBarIcon: ({ ref }) => (
                  <Lottie
                    ref={ref}
                    loop={false}
                    source={require('../assets/lottie/88719-checklist.json')}
                    style={styles.icon}
                  />
                ),
                tabBarBadge: trackerItems.length,
                headerTitleStyle: {
                  color: 'rgb(124, 131, 134)',
                  fontSize: 44,
                  fontWeight: '200',
                },
                headerStyle: {
                  backgroundColor: '#350244',
                },
                tabBarItemStyle: {
                  backgroundColor: 'rgba(59, 73, 55, 1)',
                },
                tabBarBadgeStyle: {
                  backgroundColor: '#453749',
                  color: '#BBBccc',
                  fontSize: 17,
                },
              }}
            />
            <Tab.Screen
              name="Keto Limit"
              component={KetoLimitScreen}
              options={{
                // tabBarIcon: ({ color, size }) => (
                //   <FontAwesome5 name="ban" size={36} color="orange" />
                // ),
                tabBarIcon: ({ ref }) => (
                  <Lottie
                    ref={ref}
                    loop={false}
                    source={require('../assets/lottie/64165-statistics-chart.json')}
                    style={styles.icon}
                  />
                ),
                tabBarBadge: totalCarbs,
                headerStyle: {
                  opacity: 0.9,
                  backgroundColor: 'aqua',
                },
                headerTitleStyle: {
                  color: 'rgb(124, 131, 134)',
                  fontSize: 44,
                  fontWeight: '200',
                },
                tabBarItemStyle: {
                  backgroundColor: 'rgba(59, 73, 55, 1)',
                  color: '#BBBccc',
                },
                tabBarBadgeStyle: {
                  backgroundColor: '#2196F3',

                  color: '#BBBccc',
                  fontSize: 17,
                },
              }}
            />
            <Tab.Screen
              name="Help"
              component={HelpScreen}
              options={{
                // tabBarIcon: ({ color, size }) => (
                //   <FontAwesome5 name="book" size={36} color="orange" />
                // ),
                tabBarIcon: ({ ref }) => (
                  <Lottie
                    ref={ref}
                    loop={false}
                    source={require('../assets/lottie/33101-light-bulb-animation.json')}
                    style={styles.icon}
                  />
                ),
                headerTitle: {
                  paddingHorizontal: 20,
                  paddingBottom: 20,
                  padding: 10,
                },
                headerTitleStyle: {
                  color: 'rgb(124, 131, 134)',
                  fontSize: 44,
                  fontWeight: '200',
                },
                headerStyle: {
                  backgroundColor: '#5C6500',
                },
                tabBarItemStyle: {
                  backgroundColor: 'rgba(59, 73, 55, 1)',
                },
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </TrackerProvider>
  )
}

export const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#350244',
  },
  activeBackground: {
    position: 'absolute',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  component: {
    height: 60,
    width: 60,
    marginTop: -5,
  },
  componentCircle: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#3490dc',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 55,
    width: 55,
  },
})
