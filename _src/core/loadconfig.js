(function() {
  UE.Editor.prototype.loadServerConfig = function() {
    var me = this;
    setTimeout(function() {
      try {
        me.options.imageUrl &&
          me.setOpt(
            "serverUrl",
            me.options.imageUrl.replace(
              /^(.*[\/]).+([\.].+)$/,
              "$1controller$2"
            )
          );

        // var configUrl = me.getActionUrl("config"),
        //   isJsonp = utils.isCrossDomainUrl(configUrl);

        /** LyS - 是否发出过ajax请求 */
        me._serverConfigLoaded = false;
        // 配置本地化
        var configJSON = {
          'imageActionName': 'uploadimage',
          'imageFieldName': 'file',
          'imageMaxSize': 2048000,
          'imageAllowFiles': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
          'imageCompressEnable': true,
          'imageCompressBorder': 1600,
          'imageInsertAlign': 'none',
          'imageUrlPrefix': '',
          'imagePathFormat': '\/ueditor\/php\/upload\/image\/{yyyy}{mm}{dd}\/{time}{rand:6}',
          'scrawlActionName': 'uploadscrawl',
          'scrawlFieldName': 'file',
          'scrawlPathFormat': '\/ueditor\/php\/upload\/image\/{yyyy}{mm}{dd}\/{time}{rand:6}',
          'scrawlMaxSize': 2048000,
          'scrawlUrlPrefix': '',
          'scrawlInsertAlign': 'none',
          'snapscreenActionName': 'uploadimage',
          'snapscreenPathFormat': '\/ueditor\/php\/upload\/image\/{yyyy}{mm}{dd}\/{time}{rand:6}',
          'snapscreenUrlPrefix': '',
          'snapscreenInsertAlign': 'none',
          'catcherLocalDomain': ['127.0.0.1', 'localhost', 'img.baidu.com'],
          'catcherActionName': 'catchimage',
          'catcherFieldName': 'source',
          'catcherPathFormat': '\/ueditor\/php\/upload\/image\/{yyyy}{mm}{dd}\/{time}{rand:6}',
          'catcherUrlPrefix': '',
          'catcherMaxSize': 2048000,
          'catcherAllowFiles': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'],
          'videoActionName': 'uploadvideo',
          'videoFieldName': 'file',
          'videoPathFormat': '\/ueditor\/php\/upload\/video\/{yyyy}{mm}{dd}\/{time}{rand:6}',
          'videoUrlPrefix': '',
          'videoMaxSize': 102400000,
          'videoAllowFiles': ['.flv', '.swf', '.mkv', '.avi', '.rm', '.rmvb', '.mpeg', '.mpg', '.ogg', '.ogv', '.mov', '.wmv', '.mp4', '.webm', '.mp3', '.wav', '.mid'],
          'fileActionName': 'uploadfile',
          'fileFieldName': 'file',
          'filePathFormat': '\/ueditor\/php\/upload\/file\/{yyyy}{mm}{dd}\/{time}{rand:6}',
          'fileUrlPrefix': '',
          'fileMaxSize': 51200000,
          'fileAllowFiles': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.flv', '.swf', '.mkv', '.avi', '.rm', '.rmvb', '.mpeg', '.mpg', '.ogg', '.ogv', '.mov', '.wmv', '.mp4', '.webm', '.mp3', '.wav', '.mid', '.rar', '.zip', '.tar', '.gz', '.7z', '.bz2', '.cab', '.iso', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt', '.md', '.xml'],
          'imageManagerActionName': 'listimage',
          'imageManagerListPath': '\/ueditor\/php\/upload\/image\/',
          'imageManagerListSize': 20,
          'imageManagerUrlPrefix': '',
          'imageManagerInsertAlign': 'none',
          'imageManagerAllowFiles': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
          'fileManagerActionName': 'listfile',
          'fileManagerListPath': '\/ueditor\/php\/upload\/file\/',
          'fileManagerUrlPrefix': '',
          'fileManagerListSize': 20,
          'fileManagerAllowFiles': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.flv', '.swf', '.mkv', '.avi', '.rm', '.rmvb', '.mpeg', '.mpg', '.ogg', '.ogv', '.mov', '.wmv', '.mp4', '.webm', '.mp3', '.wav', '.mid', '.rar', '.zip', '.tar', '.gz', '.7z', '.bz2', '.cab', '.iso', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt', '.md', '.xml']
        };
        console.log('ueditor本地配置 =>', configJSON);
        utils.extend(me.options, configJSON);
        me.fireEvent('serverConfigLoaded');
        // 标记为已发送过，因为isServerConfigLoaded方法中会进行判断
        me._serverConfigLoaded = true

        /*configUrl &&
          UE.ajax.request(configUrl, {
            method: "GET",
            dataType: isJsonp ? "jsonp" : "",
            onsuccess: function(r) {
              try {
                var config = isJsonp ? r : eval("(" + r.responseText + ")");
                utils.extend(me.options, config);
                me.fireEvent("serverConfigLoaded");
                me._serverConfigLoaded = true;
              } catch (e) {
                showErrorMsg(me.getLang("loadconfigFormatError"));
              }
            },
            onerror: function() {
              showErrorMsg(me.getLang("loadconfigHttpError"));
            }
          });*/
      } catch (e) {
        showErrorMsg(me.getLang("loadconfigError"));
      }
    });

    function showErrorMsg(msg) {
      console && console.error(msg);
      //me.fireEvent('showMessage', {
      //    'title': msg,
      //    'type': 'error'
      //});
    }
  };

  UE.Editor.prototype.isServerConfigLoaded = function() {
    var me = this;
    return me._serverConfigLoaded || false;
  };

  UE.Editor.prototype.afterConfigReady = function(handler) {
    if (!handler || !utils.isFunction(handler)) return;
    var me = this;
    var readyHandler = function() {
      handler.apply(me, arguments);
      me.removeListener("serverConfigLoaded", readyHandler);
    };

    if (me.isServerConfigLoaded()) {
      handler.call(me, "serverConfigLoaded");
    } else {
      me.addListener("serverConfigLoaded", readyHandler);
    }
  };
})();
