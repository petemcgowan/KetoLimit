import React from 'react'
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native'

import { RFPercentage } from 'react-native-responsive-fontsize'

const { width, height } = Dimensions.get('window')

const SlideComponent = ({
  title,
  description,
  image,
  referenceLink,
  referenceSource,
}) => {
  return (
    <View style={styles.slideContainer}>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={image} />
      </View>
      <View style={styles.titleBox}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <View style={styles.textBox}>
        <Text style={styles.text}>{description}</Text>
      </View>
      {referenceLink && (
        <View style={styles.referenceView}>
          <TouchableOpacity onPress={() => Linking.openURL(referenceLink)}>
            <Text style={styles.linkText}>{referenceSource}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default SlideComponent

const styles = StyleSheet.create({
  slideContainer: {
    width: width,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  contentContainer: {
    justifyContent: 'center',
  },
  imageContainer: {
    width: width * 0.9,
    height: height * 0.4,
    alignSelf: 'center',
    paddingVertical: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleBox: {},
  referenceView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 15,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: RFPercentage(2.5),
    maxWidth: width - 40,
    justifyContent: 'center',
  },
  titleText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: RFPercentage(3.1),
    justifyContent: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
})
