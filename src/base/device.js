/**
* @Author: Shen
* @Date:   2016-07-29T14:37:41+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   Shen
* @Last modified time: 2016-10-24T12:51:56+08:00
*/

'use strict';
import React from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Dimensions from 'Dimensions'
const Device = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
	iOS: React.Platform.OS === 'ios' || false, // e.g. true or false
	isAndroid: React.Platform.OS === 'android' || false, // e.g. true or false
	androidVersion: React.Platform.OS === 'android' ? React.Platform.Version : null, // e.g. 23 or null
	deviceName: DeviceInfo.getDeviceName(), // e.g. iPhone OS
	deviceID: DeviceInfo.getDeviceId(), // e.g. iPhone7,2 / or the board on Android e.g. goldfish
	systemVersion: DeviceInfo.getSystemVersion(), // e.g. 9.0  or 6.0
	udid: DeviceInfo.getUniqueID(), // e.g. FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9
	bundleId: DeviceInfo.getBundleId(), // e.g. com.sprucethink.swift_horse
	buildNumber: DeviceInfo.getBuildNumber(), // e.g. 1
	locale: DeviceInfo.getDeviceLocale(), // e.g zh-CN
	country: DeviceInfo.getDeviceCountry(), // e.g CN
	version: DeviceInfo.getVersion(), // e.g. 1.0.0
	versions: DeviceInfo.getReadableVersion(), // e.g. 1.0.0.1
	userAgent: DeviceInfo.getUserAgent(), // e.g. Dalvik/2.1.0 (Linux; U; Android 5.1; Google Nexus 4 - 5.1.0 - API 22 - 768x1280 Build/LMY47D)
  andrAPIBelow21: React.Platform.OS === 'android' && React.Platform.Version < 21 || false ,// andorid api version < 21
  brand:DeviceInfo.getBrand()
}
export default Device
