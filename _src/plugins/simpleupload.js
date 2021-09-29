/**
 * @description
 * 简单上传:点击按钮,直接选择文件上传
 * 原 UEditor 作者使用了 form 表单 + iframe 的方式上传
 * 但由于同源策略的限制，父页面无法访问跨域的 iframe 内容
 * 导致无法获取接口返回的数据，使得单图上传无法在跨域的情况下使用
 * 这里改为普通的XHR上传，兼容到IE10+
 * @author HaoChuan9421 <hc199421@gmail.com>
 * @date 2018-12-20
 */
UE.plugin.register("simpleupload", function() {
    var me = this,
        containerBtn,
        timestrap = (+new Date()).toString(36);

    function initUploadBtn() {
        var w = containerBtn.offsetWidth || 20,
            h = containerBtn.offsetHeight || 20,
            btnStyle = 'display:block;width:' + w + 'px;height:' + h + 'px;overflow:hidden;border:0;margin:0;padding:0;position:absolute;top:0;left:0;filter:alpha(opacity=0);-moz-opacity:0;-khtml-opacity: 0;opacity: 0;cursor:pointer;';

        var form = document.createElement('form');
        var input = document.createElement('input');
        form.id = 'edui_form_' + timestrap;
        form.enctype = 'multipart/form-data';
        form.style = btnStyle;
        input.id = 'edui_input_' + timestrap;
        input.type = 'file'
        input.accept = 'image/*';
        input.name = me.options.imageFieldName;
        input.style = btnStyle;
        form.appendChild(input);
        containerBtn.appendChild(form);

        input.addEventListener('change', function(event) {
            if (!input.value) return;
            var loadingId = 'loading_' + (+new Date()).toString(36);
            var imageActionUrl = me.getActionUrl(me.getOpt('imageActionName'));
            var params = utils.serializeParam(me.queryCommandValue('serverparam')) || '';
            // var action = utils.formatUrl(imageActionUrl + (imageActionUrl.indexOf('?') == -1 ? '?' : '&') + params);
            /** 不需要额外的参数 */
            var action = utils.formatUrl(imageActionUrl);
            var allowFiles = me.getOpt('imageAllowFiles');
            me.focus();
            me.execCommand('inserthtml', '<img class="loadingclass" id="' + loadingId + '" src="' + me.options.themePath + me.options.theme + '/images/spacer.gif" title="' + (me.getLang('simpleupload.loading') || '') + '" >');

            function showErrorLoader(title) {
                if (loadingId) {
                    var loader = me.document.getElementById(loadingId);
                    loader && domUtils.remove(loader);
                    me.fireEvent('showmessage', {
                        'id': loadingId,
                        'content': title,
                        'type': 'error',
                        'timeout': 4000
                    });
                }
            }
            /* 判断后端配置是否没有加载成功 */
            if (!me.getOpt('imageActionName')) {
                showErrorLoader(me.getLang('autoupload.errorLoadConfig'));
                return;
            }
            // 判断文件格式是否错误
            var filename = input.value,
                fileext = filename ? filename.substr(filename.lastIndexOf('.')) : '';
            if (!fileext || (allowFiles && (allowFiles.join('') + '.').indexOf(fileext.toLowerCase() + '.') == -1)) {
                showErrorLoader(me.getLang('simpleupload.exceedTypeError'));
                return;
            }

            var xhr = new XMLHttpRequest()
            xhr.open('post', action, true)
            if (me.options.headers && Object.prototype.toString.apply(me.options.headers) === "[object Object]") {
                for (var key in me.options.headers) {
                    xhr.setRequestHeader(key, me.options.headers[key])
                }
            }
            /** LyS - 从cookie中获取token */
            function getToken() {
                var cookieArr = window.document.cookie.split(';');
                if (cookieArr && cookieArr.length) {
                    var tokenStr = '';
                    for (var i = 0; i < cookieArr.length; i++) {
                        if (cookieArr[i].indexOf('Admin-Token=') > -1) {
                            tokenStr = cookieArr[i];
                            break
                        }
                    }
                    if (tokenStr) {
                        return tokenStr.split('=')[1].trim()
                    }
                }
                return ''
            }
            /** LyS - 在headers中添加token信息 */
            xhr.setRequestHeader("Authorization", 'Bearer ' + getToken());
            xhr.onload = function() {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    var res = JSON.parse(xhr.responseText);
                    // console.log('xhr.onload =>', res)
                    /** 获取图片链接地址 */
                    var link = me.options.imageUrlPrefix + res.data.url;
                    if (res.code === 200 && res.data && res.data.url) {
                        loader = me.document.getElementById(loadingId);
                        loader.setAttribute('src', link);
                        loader.setAttribute('_src', link);
                        loader.setAttribute('title', res.title || '');
                        loader.setAttribute('alt', res.original || '');
                        loader.removeAttribute('id');
                        domUtils.removeClasses(loader, 'loadingclass');
                        // me.execCommand('inserthtml', '');
                        me.fireEvent("contentchange");
                    } else {
                        showErrorLoader(res.state);
                    }
                } else {
                    showErrorLoader(me.getLang('simpleupload.loadError'));
                }
            };
            xhr.onerror = function() {
                showErrorLoader(me.getLang('simpleupload.loadError'));
            };
            xhr.send(new FormData(form));
            form.reset();
        })
    }

    return {
        bindEvents: {
            'ready': function() {
                //设置loading的样式
                utils.cssRule('loading',
                    '.loadingclass{display:inline-block;cursor:default;background: url(\'' +
                    this.options.themePath +
                    this.options.theme + '/images/loading.gif\') no-repeat center center transparent;border:1px solid #cccccc;margin-right:1px;height: 22px;width: 22px;}\n' +
                    '.loaderrorclass{display:inline-block;cursor:default;background: url(\'' +
                    this.options.themePath +
                    this.options.theme + '/images/loaderror.png\') no-repeat center center transparent;border:1px solid #cccccc;margin-right:1px;height: 22px;width: 22px;' +
                    '}',
                    this.document);
            },
            /* 初始化简单上传按钮 */
            'simpleuploadbtnready': function(type, container) {
                containerBtn = container;
                me.afterConfigReady(initUploadBtn);
            }
        },
        outputRule: function(root) {
            utils.each(root.getNodesByTagName('img'), function(n) {
                if (/\b(loaderrorclass)|(bloaderrorclass)\b/.test(n.getAttr('class'))) {
                    n.parentNode.removeChild(n);
                }
            });
        }
    }

  /*var me = this,
    isLoaded = false,
    containerBtn;

  function initUploadBtn() {
    var w = containerBtn.offsetWidth || 20,
      h = containerBtn.offsetHeight || 20,
      btnIframe = document.createElement("iframe"),
      btnStyle =
        "display:block;width:" +
        w +
        "px;height:" +
        h +
        "px;overflow:hidden;border:0;margin:0;padding:0;position:absolute;top:0;left:0;filter:alpha(opacity=0);-moz-opacity:0;-khtml-opacity: 0;opacity: 0;cursor:pointer;";

    domUtils.on(btnIframe, "load", function() {
      var timestrap = (+new Date()).toString(36),
        wrapper,
        btnIframeDoc,
        btnIframeBody;

      btnIframeDoc =
        btnIframe.contentDocument || btnIframe.contentWindow.document;
      btnIframeBody = btnIframeDoc.body;
      wrapper = btnIframeDoc.createElement("div");

      wrapper.innerHTML =
        '<form id="edui_form_' +
        timestrap +
        '" target="edui_iframe_' +
        timestrap +
        '" method="POST" enctype="multipart/form-data" action="' +
        me.getOpt("serverUrl") +
        '" ' +
        'style="' +
        btnStyle +
        '">' +
        '<input id="edui_input_' +
        timestrap +
        '" type="file" accept="image/!*" name="' +
        me.options.imageFieldName +
        '" ' +
        'style="' +
        btnStyle +
        '">' +
        "</form>" +
        '<iframe id="edui_iframe_' +
        timestrap +
        '" name="edui_iframe_' +
        timestrap +
        '" style="display:none;width:0;height:0;border:0;margin:0;padding:0;position:absolute;"></iframe>';

      wrapper.className = "edui-" + me.options.theme;
      wrapper.id = me.ui.id + "_iframeupload";
      btnIframeBody.style.cssText = btnStyle;
      btnIframeBody.style.width = w + "px";
      btnIframeBody.style.height = h + "px";
      btnIframeBody.appendChild(wrapper);

      if (btnIframeBody.parentNode) {
        btnIframeBody.parentNode.style.width = w + "px";
        btnIframeBody.parentNode.style.height = w + "px";
      }

      var form = btnIframeDoc.getElementById("edui_form_" + timestrap);
      var input = btnIframeDoc.getElementById("edui_input_" + timestrap);
      var iframe = btnIframeDoc.getElementById("edui_iframe_" + timestrap);

      domUtils.on(input, "change", function() {
        if (!input.value) return;
        var loadingId = "loading_" + (+new Date()).toString(36);
        var params =
          utils.serializeParam(me.queryCommandValue("serverparam")) || "";

        var imageActionUrl = me.getActionUrl(me.getOpt("imageActionName"));
        var allowFiles = me.getOpt("imageAllowFiles");
        console.log('domUtils change =>', imageActionUrl);

        me.focus();
        me.execCommand(
          "inserthtml",
          '<img class="loadingclass" id="' +
            loadingId +
            '" src="' +
            me.options.themePath +
            me.options.theme +
            '/images/spacer.gif">'
        );

        function callback() {
          try {
            var link,
              json,
              loader,
              body = (iframe.contentDocument || iframe.contentWindow.document)
                .body,
              result = body.innerText || body.textContent || "";
            json = new Function("return " + result)();
            console.log('json =>', json);
            link = me.options.imageUrlPrefix + json.data.url;
            if (json.code === 200 && json.data && json.data.url) {
              loader = me.document.getElementById(loadingId);
              domUtils.removeClasses(loader, "loadingclass");
              loader.setAttribute("src", link);
              loader.setAttribute("_src", link);
              loader.setAttribute("alt", json.data.name || "");
              loader.removeAttribute("id");
              me.fireEvent("contentchange");
            } else {
              showErrorLoader && showErrorLoader(json.state);
            }
          } catch (er) {
            showErrorLoader &&
              showErrorLoader(me.getLang("simpleupload.loadError"));
          }
          form.reset();
          domUtils.un(iframe, "load", callback);
        }
        function showErrorLoader(title) {
          if (loadingId) {
            var loader = me.document.getElementById(loadingId);
            loader && domUtils.remove(loader);
            me.fireEvent("showmessage", {
              id: loadingId,
              content: title,
              type: "error",
              timeout: 4000
            });
          }
        }

        /!* 判断后端配置是否没有加载成功 *!/
        if (!me.getOpt("imageActionName")) {
          errorHandler(me.getLang("autoupload.errorLoadConfig"));
          return;
        }
        // 判断文件格式是否错误
        var filename = input.value,
          fileext = filename ? filename.substr(filename.lastIndexOf(".")) : "";
        if (
          !fileext ||
          (allowFiles &&
            (allowFiles.join("") + ".").indexOf(fileext.toLowerCase() + ".") ==
              -1)
        ) {
          showErrorLoader(me.getLang("simpleupload.exceedTypeError"));
          return;
        }

        domUtils.on(iframe, "load", callback);
        form.action = utils.formatUrl(
          imageActionUrl
        );
        console.log('form.action =>', form.action);
        form.submit();
      });

      var stateTimer;
      me.addListener("selectionchange", function() {
        clearTimeout(stateTimer);
        stateTimer = setTimeout(function() {
          var state = me.queryCommandState("simpleupload");
          if (state == -1) {
            input.disabled = "disabled";
          } else {
            input.disabled = false;
          }
        }, 400);
      });
      isLoaded = true;
    });

    btnIframe.style.cssText = btnStyle;
    containerBtn.appendChild(btnIframe);
  }

  return {
    bindEvents: {
      ready: function() {
        //设置loading的样式
        utils.cssRule(
          "loading",
          ".loadingclass{display:inline-block;cursor:default;background: url('" +
            this.options.themePath +
            this.options.theme +
            "/images/loading.gif') no-repeat center center transparent;border:1px solid #cccccc;margin-right:1px;height: 22px;width: 22px;}\n" +
            ".loaderrorclass{display:inline-block;cursor:default;background: url('" +
            this.options.themePath +
            this.options.theme +
            "/images/loaderror.png') no-repeat center center transparent;border:1px solid #cccccc;margin-right:1px;height: 22px;width: 22px;" +
            "}",
          this.document
        );
      },
      /!* 初始化简单上传按钮 *!/
      simpleuploadbtnready: function(type, container) {
        containerBtn = container;
        me.afterConfigReady(initUploadBtn);
      }
    },
    outputRule: function(root) {
      utils.each(root.getNodesByTagName("img"), function(n) {
        if (/\b(loaderrorclass)|(bloaderrorclass)\b/.test(n.getAttr("class"))) {
          n.parentNode.removeChild(n);
        }
      });
    },
    commands: {
      simpleupload: {
        queryCommandState: function() {
          return isLoaded ? 0 : -1;
        }
      }
    }
  };*/
});
