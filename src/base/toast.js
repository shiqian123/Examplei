/**
* @Author: Shen
* @Date:   2016-10-26T14:50:12+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   Shen
* @Last modified time: 2016-10-26T14:51:47+08:00
*/

import RootToast from 'react-native-root-toast';
import { Device } from '../base';

class Toast {

  static show(message) {
    let options = Device.isAndroid ? {} : {position: RootToast.positions.CENTER};
    RootToast.show(message, options);
  }

}

export default Toast;
