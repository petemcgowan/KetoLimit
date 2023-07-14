import React, { useState, useEffect, useRef, useContext } from 'react'
import {
  ScrollView,
  Dimensions,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import SlideComponent from '../components/SlideComponent'
import BottomSheet from 'reanimated-bottom-sheet'
import LoginBottomSheet from './LoginBottomSheet'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import UserContext, { UserContextProps } from '../state/UserContext'
const { height } = Dimensions.get('window')

// const slides = [Onboarding1, Onboarding2, Onboarding3]

const slides = [
  {
    component: SlideComponent,
    title: 'Achieve Ketosis Naturally',
    description:
      'Track your carbohydrate intake and stay within your limits to achieve ketosis. In ketosis, your body switches to burning fat as its primary fuel source, promoting natural weight loss and a boost in energy levels.',
    // image: require('../assets/images/achieve_ketosis_naturally_2.png'),
    image: require('../assets/images/achieve_ketosis_naturally_3.png'),
  },
  {
    component: SlideComponent,
    title: 'Health Benefits Abound',
    description:
      'Staying in ketosis is linked to numerous health benefits. Aside from weight loss, it may improve heart health, combat brain disorders, and help in managing diabetes. Our app helps you stay on top of your carb intake to reap these rewards.',
    image: require('../assets/images/health_benefits_abound.png'),
  },
  {
    component: SlideComponent,
    title: 'Extensive Food Database',
    description:
      'With access to an extensive list of over 2000 foods, finding and tracking the carbohydrate content of what you eat is effortless. Make informed choices and easily manage your daily intake.',
    // image: require('../assets/images/extensive_food_database_3.png'),
    image: require('../assets/images/extensive_food_database_4.png'),
  },
  {
    component: SlideComponent,
    title: 'Stay Informed and Motivated',
    description:
      'Our app empowers you with knowledge about ketosis and the ketogenic diet. Track your progress, set goals, and gain insights that keep you motivated on your journey towards improved health.',
    // image: require('../assets/images/stay_informed_and_motivated_2.png'),
    image: require('../assets/images/stay_informed_and_motivated.png'),
  },
  {
    component: SlideComponent,
    title: 'Tailored to Your Journey',
    description: `Whether you're just starting out or have been following a ketogenic lifestyle for a while, our app provides the tools you need to effectively track your carbohydrate intake and stay in ketosis.`,
    image: require('../assets/images/tailored_to_your_journey.png'),
  },
]

const OnboardingDeck = () => {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const sheetRef = useRef<BottomSheet>(null)
  const [isSigninInProgress, setSigninInProgress] = useState(false)
  const navigation = useNavigation()
  const [backgroundColor, setBackgroundColor] = useState('#000')
  const slideColors = [
    'rgb(38, 27, 21)',
    'rgb(25, 26, 29)',
    'rgb(9, 21, 39)',
    'rgb(38, 27, 21)',
    'rgb(25, 26, 29)',
  ]
  const { setEmailAddress } = useContext(UserContext) as UserContextProps

  const onScroll = (event: any) => {
    const slide = Math.ceil(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width
    )
    if (slide !== activeSlide) {
      setActiveSlide(slide)

      if (slide > slides.length - 1) {
        console.log('Slides end reached')
      } else {
        setBackgroundColor(slideColors[slide]) // Set the background color when the slide changes
        console.log(slideColors[slide])
      }
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setSigninInProgress(true)
      const hasPlayServices = await GoogleSignin.hasPlayServices()
      console.log('hasPlayServices:' + hasPlayServices)
      const userInfo = await GoogleSignin.signIn().catch((error) => {
        console.log('Error during Google Sign In:', error)
      })
      // Here you will get user information, you can send it to your backend server for verification
      console.log('userInfo:' + JSON.stringify(userInfo))
      setEmailAddress(userInfo.email)
      navigation.navigate('LoadingScreen')
      setSigninInProgress(false)
    } catch (error) {
      console.log('Error in handleGoogleLogin:' + error)
    }
  }

  const onStartNowPress = () => {
    console.log('onStartNowPress')
    if (isSheetOpen) {
      sheetRef.current?.snapTo(0)
      console.log('sheet open snapping to 0')
    } else {
      sheetRef.current?.snapTo(1)
      console.log('sheet closed snapping to 1')
    }
    setIsSheetOpen(!isSheetOpen)
  }

  const onLinkPress = () => {
    if (isSheetOpen) {
      sheetRef.current?.snapTo(0)
    } else {
      sheetRef.current?.snapTo(1)
    }
    setIsSheetOpen(!isSheetOpen)
  }

  useEffect(() => {
    GoogleSignin.configure({
      androidClientId:
        '534592509466-r0b52u6k67qqluglvd7eo6sptlsf1eqr.apps.googleusercontent.com',
      iosClientId:
        '534592509466-emk8vddvuarhkrqhdv1qlp5rg5ddtagi.apps.googleusercontent.com',
    })
  }, [])

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: backgroundColor }]}
    >
      <View style={styles.topContainer}>
        <ScrollView
          style={styles.scrollView}
          horizontal
          pagingEnabled
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        >
          {slides.map((slide, index) => {
            const SlideComponent = slide.component
            return (
              <SlideComponent
                key={index}
                title={slide.title}
                description={slide.description}
                image={slide.image}
              />
            )
          })}
        </ScrollView>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <Text
              key={index}
              style={index === activeSlide ? styles.activeDot : styles.dot}
            >
              •
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.button} onPress={onStartNowPress}>
          <Text style={styles.buttonText}>Start Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={onLinkPress}>
          <Text style={styles.linkText}>Already have an account?</Text>
        </TouchableOpacity>
      </View>
      <View
        style={
          isSheetOpen ? styles.bottomSheetVisible : styles.bottomSheetHidden
        }
      >
        <LoginBottomSheet
          sheetRef={sheetRef}
          onStartNowPress={onStartNowPress}
          handleGoogleLogin={handleGoogleLogin}
          isSigninInProgress={isSigninInProgress}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
    justifyContent: 'space-around',
  },
  topContainer: {
    flex: 1,
  },
  bottomSheetVisible: {
    position: 'absolute',
    bottom: 0,
    height: '50%',
    width: '100%',
  },
  bottomSheetHidden: {
    position: 'absolute',
    bottom: 0,
    height: 0,
    width: 0,
  },
  scrollView: {
    flex: 0.55,
    paddingTop: 20,
  },
  bottomContainer: {
    flex: 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 300,
    height: 50,
    backgroundColor: 'rgb(44, 207, 157)',
    padding: 10,
    marginBottom: 20,
    borderRadius: 30,
    elevation: 5, // for Android
    shadowOffset: {
      // for iOS
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetContainer: {},
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  dot: {
    fontSize: 50,
    color: '#888',
    margin: 5,
  },
  activeDot: {
    fontSize: 50,
    color: '#FFF',
    margin: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
  },
  link: {
    marginBottom: 10,
  },
  linkText: {
    color: 'rgb(44, 207, 157)',
    fontSize: 18,
    textDecorationLine: 'underline',
  },
})

export default OnboardingDeck
