/**
* @Author: Shen
* @Date:   2016-08-31T12:08:48+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   Shen
* @Last modified time: 2016-10-26T15:11:16+08:00
*/

'use strict';

import {AppState} from 'react-native';
import CodePush from 'react-native-code-push';
import Toast from './toast';

const updateDialog = {
  mandatoryContinueButtonLabel: '继续',
  mandatoryUpdateMessage: '有更新请您务必安装。',
  optionalIgnoreButtonLabel: '忽略',
  optionalInstallButtonLabel: '安装',
  optionalUpdateMessage: '有更新可用，您想要安装吗？',
  title: '应用可更新',
  appendReleaseDescription: true,
  descriptionPrefix: '更新内容：\n',
};

const syncStatusChangedCallback = (status) => {
  switch (status) {
    // case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
    //   Toast.show('检查更新');
    //   break;
    case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
      Toast.show('开始下载......');
      break;
    case CodePush.SyncStatus.INSTALLING_UPDATE:
      Toast.show('正在安装......');
      break;
  }
};

class HotUpdate {
  static sync() {
    CodePush.sync({ updateDialog, installMode: CodePush.InstallMode.IMMEDIATE },
      syncStatusChangedCallback
    );
  }

  static listenToAppState() {
    AppState.addEventListener('change', this._handleAppStateChange.bind(this));
  }

  static unlistenToAppState() {
    AppState.removeEventListener('change', this._handleAppStateChange.bind(this));
  }

  static _handleAppStateChange(newState) {
    newState === 'active' && this.sync();
  }
}

export default HotUpdate;
