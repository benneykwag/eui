Ext.define('Override.Component', {
    override: 'Ext.Component',
    /**
     * @cfg {String/Array} [localeProperties=html] A string or array of strings of properties on the component to be localized.
     */
    localeProperties: 'html',
    /**
     * @private
     * @cfg {RegExp} _localeRe A RegExp that will match an id and default string, both are required in this format:
     *
     *     {{id}{default text}}
     */
    //    _localeRe: /^{{(.+)}{(.+)}}$/,
    _localeRe: /^{(.+)}$/,
    initComponent: function() {
        this.doLocale();
        //        console.log('i18n: ', Ext.getStore('i18n'))
        this.callParent(arguments);
    },
    /**
     * @private
     * Method that will create a setter function that will localize the string and pass it to the original setter.
     */
    _createLocaleSetter: function(property) {
        var configurator = this.getConfigurator(),
            config = configurator.configs[property],
            store = Ext.getStore('i18n'),
            re = this._localeRe,
            setName, oldSetter, newSetter;
        // console.log('store', store)
        if (Ext.isEmpty(store)) {
            /*Ext.Error.raise({
             msg: '다국어 지원을 위한 데이터를 제공받지 못했습니다...'
             });*/
            console.log('다국어 지원을 위한 데이터를 제공받지 못했습니다...', arguments);
            return null;
        }
        if (!config) {
            config = configurator.configs[property] = new Ext.Config(property);
        }
        setName = config.names.set;
        oldSetter = this[setName];
        if (oldSetter.isLocaleSetter) {
            newSetter = oldSetter;
        } else {
            newSetter = this[setName] = function(value) {
                var info, id, defaultString, record;
                if (value && Ext.typeOf(value) == 'string' && (value.indexOf("#") != -1)) {
                    var allVar = value.split("#"),
                        len = allVar.length;
                    for (var i = 1; i < len; i++) {
                        var chkStr;
                        if (allVar[i].split('}').length == 2) {
                            chkStr = allVar[i].split('}')[0] + '}';
                        }
                        info = re.exec(chkStr);
                        if (info) {
                            if (i === 1) {
                                value = allVar[0];
                            }
                            id = info[1];
                            record = id && store.findRecord('MSG_ID', id, 0, false, false, true);
                            value += (record ? record.get('MSG_LABEL') : id) + allVar[i].split('}')[1];
                        } else {
                            value = allVar[i];
                        }
                    }
                }
                return oldSetter.call(this, value);
            };
            newSetter.isLocaleSetter = true;
        }
        return newSetter;
    },
    /**
     * @private
     * Method that will iterate through the {@link #localeProperties} to create a setter hook into a current setter.
     */
    doLocale: function() {
        var me = this,
            properties = Ext.Array.from(me.localeProperties),
            i = 0,
            length = properties.length,
            property, value, setter;
        for (; i < length; i++) {
            property = properties[i];
            value = me[property];
            if (value && Ext.typeOf(value) == 'string' && (value.indexOf("#") != -1)) {
                setter = me._createLocaleSetter(property);
                if (value && !Ext.isEmpty(setter)) {
                    setter.call(me, value);
                }
            }
        }
    }
});

Ext.define('Override.data.Model', {
    override: 'Ext.data.Model',
    /***
     * 모델 validation 처리 후 메시지 호출.
     * @returns {boolean}
     */
    recordValidationCheck: function() {
        if (!this.isValid()) {
            var validation = this.getValidation(),
                modified = validation.modified;
            for (var test in modified) {
                var value = modified[test];
                if (value) {
                    if (!Ext.isBoolean(validation.get(test))) {
                        Ext.Msg.alert('확인', validation.get(test));
                    }
                }
            }
            return false;
        }
        return true;
    }
});

Ext.define('Override.data.ProxyStore', {
    override: 'Ext.data.ProxyStore',
    /***
     * 모델 validat가 false인 경우 메시지를 호출해 알린다.
     */
    recordsValidationCheck: function() {
        var source = this.getDataSource(),
            items = source.items,
            len = items.length,
            i,
            retValue = true;
        for (i = 0; i < len; i++) {
            if (!items[i].recordValidationCheck()) {
                retValue = false;
                break;
            }
        }
        return retValue;
    },
    /***
     * sync전에 레코드를 미리 확인한다.
     * @param option
     * @returns {*}
     */
    checkSync: function(option) {
        if (this.recordsValidationCheck()) {
            this.sync(option);
            // this.needsSync
            if (!this.isSyncing) {
                Ext.Msg.alert('확인', '저장 할 레코드가 없습니다.');
            }
        }
        return this;
    }
});

Ext.define('Override.container.Container', {
    override: 'Ext.container.Container'
});

Ext.define('Override.panel.Panel', {
    override: 'Ext.panel.Panel',
    localeProperties: [
        'title'
    ]
});

Ext.define('Override.window.Window', {
    override: 'Ext.window.Window',
    localeProperties: [
        'title'
    ],
    initComponent: function() {
        this.callParent(arguments);
    }
});

Ext.define("eui.mixin.FormField", {
    extend: 'Ext.Mixin',
    mixinConfig: {},
    /**
     * 폼필드의 allowBlank:false일 경우
     * *를 표시하도록한다.
     */
    setAllowBlank: function() {
        if (this.allowBlank !== undefined && !this.allowBlank) {
            if (!this.fieldLabel) {
                this.fieldLabel = "";
            }
            this.fieldLabel = '<span style="color:red">*</span>' + this.fieldLabel;
        }
    },
    /**
     * 체크박스그룹과 라디오그룹에 바인드변수
     * 사용 편의를 위한 메소드.
     */
    setCheckboxGroupRadioGroupBindVar: function() {
        if (!this.getBind()) {
            return;
        }
        var me = this,
            bind = this.getBind(),
            name = bind.value.stub.name,
            path = bind.value.stub.path,
            recordVar = path.split('.')[0];
        this.name = name;
        this.setViewModel({
            formulas: {
                radioValue: {
                    bind: '{' + path + '}',
                    get: function(value) {
                        var model = this.get(recordVar);
                        if (model.isModel && this.get(recordVar).validate().map[name]) {
                            me.allowBlank = false;
                        }
                        var ret = {};
                        ret[name] = value;
                        return ret;
                    },
                    set: function(value) {
                        this.set(path, value[name]);
                    }
                }
            }
        });
        this.setBind({
            value: '{radioValue}'
        });
    },
    /***
     * numberfield 등 폼필드
     * bind설정에 경우 클래스 내부 기본값을 지워버리는 현상
     * 을 해결하기 위함.
     * @param value
     */
    setCustomDefaultValue: function(field) {
        if (!field.getBind()) {
            return;
        }
        var me = this,
            viewModelVar = field.getBind().value.stub.path;
        if (field.getBind() && field.getBind()['value'] && (field.getBind().value.stub.hadValue == undefined)) {
            me.getViewModel().set(viewModelVar, field.getValue());
        }
    }
});

Ext.define('Override.form.field.Base', {
    override: 'Ext.form.field.Base',
    mixins: [
        'eui.mixin.FormField'
    ],
    initComponent: function() {
        this.setAllowBlank();
        this.callParent(arguments);
        this.on('render', function() {
            if (this.previousSibling() && this.previousSibling().xtype == 'euilabel' && !this.allowBlank) {
                this.previousSibling().addCls('fo-required');
            }
        });
    }
});

Ext.define('Override.grid.column.Column', {
    override: 'Ext.grid.column.Column',
    localeProperties: [
        'text'
    ],
    initComponent: function() {
        this.callParent(arguments);
    }
});

/***
 * App전역 변수 설정.
 */
Ext.define('eui.Config', {
    singleton: true,
    alternateClassName: [
        'Config'
    ],
    localeCode: 'kr',
    localeValueField: 'MSG_ID',
    localeDisplayField: 'MSG_LABEL',
    /***
     * 메시지 제공용 서버사이드 주소.
     *
     * "data": [
     *      {"MSG_ID": "F000000119", "MSG_LABEL": "삭제할 데이터를 선택해 주세요."},
     *      {"MSG_ID": "F000000122", "MSG_LABEL": "신청일자를 입력해 주세요."},
     *      {"MSG_ID": "F000000129", "MSG_LABEL": "시간은 0~23 사이만 입력 가능합니다."},
     *      {"MSG_ID": "F000000130", "MSG_LABEL": "성명을 입력해 주시기 바랍니다."},
     * ]
     */
    localeUrl: null,
    /***
     * eui-core에 필요한 텍스트 레이블 정보.
     */
    initLocaleMessage: function() {
        var me = this,
            store = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'i18n'
            });
        var cfg = {
                pMethod: 'GET',
                url: Config.localeUrl,
                params: {
                    locale: Config.localeCode
                },
                pSync: false,
                pCallback: function(pScope, params, retData) {
                    store.loadData(retData.data);
                    store.add(Config.data.message);
                    me.mergeMessageData();
                }
            };
        if (Config.localeUrl) {
            Util.CommonAjax(cfg);
        } else {
            store.add(Config.data.message);
            me.mergeMessageData();
        }
    },
    /***
     * 사용자가 data.message의 일부를 교체할 경우사용된다.
     * eui-core를 사용하는 app에서 override할 경우.
     * Ext.define('Override.eui.Config', {
     *      override: 'eui.Config',
     *      message: [
     *          {"MSG_ID": "행추가", "MSG_LABEL": "로우추가"}
     *      ]
     * });
     */
    mergeMessageData: function() {
        var store = Ext.getStore('i18n');
        if (!Ext.isArray(Config.message)) {
            return;
        }
        Ext.each(Config.message, function(msg) {
            var record = store.findRecord(Config.localeValueField, msg[Config.localeValueField], 0, false, false, true);
            if (record) {
                // 존재하면 override한 데이터로 label을 교체한다.
                record.set(Config.localeDisplayField, msg[Config.localeDisplayField]);
            } else {
                // 존재하지 않는다면 추가한다.
                store.add(msg);
            }
        });
    },
    data: {
        message: [
            {
                "MSG_ID": "행추가",
                "MSG_LABEL": "행추가"
            },
            {
                "MSG_ID": "행추가아이콘",
                "MSG_LABEL": "x-fa fa-plus-square"
            },
            {
                "MSG_ID": "행삭제",
                "MSG_LABEL": "행삭제"
            },
            {
                "MSG_ID": "행삭제아이콘",
                "MSG_LABEL": "x-fa fa-minus-square"
            },
            {
                "MSG_ID": "등록",
                "MSG_LABEL": "등록"
            },
            {
                "MSG_ID": "등록아이콘",
                "MSG_LABEL": "x-fa fa-table"
            },
            {
                "MSG_ID": "수정",
                "MSG_LABEL": "수정"
            },
            {
                "MSG_ID": "수정아이콘",
                "MSG_LABEL": "x-fa fa-th"
            },
            {
                "MSG_ID": "저장",
                "MSG_LABEL": "저장"
            },
            {
                "MSG_ID": "저장아이콘",
                "MSG_LABEL": "x-fa fa-save"
            }
        ]
    }
});

Ext.define('sprr.DummyClass', {});

Ext.define('eui.DummyClass', {});

Ext.define('eui.Util', {
    singleton: true,
    alternateClassName: [
        'Util'
    ],
    /****
     * i18n 용
     */
    localeStoreValueField: 'MSG_ID',
    localeStoreDisplayField: 'MSG_CONTENTS',
    UrlPrefix: null,
    // "http://211.196.150.66:18080/",
    //    HurlPrefix: "http://103.168.0.58:8080/",
    //	HurlPrefix : "http://127.0.0.1:8080/",
    localeLang: "ko",
    webosShowWindowId: null,
    currentAjaxButtonId: null,
    // 통신을 일으키는 버튼 아이디.
    /***
     * 통신중인 버튼을 disabled한다.
     * @param flag
     */
    ajaxButtonDisabled: function(flag) {
        if (flag) {}
        // disabled해야할 대상을 판단.
        var clickingButton = Ext.getCmp(Util.currentAjaxButtonId);
        if (clickingButton) {
            clickingButton.setDisabled(flag);
        }
        if (!flag) {
            // 통신이 종료된 경우.
            Util.currentAjaxButtonId = null;
        }
    },
    /****
     * override를 통해 전역설정
     */
    global_setOverride: function() {
        Ext.override(Ext.data.Store, {});
        //            pageSize: Util.sessionRecord.get("ROW_PER_PAGE")
        Ext.require('Util', function() {
            Ext.Ajax.on('beforerequest', function(conn, response, eOpts) {
                // #1
                Util.ajaxButtonDisabled(true);
            });
            Ext.Ajax.on('requestexception', function(conn, response, eOpts) {
                // #1
                var result = Ext.JSON.decode(response.responseText, true);
                // #1
                if (Util.webosShowWindowId) {
                    var window = Ext.getCmp(Util.webosShowWindowId);
                    if (window) {
                        var sb = Ext.getCmp(Util.webosShowWindowId).down('statusbar');
                        sb.setStatus({
                            text: result.MSG,
                            clear: false
                        });
                    }
                }
                // auto-clear after a set interval
                if (result && parseInt(result.TYPE) === -1) {
                    if (result.STATUS === 200) {
                        Util.showGlobalMsg(result, 'INFO');
                    } else {
                        Util.showGlobalMsg(result, 'WARNING');
                    }
                }
                if (response.status === 0) {
                    Ext.Msg.show({
                        title: 'WARNING',
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK,
                        message: '서버가 응답하지 않습니다. 관리자에게 문의하세요.'
                    });
                }
                var message = "관리자에게 문의하세요.";
                if (response.status == 404) {
                    message = "페이지가 존재하지 않습니다.";
                    Ext.Msg.show({
                        title: 'WARNING',
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK,
                        message: message
                    });
                }
                Util.ajaxButtonDisabled(false);
            });
            Ext.Ajax.on('requestcomplete', function(conn, response, eOpts) {
                // #1
                var result = Ext.JSON.decode(response.responseText, true);
                // #1
                if (Util.webosShowWindowId) {
                    var window = Ext.getCmp(Util.webosShowWindowId);
                    if (window) {
                        var sb = Ext.getCmp(Util.webosShowWindowId).down('statusbar');
                        sb.setStatus({
                            text: result.MSG,
                            iconCls: 'ok-icon',
                            clear: true
                        });
                    }
                }
                // auto-clear after a set interval
                //                Ext.require('eui.window.Notification', function () {
                //                    Ext.create('widget.uxNotification', {
                //                        title: '처리결과',
                //                        position: 'br',
                //                        cls: 'ux-notification-light',
                //                        closable: false,
                //                        iconCls: 'ux-notification-icon-information',
                //                        autoCloseDelay: 3000,
                //                        spacing: 20,
                //                        html: result.DESC || result.MSG
                //                    }).show();
                //                });
                if (result && parseInt(result.TYPE) === 0) {
                    Util.showGlobalMsg(result, 'INFO');
                }
                Util.ajaxButtonDisabled(false);
            });
        });
    },
    /***
     * 세션이 존재하면 이후 app에서 사용할 변수 등을 처리한다.
     * @param rec
     */
    global_InitialProcess: function(retData) {
        var session = retData.data.session,
            // session정보
            message = retData.data.message,
            // 로케일정보
            dept = retData.data.dept,
            // 부서정보
            cmpsetting = retData.data.cmpsetting;
        // 법인정보
        //        globalVar.SYSSETTING = retData.data.syssetting;
        //        globalVar.VARSETTING = retData.data.varsetting;
        var sessionRecord = Ext.create('Ext.data.Model', session);
        var deptRecord = Ext.create('Ext.data.Model', dept);
        // Util.getGlobalModel에서 사용.
        //        app.sessionRecord = sessionRecord;
        //        app.deptRecord = deptRecord;
        // 추후 삭제 예정..
        // Session
        //        globalVar.sessionRecord = sessionRecord;
        // dept
        //        globalVar.deptRecord = deptRecord;
        // cmpSetting
        var cmpsettingStore = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'cmpsettingStore'
            });
        cmpsettingStore.loadData(cmpsetting);
        Util.global_setOverride();
        Util.global_setLocale(message);
    },
    //        Util.globalLoadLocaleScript('en');
    // 공통 콤보등 대량 코드 preload
    //        Util.globalCodeData();
    //        Util.global_setOzRept();
    global_setLocale: function(message) {
        var store = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'i18n'
            });
        store.loadData(message);
    },
    /***
     * 로그인 체크여부
     */
    globalCheckLogin: function() {
        Ext.require('Util', function() {
            // sessiong check
            var cfg = {
                    url: "api/G1E000000SVC/getInit",
                    params: {},
                    pSync: false,
                    pCallback: function(pScope, params, retData) {
                        if (retData.TYPE === 1) {
                            Util.global_InitialProcess(retData);
                        } else {
                            Util.globalLoginForm();
                        }
                    }
                };
            Util.CommonAjax(cfg);
        });
    },
    globalLoginForm: function() {
        Ext.create('com.view.layout.login.HLogin');
    },
    globalLoadLocaleScript: function(languageCode) {
        var scriptSrc;
        if (location.pathname.indexOf('webos') != -1) {
            scriptSrc = Ext.util.Format.format('resources/js/ext-locale/ext-locale-{0}.js', languageCode);
        } else {
            scriptSrc = Ext.util.Format.format('../webos/resources/js/ext-locale/ext-locale-{0}.js', languageCode);
        }
        Ext.Loader.loadScript({
            url: scriptSrc
        });
    },
    /***
     * 최상위 부모를 찾는다.
     * @param component
     * @returns {*}
     */
    getOwnerCt: function(component) {
        if (!component.rendered) {
            Ext.Error.raise({
                msg: '전달된 컴포넌트는 렌더링이 완료되지 않았습니다.렌더 이후에 호출하세요.'
            });
            return null;
        }
        if (component.up('window')) {
            return component.up('window');
        }
        var baseComponent = component.up('container') || component.up('panel');
        if (Ext.isEmpty(baseComponent)) {
            Ext.Error.raise({
                msg: 'HBasePanel 또는 HBaseContainer를 찾을 수 없습니다.'
            });
        }
        return baseComponent;
    },
    createStore: function(component, options) {
        var store = Ext.create('Ext.data.Store', {
                autoDestroy: true,
                autoLoad: this.autoMaticLoad,
                storeId: this.generateUUID(),
                fields: options.fields,
                proxy: {
                    type: 'rest',
                    //                type: 'ajax',
                    noCache: false,
                    // to remove param "_dc"
                    pageParam: false,
                    // to remove param "page"
                    startParam: false,
                    // to remove param "start"
                    limitParam: false,
                    // to remove param "limit"
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    paramsAsJson: true,
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    url: options.url,
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        transform: options.transform || false
                    },
                    extraParams: options.params
                }
            });
        if (Ext.isDefined(component.bindStore)) {
            component.bindStore(store);
        } else {
            component._store = store;
        }
        return store;
    },
    commonPopup: function(ownerCt, title, className, width, height, params, windowOption, addParentMvvm) {
        var detailForm = function(ownerCt, title, className, params) {
                var component = null;
                if (className) {
                    try {
                        component = Ext.create(className, {
                            __PARAMS: params,
                            __PARENT: ownerCt
                        });
                    } catch (e) {
                        console.log(e.message);
                    }
                }
                return component;
            };
        var openForm = detailForm(ownerCt, title, className, params);
        var config = {
                title: title,
                header: true,
                padding: 0,
                closable: true,
                constrainHeader: true,
                maximizable: true,
                layout: 'fit',
                height: height,
                width: width,
                //            modal: true,
                options: params,
                listeners: {}
            };
        config.items = null;
        if (!Ext.isEmpty(windowOption)) {
            for (var test in windowOption) {
                var value = windowOption[test];
                config[test] = value;
            }
        }
        //            config = Ext.apply(config, windowOption);
        //            config = Ext.apply(config, ownerCt.getViewModel());
        config.items = [
            openForm
        ];
        //        var baseComponent = ownerCt.up('FMS010106V') || ownerCt.up('FMS010106V');
        //        console.log('baseC', baseComponent)
        if (ownerCt && addParentMvvm) {
            var commandtoolbar = ownerCt.down('commandtoolbar'),
                pagingtoolbar = ownerCt.down('pagingtoolbar'),
                window = Ext.create('Ext.window.Window', config);
            /*if(commandtoolbar){
                commandtoolbar.setDisabled(true);
            }
            if(pagingtoolbar){
                pagingtoolbar.setDisabled(true);
            }
            window.addListener('close', function () {
                if(commandtoolbar){
                    commandtoolbar.setDisabled(false);
                }
                if(pagingtoolbar){
                    pagingtoolbar.setDisabled(false);
                }
            });*/
            return ownerCt.add(window);
        }
        return Ext.create('Ext.window.Window', config);
    },
    generateUUID: function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 7 | 8)).toString(16);
            });
        return uuid;
    },
    commonTreeItem: function() {
        var retvalue = [];
        // #7
        Ext.Ajax.request({
            async: false,
            // #8
            url: 'resources/data/treesmpl.json',
            failure: function(conn, response, options, eOpts) {
                Ext.Msg.show({
                    title: 'Error!',
                    msg: conn.responseText,
                    icon: Ext.Msg.ERROR,
                    buttons: Ext.Msg.OK
                });
            },
            success: function(conn, response, options, eOpts) {
                var me = this;
                var result = Ext.JSON.decode(conn.responseText, true);
                // #10
                retvalue = result;
            }
        });
        return retvalue;
    },
    /**
     * gfn_BaseTransaction : 공통 Transaction 함수. 업무 화면에서 직접 호출 금지. 공통 함수에서만 호출하도록 한다
     * @param pSvcID            서비스 ID
     * @param pURL                URL
     * @param pInDs                input Dataset
     * @param pOutDs            Output Dataset
     * @param pArg                파라메터
     * @param [pCallBack]        콜백함수(SVCID, PARAMS, DATA, ERRORCODE,MESSAGETYPE,MESSAGECODE,MESSAGETEXT)
     * @param [pSync]            Sync 여부
     * @param [pScope]            함수실행범위
     * @param [timeoutSeq]      타임아웃 시간설정
     **/
    CommonAjax: function(cfg) {
        var pSvcID = cfg.svcId || 'CMAJAX',
            pURL = cfg.url,
            pInDs = cfg.inDs,
            pOutDs = cfg.outDs,
            pArg = cfg.params,
            pCallBack = cfg.pCallback,
            pSync = cfg.pSync,
            pScope = cfg.pScope,
            pMethod = cfg.method,
            timeoutSeq = cfg.timeoutSeq,
            __scopeGrid = null;
        if (pArg) {
            __scopeGrid = pArg.__scopeGrid;
            delete pArg['__scopeGrid'];
        }
        var buildParam = function(option, pArg, pOutDs) {
                if (!Ext.isEmpty(pArg)) {
                    if (Ext.isString(pArg)) {
                        try {
                            option.params = Ext.applyIf(option.params, Ext.Object.fromQueryString(pArg));
                        } catch (e) {
                            console.log(e.message);
                        }
                        return option;
                    } else {
                        if (Ext.isObject(pArg)) {
                            option.params = Ext.applyIf(option.params, pArg);
                        }
                        return option;
                    }
                }
                return option;
            };
        var setOptions = function(option, pArg, pInDs, pOutDs, pScope) {
                option.params = {};
                option.jsonData = {};
                if (!Ext.isEmpty(pInDs)) {
                    option.jsonData = Ext.applyIf(option.jsonData, pInDs);
                }
                if (!Ext.isEmpty(pArg)) {
                    option = buildParam(option, pArg, pOutDs);
                }
                if (!Ext.isEmpty(option.params)) {
                    option.jsonData = Ext.applyIf(option.jsonData, option.params);
                }
                delete option.params;
                return option;
            };
        if (!!timeoutSeq) {
            timeoutSeq = timeoutSeq * 1000;
        } else {
            timeoutSeq = 30000;
        }
        var rtnData = "";
        var options = {
                async: pSync,
                method: (pMethod ? pMethod : 'GET'),
                timeout: timeoutSeq,
                disableCaching: false,
                url: pURL,
                success: function(response, opts) {
                    var returnData = Ext.decode(response.responseText);
                    if (!pSync) {
                        rtnData = returnData;
                    }
                    if (pOutDs) {
                        var keys = Object.keys(pOutDs);
                        for (var i = 0; i < keys.length; i++) {
                            pOutDs[keys[i]].loadData(returnData[keys[i]]);
                            pOutDs[keys[i]].commitChanges();
                        }
                    }
                    if (Ext.isFunction(pCallBack)) {
                        if (__scopeGrid) {
                            // 그리드 공통 기능
                            Ext.callback(pCallBack, pScope || this, [
                                __scopeGrid,
                                pArg,
                                returnData
                            ]);
                        } else {
                            Ext.callback(pCallBack, pScope || this, [
                                pScope || this,
                                pArg,
                                returnData,
                                pSvcID
                            ]);
                        }
                    }
                },
                failure: function(response, opts) {}
            };
        //                var message = "관리자에게 문의하세요.";
        //                if(response.status  == 404){
        //                    message = "페이지가 존재하지 않습니다."
        //                }
        //                Ext.Msg.show({
        //                    title: 'WARNING',
        //                    icon: Ext.Msg.ERROR,
        //                    buttons: Ext.Msg.OK,
        //                    message: message
        //                });
        options = setOptions(options, pArg, pInDs, pOutDs, pScope);
        Ext.Ajax.request(options);
        if (!pSync) {
            return rtnData;
        }
    },
    showGlobalMsg: function(result, iconType) {
        Ext.require('Ext.window.MessageBox', function() {
            if (result.DESC) {
                Ext.Msg.show({
                    icon: Ext.Msg[iconType],
                    title: iconType,
                    width: 400,
                    resizable: true,
                    height: 400,
                    defaultTextHeight: 300,
                    value: result.DESC,
                    textAreaReadOnly: true,
                    message: result.MSG,
                    buttons: Ext.Msg.OK,
                    multiline: true
                });
            } else {
                Ext.Msg.show({
                    title: iconType,
                    icon: Ext.Msg[iconType],
                    buttons: Ext.Msg.OK,
                    message: result.MSG
                });
            }
        });
    },
    getDatasetParam: function(store) {
        var me = store;
        var returnDataset = {
                deletedData: [],
                data: []
            };
        function writeValue(data, field, record) {
            var value = record.get(field.name);
            //            if(field.type === Ext.data.Types.DATE && field.dateFormat && Ext.isDate(value)) {
            if (field.type === 'date' && field.dateFormat && Ext.isDate(value)) {
                data[field.name] = Ext.Date.format(value, field.dateFormat);
            } else if (field.type === 'boolean') {
                // Ext.data.Types.BOOL){
                data[field.name] = value ? '1' : '0';
            } else {
                data[field.name] = value;
            }
        }
        function getRecordData(record) {
            /*var data = {},
             fields = record.fields,
             fieldItems = fields.items,
             field,
             len = fieldItems.length;
             for (var i = 0; i < len; i++) {
             field = fieldItems[i];
             writeValue(data, field, record);
             }*/
            return record.getData();
        }
        var records = me.getNewRecords();
        var len = records.length;
        for (var i = 0; i < len; i++) {
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {
                '__rowStatus': 'I'
            });
            returnDataset.data.push(rtv);
        }
        records = me.getUpdatedRecords() , len = records.length;
        for (var i = 0; i < len; i++) {
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {
                '__rowStatus': 'U'
            });
            returnDataset.data.push(rtv);
        }
        records = me.getRemovedRecords() , len = records.length;
        for (var i = 0; i < len; i++) {
            returnDataset.deletedData.push(getRecordData(records[i]));
        }
        return returnDataset;
    },
    /**
     * 변경된 레코드셋을 JSON 타입으로 반환.
     *
     * Example usage:
     *
     *     // 데이터 저장
     *     var store = grid.getStore();
     *
     *     var options = {
     *         inDs: store.getDatasetParam(),
     *         ....
     *     };
     *     Utils.trsnsaction(options);
     *
     * @return {Object}
     * @return {Array} return.deleteData 삭제된 Record 정보.
     * @return {Array} return.data 추가/변경된 Record 정보.
     */
    getAllDatasetParam: function() {
        var me = this;
        var returnDataset = {
                deletedData: [],
                data: []
            };
        function writeValue(data, field, record) {
            var value = record.get(field.name);
            if (field.type === Ext.data.Types.DATE && field.dateFormat && Ext.isDate(value)) {
                data[field.name] = Ext.Date.format(value, field.dateFormat);
            } else if (field.type === Ext.data.Types.BOOL) {
                data[field.name] = value ? '1' : '0';
            } else {
                data[field.name] = value;
            }
        }
        function getRecordData(record) {
            var data = {},
                fields = record.fields,
                fieldItems = fields.items,
                field,
                len = fieldItems.length;
            for (var i = 0; i < len; i++) {
                field = fieldItems[i];
                writeValue(data, field, record);
            }
            return data;
        }
        // All record
        var records = me.getRange();
        var len = records.length;
        for (var i = 0; i < len; i++) {
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {
                '__rowStatus': ''
            });
            returnDataset.data.push(rtv);
        }
        return returnDataset;
    },
    /**
     * 레코드셋 변경여부를 반환하는 함수.
     * @returns {Boolean}
     * @returns {Boolean} return.true 레코드셋 변경됨.
     * @returns {Boolean} return.false 레코드셋 변경없음.
     */
    getIsDirty: function() {
        return (this.getNewRecords().length > 0 || this.getUpdatedRecords().length > 0 || this.getRemovedRecords().length > 0);
    },
    getLocaleValue: function(MSG_ID) {
        var store = Ext.getStore('i18n');
        var record = id && store.findRecord('MSG_ID', MSG_ID, 0, false, false, true);
        if (record) {
            return record.get('MSG_LABEL');
        }
        return '';
    },
    //=================== add start ========================================//
    config: {
        contextPath: 'eui',
        baseUrl: 'controller/router'
    },
    constructor: function(cfg) {
        this.initConfig(cfg);
        this.init();
    },
    init: function() {
        Ext.EventManager.on(Ext.isIE ? document : window, 'keydown', function(e, t) {
            if (e.getKey() == e.BACKSPACE && ((!/^input$/i.test(t.tagName) && !/^textarea$/i.test(t.tagName)) || t.disabled || t.readOnly)) {
                e.stopEvent();
            }
        });
        Ext.getDoc().on("contextmenu", function(ev) {
            ev.preventDefault();
        });
    },
    //    	Ext.direct.Manager.addProvider({
    //    		id: 'euiprovider',
    //    	    url: Ext.util.Format.format('/{0}/{1}/', this.getContextPath(), this.getBaseUrl()),
    //    	    type: 'remoting',
    //    	    enableBuffer:true,
    //    	    maxRetries: 0,
    //    	    actions: {}
    //    	});
    sessionValidation: function() {
        //TODO
        var option = {
                url: Ext.util.Format.format('/{0}/{1}/', this.getContextPath(), this.getBaseUrl()),
                async: true,
                method: 'POST',
                success: function(response, options) {
                    if (!Ext.isEmpty(response.responseText)) {
                        var returnData = Ext.decode(response.responseText),
                            result = returnData[0].result;
                        this.sessionValidationCallback(result);
                    }
                },
                failure: function(response, options) {
                    if (!Ext.isEmpty(response.responseText)) {
                        var returnData = Ext.decode(response.responseText),
                            result = returnData[0].result;
                        this.sessionValidationCallback(result);
                    }
                },
                jsonData: {
                    action: '',
                    method: '',
                    tid: Ext.id(),
                    type: 'rpc',
                    data: {}
                },
                scope: this,
                timeout: 30000,
                disableCaching: false
            };
        Ext.Ajax.request(option);
    },
    sessionValidationCallback: function(response) {},
    //TODO 
    /**
     * fgn(fully qualified name of the function. for example: my.app.service.MenuService.getMenu )
     * dn(dataset name. for example: ds_menulist)
     */
    createDirectStore: function(fqn, dn, fields) {
        return {
            xclass: 'eui.data.DirectStore',
            storeId: Ext.util.Format.format('{0}-{1}', dn, Ext.id()),
            fields: fields,
            proxy: {
                type: 'direct',
                directFn: fqn,
                reader: {
                    type: 'json',
                    rootProperty: dn,
                    totalProperty: 'totalCount'
                }
            }
        };
    }
});
//=================== add end ========================================//

Ext.define('eui.button.Button', {
    extend: 'Ext.button.Button',
    xtype: 'euibutton',
    //    text: 'SpButton',
    //    ui: 'basicbtn',
    config: {
        showText: true
    },
    localeProperties: [
        'text',
        'iconCls'
    ],
    margin: '0 5 2 0',
    initComponent: function() {
        var me = this;
        if (!me.getShowText()) {
            delete me.text;
        }
        me.callParent(arguments);
    }
});

/***
 * 이 컨테이너는 프로그램(각 모듈)의 최상단에 위치해 프로그램을
 * 배치하는 용도로 사용된다.
 * 모든 프로그램 모듈은 이 컨테이너를 확장해 작성한다.
 * 모든 팝업은 호출즉시 특이사항이 없는 경우 이 컨테이너의 자식으로 추가된다.
 */
Ext.define('eui.container.BaseContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.spbasecontainer',
    mixins: [],
    //        'com.ux.mixin.BaseContainer'
    scrollable: 'y',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    style: {
        'background-color': 'white'
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

/***
 * PopUp을 위한 Container
 */
Ext.define('eui.container.PopupContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.sppopupcontainer',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },
    /***
     * HPopupTrigger에 값을 전달한다.
     */
    parentCallBack: function(record, valueField, displayField) {
        var trigger = this.__PARENT;
        if (!Ext.isEmpty(trigger) && !Ext.isEmpty(trigger.callBack)) {
            Ext.callback(trigger.callBack, trigger, [
                trigger,
                record,
                valueField || trigger.valueField,
                displayField || trigger.displayField
            ]);
        } else if (Ext.isFunction(this.__PARENT.popupCallback)) {
            //화면에서 호출시 리턴 함수 호출 ( popupCallback )
            this.__PARENT.popupCallback([
                record,
                valueField,
                displayField
            ]);
        }
        Util.getOwnerCt(this).close();
    }
});

Ext.define('eui.controller.InitController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.spinit',
    constructor: function(cfg) {
        cfg = cfg || {};
        if (this.globalUrlPrefix) {
            Util.HurlPrefix = this.globalUrlPrefix;
        }
        Util.localeStoreDisplayField = this.localeStoreDisplayField;
        Util.localeStoreValueField = this.localeStoreValueField;
        //        var fileref=document.createElement("link");
        //        fileref.setAttribute("rel", "stylesheet");
        //        fileref.setAttribute("type", "text/css");
        //        fileref.setAttribute("href", 'resources/css/sprr-theme.css');
        //        document.getElementsByTagName("head")[0].appendChild(fileref);
        var store = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'i18n'
            });
        Ext.apply(cfg, {
            url: Util.HurlPrefix + this.localeStoreUrl,
            pSync: false,
            outDs: {
                data: Ext.getStore('i18n')
            }
        });
        if (this.localeStoreUrl) {
            Util.CommonAjax(cfg);
        }
        Util.globalCheckLogin();
        this.callParent(this.processInitialController(cfg));
    },
    processInitialController: function(config) {
        return config;
    },
    init: function(application) {
        console.log('init', this.localeUrl);
    }
});

Ext.define('eui.data.DirectStore', {
    extend: 'Ext.data.DirectStore',
    constructor: function(config) {
        var me = this;
        me.callParent([
            config
        ]);
        if (me.proxy) {
            var provider = Ext.direct.Manager.getProvider('euiprovider');
            if (me.proxy.api) {
                for (p in me.proxy.api) {
                    var action = me.proxy.api[p].substring(0, me.proxy.api[p].lastIndexOf('.'));
                    var method = me.proxy.api[p].substring(me.proxy.api[p].lastIndexOf('.') + 1, me.proxy.api[p].length);
                    if (!provider.actions[action]) {
                        provider.actions[action] = [
                            {
                                name: method,
                                len: 1
                            }
                        ];
                    } else {
                        provider.actions[action].push({
                            name: method,
                            len: 1
                        });
                    }
                }
                provider.initAPI();
            }
            if (me.proxy.directFn) {
                var action = me.proxy.directFn.substring(0, me.proxy.directFn.lastIndexOf('.'));
                var method = me.proxy.directFn.substring(me.proxy.directFn.lastIndexOf('.') + 1, me.proxy.directFn.length);
                if (!provider.actions[action]) {
                    provider.actions[action] = [
                        {
                            name: method,
                            len: 1
                        }
                    ];
                } else {
                    provider.actions[action].push({
                        name: method,
                        len: 1
                    });
                }
                provider.initAPI();
            }
        }
    },
    getPostData: function(isAll, trueText, falseText) {
        var me = this,
            returnDataset = {
                deletedData: [],
                data: []
            },
            isAll = isAll || false,
            records, len;
        function writeValue(data, field, record) {
            if (field.name === 'id')  {
                return;
            }
            
            var value = record.get(field.name);
            if (field.type === Ext.data.Types.DATE && field.dateFormat && Ext.isDate(value)) {
                data[field.name] = Ext.Date.format(value, field.dateFormat);
            } else if (field.type === Ext.data.Types.BOOL.type) {
                data[field.name] = value ? trueText || '1' : falseText || '0';
            } else {
                data[field.name] = value;
            }
        }
        function getRecordData(record) {
            var data = {},
                fields = record.fields,
                fieldItems = fields.items,
                field,
                len = fieldItems.length;
            for (var i = 0; i < len; i++) {
                field = fieldItems[i];
                writeValue(data, field, record);
            }
            return data;
        }
        if (isAll) {
            records = me.getRange();
            len = records.length;
            for (var i = 0; i < len; i++) {
                var rtv = getRecordData(records[i]);
                rtv = Ext.apply(rtv, {
                    '__rowStatus': ''
                });
                returnDataset.data.push(rtv);
            }
        } else {
            records = me.getNewRecords();
            len = records.length;
            for (var i = 0; i < len; i++) {
                var rtv = getRecordData(records[i]);
                rtv = Ext.apply(rtv, {
                    '__rowStatus': 'I'
                });
                returnDataset.data.push(rtv);
            }
            records = me.getUpdatedRecords() , len = records.length;
            for (var i = 0; i < len; i++) {
                var rtv = getRecordData(records[i]);
                rtv = Ext.apply(rtv, {
                    '__rowStatus': 'U'
                });
                returnDataset.data.push(rtv);
            }
            records = me.getRemovedRecords() , len = records.length;
            for (var i = 0; i < len; i++) {
                returnDataset.deletedData.push(getRecordData(records[i]));
            }
        }
        return returnDataset;
    },
    getIsDirty: function() {
        return (this.getNewRecords().length > 0 || this.getUpdatedRecords().length > 0 || this.getRemovedRecords().length > 0);
    }
});

Ext.define('eui.store.LocaleStore', {
    extend: 'Ext.data.Store'
});
/*,

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        console.log('before', arguments);
        var cfg = {
            url: Util.HurlPrefix + 'api/ADM020106SVC/getWebOSInitLvl',
            pSync: false,
            pScope: me,
            pCallback: function(a,b,c){
                console.log('callback', arguments);
                me.superclass.constructor([Ext.apply({
                    storeId: 'i18n',
                    autoLoad: true,
                    fields: [
                        {
                            name: 'name'
                        }
                    ],
                    proxy: {
                        type: 'rest',
                        url: 'http://211.196.150.66:18080/api/ADM020106SVC/getWebOSInitLvl22',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    }
                }, cfg)]);
            }
        };
        console.log('before1', arguments);
        Util.CommonAjax(cfg);
        console.log('before2', arguments);


    }*/

Ext.define('eui.form.CheckboxGroup', {
    extend: 'Ext.form.CheckboxGroup',
    xtype: 'euicheckboxgroup',
    mixins: [
        'eui.mixin.FormField'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',
    initComponent: function() {
        this.setCheckboxGroupRadioGroupBindVar();
        this.setAllowBlank();
        this.callParent(arguments);
    }
});

Ext.define('eui.form.FieldContainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.spfieldcontainer',
    cellCls: 'fo-table-row-td',
    width: '100%',
    layout: 'column',
    defaults: {
        width: '50%'
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

Ext.define('eui.form.Label', {
    extend: 'Ext.form.Label',
    alias: 'widget.euilabel',
    cellCls: 'fo-table-row-th',
    allowBlank: true,
    localeProperties: [
        'html',
        'text'
    ],
    initComponent: function() {
        var me = this;
        if (me.allowBlank === false) {
            Ext.apply(me, {
                cls: 'fo-required'
            });
        }
        me.callParent(arguments);
    }
});

/***
 * formpanel, panel, gridpanel 등의 공통 사항.
 */
Ext.define("eui.mixin.Panel", {
    extend: 'Ext.Mixin',
    mixinConfig: {},
    config: {
        // 하단 명령 툴바 제어.
        hiddenBtmTbar: false,
        defaultToolbarPosition: 'top',
        defaultToolbarUi: 'default'
    },
    // grid, form
    //    margin: '10 10 10 10',
    /***
     * 명령 라인 버튼 설정
     * hbuttons으로 추가될 경우 기존 버튼과 합쳐보여준다.
     * @param defaultButtons
     * @param otherButtons
     */
    applyButtonToolBar: function(defaultButtons, otherButtons) {
        var me = this;
        if (me.bbar || me.hiddenBtmTbar) {
            return;
        }
        if (otherButtons) {
            Ext.each(otherButtons, function(btn) {
                if (btn.insertBefore) {
                    defaultButtons.unshift(btn);
                } else {
                    defaultButtons.push(btn);
                }
            });
        }
        defaultButtons.unshift('->');
        var visibleCnt = 0;
        Ext.each(defaultButtons, function(btn, idx) {
            if (idx > 0 && (btn.hidden == false || btn.hidden === undefined)) {
                visibleCnt++;
            }
        });
        if (visibleCnt > 0) {
            if (Ext.isEmpty(me.dockedItems)) {
                me.dockedItems = [];
            }
            console.log('me.getDefaultUi():', me.getDefaultToolbarUi());
            me.dockedItems.push({
                xtype: 'toolbar',
                ui: me.getDefaultToolbarUi(),
                dock: me.getDefaultToolbarPosition(),
                items: defaultButtons
            });
        }
        return defaultButtons;
    }
});

Ext.define('eui.form.Panel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.euiform',
    localeProperties: [
        'title'
    ],
    requires: [
        'eui.button.Button',
        'Ext.layout.container.Column',
        'eui.button.Button',
        //        'com.ux.form.field.HTriggerCombo',
        //        'com.ux.form.HFieldContainer',
        //        'com.ux.form.field.HCheckbox',
        //        'com.ux.form.field.HComboBox',
        //        'com.ux.form.field.HText',
        //        'com.ux.form.field.HTextArea',
        //        'com.ux.form.field.HTrigger',
        //        'com.ux.form.field.HNumber',
        //        'com.ux.button.HButton',
        //        'com.ux.form.field.HPopupTriggerSet',
        'Ext.layout.container.Table'
    ],
    mixins: [
        'eui.mixin.Panel'
    ],
    cls: 'eui-form-table',
    collapsed: false,
    collapsible: false,
    modelValidation: true,
    config: {
        //        defaultToolbarUi: 'footer',
        // 하단 명령 툴바 제어.
        hiddenBtmTbar: false,
        hiddenCloseBtn: true,
        hiddenHeader: false,
        hiddenSearchBtn: true,
        hiddenPrintBtn: true,
        hiddenDeleteBtn: true,
        hiddenSaveBtn: true,
        hiddenClearBtn: true,
        // table layout을 사용치 않는다면 false로 설정할 것.
        useTableLayout: true,
        tableColumns: 4,
        hbuttons: null
    },
    initComponent: function() {
        var me = this;
        //        me.setHeader();
        //        me.setBottomToolbar();
        me.setTableLayout();
        me.callParent(arguments);
        me.on('afterrender', function() {
            me.isValid();
        }, me, {
            delay: 500
        });
    },
    setBottomToolbar: function() {
        var me = this;
        var buttons = [
                {
                    xtype: 'euibutton',
                    formBind: true,
                    disabled: true,
                    code: 'search',
                    iconCls: 'x-fa fa-search-plus',
                    text: '검색',
                    hidden: me.getHiddenSearchBtn(),
                    listeners: {
                        click: {
                            fn: function(button, e, eOpts) {
                                me.fireEvent('baseformsearch', me);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    formBind: true,
                    code: 'save',
                    iconCls: 'x-fa fa-save',
                    text: '저장',
                    hidden: me.getHiddenSaveBtn(),
                    listeners: {
                        click: {
                            fn: function(button, e, eOpts) {
                                me.fireEvent('baseformsave', me);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    formBind: true,
                    disabled: true,
                    code: 'delete',
                    iconCls: 'x-fa fa-eraser',
                    text: '삭제',
                    hidden: me.getHiddenDeleteBtn(),
                    listeners: {
                        click: {
                            fn: function(button, e, eOpts) {
                                me.fireEvent('baseformdelete', me);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    code: 'delete',
                    text: '닫기',
                    iconCls: 'x-fa fa-sign-out',
                    hidden: me.getHiddenCloseBtn(),
                    handler: function() {
                        var window = Util.getOwnerCt(this);
                        if (Util.getOwnerCt(this).xtype === 'window') {
                            window.close();
                        } else {
                            Ext.Error.raise({
                                msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                            });
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    code: 'delete',
                    text: '출력',
                    iconCls: 'x-fa fa-print',
                    hidden: me.getHiddenPrintBtn(),
                    handler: function() {
                        var window = Util.getOwnerCt(this);
                        if (Util.getOwnerCt(this).xtype === 'window') {
                            window.close();
                        } else {
                            Ext.Error.raise({
                                msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                            });
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    code: 'clear',
                    text: '취소',
                    iconCls: 'x-fa fa-retweet',
                    hidden: me.getHiddenClearBtn(),
                    handler: function() {
                        var window = Util.getOwnerCt(this);
                        if (Util.getOwnerCt(this).xtype === 'window') {
                            window.close();
                        } else {
                            Ext.Error.raise({
                                msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                            });
                        }
                    }
                }
            ];
        this.applyButtonToolBar(buttons, me.otherButtons);
    },
    setTableLayout: function() {
        var me = this;
        if (me.getUseTableLayout()) {
            Ext.apply(me, {
                layout: {
                    type: 'table',
                    columns: me.getTableColumns(),
                    tableAttrs: {
                        style: {
                            width: '100%'
                        }
                    }
                }
            });
        }
    },
    setHeader: function() {
        var me = this;
        var header = {
                titlePosition: 0,
                hidden: me.getHiddenHeader(),
                items: [
                    {
                        xtype: 'euibutton',
                        iconCls: 'x-fa fa-print'
                    },
                    //                    text: '프린트',
                    //                    hidden: me.getHiddenHeaderPrintBtn()
                    {
                        xtype: 'euibutton',
                        iconCls: 'x-fa fa-sign-out',
                        //                    hidden: me.getHiddenHeaderClearBtn(),
                        listeners: {
                            click: {
                                fn: function(button, e, eOpts) {
                                    var values = me.getForm().getValues();
                                    Ext.iterate(values, function(key, value) {
                                        values[key] = null;
                                    });
                                    //valueObject의 의 데이터를 null로 입력
                                    me.getForm().setValues(values);
                                    me.fireEvent('baseformreset', me);
                                }
                            }
                        }
                    }
                ]
            };
        Ext.apply(me, {
            header: header
        });
    }
});

Ext.define('eui.form.RadioGroup', {
    extend: 'Ext.form.RadioGroup',
    xtype: 'euiradiogroup',
    mixins: [
        'eui.mixin.FormField'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',
    initComponent: function() {
        this.setCheckboxGroupRadioGroupBindVar();
        this.setAllowBlank();
        this.callParent(arguments);
    }
});

/*
* checkbox의 값은 기본으로 'Y', 'N'으로 한다.
* getData()에서 return시 true, false를 return하는 것이 아니라, Y, N을 return한다.
* */
Ext.define('eui.form.field.Checkbox', {
    extend: 'Ext.form.field.Checkbox',
    alias: 'widget.spcheckbox',
    inputValue: 'Y',
    uncheckedValue: 'N',
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },
    getValue: function() {
        return this.getSubmitValue();
    }
});

Ext.define('eui.form.field.ComboBoxController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.spcombo',
    onSelect: function(combo, record) {
        var me = this;
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            var grid = combo.column.up('tablepanel');
            var selModel = grid.getSelectionModel();
            var rec = selModel.getLastSelected();
            rec.set(combo.valueColumnDataIndex, record.get(combo.originalValueField));
        }
        me.nextBindFields(record);
    },
    /***
     * lastQuery를 지우면 콤보를 매번재로드한다.
     * 이전 조건이 변경될 경우면 재로드하도록 해야한다.
     */
    beforeCheckParamValue: function(qe) {
        var me = this,
            combo = this.getView(),
            extraParams = combo.store.getProxy().extraParams,
            currentParams = this.getComboData();
        /***
         * useLocalFilter : true일 경우는 queryMode가 local이다.
         * 최초 로드를 위해 인위적으로 store를 로드한다.
         * 최초 값이 설정되었을 경우 이미 로드했으므로 로드하지 않는다.(checkAutoLoad => false)
         */
        //    일단 주석..
        //        if (combo.useLocalFilter && qe.combo.lastQuery == undefined && !combo.checkAutoLoad()) {
        //            combo.store.load({
        //                callback: function () {
        //                    combo.expand()
        //                }
        //            });
        //        }
        /***
         *
         * 초기 값이 설정될 경우(value, bind) autoLoad:true로 데이터를 로딩하도록 checkAutoLoad() 메소드가 결정한다.
         * 이 후 트리거를 클릭하면 lastQuery가 undefined이므로 다시 로딩하게 된다.
         * 즉 값이 설정되어 최초 로드한 이후에도 불필요하게 재로드 되는 것을 방지.
         * 조건 1: queryMode는 remote일 경우다.
         * 조건 2: 사용자에 의해 한번도 쿼리하지 않았다.
         * 조건 3: checkAutoLoad()메소드는 값이 존재할 경우 true를 반환 할 것이다.
         */
        var checkAutoLoad = combo.checkAutoLoad();
        if (combo.column) {
            checkAutoLoad = true;
        }
        if (combo.queryMode == 'remote' && (qe.combo.lastQuery == undefined) && checkAutoLoad) {
            //            console.log(combo.queryMode, qe.combo.lastQuery, combo.checkAutoLoad())
            qe.combo.lastQuery = '';
        }
        var ownerCombo = Ext.getCmp(combo.ownerNextBindFieldId);
        // 이 콤보를 참조하고 있는 콤보가 있을 경우.
        if (combo.ownerNextBindVar && combo.column) {
            if (ownerCombo.column) {
                var grid = ownerCombo.column.up('tablepanel'),
                    selModel = grid.getSelectionModel(),
                    rec = selModel.getLastSelected(),
                    searfield = (ownerCombo.valueColumnDataIndex ? ownerCombo.valueColumnDataIndex : ownerCombo.column.dataIndex);
                console.log('이 콤보를 연계해 사용중인 콤보가 존재함.:', combo.ownerNextBindFieldId, combo.ownerNextBindParam, '변경전값:', ownerCombo.getValue(), '변경후:', rec.get(searfield));
                ownerCombo.setValue(rec.get(searfield));
            }
            currentParams[combo.ownerNextBindParam] = ownerCombo.getValue();
        }
        // 참조하고 있는 모든 필드 등의 값이 변경되었다면 콤보는 재로드 해야한다.
        // 조건에 부합 할 경우 lastQuery를 지우도록 해 재로드가 가능하게 한다.
        if (Ext.Object.toQueryString(extraParams) != Ext.Object.toQueryString(currentParams)) {
            console.log('조건이 변경되었음.: ', Ext.Object.toQueryString(extraParams), '||', Ext.Object.toQueryString(currentParams));
            Ext.apply(combo.store.getProxy().extraParams, currentParams);
            delete qe.combo.lastQuery;
            if (qe.combo.useLocalFilter) {
                qe.combo.store.load();
            }
        }
    },
    enableEditor: function(column) {
        var combo = this.getView();
        var grid = column.up('tablepanel');
        var plugin = grid.findPlugin('cellediting');
        var selModel = grid.getSelectionModel();
        var rec = selModel.getLastSelected();
        var row = grid.store.indexOf(rec);
        var node = grid.view.getNode(rec);
        if (rec) {
            if (plugin) {
                if (plugin.clicksToEdit == 1) {
                    Ext.get(node).select('.x-grid-cell-' + column.getId()).elements[0].click();
                } else {
                    grid.editingPlugin.startEditByPosition({
                        row: row,
                        column: column.fullColumnIndex
                    });
                }
            }
            return true;
        }
        return false;
    },
    nextBindFields: function(record) {
        var me = this,
            combo = this.getView();
        if (!combo.nextBindFields) {
            return;
        }
        var targetFields = Ext.Array.filter(Ext.ComponentQuery.query('[bind][isFormField]'), function(field) {
                var retValue = true;
                if (combo.getId() == field.getId()) {
                    retValue = false;
                }
                //            if (field.column) {
                //                retValue = false;
                //            }
                return retValue;
            });
        var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function(column) {
                var retValue = false;
                if (combo.column && combo.column.up('tablepanel').getId() == column.ownerCt.grid.getId() && column.config.editor) {
                    retValue = true;
                }
                return retValue;
            });
        Ext.each(editorColumns, function(column) {
            targetFields.push(column);
        });
        Ext.each(combo.nextBindFields, function(bindFieldInfo) {
            var fieldArr = bindFieldInfo.split('|'),
                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
            Ext.each(targetFields, function(field) {
                var className = Ext.ClassManager.getNameByAlias('widget.' + field.xtype);
                var viewClass = Ext.ClassManager.get(className);
                if (field.isFormField && field.getBind()) {
                    if (field.getBind().hasOwnProperty('value') && fieldArr[0] == field.getBind().value.stub.path) {
                        // 연계 콤보
                        if (viewClass.prototype.xtypesMap['spcombo']) {
                            field.setValue(null);
                            if (record) {
                                // select이벤트에 의해 연계처리.
                                field.ownerNextBindVar = fieldArr[0];
                                field.ownerNextBindParam = fieldParam;
                                field.ownerNextBindFieldId = combo.getId();
                                field.proxyParams[fieldParam] = record.get((field.column ? combo.originalValueField : combo.valueField));
                                //                                console.log('field.proxyParams', field.proxyParams);
                                // 그리드 에디터일 경우
                                var enableEditor = true;
                                if (field.column) {
                                    enableEditor = me.enableEditor(field.column);
                                }
                                if (combo.nextBindComboExpand && enableEditor) {
                                    Ext.defer(function() {
                                        Ext.get(field.getId() + '-triggerWrap').select('#' + field.getId() + '-trigger-picker').elements[0].click();
                                    }, //                                        Ext.get(field.getId()).select('.x-form-arrow-trigger').elements[0].click();
                                    //                                        Ext.get(field.getId()).select('div#'+field.getId()+'-trigger-picker').elements[0].click();
                                    500);
                                }
                            } else {
                                // clear
                                if (field.column) {
                                    me.enableEditor(field.column);
                                    Ext.defer(function() {
                                        field.column.up('tablepanel').editingPlugin.completeEdit();
                                    }, 100);
                                }
                                field.clearValue();
                            }
                        } else {
                            // 일반적인 폼필드.
                            field.setValue(null);
                        }
                    }
                } else if ('Ext.grid.column.Column' == className) {
                    if (field.config.editor.bind == '{' + fieldArr[0] + '}') {
                        console.log('editor render 여부.', field.hasEditor());
                        var editor = field.config.editor;
                        if (!field.hasEditor()) {
                            console.log('editor 존재하지 않아 obj에 설정함. :', fieldParam, combo.getId());
                            var proxyParams = editor.setProxyParams();
                            proxyParams[fieldParam] = (record ? record.get(combo.originalValueField) : null);
                            editor.setProxyParams = function() {
                                return proxyParams;
                            };
                            editor.ownerNextBindVar = fieldArr[0];
                            editor.ownerNextBindParam = fieldParam;
                            editor.ownerNextBindFieldId = combo.getId();
                            me.enableEditor(field);
                            if (combo.nextBindComboExpand) {
                                Ext.defer(function() {
                                    var fieldId = field.getEditor().getId();
                                    Ext.get(fieldId + '-triggerWrap').select('#' + fieldId + '-trigger-picker').elements[0].click();
                                }, //                                    Ext.get(field.getEditor().getId()).select('.x-form-arrow-trigger').elements[0].click();
                                //                                    Ext.get(field.getEditor().getId()).select('div#'+field.getEditor().getId()+'-trigger-picker').elements[0].click();
                                500);
                            }
                        }
                    }
                }
            });
        });
    },
    clearValue: function() {
        var me = this,
            combo = this.getView();
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            var grid = combo.column.up('tablepanel');
            var selModel = grid.getSelectionModel();
            var rec = selModel.getLastSelected();
            rec.set(combo.valueColumnDataIndex, null);
        }
        me.nextBindFields(null);
    },
    // 서버에 전달되는 내부정의 파라메터를 반환한다.
    // 1. groupCode :
    // 2. 연계정보를 다시 읽는다.
    //    다른 폼필드의 값을 연계할 경우는 뷰모델의 변수를 이용한다.
    getComboData: function() {
        var me = this,
            param = {},
            combo = this.getView();
        param[combo.defaultParam] = combo[combo.defaultParam];
        /***
         * 외부 폼필드 연계 처리
         * 뷰모델의 바인드를 이용.
         * 바인드변수명:파라메터명@설정값
         */
        Ext.each(combo.relBindVars, function(bindVar) {
            var bindVarArr = bindVar.split('|'),
                bindFieldName = (bindVarArr.length == 1 ? bindVarArr[0] : bindVarArr[1]),
                bindFieldName = bindFieldName.split('@')[0],
                bindValue = bindVar.split('@');
            param[bindFieldName] = (bindValue.length == 2 ? bindValue[1] : me.getViewModel().get(bindVarArr[0]));
        });
        Ext.apply(param, combo.getProxyParams());
        return param;
    },
    createStore: function(component, options) {
        var me = this,
            view = this.getView(),
            store = Ext.create('Ext.data.Store', {
                autoDestroy: true,
                autoLoad: view.checkAutoLoad(),
                storeId: view.generateUUID(),
                fields: options.fields,
                proxy: {
                    type: view.proxyType,
                    noCache: false,
                    // to remove param "_dc"
                    pageParam: false,
                    // to remove param "page"
                    startParam: false,
                    // to remove param "start"
                    limitParam: false,
                    // to remove param "limit"
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    paramsAsJson: true,
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    url: options.url,
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        transform: options.transform || false
                    },
                    extraParams: options.params
                }
            });
        component.bindStore(store);
        //console.log('autoLoad:', store.autoLoad)
        return store;
    },
    init: function() {
        var me = this,
            view = this.getView();
        // 외부에서 store 정의 된 경우 이후 처리안함.
        if (view.store.storeId != 'ext-empty-store') {
            return;
        }
        //        var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function (field, idx) {
        //            var retValue = true;
        //            console.log('editor:', idx, field.getEditor())
        ////            if (field.getEditor()) {
        ////                retValue = true;
        ////            }
        //            return retValue;
        //        });
        //        Ext.defer(function () {
        //        if(view.getId() === 'NEXT12') {
        //        }
        //        },1000)
        //        console.log('editorColumns1', view.getId(), editorColumns)
        view.proxyParams = view.setProxyParams();
        if (view.useLocalFilter) {
            view.queryMode = 'local';
        }
        // 공통 코드를 사용하지 않을 경우.
        //        if (!Ext.isEmpty(view.groupCode)) {
        // 공통 코드를 사용할 경우.
        me.createStore(view, {
            url: view.proxyUrl,
            fields: [],
            params: me.getComboData()
        });
        //        }
        me.getView().store.on('load', function(store) {
            console.log('store load ::', store.getProxy().extraParams);
        });
    }
});

Ext.define('eui.form.field.ComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.euicombo',
    requires: [
        'Util',
        "eui.form.field.ComboBoxController"
    ],
    controller: 'spcombo',
    /***
     * 요구 정의.
     * 1. groupCode를 설정해 해당 코드를 가져온다.
     * 2. 폼필드와 연계되어 해당 폼필드의 변경사항이 있을 경우
     *      재로드한다.
     * 3. queryMode : 'local'을 지정할 경우 내부 필터링된다.
     *      이경우에도 연계된 폼필드가 있고 변경사항이 있다면
     *      재로드해야한다.
     */
    /// 기본 설정.
    minChars: 1,
    editable: false,
    emptyText: '선택하세요',
    cellCls: 'fo-table-row-td',
    displayField: 'NM',
    valueField: 'CD',
    autoLoadOnValue: true,
    width: '100%',
    //    proxyParams : {},
    config: {
        nextBindComboExpand: true,
        /***
         * @cfg {string} proxyUrl
         * 데이터를 얻기 위한 서버사이드 주소
         */
        proxyUrl: {},
        /***
         * @cfg {string} defaultParam
         * 콤보가 데이터를 얻기 위한 기본 파라메터이다.
         * 코드성 데이터를 얻기 위해서는 코드집합의 구분자가 필요하다.
         * 기본값은 groupCode이다.
         */
        defaultParam: 'groupCode',
        /***
         * @cfg {boolean} useLocalFilter
         * editable:true해 입력된 값을 서버로 전달하지 않고
         * 로드한 데이터를 활용한 필터를 작동시킨다.
         * true일 경우 queryMode를 'local'로 변경한다.
         */
        useLocalFilter: false,
        proxyParams: null,
        proxyType: 'ajax',
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        /***
         * @cfg {String} valueColumnDataIndex
         * 그리드 내부 에디터로 사용 할 경우로 항상 코드명을 표현하기 위한 용도로
         * 사용되며 이 설정은 에디터를 select한 이후 에디터 내부 코드에 해당하는
         * 값을 그리드 모델에 write해주기 위한 용도다.         *
         */
        valueColumnDataIndex: null,
        /***
         *  @cfg {String Array} relBindVars
         *  콤보가 데이터를 얻기 위해 참조하는 다른 뷰모델 데이터를 정의한다.
         *  일반적으로 콤보는 폼패널 내부의 폼필드 값을 참조하거나 동적으로 변경되는
         *  값을 콤보를 클릭할 때마다 불러와 서버사이드에 전달하도록 하기 위함이다.
         *  이 설정을 이용하면 뷰모델과 상관없이 특정 이름으로 정해진 값을 전달할 수도 있다.
         *  @example
         *
         *  xtype: 'spcombo',
         *  editable: true,
         *  relBindVars: ['CUSTOMER_CODE|CSCODE@2000'],
         *
         *  CUSTOMER_CODE   : 뷰모델 변수명(존재하지 않는 경우는 값이 null로 전달되므로 이 경우는 뷰모델과 상관없이 서버사이드에 원하는 값을 지정해 전달할 목적으로 사용한다.)
         *  |               : 서버사이드에 전송될 이름을 변경할 경우 구분자를 사용해 이후 정의한다.
         *  CSCODE          : 뷰모델 변수명 대신 CSCODE라는 이름으로 보낼수 있다.
         *  @               : 뷰모델 변수의 값을 보내지 않고 원하는 값을 지정할 경우 구분자.
         *  2000            : 뷰모델 변수의 값 대신 전달할 값.
         *
         */
        relBindVars: null
    },
    // clear button add
    triggers: {
        arrow: {
            cls: 'x-form-clear-trigger',
            handler: 'clearValue',
            scope: 'this'
        }
    },
    valueNotFoundText: '검색결과가 존재하지 않습니다.',
    listeners: {
        //        focus: function () {
        //            var me = this;
        //            if (me.nextBindComboExpand) {
        //                Ext.defer(function () {
        //                    Ext.get(me.getId()).select('.x-form-arrow-trigger').elements[0].click();
        //                    //                Ext.get(me.getId()).select('div#' + me.getId() + '-trigger-picker').elements[0].click();
        //                }, 100)
        //            }
        //        },
        //render: 'initCombo',
        select: 'onSelect',
        beforequery: 'beforeCheckParamValue'
    },
    initComponent: function() {
        var me = this;
        //        console.log('initComponent..', me.getId())
        if (me.column && me.valueColumnDataIndex) {
            Ext.apply(me, {
                originalValueField: me.valueField,
                valueField: me.displayField
            });
        }
        me.callParent(arguments);
    },
    /***
     * 재정의 용도로 사용한다.
     * @exmaple
     * this.proxyParams = {
     *      myParam1 : '1',
     *      myParam2 : 'AA'
     * }
     */
    setProxyParams: function() {
        return {};
    },
    clearValue: function() {
        this.callParent(arguments);
        this.getController().clearValue();
    },
    generateUUID: function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 7 | 8)).toString(16);
            });
        return uuid;
    },
    /***
     * value 또는 bind에 의해 값이 설정될 경우만
     * autoLoad: true 하고 나머진 false한다.
     * 값이 설정되지 않은 경우에는 데이터를 미리 가져오지
     * 않도록 한다.
     */
    checkAutoLoad: function() {
        if (this.value) {
            return true;
        }
        if (this.getBind() && this.getBind()['value'] && this.getBind().value.stub.hadValue) {
            return true;
        }
        return false;
    }
});

Ext.define('eui.form.field.ComboBoxController_', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.spcombo_',
    getLastSelectedRecord: function(combo) {
        if (!combo) {
            combo = this.getView();
        }
        var grid = combo.column.up('tablepanel'),
            selModel = grid.getSelectionModel(),
            rec = selModel.getLastSelected();
        return rec;
    },
    onSelect: function(combo, record) {
        var me = this;
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            var rec = me.getLastSelectedRecord();
            rec.set(combo.valueColumnDataIndex, record.get(combo.originalValueField));
        }
        me.nextBindFields(record);
    },
    /***
     * lastQuery를 지우면 콤보를 매번재로드한다.
     * 이전 조건이 변경될 경우면 재로드하도록 해야한다.
     */
    beforeCheckParamValue: function(qe) {
        var me = this,
            combo = this.getView(),
            extraParams = combo.store.getProxy().extraParams,
            currentParams = this.getComboData();
        /***
         * useLocalFilter : true일 경우는 queryMode가 local이다.
         * 최초 로드를 위해 인위적으로 store를 로드한다.
         * 최초 값이 설정되었을 경우 이미 로드했으므로 로드하지 않는다.(checkAutoLoad => false)
         */
        if (combo.useLocalFilter && qe.combo.lastQuery == undefined && !combo.checkAutoLoad()) {
            combo.store.load({
                callback: function() {
                    combo.expand();
                }
            });
        }
        /***
         *
         * 초기 값이 설정될 경우(value, bind) autoLoad:true로 데이터를 로딩하도록 checkAutoLoad() 메소드가 결정한다.
         * 이 후 트리거를 클릭하면 lastQuery가 undefined이므로 다시 로딩하게 된다.
         * 즉 값이 설정되어 최초 로드한 이후에도 불필요하게 재로드 되는 것을 방지.
         * 조건 1: queryMode는 remote일 경우다.
         * 조건 2: 사용자에 의해 한번도 쿼리하지 않았다.
         * 조건 3: checkAutoLoad()메소드는 값이 존재할 경우 true를 반환 할 것이다.
         */
        if (combo.queryMode == 'remote' && (qe.combo.lastQuery == undefined) && combo.checkAutoLoad()) {
            qe.combo.lastQuery = '';
        }
        // 이 콤보를 참조하고 있는 콤보가 있을 경우.
        if (combo.ownerNextBindVar && combo.column) {
            var ownerCombo = Ext.getCmp(combo.ownerNextBindFieldId),
                rec = me.getLastSelectedRecord(ownerCombo),
                searfield = (ownerCombo.valueColumnDataIndex ? ownerCombo.valueColumnDataIndex : ownerCombo.column.dataIndex);
            ownerCombo.setValue(rec.get(searfield));
            currentParams[combo.ownerNextBindParam] = ownerCombo.getValue();
        }
        // 참조하고 있는 모든 필드 등의 값이 변경되었다면 콤보는 재로드 해야한다.
        // 조건에 부합 할 경우 lastQuery를 지우도록 해 재로드가 가능하게 한다.
        if (Ext.Object.toQueryString(extraParams) != Ext.Object.toQueryString(currentParams)) {
            Ext.apply(combo.store.getProxy().extraParams, currentParams);
            delete qe.combo.lastQuery;
            if (qe.combo.useLocalFilter) {
                qe.combo.store.load();
            }
        }
    },
    getGrid: function(combo) {
        if (!combo) {
            combo = this.getView();
        }
        return combo.column.up('tablepanel');
    },
    /*enableEditor: function (editor) {
        var grid = editor.column.up('tablepanel'),
            rec = this.getLastSelectedRecord(editor),
            row = grid.store.indexOf(rec);
        if (rec) {
            grid.editingPlugin.startEditByPosition({row: row, column: editor.column.fullColumnIndex});
            return true;
        }
        return false;
    },*/
    enableEditor: function(column) {
        var grid = column.up('tablepanel'),
            selModel = grid.getSelectionModel(),
            rec = selModel.getLastSelected(),
            row = grid.store.indexOf(rec);
        if (rec) {
            grid.editingPlugin.startEditByPosition({
                row: row,
                column: column.fullColumnIndex
            });
            return true;
        }
        return false;
    },
    getAllBindFormFields: function(combo) {
        return Ext.Array.filter(Ext.ComponentQuery.query('[bind][isFormField]'), function(field) {
            var retValue = true;
            if (combo.getId() == field.getId()) {
                retValue = false;
            }
            if (field.column) {
                retValue = false;
            }
            return retValue;
        });
    },
    getAllEditorColumns: function(combo) {
        var me = this;
        var ret = Ext.Array.filter(Ext.Array.clone(Ext.ComponentQuery.query('gridcolumn')), function(column) {
                var retValue = false;
                //            column = Ext.clone(column);
                if (me.getGrid().getId() == column.ownerCt.grid.getId()) {
                    retValue = true;
                }
                //            if (column.getEditor(me.getLastSelectedRecord(combo))) {
                //                retValue = true;
                //            }
                return retValue;
            });
        return ret;
    },
    setNextBindSpCombo: function(combo, record, fieldArr, fieldParam, field) {
        field.setValue(null);
        if (record) {
            // select이벤트에 의해 연계처리.
            /***
             * 역방향으로 자신을 참조하고 있는 대상을 알기위한 정보설정.
             */
            field.ownerNextBindVar = fieldArr[0];
            field.ownerNextBindParam = fieldParam;
            field.ownerNextBindFieldId = combo.getId();
            field.proxyParams[fieldParam] = record.get((field.column ? combo.originalValueField : combo.valueField));
            // 그리드 에디터일 경우
            var enableEditor = true;
            if (field.column) {
                enableEditor = this.enableEditor(field.column);
            }
            if (combo.nextBindComboExpand && enableEditor) {
                Ext.defer(function() {
                    Ext.get(field.getId()).select('.x-form-arrow-trigger').elements[0].click();
                }, 500);
            }
        } else {
            // clear
            if (field.column) {
                me.enableEditor(field);
                Ext.defer(function() {
                    field.column.up('tablepanel').editingPlugin.completeEdit();
                }, 100);
            }
            field.clearValue();
        }
    },
    nextBindFields: function(record) {
        var me = this,
            combo = this.getView();
        if (!combo.nextBindFields) {
            return;
        }
        var targetFields = me.getAllBindFormFields(combo);
        if (combo.column) {
            Ext.each(me.getAllEditorColumns(combo), function(column) {
                if (column.config.editor) {
                    targetFields.push(column.getEditor());
                }
            });
        }
        console.log('targetFields', targetFields);
        Ext.each(combo.nextBindFields, function(bindFieldInfo) {
            var fieldArr = bindFieldInfo.split('|'),
                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
            Ext.each(targetFields, function(field) {
                var className = Ext.ClassManager.getNameByAlias('widget.' + field.xtype);
                var viewClass = Ext.ClassManager.get(className);
                if (field.isFormField && field.getBind()) {
                    if (field.getBind().hasOwnProperty('value') && fieldArr[0] == field.getBind().value.stub.path) {
                        //                        // 연계 콤보
                        if (viewClass.prototype.xtypesMap['spcombo']) {
                            console.log('xtype:', field, fieldArr[0]);
                            me.setNextBindSpCombo(combo, record, fieldArr, fieldParam, field);
                        } else {
                            // 일반적인 폼필드.
                            field.setValue(null);
                        }
                    }
                } else {}
            });
        });
    },
    //                    var className2 = Ext.ClassManager.getNameByAlias('widget.' + field.config.editor.xtype);
    //                    var viewClass2 = Ext.ClassManager.get(className2);
    //                    console.log(className2, viewClass2.prototype.xtypesMap, '컬럼에서 작동할 경우: ', fieldArr[0], field.config.editor.bind);
    //                    if (viewClass2.prototype.xtypesMap['spcombo']) {
    //                        me.setNextBindSpCombo(combo, record, fieldArr, fieldParam, field, field);
    //                    }
    ////                    if (fieldArr[0] == field.getBind().value.stub.path) {
    ////                        // 연계 콤보
    ////                        if (viewClass.prototype.xtypesMap['spcombo']) {
    ////                            me.setNextBindSpCombo(combo, record, fieldArr, fieldParam, field);
    ////                        } else {    // 일반적인 폼필드.
    ////                            field.setValue(null);
    ////                        }
    ////                    }
    clearValue: function() {
        var me = this,
            combo = this.getView();
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            var rec = me.getLastSelectedRecord();
            rec.set(combo.valueColumnDataIndex, null);
        }
        me.nextBindFields(null);
    },
    // 서버에 전달되는 내부정의 파라메터를 반환한다.
    // 1. groupCode :
    // 2. 연계정보를 다시 읽는다.
    //    다른 폼필드의 값을 연계할 경우는 뷰모델의 변수를 이용한다.
    getComboData: function() {
        var me = this,
            param = {},
            combo = this.getView();
        param[combo.defaultParam] = combo[combo.defaultParam];
        // 나의 바인드 변수를 참조하고 있는 컬럼의 에디터를 찾는다.
        // 현재 선택된 레코드의 값으로 에디터의
        if (combo.column) {}
        //            var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function (field) {
        //                var retValue = true;
        ////                if (field.getEditor()) {
        ////                    retValue = true;
        ////                }
        //                return retValue;
        //            });
        //            Ext.each(Ext.ComponentQuery.query('gridcolumn'), function (field, idx) {
        //                Ext.each(combo.column.up('tablepanel').columns, function (field, idx) {
        //                    var field2 = Ext.clone(field);
        ////                    if(field['editor']){
        //                        console.log('editor:', combo.getId(), field2.editor, idx);
        ////                        Ext.each(field.editor.nextBindFields, function (bindFieldInfo) {
        ////                            var fieldArr = bindFieldInfo.split('|'),
        ////                                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
        ////
        ////                            if(fieldParam == combo.name){
        ////                                debugger;
        ////                            }
        ////                        });
        ////                    }
        //                });
        //            console.log('editorColumns2', combo.getId(), editorColumns)
        //            Ext.each(editorColumns, function (nextfield) {
        //                Ext.each(nextfield.getEditor().nextBindFields, function (bindFieldInfo) {
        //                    var fieldArr = bindFieldInfo.split('|'),
        //                        fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
        //
        //                    if(fieldParam == combo.name){
        //                        debugger;
        //                    }
        //                });
        //
        //            })
        /***
         * 외부 폼필드 연계 처리
         * 뷰모델의 바인드를 이용.
         * 바인드변수명:파라메터명@설정값
         */
        Ext.each(combo.relBindVars, function(bindVar) {
            var bindVarArr = bindVar.split('|'),
                bindFieldName = (bindVarArr.length == 1 ? bindVarArr[0] : bindVarArr[1]),
                bindFieldName = bindFieldName.split('@')[0],
                bindValue = bindVar.split('@');
            param[bindFieldName] = (bindValue.length == 2 ? bindValue[1] : me.getViewModel().get(bindVarArr[0]));
        });
        Ext.apply(param, combo.getProxyParams());
        return param;
    },
    createStore: function(component, options) {
        var me = this,
            view = this.getView(),
            store = Ext.create('Ext.data.Store', {
                autoDestroy: true,
                autoLoad: false,
                //view.checkAutoLoad(),
                storeId: view.generateUUID(),
                fields: options.fields,
                proxy: {
                    type: view.proxyType,
                    noCache: false,
                    // to remove param "_dc"
                    pageParam: false,
                    // to remove param "page"
                    startParam: false,
                    // to remove param "start"
                    limitParam: false,
                    // to remove param "limit"
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    paramsAsJson: true,
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    url: options.url,
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        transform: options.transform || false
                    },
                    extraParams: options.params
                }
            });
        component.bindStore(store);
        return store;
    },
    init: function() {
        var me = this,
            view = this.getView();
        // 외부에서 store 정의 된 경우 이후 처리안함.
        if (view.store.storeId != 'ext-empty-store') {
            return;
        }
        //        var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function (field, idx) {
        //            var retValue = true;
        //            console.log('editor:', idx, field.getEditor())
        ////            if (field.getEditor()) {
        ////                retValue = true;
        ////            }
        //            return retValue;
        //        });
        //        Ext.defer(function () {
        //        if(view.getId() === 'NEXT12') {
        //        }
        //        },1000)
        //        console.log('editorColumns1', view.getId(), editorColumns)
        view.setProxyParams();
        if (view.useLocalFilter) {
            view.queryMode = 'local';
        }
        // 공통 코드를 사용하지 않을 경우.
        //        if (!Ext.isEmpty(view.groupCode)) {
        // 공통 코드를 사용할 경우.
        me.createStore(view, {
            url: view.proxyUrl,
            fields: [],
            params: me.getComboData()
        });
    }
});
//        }

Ext.define('eui.form.field.ComboBoxController_today', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.spcombotoday',
    onSelect: function(combo, record) {
        var me = this;
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            var grid = combo.column.up('tablepanel');
            var selModel = grid.getSelectionModel();
            var rec = selModel.getLastSelected();
            rec.set(combo.valueColumnDataIndex, record.get(combo.originalValueField));
        }
        me.nextBindFields(record);
    },
    /***
     * lastQuery를 지우면 콤보를 매번재로드한다.
     * 이전 조건이 변경될 경우면 재로드하도록 해야한다.
     */
    beforeCheckParamValue: function(qe) {
        var me = this,
            combo = this.getView(),
            extraParams = combo.store.getProxy().extraParams,
            currentParams = this.getComboData();
        /***
         * useLocalFilter : true일 경우는 queryMode가 local이다.
         * 최초 로드를 위해 인위적으로 store를 로드한다.
         * 최초 값이 설정되었을 경우 이미 로드했으므로 로드하지 않는다.(checkAutoLoad => false)
         */
        if (combo.useLocalFilter && qe.combo.lastQuery == undefined && !combo.checkAutoLoad()) {
            combo.store.load({
                callback: function() {
                    combo.expand();
                }
            });
        }
        /***
         *
         * 초기 값이 설정될 경우(value, bind) autoLoad:true로 데이터를 로딩하도록 checkAutoLoad() 메소드가 결정한다.
         * 이 후 트리거를 클릭하면 lastQuery가 undefined이므로 다시 로딩하게 된다.
         * 즉 값이 설정되어 최초 로드한 이후에도 불필요하게 재로드 되는 것을 방지.
         * 조건 1: queryMode는 remote일 경우다.
         * 조건 2: 사용자에 의해 한번도 쿼리하지 않았다.
         * 조건 3: checkAutoLoad()메소드는 값이 존재할 경우 true를 반환 할 것이다.
         */
        if (combo.queryMode == 'remote' && (qe.combo.lastQuery == undefined) && combo.checkAutoLoad()) {
            qe.combo.lastQuery = '';
        }
        // 이 콤보를 참조하고 있는 콤보가 있을 경우.
        if (combo.ownerNextBindVar && combo.column) {
            var ownerCombo = Ext.getCmp(combo.ownerNextBindFieldId),
                grid = ownerCombo.column.up('tablepanel'),
                selModel = grid.getSelectionModel(),
                rec = selModel.getLastSelected(),
                searfield = (ownerCombo.valueColumnDataIndex ? ownerCombo.valueColumnDataIndex : ownerCombo.column.dataIndex);
            ownerCombo.setValue(rec.get(searfield));
            currentParams[combo.ownerNextBindParam] = ownerCombo.getValue();
        }
        // 참조하고 있는 모든 필드 등의 값이 변경되었다면 콤보는 재로드 해야한다.
        // 조건에 부합 할 경우 lastQuery를 지우도록 해 재로드가 가능하게 한다.
        console.log('조건 확인1: ', Ext.Object.toQueryString(extraParams));
        console.log('조건 확인2: ', Ext.Object.toQueryString(currentParams));
        if (Ext.Object.toQueryString(extraParams) != Ext.Object.toQueryString(currentParams)) {
            Ext.apply(combo.store.getProxy().extraParams, currentParams);
            delete qe.combo.lastQuery;
            if (qe.combo.useLocalFilter) {
                qe.combo.store.load();
            }
        }
    },
    enableEditor: function(editor) {
        var grid = editor.column.up('tablepanel');
        var selModel = grid.getSelectionModel();
        var rec = selModel.getLastSelected();
        var row = grid.store.indexOf(rec);
        if (rec) {
            grid.editingPlugin.startEditByPosition({
                row: row,
                column: editor.column.fullColumnIndex
            });
            return true;
        }
        return false;
    },
    nextBindFields: function(record) {
        var me = this,
            combo = this.getView();
        if (!combo.nextBindFields) {
            return;
        }
        var targetFields = Ext.Array.filter(Ext.ComponentQuery.query('[bind]'), function(field) {
                var retValue = true;
                if (combo.getId() == field.getId()) {
                    retValue = false;
                }
                if (field.column) {
                    retValue = false;
                }
                return retValue;
            });
        var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function(column) {
                var retValue = false;
                if (combo.column && combo.column.up('tablepanel').getId() == column.ownerCt.grid.getId() && column.getEditor()) {
                    retValue = true;
                }
                return retValue;
            });
        console.log('editorColumn', editorColumns);
        var targetFields2 = Ext.Array.filter(Ext.ComponentQuery.query('hcombobox[isFormField]'), function(field) {
                var retValue = true;
                return retValue;
            });
        console.log('targetFields2', targetFields2);
        Ext.each(targetFields2, function(item) {
            console.log('combo:', item.rendered, item.getId());
        });
        Ext.each(editorColumns, function(column) {
            targetFields.push(column.getEditor());
        });
        Ext.each(combo.nextBindFields, function(bindFieldInfo) {
            var fieldArr = bindFieldInfo.split('|'),
                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
            Ext.each(targetFields, function(field) {
                var className = Ext.ClassManager.getNameByAlias('widget.' + field.xtype);
                var viewClass = Ext.ClassManager.get(className);
                if (field.isFormField && field.getBind()) {
                    if (field.getBind().hasOwnProperty('value') && fieldArr[0] == field.getBind().value.stub.path) {
                        // 연계 콤보
                        if (viewClass.prototype.xtypesMap['spcombo']) {
                            field.setValue(null);
                            if (record) {
                                // select이벤트에 의해 연계처리.
                                field.ownerNextBindVar = fieldArr[0];
                                field.ownerNextBindParam = fieldParam;
                                field.ownerNextBindFieldId = combo.getId();
                                console.log(field.proxyParams, record, field.column, combo.originalValueField, combo.valueField);
                                field.proxyParams[fieldParam] = record.get((field.column ? combo.originalValueField : combo.valueField));
                                // 그리드 에디터일 경우
                                var enableEditor = true;
                                if (field.column) {
                                    enableEditor = me.enableEditor(field);
                                }
                                if (combo.nextBindComboExpand && enableEditor) {
                                    Ext.defer(function() {}, //                                        Ext.get(field.getId()).select('.x-form-arrow-trigger').elements[0].click();
                                    500);
                                }
                            } else {
                                // clear
                                if (field.column) {
                                    me.enableEditor(field);
                                    Ext.defer(function() {
                                        field.column.up('tablepanel').editingPlugin.completeEdit();
                                    }, 100);
                                    field.clearValue();
                                }
                            }
                        } else {
                            // 일반적인 폼필드.
                            field.setValue(null);
                        }
                    }
                } else {}
            });
        });
    },
    //                    console.log(field.getId(), className)
    clearValue: function() {
        var me = this,
            combo = this.getView();
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            var grid = combo.column.up('tablepanel');
            var selModel = grid.getSelectionModel();
            var rec = selModel.getLastSelected();
            rec.set(combo.valueColumnDataIndex, null);
        }
        me.nextBindFields(null);
    },
    // 서버에 전달되는 내부정의 파라메터를 반환한다.
    // 1. groupCode :
    // 2. 연계정보를 다시 읽는다.
    //    다른 폼필드의 값을 연계할 경우는 뷰모델의 변수를 이용한다.
    getComboData: function() {
        var me = this,
            param = {},
            combo = this.getView();
        param[combo.defaultParam] = combo[combo.defaultParam];
        // 나의 바인드 변수를 참조하고 있는 컬럼의 에디터를 찾는다.
        // 현재 선택된 레코드의 값으로 에디터의
        if (combo.column) {}
        //            var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function (field) {
        //                var retValue = true;
        ////                if (field.getEditor()) {
        ////                    retValue = true;
        ////                }
        //                return retValue;
        //            });
        //            Ext.each(Ext.ComponentQuery.query('gridcolumn'), function (field, idx) {
        //                Ext.each(combo.column.up('tablepanel').columns, function (field, idx) {
        //                    var field2 = Ext.clone(field);
        ////                    if(field['editor']){
        //                        console.log('editor:', combo.getId(), field2.editor, idx);
        ////                        Ext.each(field.editor.nextBindFields, function (bindFieldInfo) {
        ////                            var fieldArr = bindFieldInfo.split('|'),
        ////                                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
        ////
        ////                            if(fieldParam == combo.name){
        ////                                debugger;
        ////                            }
        ////                        });
        ////                    }
        //                });
        //            console.log('editorColumns2', combo.getId(), editorColumns)
        //            Ext.each(editorColumns, function (nextfield) {
        //                Ext.each(nextfield.getEditor().nextBindFields, function (bindFieldInfo) {
        //                    var fieldArr = bindFieldInfo.split('|'),
        //                        fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
        //
        //                    if(fieldParam == combo.name){
        //                        debugger;
        //                    }
        //                });
        //
        //            })
        /***
         * 외부 폼필드 연계 처리
         * 뷰모델의 바인드를 이용.
         * 바인드변수명:파라메터명@설정값
         */
        Ext.each(combo.relBindVars, function(bindVar) {
            var bindVarArr = bindVar.split('|'),
                bindFieldName = (bindVarArr.length == 1 ? bindVarArr[0] : bindVarArr[1]),
                bindFieldName = bindFieldName.split('@')[0],
                bindValue = bindVar.split('@');
            param[bindFieldName] = (bindValue.length == 2 ? bindValue[1] : me.getViewModel().get(bindVarArr[0]));
        });
        Ext.apply(param, combo.getProxyParams());
        return param;
    },
    createStore: function(component, options) {
        var me = this,
            view = this.getView(),
            store = Ext.create('Ext.data.Store', {
                autoDestroy: true,
                autoLoad: view.checkAutoLoad(),
                storeId: view.generateUUID(),
                fields: options.fields,
                proxy: {
                    type: view.proxyType,
                    noCache: false,
                    // to remove param "_dc"
                    pageParam: false,
                    // to remove param "page"
                    startParam: false,
                    // to remove param "start"
                    limitParam: false,
                    // to remove param "limit"
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    paramsAsJson: true,
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    url: options.url,
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        transform: options.transform || false
                    },
                    extraParams: options.params
                }
            });
        component.bindStore(store);
        return store;
    },
    init: function() {
        var me = this,
            view = this.getView();
        // 외부에서 store 정의 된 경우 이후 처리안함.
        if (view.store.storeId != 'ext-empty-store') {
            return;
        }
        //        var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function (field, idx) {
        //            var retValue = true;
        //            console.log('editor:', idx, field.getEditor())
        ////            if (field.getEditor()) {
        ////                retValue = true;
        ////            }
        //            return retValue;
        //        });
        //        Ext.defer(function () {
        //        if(view.getId() === 'NEXT12') {
        //        }
        //        },1000)
        //        console.log('editorColumns1', view.getId(), editorColumns)
        view.setProxyParams();
        if (view.useLocalFilter) {
            view.queryMode = 'local';
        }
        // 공통 코드를 사용하지 않을 경우.
        //        if (!Ext.isEmpty(view.groupCode)) {
        // 공통 코드를 사용할 경우.
        me.createStore(view, {
            url: view.proxyUrl,
            fields: [],
            params: me.getComboData()
        });
    }
});
//        }

Ext.define('eui.form.field.ComboBox_', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.spcombo_',
    requires: [
        'Util',
        "eui.form.field.ComboBoxController"
    ],
    controller: 'spcombo',
    /***
     * 요구 정의.
     * 1. groupCode를 설정해 해당 코드를 가져온다.
     * 2. 폼필드와 연계되어 해당 폼필드의 변경사항이 있을 경우
     *      재로드한다.
     * 3. queryMode : 'local'을 지정할 경우 내부 필터링된다.
     *      이경우에도 연계된 폼필드가 있고 변경사항이 있다면
     *      재로드해야한다.
     */
    /// 기본 설정.
    hideLabel: true,
    minChars: 1,
    editable: false,
    emptyText: '선택하세요',
    cellCls: 'fo-table-row-td',
    displayField: 'NM',
    valueField: 'CD',
    autoLoadOnValue: true,
    width: '100%',
    config: {
        nextBindComboExpand: true,
        /***
         * @cfg {string} proxyUrl
         * 데이터를 얻기 위한 서버사이드 주소
         */
        proxyUrl: {},
        /***
         * @cfg {string} defaultParam
         * 콤보가 데이터를 얻기 위한 기본 파라메터이다.
         * 코드성 데이터를 얻기 위해서는 코드집합의 구분자가 필요하다.
         * 기본값은 groupCode이다.
         */
        defaultParam: 'groupCode',
        /***
         * @cfg {boolean} useLocalFilter
         * editable:true해 입력된 값을 서버로 전달하지 않고
         * 로드한 데이터를 활용한 필터를 작동시킨다.
         * true일 경우 queryMode를 'local'로 변경한다.
         */
        useLocalFilter: true,
        proxyParams: null,
        proxyType: 'ajax',
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        /***
         * @cfg {String} valueColumnDataIndex
         * 그리드 내부 에디터로 사용 할 경우로 항상 코드명을 표현하기 위한 용도로
         * 사용되며 이 설정은 에디터를 select한 이후 에디터 내부 코드에 해당하는
         * 값을 그리드 모델에 write해주기 위한 용도다.         *
         */
        valueColumnDataIndex: null,
        /***
         *  @cfg {String Array} relBindVars
         *  콤보가 데이터를 얻기 위해 참조하는 다른 뷰모델 데이터를 정의한다.
         *  일반적으로 콤보는 폼패널 내부의 폼필드 값을 참조하거나 동적으로 변경되는
         *  값을 콤보를 클릭할 때마다 불러와 서버사이드에 전달하도록 하기 위함이다.
         *  이 설정을 이용하면 뷰모델과 상관없이 특정 이름으로 정해진 값을 전달할 수도 있다.
         *  @example
         *
         *  xtype: 'spcombo',
         *  editable: true,
         *  relBindVars: ['CUSTOMER_CODE|CSCODE@2000'],
         *
         *  CUSTOMER_CODE   : 뷰모델 변수명(존재하지 않는 경우는 값이 null로 전달되므로 이 경우는 뷰모델과 상관없이 서버사이드에 원하는 값을 지정해 전달할 목적으로 사용한다.)
         *  |               : 서버사이드에 전송될 이름을 변경할 경우 구분자를 사용해 이후 정의한다.
         *  CSCODE          : 뷰모델 변수명 대신 CSCODE라는 이름으로 보낼수 있다.
         *  @               : 뷰모델 변수의 값을 보내지 않고 원하는 값을 지정할 경우 구분자.
         *  2000            : 뷰모델 변수의 값 대신 전달할 값.
         *
         */
        relBindVars: null
    },
    // clear button add
    triggers: {
        arrow: {
            cls: 'x-form-clear-trigger',
            handler: 'clearValue',
            scope: 'this'
        }
    },
    valueNotFoundText: '검색결과가 존재하지 않습니다.',
    listeners: {
        select: 'onSelect',
        beforequery: 'beforeCheckParamValue'
    },
    initComponent: function() {
        var me = this;
        console.log('initComponent..', me.getId());
        if (me.column && me.valueColumnDataIndex) {
            Ext.apply(me, {
                originalValueField: me.valueField,
                valueField: me.displayField
            });
        }
        me.callParent(arguments);
        me.on('afterrender', function() {
            Ext.each(Ext.Array.clone(Ext.ComponentQuery.query('gridcolumn')), function(field, idx) {
                if (field.hasOwnProperty('editor')) {
                    console.log(field.getEditor());
                }
            });
        });
    },
    //                        Ext.each(field.editor.nextBindFields, function (bindFieldInfo) {
    //                            var fieldArr = bindFieldInfo.split('|'),
    //                                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
    //
    //                            if(fieldParam == combo.name){
    //                                debugger;
    //                            }
    //                        });
    //                    }
    /***
     * 재정의 용도로 사용한다.
     * @exmaple
     * this.proxyParams = {
     *      myParam1 : '1',
     *      myParam2 : 'AA'
     * }
     */
    setProxyParams: function() {
        this.proxyParams = {};
    },
    clearValue: function() {
        this.callParent(arguments);
        this.getController().clearValue();
    },
    generateUUID: function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 7 | 8)).toString(16);
            });
        return uuid;
    },
    /***
     * value 또는 bind에 의해 값이 설정될 경우만
     * autoLoad: true 하고 나머진 false한다.
     * 값이 설정되지 않은 경우에는 데이터를 미리 가져오지
     * 않도록 한다.
     */
    checkAutoLoad: function() {
        if (this.value) {
            return true;
        }
        if (this.getBind() && this.getBind()['value'] && this.getBind().value.stub.hadValue) {
            return true;
        }
        return false;
    }
});

Ext.define('eui.form.field.ComboBox_today', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.spcombotoday',
    requires: [
        'Util',
        "eui.form.field.ComboBoxController"
    ],
    controller: 'spcombo',
    /***
     * 요구 정의.
     * 1. groupCode를 설정해 해당 코드를 가져온다.
     * 2. 폼필드와 연계되어 해당 폼필드의 변경사항이 있을 경우
     *      재로드한다.
     * 3. queryMode : 'local'을 지정할 경우 내부 필터링된다.
     *      이경우에도 연계된 폼필드가 있고 변경사항이 있다면
     *      재로드해야한다.
     */
    /// 기본 설정.
    hideLabel: true,
    minChars: 1,
    editable: false,
    emptyText: '선택하세요',
    cellCls: 'fo-table-row-td',
    displayField: 'NM',
    valueField: 'CD',
    autoLoadOnValue: true,
    width: '100%',
    lastQuery: '',
    //    proxyParams : {},
    config: {
        nextBindComboExpand: true,
        /***
         * @cfg {string} proxyUrl
         * 데이터를 얻기 위한 서버사이드 주소
         */
        proxyUrl: {},
        /***
         * @cfg {string} defaultParam
         * 콤보가 데이터를 얻기 위한 기본 파라메터이다.
         * 코드성 데이터를 얻기 위해서는 코드집합의 구분자가 필요하다.
         * 기본값은 groupCode이다.
         */
        defaultParam: 'groupCode',
        /***
         * @cfg {boolean} useLocalFilter
         * editable:true해 입력된 값을 서버로 전달하지 않고
         * 로드한 데이터를 활용한 필터를 작동시킨다.
         * true일 경우 queryMode를 'local'로 변경한다.
         */
        useLocalFilter: false,
        proxyParams: null,
        proxyType: 'ajax',
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        /***
         * @cfg {String} valueColumnDataIndex
         * 그리드 내부 에디터로 사용 할 경우로 항상 코드명을 표현하기 위한 용도로
         * 사용되며 이 설정은 에디터를 select한 이후 에디터 내부 코드에 해당하는
         * 값을 그리드 모델에 write해주기 위한 용도다.         *
         */
        valueColumnDataIndex: null,
        /***
         *  @cfg {String Array} relBindVars
         *  콤보가 데이터를 얻기 위해 참조하는 다른 뷰모델 데이터를 정의한다.
         *  일반적으로 콤보는 폼패널 내부의 폼필드 값을 참조하거나 동적으로 변경되는
         *  값을 콤보를 클릭할 때마다 불러와 서버사이드에 전달하도록 하기 위함이다.
         *  이 설정을 이용하면 뷰모델과 상관없이 특정 이름으로 정해진 값을 전달할 수도 있다.
         *  @example
         *
         *  xtype: 'spcombo',
         *  editable: true,
         *  relBindVars: ['CUSTOMER_CODE|CSCODE@2000'],
         *
         *  CUSTOMER_CODE   : 뷰모델 변수명(존재하지 않는 경우는 값이 null로 전달되므로 이 경우는 뷰모델과 상관없이 서버사이드에 원하는 값을 지정해 전달할 목적으로 사용한다.)
         *  |               : 서버사이드에 전송될 이름을 변경할 경우 구분자를 사용해 이후 정의한다.
         *  CSCODE          : 뷰모델 변수명 대신 CSCODE라는 이름으로 보낼수 있다.
         *  @               : 뷰모델 변수의 값을 보내지 않고 원하는 값을 지정할 경우 구분자.
         *  2000            : 뷰모델 변수의 값 대신 전달할 값.
         *
         */
        relBindVars: null
    },
    // clear button add
    triggers: {
        arrow: {
            cls: 'x-form-clear-trigger',
            handler: 'clearValue',
            scope: 'this'
        }
    },
    valueNotFoundText: '검색결과가 존재하지 않습니다.',
    listeners: {
        //render: 'initCombo',
        select: 'onSelect',
        beforequery: 'beforeCheckParamValue'
    },
    initComponent: function() {
        var me = this;
        console.log('initComponent..', me.getId());
        if (me.column && me.valueColumnDataIndex) {
            Ext.apply(me, {
                originalValueField: me.valueField,
                valueField: me.displayField
            });
        }
        me.callParent(arguments);
        me.on('afterrender', function() {
            Ext.each(Ext.Array.clone(Ext.ComponentQuery.query('gridcolumn')), function(field, idx) {});
        });
    },
    //                if(field.hasOwnProperty('editor')){
    //                    console.log(field.getEditor())
    //                }
    //                        Ext.each(field.editor.nextBindFields, function (bindFieldInfo) {
    //                            var fieldArr = bindFieldInfo.split('|'),
    //                                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
    //
    //                            if(fieldParam == combo.name){
    //                                debugger;
    //                            }
    //                        });
    //                    }
    /***
     * 재정의 용도로 사용한다.
     * @exmaple
     * this.proxyParams = {
     *      myParam1 : '1',
     *      myParam2 : 'AA'
     * }
     */
    setProxyParams: function() {
        this.proxyParams = {};
    },
    clearValue: function() {
        this.callParent(arguments);
        this.getController().clearValue();
    },
    generateUUID: function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 7 | 8)).toString(16);
            });
        return uuid;
    },
    /***
     * value 또는 bind에 의해 값이 설정될 경우만
     * autoLoad: true 하고 나머진 false한다.
     * 값이 설정되지 않은 경우에는 데이터를 미리 가져오지
     * 않도록 한다.
     */
    checkAutoLoad: function() {
        if (this.value) {
            return true;
        }
        if (this.getBind() && this.getBind()['value'] && this.getBind().value.stub.hadValue) {
            return true;
        }
        return false;
    }
});

Ext.define('eui.form.field.Date', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.euidate',
    submitFormat: 'Ymd',
    format: 'Y.m.d',
    altFormats: 'Ymd',
    value: new Date(),
    dateNum: null,
    width: '100%',
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        var dateNum = me.dateNum;
        me.callParent(arguments);
        if (!Ext.isEmpty(dateNum)) {
            me.setValue(me.dayCal(new Date(), dateNum));
        }
    },
    dayCal: function(val, num) {
        val.setDate(val.getDate() + num);
        return val;
    }
});

Ext.define('eui.form.field.Display', {
    extend: 'Ext.form.field.Display',
    alias: 'widget.euidisplay',
    width: '100%',
    cellCls: 'fo-table-row-td'
});

Ext.define('eui.form.field.File', {
    extend: 'Ext.form.field.File',
    alias: 'widget.euifile',
    width: '100%',
    cellCls: 'fo-table-row-td'
});

Ext.define('eui.form.field.HtmlEditor', {
    extend: 'Ext.form.field.HtmlEditor',
    alias: 'widget.euihtmleditor',
    width: '100%',
    height: 100,
    cellCls: 'fo-table-row-td'
});

Ext.define('eui.form.field.Number', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.euinumber',
    cellCls: 'fo-table-row-td',
    hideTrigger: true,
    mouseWheelEnabled: false,
    fieldStyle: 'text-align: right',
    decimalPrecision: 0,
    useThousandSeparator: true,
    submitLocaleSeparator: false,
    value: 0,
    width: '100%',
    //    fieldStyle: 'text-align: right;ime-mode:disabled',
    initComponent: function() {
        var me = this;
        me.enableKeyEvents = true;
        me.callParent(arguments);
        me.setInterceptor(me);
        me.addListener('focus', function() {
            if (this.readOnly || this.disabled)  {
                return;
            }
            
            this.setRawValue(this.value);
            if (!Ext.isWebKit) {
                if (!!me.selectOnFocus) {
                    this.selectText();
                }
            }
        });
    },
    setInterceptor: function(me) {
        Ext.Function.interceptAfter(me, "postBlur", function(e) {
            var me = this,
                hadError = me.hasActiveError();
            delete me.needsValidateOnEnable;
            me.unsetActiveError();
            if (hadError) {
                me.setError('');
                me.setValue('');
            }
        });
    },
    /**
     * @inheritdoc
     */
    toRawNumber: function(value) {
        return String(value).replace(this.decimalSeparator, '.').replace(new RegExp(Ext.util.Format.thousandSeparator, "g"), '');
    },
    /**
     * @inheritdoc
     */
    getErrors: function(value) {
        if (!this.useThousandSeparator)  {
            return this.callParent(arguments);
        }
        
        var me = this,
            errors = [],
            format = Ext.String.format,
            onlynumber = "",
            num;
        value = Ext.isDefined(value) ? value : this.processRawValue(this.getRawValue());
        if (value.length < 1) {
            return errors;
        }
        value = me.toRawNumber(value);
        onlynumber = value.replace(this.decimalSeparator, '');
        errors = Ext.form.field.Text.prototype.getErrors.apply(me, [
            onlynumber
        ]);
        if (isNaN(value.replace(Ext.util.Format.thousandSeparator, ''))) {
            errors.push(format(me.nanText, value));
        }
        num = me.parseValue(value);
        if (me.minValue === 0 && num < 0) {
            errors.push(this.negativeText);
        } else if (num < me.minValue) {
            errors.push(format(me.minText, me.minValue));
        }
        if (num > me.maxValue) {
            errors.push(format(me.maxText, me.maxValue));
        }
        return errors;
    },
    /**
     * @inheritdoc
     */
    getSubmitValue: function() {
        if (!this.useThousandSeparator)  {
            return this.callParent(arguments);
        }
        
        var me = this,
            value = me.callParent();
        if (!me.submitLocaleSeparator) {
            value = me.toRawNumber(value);
        }
        return value;
    },
    /**
     * @inheritdoc
     */
    setMinValue: function(value) {
        if (!this.useThousandSeparator)  {
            return this.callParent(arguments);
        }
        
        var me = this,
            allowed;
        me.minValue = Ext.Number.from(value, Number.NEGATIVE_INFINITY);
        me.toggleSpinners();
        if (me.disableKeyFilter !== true) {
            allowed = me.baseChars + '';
            if (me.allowExponential) {
                allowed += me.decimalSeparator + 'e+-';
            } else {
                allowed += Ext.util.Format.thousandSeparator;
                if (me.allowDecimals) {
                    allowed += me.decimalSeparator;
                }
                if (me.minValue < 0) {
                    allowed += '-';
                }
            }
            allowed = Ext.String.escapeRegex(allowed);
            me.maskRe = new RegExp('[' + allowed + ']');
            if (me.autoStripChars) {
                me.stripCharsRe = new RegExp('[^' + allowed + ']', 'gi');
            }
        }
    },
    /**
     * @private
     */
    parseValue: function(value) {
        if (!this.useThousandSeparator)  {
            return this.callParent(arguments);
        }
        
        value = parseFloat(this.toRawNumber(value));
        return isNaN(value) ? null : value;
    },
    exNumber: function(v, formatString) {
        var UtilFormat = Ext.util.Format,
            stripTagsRE = /<\/?[^>]+>/gi,
            stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
            nl2brRe = /\r?\n/g,
            // A RegExp to remove from a number format string, all characters except digits and '.'
            formatCleanRe = /[^\d\.]/g,
            // A RegExp to remove from a number format string, all characters except digits and the local decimal separator.
            // Created on first use. The local decimal separator character must be initialized for this to be created.
            I18NFormatCleanRe;
        if (!formatString) {
            return v;
        }
        v = Ext.Number.from(v, NaN);
        if (isNaN(v)) {
            return '';
        }
        var comma = UtilFormat.thousandSeparator,
            dec = UtilFormat.decimalSeparator,
            neg = v < 0,
            hasComma, psplit, fnum, cnum, parr, j, m, n, i;
        v = Math.abs(v);
        // The "/i" suffix allows caller to use a locale-specific formatting string.
        // Clean the format string by removing all but numerals and the decimal separator.
        // Then split the format string into pre and post decimal segments according to *what* the
        // decimal separator is. If they are specifying "/i", they are using the local convention in the format string.
        if (formatString.substr(formatString.length - 2) == '/i') {
            if (!I18NFormatCleanRe) {
                I18NFormatCleanRe = new RegExp('[^\\d\\' + UtilFormat.decimalSeparator + ']', 'g');
            }
            formatString = formatString.substr(0, formatString.length - 2);
            hasComma = formatString.indexOf(comma) != -1;
            psplit = formatString.replace(I18NFormatCleanRe, '').split(dec);
        } else {
            hasComma = formatString.indexOf(',') != -1;
            psplit = formatString.replace(formatCleanRe, '').split('.');
        }
        if (psplit.length > 2) {
            Ext.Error.raise({
                sourceClass: "Ext.util.Format",
                sourceMethod: "number",
                value: v,
                formatString: formatString,
                msg: "Invalid number format, should have no more than 1 decimal"
            });
        } else if (psplit.length > 1) {
            v = Ext.Number.toFixed(v, psplit[1].length);
        } else {
            v = Ext.Number.toFixed(v, 0);
        }
        fnum = v.toString();
        psplit = fnum.split('.');
        if (hasComma) {
            cnum = psplit[0];
            parr = [];
            j = cnum.length;
            m = Math.floor(j / 3);
            n = cnum.length % 3 || 3;
            for (i = 0; i < j; i += n) {
                if (i !== 0) {
                    n = 3;
                }
                parr[parr.length] = cnum.substr(i, n);
                m -= 1;
            }
            fnum = parr.join(comma);
            if (psplit[1]) {
                fnum += dec + psplit[1];
            }
        } else {
            if (psplit[1]) {
                fnum = psplit[0] + dec + psplit[1];
            }
        }
        if (neg) {
            /*
             * Edge case. If we have a very small negative number it will get rounded to 0,
             * however the initial check at the top will still report as negative. Replace
             * everything but 1-9 and check if the string is empty to determine a 0 value.
             */
            neg = fnum.replace(/[^1-9]/g, '') !== '';
        }
        return (neg ? '-' : '') + formatString.replace(/[\d,?\.?]+/, fnum);
    },
    valueToRaw: function(value) {
        if (!this.useThousandSeparator)  {
            return this.callParent(arguments);
        }
        
        var me = this;
        var format = "000,000";
        for (var i = 0; i < me.decimalPrecision; i++) {
            if (i == 0) {
                format += ".";
            }
            format += "0";
        }
        //        if (value !== undefined && Ext.Number.toFixed(value, 0) == value) {
        //            console.log(Ext.Number.toFixed(value, 0),  value)
        //            format = "000,000";
        //        }
        value = me.parseValue(me.exNumber(value, format));
        value = me.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(me.toRawNumber(value));
        value = isNaN(value) ? '' : String(me.exNumber(value, format)).replace('.', me.decimalSeparator);
        return value;
    }
});

/***
 * 팝업을 호출하고 선택된 값을 설정한다.
 *
 */
Ext.define('eui.form.field.PopupTrigger', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.sppopup',
    hideLabel: true,
    /***** Custom Config Start *****/
    config: {
        tempTitle: null
    },
    cellCls: 'fo-table-row-td',
    displayField: 'ENG_VALUE',
    valueField: 'DT_CODE',
    triggers: {
        search: {
            cls: 'x-form-search-trigger',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },
    pConfigs: {
        DEFAULT: {
            width: 600,
            height: 400,
            popupClass: 'eui.ux.popup.DefaultPopup',
            autoSearch: true,
            url: 'api/COM050101SVC/getCode',
            convertparam: function(popupConfig, trigger) {
                var sqlparams = {};
                Ext.each(popupConfig.formConfig, function(p) {
                    if (p.singleCheckParam) {
                        sqlparams[p.name] = p['value'] = trigger.getValue();
                    }
                });
                return {
                    groupCode: popupConfig.groupCode,
                    SQL: Ext.apply(sqlparams, popupConfig.sql)
                };
            }
        },
        NONE: {}
    },
    /***** Custom Config End *****/
    selectedRecord: Ext.emptyFn,
    callBack: 'onTriggerCallback',
    /***
     * config의 유효성 체크.
     */
    validateConfig: function() {},
    /****
     * 클래스 내부 기본 설정과 외부 설정을 합쳐야한다.
     *
     */
    setpopupConfig: function() {},
    /***
     * 팝업 호출 전 한건인 경우 바로 설정한다.
     * @param field
     */
    checkSingleResult: function(field) {},
    onTriggerCallback: function(trigger, record, valueField, displayField) {
        trigger.setValues(record.get(valueField), record.get(displayField), [
            record
        ]);
    },
    setValues: function(code, name, records) {
        this.codeOldValue = this.getValue() , this.codeNewValue = code , this.nameOldValue = ((this.nextSibling() && this.nextSibling().xtype == 'sptext') ? this.nextSibling().getValue() : '') , this.nameNewValue = name;
        this.setValue(code);
        this.fireEvent('select', this, code, name, records, this.codeOldValue, this.nameOldValue);
    },
    onTriggerClick: function() {
        var me = this;
        var options = {
                trigger: this,
                popupConfig: me.popupConfig,
                multiReturnValue: this.multiReturnValue,
                selectedRecord: this.selectedRecord()
            };
        me.validateConfig();
        Ext.apply(options, this.setSingleRowCondition());
        if (!me.popupConfig.title && me.getTempTitle()) {
            me.popupConfig.title = me.getTempTitle();
        }
        Util.commonPopup(this, me.popupConfig.title, me.popupConfig.popupClass, me.popupConfig.width, me.popupConfig.height, options, null, true).show();
    },
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            enableKeyEvents: true
        });
        me.setpopupConfig();
        me.callParent(arguments);
        me.addListener('specialkey', this.setSpecialKey, this);
        me.on('blur', me.onBlurHandler, this, {
            //            delay: 100,
            scope: this
        });
    },
    resetValues: function() {
        var me = this;
        if (!me.readOnly) {
            me.setValue();
            if (me.nextSibling()) {
                me.nextSibling().setValue();
                me.resetNextEditField();
            } else if (me.column) {}
        }
    },
    /***
     * 검색어를 수정하고 떠나면 리셋한다.
     */
    onBlurHandler: function() {
        var me = this;
        var grid = me.up('grid');
        if (grid) {} else //            // 다음 컬럼을 리셋한다.
        //            var selModel = grid.getSelectionModel();
        //            selectedRecord = selModel.getLastSelected();
        //            if(me.rowIndex == grid.store.indexOf(selectedRecord)){
        //                if ((me.getValue() != this.codeNewValue) && !Ext.isEmpty(this.codeNewValue)) {
        //                    me.resetValues();
        //                }
        //            }
        {
            if ((me.getValue() != this.codeNewValue) && !Ext.isEmpty(this.codeNewValue)) {
                me.resetValues();
            }
        }
    },
    /****
     * 트리거에 입력된 값을 params에 포함시킨다.
     * singleRowCheckParamName 는 외부에서 입력할 수 있고 기본값도 가진다.
     * 기본값은
     * params {
     *      SEARCH_VALUE = "입력된값"
     * }
     * @returns {{}}
     */
    setSingleRowCondition: function() {},
    /***
     * 엔터키 입력 처리.
     * @param field
     * @param e
     * @param eOpts
     */
    setSpecialKey: function(field, e, eOpts) {
        var me = this;
        if (e.getKey() === Ext.EventObject.ENTER && !Ext.isEmpty(this.getValue())) {
            console.log('setSpecialKey:', me.popupConfig.groupCode, field.id);
            if (!this.checkSingleResult(field)) {
                field.onTriggerClick();
            }
        }
    },
    /***
     * 연계 설정된 컴포넌트를 찾아 리셋한다.
     */
    resetNextEditField: function() {
        // 연계설정이 없다면
        var me = this;
        if (me.nextEditField) {
            var grid = me.up('grid');
            var plugin = grid.findPlugin('cellediting');
            if (grid) {
                // 다음 컬럼을 리셋한다.
                var selModel = grid.getSelectionModel();
                selectedRecord = selModel.getLastSelected();
                selectedRecord.set(me.nextEditField, '');
                Ext.each(grid.columns, function(col) {
                    if (me.nextEditField == col.dataIndex) {
                        plugin.startEdit(selectedRecord, col);
                    }
                });
            } else {
                // 폼에 경우
                var target = Util.getOwnerCt(me).down("[searchId=" + me.nextEditField + "]");
                if (!Ext.isEmpty(target)) {
                    target.setValue("");
                }
            }
        }
    }
});

Ext.define('eui.form.field.PopupTrigger2', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.sppopup2',
    hideLabel: true,
    /***** Custom Config Start *****/
    config: {
        tempTitle: null
    },
    cellCls: 'fo-table-row-td',
    displayField: 'ENG_VALUE',
    valueField: 'DT_CODE',
    triggers: {
        search: {
            cls: 'x-form-search-trigger',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },
    singleRowCheckParamName: 'SEARCH_VALUE',
    // 검색 결과 코드
    codeNewValue: null,
    multiReturnValue: false,
    // 단건 조회를 위한 기본 통신 조건.
    pType: 'DEFAULT',
    pConfigs: {
        DEFAULT: {
            width: 600,
            height: 400,
            popupClass: 'eui.ux.popup.DefaultPopup',
            autoSearch: true,
            url: 'api/COM050101SVC/getCode',
            convertparam: function(popupOption, trigger) {
                var sqlparams = {};
                Ext.each(popupOption.formConfig, function(p) {
                    if (p.singleCheckParam) {
                        sqlparams[p.name] = p['value'] = trigger.getValue();
                    }
                });
                return {
                    groupCode: popupOption.groupCode,
                    SQL: Ext.apply(sqlparams, popupOption.sql)
                };
            }
        },
        NONE: {}
    },
    //            popupOption의 모든 내용을 외부에서 입력한다.
    /***** Custom Config End *****/
    selectedRecord: Ext.emptyFn,
    callBack: 'onTriggerCallback',
    /***
     * config의 유효성 체크.
     */
    validateConfig: function() {
        if (!this.popupOption.popupClass) {
            Ext.Error.raise({
                msg: '호출할 대상 팝업의 클래스명이 설정되지 않았습니다.'
            });
        }
    },
    /****
     * 클래스 내부 기본 설정과 외부 설정을 합쳐야한다.
     *
     */
    setPopupOption: function() {
        var me = this,
            config = Ext.clone(me.pConfigs[me.pType]);
        Ext.apply(config, me.popupOption);
        me.popupOption = config;
    },
    /***
     * 팝업 호출 전 한건인 경우 바로 설정한다.
     * @param field
     */
    checkSingleResult: function(field) {
        var me = this,
            popupOption = me.popupOption;
        /***
         * pConfig 내부에 각 pType별로 정의할 수 있다.
         * 존재하지 않는 경우 아래와 같이 기본 params를 반환하도록 한다.
         */
        if (!Ext.isFunction(popupOption.convertparam)) {
            popupOption.convertparam = function(a) {
                return {} || a.params;
            };
        }
        var params = Ext.apply(popupOption.convertparam(popupOption, me), me.setSingleRowCondition());
        if (Ext.isEmpty(this.getValue())) {
            return false;
        }
        if (Ext.isEmpty(popupOption.url)) {
            return false;
        }
        var retFlag = false;
        Util.CommonAjax({
            url: popupOption.url,
            params: params,
            pSync: false,
            pCallback: function(component, id, results, params) {
                if (results && results.data.length == 1) {
                    var record = Ext.create('Ext.data.Model', results.data[0]);
                    me.onTriggerCallback(me, record, me.valueField, me.displayField);
                    retFlag = true;
                } else {
                    retFlag = false;
                }
            }
        });
        return retFlag;
    },
    onTriggerCallback: function(trigger, record, codeField, nameField) {
        if (record.isModel) {
            trigger.setValues(record.get(codeField), record.get(nameField), [
                record
            ]);
        } else if (Ext.isArray(record)) {
            var ret = {
                    code: '',
                    name: ''
                };
            Ext.each(record, function(rec, idx) {
                var code = rec.get(codeField),
                    name = rec.get(nameField);
                if (idx == 0) {
                    ret.code = code;
                    ret.name = name;
                } else {
                    ret.code = ret.code + ',' + code;
                    ret.name = ret.name + ',' + name;
                }
            });
            trigger.setValues(ret.code, ret.name, record);
        }
    },
    setValues: function(code, name, records) {
        this.codeOldValue = this.getValue() , this.codeNewValue = code , this.nameOldValue = ((this.nextSibling() && this.nextSibling().xtype == 'sptextfield') ? this.nextSibling().getValue() : '') , this.nameNewValue = name;
        this.setValue(code);
        // 그리드에서 에디터로 사용
        if (this.column) {
            var grid = this.column.up('grid');
            var selModel = grid.getSelectionModel();
            selModel.getLastSelected().set(this.column.dataIndex, code);
        }
        this.resetNextEditField();
        // nextSibling이 label인 경우 방지
        if (this.nextSibling() && this.nextSibling().isFormField) {
            this.fireEvent('popupvaluechange', this, this.codeNewValue, this.codeOldValue, this.nameNewValue, this.nameOldValue, records);
        } else {
            this.fireEvent('popupvaluechange', this, code, name, records);
        }
    },
    onTriggerClick: function() {
        var me = this;
        var options = {
                trigger: this,
                popupOption: me.popupOption,
                multiReturnValue: this.multiReturnValue,
                selectedRecord: this.selectedRecord()
            };
        me.validateConfig();
        Ext.apply(options, this.setSingleRowCondition());
        if (!me.popupOption.title && me.getTempTitle()) {
            me.popupOption.title = me.getTempTitle();
        }
        Util.commonPopup(this, me.popupOption.title, me.popupOption.popupClass, me.popupOption.width, me.popupOption.height, options, null, true).show();
        this.fireEvent("ontriggerclick", this, event);
    },
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            enableKeyEvents: true
        });
        if (me.valueField) {
            Ext.apply(me, {
                valueField: me.valueField
            });
        }
        if (me.displayField) {
            Ext.apply(me, {
                displayField: me.displayField
            });
        }
        me.setPopupOption();
        me.callParent(arguments);
        me.addListener('specialkey', this.setSpecialKey, this);
        me.on('blur', me.onBlurHandler, this, {
            //            delay: 100,
            scope: this
        });
        me.on('afterrender', function() {
            var compare = this;
            if ('sppopuptriggerset' === this.ownerCt.xtype || 'sptriggercombo' === this.ownerCt.xtype) {
                compare = this.ownerCt;
            }
            var hlabel = compare.previousSibling();
            if (hlabel && hlabel.xtype === 'euilabel') {
                this.setTempTitle(hlabel.text);
            }
            if (this.ownerCt.xtype === 'editor') {
                this.setTempTitle(this.ownerCt.context.column.text);
            }
        });
    },
    resetValues: function() {
        var me = this;
        if (!me.readOnly) {
            me.setValue();
            if (me.nextSibling()) {
                me.nextSibling().setValue();
                me.resetNextEditField();
            } else if (me.column) {
                Ext.defer(function() {}, // me.recorvery_selectedRecord.set(me.column.dataIndex, '');
                10);
            }
        }
    },
    /***
     * 검색어를 수정하고 떠나면 리셋한다.
     */
    onBlurHandler: function() {
        var me = this;
        var grid = me.up('grid');
        if (grid) {} else //            // 다음 컬럼을 리셋한다.
        //            var selModel = grid.getSelectionModel();
        //            selectedRecord = selModel.getLastSelected();
        //            if(me.rowIndex == grid.store.indexOf(selectedRecord)){
        //                if ((me.getValue() != this.codeNewValue) && !Ext.isEmpty(this.codeNewValue)) {
        //                    me.resetValues();
        //                }
        //            }
        {
            if ((me.getValue() != this.codeNewValue) && !Ext.isEmpty(this.codeNewValue)) {
                me.resetValues();
            }
        }
    },
    /****
     * 트리거에 입력된 값을 params에 포함시킨다.
     * singleRowCheckParamName 는 외부에서 입력할 수 있고 기본값도 가진다.
     * 기본값은
     * params {
     *      SEARCH_VALUE = "입력된값"
     * }
     * @returns {{}}
     */
    setSingleRowCondition: function() {
        if (this.popupOption.singleRowCheckParamName) {
            this.singleRowCheckParamName = this.popupOption.singleRowCheckParamName;
        }
        var params = {};
        params[this.singleRowCheckParamName] = this.getValue();
        if (!Ext.isEmpty(this.popupOption.params)) {
            Ext.apply(params, this.popupOption.params);
        }
        return params;
    },
    /***
     * 엔터키 입력 처리.
     * @param field
     * @param e
     * @param eOpts
     */
    setSpecialKey: function(field, e, eOpts) {
        var me = this;
        if (e.getKey() === Ext.EventObject.ENTER && !Ext.isEmpty(this.getValue())) {
            console.log('setSpecialKey:', me.popupOption.groupCode, field.id);
            if (!this.checkSingleResult(field)) {
                field.onTriggerClick();
            }
        }
    },
    /***
     * 연계 설정된 컴포넌트를 찾아 리셋한다.
     */
    resetNextEditField: function() {
        // 연계설정이 없다면
        var me = this;
        if (me.nextEditField) {
            var grid = me.up('grid');
            var plugin = grid.findPlugin('cellediting');
            if (grid) {
                // 다음 컬럼을 리셋한다.
                var selModel = grid.getSelectionModel();
                selectedRecord = selModel.getLastSelected();
                selectedRecord.set(me.nextEditField, '');
                Ext.each(grid.columns, function(col) {
                    if (me.nextEditField == col.dataIndex) {
                        plugin.startEdit(selectedRecord, col);
                    }
                });
            } else {
                // 폼에 경우
                var target = Util.getOwnerCt(me).down("[searchId=" + me.nextEditField + "]");
                if (!Ext.isEmpty(target)) {
                    target.setValue("");
                }
            }
        }
    }
});

Ext.define('eui.form.field.PopupTriggerSet', {
    extend: 'eui.form.FieldContainer',
    alias: 'widget.sppopupset',
    requires: [
        'eui.form.field.PopupTrigger'
    ],
    /***** Custom Config Start *****/
    codeFieldName: null,
    textFieldName: null,
    /***** Custom Config End *****/
    setCallBackData: function(trigger, codeNewValue, nameNewValue, codeOldValue, nameOldValue, records) {
        this.down('sptext').setValue(nameNewValue);
    },
    bindVar: {
        CD: null,
        NM: null
    },
    initComponent: function() {
        var me = this;
        var options = {
                width: '60%',
                allowBlank: me.allowBlank || true,
                // 필수 처리 추가
                name: me.codeFieldName,
                xtype: 'sppopup',
                bind: me.bindVar.CD,
                listeners: {
                    select: {
                        fn: 'setCallBackData',
                        scope: me
                    }
                }
            };
        if (me.valueField) {
            Ext.apply(options, {
                valueField: me.valueField
            });
        }
        if (me.displayField) {
            Ext.apply(options, {
                displayField: me.displayField
            });
        }
        if (me.popupConfig) {
            Ext.apply(options, {
                popupConfig: me.popupConfig
            });
        }
        var sppopup = Ext.widget('sppopup', options);
        me.relayEvents(sppopup, [
            'select'
        ]);
        Ext.apply(me, {
            items: [
                sppopup,
                {
                    name: me.textFieldName,
                    allowBlank: me.allowBlank || true,
                    // 필수 처리 속성 추가
                    width: '40%',
                    readOnly: true,
                    bind: me.bindVar.NM,
                    xtype: 'euitext'
                }
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('eui.form.field.PopupTriggerSet2', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.sppopupset2',
    requires: [
        'eui.form.field.PopupTrigger'
    ],
    /***** Custom Config Start *****/
    codeFieldName: null,
    textFieldName: null,
    /***** Custom Config End *****/
    setCallBackData: function(trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records) {
        this.down('sptextfield').setValue(nameNewValue);
        this.fireEvent('popupvaluechange', trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records);
    },
    bindVar: {
        CD: null,
        NM: null
    },
    width: '100%',
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        var options = {
                width: '40%',
                allowBlank: me.allowBlank || true,
                // 필수 처리 추가
                name: me.codeFieldName,
                xtype: 'sppopup',
                bind: me.bindVar.CD,
                listeners: {
                    popupvaluechange: {
                        fn: 'setCallBackData',
                        scope: me
                    }
                }
            };
        Ext.apply(options, {
            popupOption: me.popupOption
        });
        if (me.valueField) {
            Ext.apply(options, {
                valueField: me.valueField
            });
        }
        if (me.pType) {
            Ext.apply(options, {
                pType: me.pType
            });
        }
        if (me.displayField) {
            Ext.apply(options, {
                displayField: me.displayField
            });
        }
        if (me.popupOption) {
            Ext.apply(options, {
                popupOption: me.popupOption
            });
        }
        Ext.apply(me, {
            layout: 'column',
            items: [
                options,
                {
                    name: me.textFieldName,
                    allowBlank: me.allowBlank || true,
                    // 필수 처리 속성 추가
                    width: '60%',
                    readOnly: true,
                    bind: me.bindVar.NM,
                    xtype: 'euitext'
                }
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('eui.form.field.Radio', {
    extend: 'Ext.form.field.Radio',
    alias: 'widget.spradio',
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },
    getValue: function() {
        return this.getSubmitValue();
    }
});

Ext.define('eui.form.field.Text', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.euitext',
    cellCls: 'fo-table-row-td',
    width: '100%',
    fieldStyle: {
        display: 'inherit'
    }
});

Ext.define('eui.form.field.TextArea', {
    extend: 'Ext.form.field.TextArea',
    alias: 'widget.euitextarea',
    cellCls: 'fo-table-row-td',
    width: '100%',
    height: 100,
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

Ext.define('eui.form.field.Trigger', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.sptrigger',
    cellCls: 'fo-table-row-td',
    triggers: {
        search: {
            //            cls: 'x-form-clear-trigger',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },
    onTriggerClick: function() {
        //noinspection JSUnresolvedFunction
        this.setValue('');
        this.fireEvent("ontriggerclick", this, event);
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

Ext.define('eui.form.field.TriggerCombo', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.sptriggercombo',
    requires: [
        'eui.form.field.PopupTrigger'
    ],
    /***** Custom Config Start *****/
    codeFieldName: null,
    textFieldName: null,
    comboFieldName: null,
    /***** Custom Config End *****/
    setCallBackData: function(trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records) {
        this.down('hcombobox').setValue(nameNewValue);
        this.fireEvent('popupvaluechange', trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records);
    },
    width: '100%',
    bindVar: {
        CD: null,
        NM: null
    },
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        var options = {
                width: '40%',
                allowBlank: me.allowBlank || true,
                // 필수 처리 추가
                name: me.codeFieldName,
                xtype: 'sppopuptrigger',
                bind: me.bindVar.CD,
                listeners: {
                    popupvaluechange: {
                        fn: 'setCallBackData',
                        scope: me
                    }
                }
            };
        Ext.apply(options, {
            popupOption: me.popupOption
        });
        if (me.valueField) {
            Ext.apply(options, {
                valueField: me.valueField
            });
        }
        if (me.pType) {
            Ext.apply(options, {
                pType: me.pType
            });
        }
        if (me.displayField) {
            Ext.apply(options, {
                displayField: me.displayField
            });
        }
        if (me.popupOption) {
            Ext.apply(options, {
                popupOption: me.popupOption
            });
        }
        Ext.apply(me, {
            layout: 'column',
            items: [
                options,
                {
                    width: '60%',
                    displayField: me.displayField,
                    valueField: me.displayField,
                    name: me.comboFieldName,
                    editable: true,
                    allowBlank: me.allowBlank || true,
                    // 필수 처리 속성 추가
                    groupCode: ((me.popupOption) ? me.popupOption.groupCode : ''),
                    sql: ((me.popupOption) ? me.popupOption.sql : ''),
                    bind: me.bindVar.NM,
                    xtype: 'spcombo',
                    listeners: {
                        select: {
                            fn: function(combo, record) {
                                // Ext 5.0 array - > 5.1 model
                                if (Ext.isArray(record)) {
                                    record = record[0];
                                }
                                var codeField = this.down('sppopuptrigger');
                                codeField.codeNewValue = record.get(this.valueField);
                                codeField.setValue(record.get(this.valueField));
                                this.fireEvent('popupvaluechange', combo, null, null, null, null, [
                                    record
                                ]);
                            },
                            scope: me
                        }
                    }
                }
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('eui.grid.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.euigrid',
    columnLines: true,
    //    ui: 'basicgrid',
    localeProperties: [
        'title'
    ],
    mixins: [
        'eui.mixin.Panel'
    ],
    config: {
        showRowAddBtn: false,
        showRowDelBtn: false,
        showRowRegBtn: false,
        showRowModBtn: false,
        showRowSaveBtn: false,
        // defaultButtons에 추가할 버튼을 정의한다.
        otherButtons: null,
        usePagingToolbar: false
    },
    initComponent: function() {
        var me = this;
        me.setBottomToolbar();
        me.callParent(arguments);
    },
    checkComplete: function(editor, context) {
        var view = context.grid.getView(),
            rowIdx = context.rowIdx,
            record = context.record,
            nodeId = context.node.id;
        if (record.dirty) {
            context.grid.selModel.doDeselect(record);
            Ext.get(nodeId).select('.x-grid-row-checker').elements[0].click();
        } else {
            context.grid.selModel.doDeselect(record);
        }
    },
    /***
     * 그리드 내부 에디터
     * @param editor
     * @param context
     */
    checkDeselect: function(editor, context) {
        var view = context.grid.getView(),
            rowIdx = context.rowIdx,
            record = context.record,
            nodeId = context.node.id;
        context.grid.selModel.doDeselect(record);
        Ext.get(nodeId).select('.x-grid-row-checker').elements[0].click();
    },
    onRender: function(cmp) {
        this.setPagingToolbarStore();
        this.callParent(arguments);
    },
    /***
     * Paging Toolbar store를 설정한다.
     */
    setPagingToolbarStore: function() {
        var me = this;
        if (me.getUsePagingToolbar()) {
            if (this.bind && this.bind['store']) {
                this.down('pagingtoolbar').setBind({
                    store: '{' + this.bind.store.stub.name + '}'
                });
            } else if (this.store) {
                this.down('pagingtoolbar').bindStore(this.store);
            }
        }
    },
    /***
     * 행추가 처리.
     * @param grid
     * @param data
     * @param idx
     * @param callback
     * @example
     * // 확장한 클래스 내부 메소드로 override 할 경우
     * onRowAdd: function () {
     *      // this.callParent를 꼭 호출하고 arguments를 전달한다.
     *      this.callParent([this, {
     *        ULD_NO : '111222'
     *    },0, function () {    // callback이 필요할 경우 구현한다.
     *        console.log('그리드 내부에서 콜백철...')
     *    }]);
     * }
     * // 뷰컨트롤러에서 처리하려 할 경우. spgridaddrow이벤트 리스너를 구현한다.
     * listeners: {
     *      rowAddBtnClick: 'myControlMethod'
     * }
     *
     * // 뷰컨트롤러의 myControlMethod
     *  myControlMethod: function (grid) {
     *      // onRowAdd메소드를 직접호출한다. 원치 않을 경우 자체 로직으로 처리하고 호출하지 않을 수 있다.
     *      grid.superclass.onRowAdd(
     *          grid,   // 해당 그리드
     *          {       // 추가할 모델오브젝트
     *              ULD_NO : '111'
     *          },
     *          0,      // 추가할 위치
     *          this.myCallback, // 추가 이후 콜백이 필요하면 컨트롤러 내부에 구현한다.
     *          this    // 콜백에서 사용할 scope이다. this를 전달하지 않을 경우 콜백 내부에서 this는 grid가 된다.
     *     );
     *  }
     */
    onRowAdd: function(grid, data, idx, callback, scope) {
        if (!idx) {
            idx = 0;
        }
        var store = grid.getStore();
        if (Ext.isEmpty(idx)) {
            store.add(data);
        } else {
            store.insert(idx, data);
        }
        var index = store.indexOf(data);
        //        grid.getView().focusRow(index);
        console.log('index', index);
        var selectionModel = grid.getSelectionModel();
        selectionModel.select(index);
        if (Ext.isEmpty(scope)) {
            scope = grid;
        }
        if (Ext.isFunction(callback)) {
            Ext.callback(callback, scope, [
                grid,
                selectionModel.getSelection()[0]
            ]);
        }
    },
    /***
     * 선택된 로우를 삭제처리한다.
     * @param grid
     * @param callback
     * @param scope
     */
    onRowDelete: function(grid, callback, scope) {
        var sel = grid.getSelection(),
            model = grid.getSelection()[0],
            list;
        if (!model || !model.isModel) {
            Ext.Msg.alert('Erorr', '#{삭제할 항목을 선택하여 주십시오}');
            return;
        }
        if (Ext.isArray(sel) && sel.length > 1) {
            list = [];
            Ext.Array.each(sel, function(itm) {
                list.push(itm.getData());
            });
        }
        if (Ext.isEmpty(scope)) {
            scope = grid;
        }
        Ext.Msg.show({
            title: '#{삭제}',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: '#{삭제하시겠습니까?}',
            fn: function(btn) {
                if (btn === 'yes') {
                    // 위치 고민...
                    //                    grid.store.remove(sel);
                    if (Ext.isFunction(callback)) {
                        Ext.callback(callback, scope, [
                            grid.store,
                            sel
                        ]);
                    }
                }
            }
        });
    },
    onSave: function(grid) {
        var me = this;
        me.store.sync();
    },
    onReload: function() {
        var me = this;
        me.store.reload();
    },
    setBottomToolbar: function() {
        var me = this;
        var buttons = [
                {
                    xtype: 'spbutton',
                    text: '#{행추가}',
                    iconCls: '#{행추가아이콘}',
                    scope: me,
                    hidden: !me.getShowRowAddBtn(),
                    listeners: {
                        click: function() {
                            if (me.hasListeners['SPGridRowAdd'.toLowerCase()]) {
                                me.fireEvent('SPGridRowAdd', me);
                            } else {
                                me.onRowAdd(me, {
                                    randomInt: Ext.Number.randomInt(1, 1.0E12)
                                }, 0, null);
                            }
                        }
                    }
                },
                {
                    xtype: 'spbutton',
                    iconCls: '#{행삭제아이콘}',
                    text: '#{행삭제}',
                    scope: me,
                    hidden: !me.getShowRowDelBtn(),
                    listeners: {
                        click: function() {
                            if (me.hasListeners['SPGridRowDel'.toLowerCase()]) {
                                me.fireEvent('SPGridRowDel', me);
                            } else {
                                me.onRowDel(me, null, me);
                            }
                        }
                    }
                },
                {
                    xtype: 'spbutton',
                    text: '#{등록}',
                    iconCls: '#{등록아이콘}',
                    hidden: !me.getShowRowRegBtn(),
                    listeners: {
                        click: function() {
                            me.fireEvent('SPGridRowReg', me);
                        }
                    }
                },
                {
                    xtype: 'spbutton',
                    text: '#{수정}',
                    iconCls: '#{수정아이콘}',
                    hidden: !me.getShowRowModBtn(),
                    listeners: {
                        click: function() {
                            me.fireEvent('SPGridRowMod', me);
                        }
                    }
                },
                {
                    xtype: 'spbutton',
                    text: '#{저장}',
                    iconCls: '#{저장아이콘}',
                    hidden: !me.getShowRowSaveBtn(),
                    listeners: {
                        click: function() {
                            if (me.hasListeners['SPGridRowSave'.toLowerCase()]) {
                                me.fireEvent('SPGridRowSave', me);
                            } else {
                                me.onRowSave();
                            }
                        }
                    }
                }
            ];
        var btns = this.applyButtonToolBar(buttons, this.otherButtons);
        if (me.getUsePagingToolbar()) {
            if (Ext.isEmpty(me.dockedItems)) {
                me.dockedItems = [];
            }
            me.dockedItems.push({
                xtype: 'pagingtoolbar',
                dock: 'bottom',
                displayInfo: true
            });
        }
    }
});

Ext.define('eui.grid.column.Check', {
    extend: 'Ext.grid.column.Check',
    alias: 'widget.spcheckcolumn',
    isRecordChecked: function(record) {
        var prop = this.property;
        if (prop) {
            return record[prop] == 'Y';
        }
        return record.get(this.dataIndex) == 'Y';
    },
    setRecordCheck: function(record, checked, cell, row, e) {
        var me = this,
            prop = me.property,
            val = checked ? 'Y' : 'N';
        if (prop) {
            record[prop] = val;
        } else {
            record.set(me.dataIndex, val);
        }
        me.updater(cell, checked);
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

Ext.define('eui.grid.column.Column', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.spcolumn',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

Ext.define('eui.mvvm.GridRenderer', {
    extend: 'Ext.Mixin',
    mixinId: 'gridrenderer',
    dateRenderer: function(v) {
        var date;
        if (Ext.isDate(v)) {
            return Ext.Date.format(v, 'Y/m/d');
        } else if (Ext.Date.parse(v, 'Ymd')) {
            date = Ext.Date.parse(v, 'Ymd');
            return Ext.Date.format(date, 'Y/m/d');
        } else {
            return v;
        }
    },
    currencyRenderer: function(v) {
        if (Ext.isNumber(v)) {
            return Ext.util.Format.number(v, '#,###.##');
        } else {
            return v;
        }
    }
});

Ext.define('eui.grid.column.Date', {
    extend: 'Ext.grid.column.Date',
    alias: 'widget.spdatecolumn',
    format: 'Y/m/d',
    align: 'center',
    width: 100,
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    initComponent: function() {
        var me = this;
        if (!me.renderer) {
            me.renderer = me.dateRenderer;
        }
        me.callParent(arguments);
    }
});

Ext.define('eui.grid.column.Number', {
    extend: 'Ext.grid.column.Number',
    alias: 'widget.spnumbercolumn',
    align: 'right',
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    initComponent: function() {
        var me = this;
        if (!me.renderer) {
            me.renderer = me.currencyRenderer;
        }
        me.callParent(arguments);
    }
});

/***
 * 모든 모듈에서 실행된다.
 * 공통 config, method 등.
 */
Ext.define("eui.mixin.BaseContainer", {
    extend: 'Ext.Mixin',
    mixinConfig: {},
    config: {}
});

Ext.define("eui.mvvm.GridViewController", {
    extend: 'Ext.Mixin',
    mixinId: 'gridviewcontroller',
    mixinConfig: {},
    config: {},
    // 그리드 행 추가
    onRowAdd: function(grid, data, idx) {
        console.log(arguments);
        return;
        var store = grid.getStore();
        if (Ext.isEmpty(idx)) {
            store.add(data);
        } else {
            store.insert(idx, data);
        }
        var index = store.indexOf(data);
        grid.getView().focusRow(index);
        Ext.get(Ext.get(grid.getView().getRow(index)).id).select('.x-grid-row-checker').elements[0].click();
    },
    /***
     * 선택된 로우를 삭제처리한다.
     * @param button
     * @param serviceUrl    삭제 주소
     * @param dataPrefix    내부 구분
     * @param callback      후처리
     */
    onRowDel: function(button, srvOpt, callback) {
        var me = this,
            controller = this.getMyViewController(button),
            dataPrefix = srvOpt.prefix,
            grid = button.up('grid'),
            sel = button.up('grid').getSelection(),
            model = grid.getSelection()[0];
        //선택된 레코드
        var list;
        if (!model || !model.isModel) {
            Ext.Msg.alert('Erorr', '삭제할 항목을 선택하여 주십시오');
            return;
        }
        if (Ext.isArray(sel) && sel.length > 1) {
            list = [];
            Ext.Array.each(sel, function(itm) {
                list.push(itm.getData());
            });
        }
        if (!Ext.isFunction(callback)) {
            callback = function() {
                grid.store.load();
                Ext.Msg.alert('확인', '처리가 완료되었습니다.');
            };
        }
        Ext.Msg.show({
            title: '삭제',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: '삭제하시겠습니까?',
            fn: function(btn) {
                if (btn === 'yes') {
                    // 위치 고민...
                    grid.store.remove(sel);
                    srvOpt.params = {};
                    srvOpt.params[dataPrefix] = {
                        deleteData: list || [
                            model.getData()
                        ]
                    };
                    srvOpt.params['__scopeGrid'] = grid;
                    srvOpt.pCallback = callback;
                    srvOpt.pScope = controller;
                    Util.CommonAjax(srvOpt);
                }
            }
        });
    },
    getMyViewController: function(component) {
        if (Util.getOwnerCt(component).xtype === 'window') {
            return Util.getOwnerCt(component).items.items[0].getController();
        } else {
            // hbasecontainer
            return Util.getOwnerCt(component).getController();
        }
        return null;
    },
    /***
     * private 내부 처리용.
     * @param button
     * @param serviceUrl
     * @param dataPrefix
     * @param callback
     */
    onRowDataUpdate: function(button, srvOpt, callback) {
        var grid = button.up('grid'),
            dataPrefix = srvOpt.prefix,
            controller = this.getMyViewController(button),
            modifyRecords = grid.store.getModifiedRecords();
        if (!Ext.isDefined(callback)) {
            callback = function() {
                grid.store.load();
                Ext.Msg.alert('확인', '처리가 완료되었습니다.');
            };
        }
        srvOpt.params = {};
        srvOpt.params[dataPrefix] = Util.getDatasetParam(grid.store);
        srvOpt.params['__scopeGrid'] = grid;
        srvOpt.pCallback = callback;
        srvOpt.pScope = controller;
        Util.CommonAjax(srvOpt);
    },
    /***
     * 그리드 공통 "등록"
     * 그리드의 수정된 데이터를 전송하고 서버사이드에서는 입력처리한다
     * @param button
     * @param serviceUrl    삭제 주소
     * @param dataPrefix    내부 구분
     * @param callback      후처리
     */
    onRowReg: function(button, cfg, callback) {
        var grid = button.up('grid'),
            modifyRecords = grid.store.getModifiedRecords(),
            i = 0;
        Ext.each(modifyRecords, function(rec) {
            if (!rec.phantom) {
                i++;
            }
        });
        if (i === 0) {
            Ext.Msg.alert('확인', '대상 레코드가 존재하지 않습니다.');
            return;
        }
        this.onRowDataUpdate(button, cfg, callback);
    },
    /***
     * 그리드 공통 "수정"
     * 신규 레코드가 존재할 경우 진행하지 않는다.
     * 수정된 레코듬만 대상이다.
     * @param button
     * @param serviceUrl
     * @param dataPrefix
     * @param callback
     */
    onRowMod: function(button, srvOpt, callback) {
        var grid = button.up('grid'),
            newRecords = grid.store.getNewRecords(),
            modifyRecords = grid.store.getModifiedRecords(),
            i = 0;
        if (newRecords.length > 0) {
            Ext.Msg.alert('확인', '등록이 필요합니다.');
            return;
        }
        Ext.each(modifyRecords, function(rec) {
            if (!rec.phantom) {
                i++;
            }
        });
        if (i === 0) {
            Ext.Msg.alert('확인', '대상 레코드가 존재하지 않습니다.');
            return;
        }
        this.onRowDataUpdate(button, srvOpt, callback);
    },
    /***
     * 그리드 공통 "저장"
     * 입력 , 수정된 데이터가 대상이다.
     * @param button
     * @param serviceUrl
     * @param dataPrefix
     * @param callback
     */
    onRowSave: function(button, srvOpt, callback) {
        var grid = button.up('grid'),
            modifyRecords = grid.store.getModifiedRecords(),
            i = 0;
        if (modifyRecords.length === 0) {
            Ext.Msg.alert('확인', '대상 레코드가 존재하지 않습니다.');
            return;
        }
        this.onRowDataUpdate(button, srvOpt, callback);
    }
});

Ext.define('eui.mvvm.HViewModel', {
    extend: 'Ext.app.ViewModel'
});

Ext.define('eui.mvvm.ViewController', {
    extend: 'Ext.app.ViewController',
    mixins: [
        'eui.mixin.FormField',
        'eui.mvvm.GridViewController',
        'eui.mvvm.GridRenderer'
    ],
    requires: [
        'eui.Util'
    ],
    init: function() {
        var vm = this.vm = this.getViewModel(),
            view = this.view = this.getView();
    },
    /***** form 관련 *******/
    /***
     * 공통 폼 저장 처리. 무조건 재정의 해야한다.
     */
    baseFormSave: function(form, srvOpt, callback) {
        var alertTitle = srvOpt.alertTitle || "저장",
            alertMsg = srvOpt.alertMsg || "처리하시겠습니까?";
        srvOpt.pCallback = function(formpanel, input, output, svrId) {
            Ext.Msg.alert('처리완료', '처리가 완료되었습니다.');
            if (Ext.isFunction(callback)) {
                callback(formpanel, input, output, svrId);
            }
        };
        HMsg.show({
            title: alertTitle,
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: alertMsg,
            fn: function(btn) {
                if (btn === 'yes') {
                    srvOpt.pScope = form;
                    Util.CommonAjax(srvOpt);
                }
            }
        });
    },
    transaction: function(transactionID, className, methodName, outgoingDataset, incomingDataset, additionalParameters, showLoadMask, userCallBack, timeout) {
        var option = {
                url: Ext.util.Format.format('/{0}/{1}/', Util.getContextPath(), Util.getBaseUrl()),
                async: true,
                method: 'POST',
                success: function(response, options) {
                    Ext.getBody().unmask();
                    if (!Ext.isEmpty(response.responseText)) {
                        var returnData = Ext.decode(response.responseText),
                            result = returnData[0].result;
                        this.processCallback(result, incomingDataset, userCallBack);
                    }
                },
                failure: function(response, options) {
                    Ext.Msg.alert('Status', 'server-side failure with status code ' + response.status);
                    Ext.getBody().unmask();
                    this.processCallback(null, incomingDataset, userCallBack);
                },
                jsonData: {
                    action: className,
                    method: methodName,
                    tid: Ext.id(),
                    type: 'rpc',
                    data: []
                },
                scope: this,
                timeout: timeout || 30000,
                disableCaching: false
            };
        option = this.buildJsonData(option, outgoingDataset, additionalParameters, incomingDataset);
        if (showLoadMask) {
            Ext.getBody().mask('Please waiting...').dom.style.zIndex = '99999';
            if (!Ext.Ajax.hasListener('requestexception')) {
                Ext.Ajax.on('requestexception', function(conn, response, options) {
                    Ext.getBody().unmask();
                });
            }
        }
        Ext.Ajax.request(option);
    }
});

Ext.define('eui.panel.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.euipanel'
});
//    ui : 'highlight'

Ext.define('eui.toolbar.Command', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'commandtoolbar',
    ui: 'plain',
    config: {
        showText: true,
        showRowAddBtn: false,
        showRowDelBtn: false,
        showRegBtn: false,
        showReloadBtn: false,
        showModBtn: false,
        showSaveBtn: false,
        showCloseBtn: false
    },
    initComponent: function() {
        var me = this,
            owner = this.up('grid,form');
        Ext.apply(me, {
            items: [
                {
                    xtype: 'euibutton',
                    text: '#{행추가}',
                    iconCls: '#{행추가아이콘}',
                    scope: me,
                    showText: me.getShowText(),
                    hidden: !me.getShowRowAddBtn(),
                    listeners: {
                        click: function() {
                            if (owner.hasListeners['rowAddBtnClick'.toLowerCase()]) {
                                owner.fireEvent('rowAddBtnClick', owner);
                            } else {
                                owner.onRowAdd(owner, {
                                    randomInt: Ext.Number.randomInt(1, 1.0E12)
                                }, 0, null);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    iconCls: '#{행삭제아이콘}',
                    text: '#{행삭제}',
                    scope: me,
                    hidden: !me.getShowRowDelBtn(),
                    listeners: {
                        click: function() {
                            if (owner.hasListeners['rowDeleteBtnClick'.toLowerCase()]) {
                                owner.fireEvent('rowDeleteBtnClick', owner);
                            } else {
                                owner.onRowDelete(owner, null, owner);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{등록}',
                    iconCls: '#{등록아이콘}',
                    hidden: !me.getShowRegBtn(),
                    listeners: {
                        click: function() {
                            owner.fireEvent('regBtnClick', owner);
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{수정}',
                    iconCls: '#{수정아이콘}',
                    hidden: !me.getShowModBtn(),
                    listeners: {
                        click: function() {
                            owner.fireEvent('modBtnClick', owner);
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{저장}',
                    formBind: true,
                    iconCls: '#{저장아이콘}',
                    hidden: !me.getShowSaveBtn(),
                    listeners: {
                        click: function() {
                            if (owner.hasListeners['saveBtnClick'.toLowerCase()]) {
                                owner.fireEvent('saveBtnClick', owner);
                            } else {
                                owner.onSave(owner);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{조회}',
                    iconCls: '#{저장아이콘}',
                    hidden: !me.getShowReloadBtn(),
                    listeners: {
                        click: function() {
                            if (owner.hasListeners['reloadBtnClick'.toLowerCase()]) {
                                owner.fireEvent('reloadBtnClick', owner);
                            } else {
                                owner.onReload();
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{닫기}',
                    iconCls: 'x-fa fa-sign-out',
                    hidden: !me.getShowCloseBtn(),
                    listeners: {
                        click: function() {
                            var window = Util.getOwnerCt(this);
                            if (Util.getOwnerCt(this).xtype === 'window') {
                                window.close();
                            } else {
                                Ext.Error.raise({
                                    msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                                });
                            }
                        }
                    }
                }
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('eui.ux.popup.DefaultPopup', {
    extend: 'eui.container.PopupContainer',
    alias: 'widget.popup-default',
    requires: [],
    viewModel: {
        stores: {
            commonpopupStore: {
                autoLoad: true,
                remoteSort: true,
                fields: [],
                proxy: {
                    type: 'rest',
                    url: 'api/COM050101SVC/getPopup',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            }
        }
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    autoScroll: true,
    setCallbackData: function() {
        console.log(this);
        var record = Ext.create('Ext.data.Model', {
                CD: 'AAAA',
                CD_NM: '코드명'
            });
        this.parentCallBack(record, 'CD', 'CD_NM');
        this.up('window').close();
    },
    /***
     *
     */
    beforeRender: function() {
        var me = this,
            formConfig = this.__PARAMS.popupConfig.formConfig,
            length = formConfig.length,
            tableColumns = me.items.items[0].tableColumns,
            colspan = (length * 2) % tableColumns == 0 ? 0 : ((tableColumns + 1) - (length * 2) % tableColumns);
        // formpanel title
        if (this.__PARAMS.popupConfig.title) {
            me.items.items[0].title = this.__PARAMS.popupConfig.title;
        } else {
            me.items.items[0].setHiddenHeader(true);
        }
        Ext.each(formConfig, function(item, idx) {
            me.items.items[0].add({
                xtype: 'euilabel',
                text: item.label
            }, Ext.apply(item, {
                colspan: (idx === (length - 1) ? colspan : 0)
            }));
        });
        this.callParent(arguments);
    },
    onSearch: function(type) {
        var me = Util.getOwnerCt(this).down('sppopupcontainer'),
            grid = me.down('spgrid'),
            popupConfig = me.__PARAMS.popupConfig;
        if (type == "S") {} else //시작은 sql이 우선
        //            var sql = Ext.apply(Util.getOwnerCt(me).down('spform').getValues(), popupConfig.sql);
        {}
        //            var sql = Ext.apply(popupConfig.sql, Util.getOwnerCt(me).down('spform').getValues()); //팝업은 검색조건이 우선시됨 JKM
        //        if (!Ext.isEmpty(popupConfig.addSearchOption)) {
        //            Ext.each(popupConfig.addSearchOption, function (field, idx) {
        //
        ////                var search = '[searchId=' + field.searchId + ']';
        ////                var value = field.reqValue;
        ////                if (!value) {
        ////                    value = Util.getOwnerCt(me.__PARENT).down(search).getSubmitValue();
        ////                }
        ////                if (sql) {
        ////                    sql[(field.reqName ? field.reqName : field.searchId)] = value;
        ////                }
        //            });
        //        }
        grid.store.getProxy().extraParams = {
            groupCode: popupConfig.groupCode
        };
        if (!popupConfig.hiddenColumns) {
            popupConfig.hiddenColumns = [];
        }
        grid.store.load({
            //            params: me.down('#popup').getForm().getValue(),
            callback: function(records, operation, success) {
                if (Ext.isEmpty(records) || records.length === 0) {
                    return;
                }
                var keys = Object.keys(records[0].getData());
                var columns = [];
                var formFields = [];
                var firstRecord = grid.store.getAt(0);
                var addColumn = function(key, idx) {
                        if (key !== 'id') {
                            if (!Ext.isArray(popupConfig.hiddenColumns)) {
                                popupConfig.hiddenColumns = [
                                    popupConfig.hiddenColumns
                                ];
                            }
                            var hiddenFlag = Ext.Array.filter(popupConfig.hiddenColumns, function(item) {
                                    return item.indexOf(key) != -1;
                                });
                            var langKey = Util.getLocaleValue(key),
                                langSize = 100;
                            if (!firstRecord.get(key)) {
                                return;
                            }
                            if (langKey.length < firstRecord.get(key).length) {
                                langKey = firstRecord.get(key);
                            }
                            if (langKey === 0) {
                                langSize = 200;
                            } else {
                                langSize = langKey.length * 10;
                                if (langSize < 100) {
                                    langSize = 100;
                                }
                            }
                            columns.push({
                                //                            hidden: (hiddenFlag.length === 0) ? false : true,
                                minWidth: langSize,
                                text: '#{' + key + '}',
                                dataIndex: key
                            });
                        }
                    };
                Ext.each(popupConfig && popupConfig.formConfig || [], function(itm) {
                    formFields.push(itm.name);
                });
                Ext.each(formFields, addColumn);
                Ext.each(formFields, function(itm) {
                    Ext.Array.remove(keys, itm);
                });
                Ext.each(keys, addColumn);
                grid.reconfigure(this.store, columns);
            }
        });
    },
    onLoad: function() {
        if (!this.__PARAMS.popupConfig.autoSearch) {
            return;
        }
        this.onSearch('S');
    },
    parentCallBack: function(view, record) {
        this.callParent([
            record
        ]);
    },
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            items: [
                {
                    tableColumns: 4,
                    hiddenCloseBtn: false,
                    hiddenHeader: true,
                    itemId: 'popup',
                    xtype: 'spform',
                    hiddenSearchBtn: false,
                    listeners: {
                        scome: me,
                        baseformsearch: me.onSearch
                    }
                },
                {
                    xtype: 'spgrid',
                    flex: 1,
                    usePagingToolbar: true,
                    bind: {
                        store: '{commonpopupStore}'
                    },
                    listeners: {
                        itemdblclick: {
                            fn: me.parentCallBack,
                            scope: me
                        },
                        afterrender: {
                            scope: me,
                            fn: 'onLoad',
                            delay: 500
                        }
                    },
                    forceFit: true,
                    columns: {
                        defaults: {
                            width: 120
                        },
                        items: [
                            {
                                text: '-',
                                dataIndex: 'temp'
                            }
                        ]
                    }
                }
            ]
        });
        this.callParent(arguments);
        this.on('afterrender', function() {
            var me = this;
        });
    }
});

Ext.define('eui.window.Notification', {
    extend: 'Ext.window.Window',
    alias: 'widget.uxNotification',
    cls: 'ux-notification-window',
    autoClose: true,
    autoHeight: true,
    plain: false,
    draggable: false,
    shadow: false,
    focus: Ext.emptyFn,
    // For alignment and to store array of rendered notifications. Defaults to document if not set.
    manager: null,
    useXAxis: false,
    // Options: br, bl, tr, tl, t, l, b, r
    position: 'br',
    // Pixels between each notification
    spacing: 6,
    // Pixels from the managers borders to start the first notification
    paddingX: 30,
    paddingY: 10,
    slideInAnimation: 'easeIn',
    slideBackAnimation: 'bounceOut',
    slideInDuration: 1500,
    slideBackDuration: 1000,
    hideDuration: 500,
    autoCloseDelay: 7000,
    stickOnClick: true,
    stickWhileHover: true,
    // Private. Do not override!
    isHiding: false,
    isFading: false,
    destroyAfterHide: false,
    closeOnMouseOut: false,
    // Caching coordinates to be able to align to final position of siblings being animated
    xPos: 0,
    yPos: 0,
    statics: {
        defaultManager: {
            el: null
        }
    },
    initComponent: function() {
        var me = this;
        // Backwards compatibility
        if (Ext.isDefined(me.corner)) {
            me.position = me.corner;
        }
        if (Ext.isDefined(me.slideDownAnimation)) {
            me.slideBackAnimation = me.slideDownAnimation;
        }
        if (Ext.isDefined(me.autoDestroyDelay)) {
            me.autoCloseDelay = me.autoDestroyDelay;
        }
        if (Ext.isDefined(me.autoHideDelay)) {
            me.autoCloseDelay = me.autoHideDelay;
        }
        if (Ext.isDefined(me.autoHide)) {
            me.autoClose = me.autoHide;
        }
        if (Ext.isDefined(me.slideInDelay)) {
            me.slideInDuration = me.slideInDelay;
        }
        if (Ext.isDefined(me.slideDownDelay)) {
            me.slideBackDuration = me.slideDownDelay;
        }
        if (Ext.isDefined(me.fadeDelay)) {
            me.hideDuration = me.fadeDelay;
        }
        // 'bc', lc', 'rc', 'tc' compatibility
        me.position = me.position.replace(/c/, '');
        me.updateAlignment(me.position);
        me.setManager(me.manager);
        me.callParent(arguments);
    },
    onRender: function() {
        var me = this;
        me.callParent(arguments);
        me.el.hover(function() {
            me.mouseIsOver = true;
        }, function() {
            me.mouseIsOver = false;
            if (me.closeOnMouseOut) {
                me.closeOnMouseOut = false;
                me.close();
            }
        }, me);
    },
    updateAlignment: function(position) {
        var me = this;
        switch (position) {
            case 'br':
                me.paddingFactorX = -1;
                me.paddingFactorY = -1;
                me.siblingAlignment = "br-br";
                if (me.useXAxis) {
                    me.managerAlignment = "bl-br";
                } else {
                    me.managerAlignment = "tr-br";
                };
                break;
            case 'bl':
                me.paddingFactorX = 1;
                me.paddingFactorY = -1;
                me.siblingAlignment = "bl-bl";
                if (me.useXAxis) {
                    me.managerAlignment = "br-bl";
                } else {
                    me.managerAlignment = "tl-bl";
                };
                break;
            case 'tr':
                me.paddingFactorX = -1;
                me.paddingFactorY = 1;
                me.siblingAlignment = "tr-tr";
                if (me.useXAxis) {
                    me.managerAlignment = "tl-tr";
                } else {
                    me.managerAlignment = "br-tr";
                };
                break;
            case 'tl':
                me.paddingFactorX = 1;
                me.paddingFactorY = 1;
                me.siblingAlignment = "tl-tl";
                if (me.useXAxis) {
                    me.managerAlignment = "tr-tl";
                } else {
                    me.managerAlignment = "bl-tl";
                };
                break;
            case 'b':
                me.paddingFactorX = 0;
                me.paddingFactorY = -1;
                me.siblingAlignment = "b-b";
                me.useXAxis = 0;
                me.managerAlignment = "t-b";
                break;
            case 't':
                me.paddingFactorX = 0;
                me.paddingFactorY = 1;
                me.siblingAlignment = "t-t";
                me.useXAxis = 0;
                me.managerAlignment = "b-t";
                break;
            case 'l':
                me.paddingFactorX = 1;
                me.paddingFactorY = 0;
                me.siblingAlignment = "l-l";
                me.useXAxis = 1;
                me.managerAlignment = "r-l";
                break;
            case 'r':
                me.paddingFactorX = -1;
                me.paddingFactorY = 0;
                me.siblingAlignment = "r-r";
                me.useXAxis = 1;
                me.managerAlignment = "l-r";
                break;
        }
    },
    getXposAlignedToManager: function() {
        var me = this;
        var xPos = 0;
        // Avoid error messages if the manager does not have a dom element
        if (me.manager && me.manager.el && me.manager.el.dom) {
            if (!me.useXAxis) {
                // Element should already be aligned vertically
                return me.el.getLeft();
            } else {
                // Using getAnchorXY instead of getTop/getBottom should give a correct placement when document is used
                // as the manager but is still 0 px high. Before rendering the viewport.
                if (me.position == 'br' || me.position == 'tr' || me.position == 'r') {
                    xPos += me.manager.el.getAnchorXY('r')[0];
                    xPos -= (me.el.getWidth() + me.paddingX);
                } else {
                    xPos += me.manager.el.getAnchorXY('l')[0];
                    xPos += me.paddingX;
                }
            }
        }
        return xPos;
    },
    getYposAlignedToManager: function() {
        var me = this;
        var yPos = 0;
        // Avoid error messages if the manager does not have a dom element
        if (me.manager && me.manager.el && me.manager.el.dom) {
            if (me.useXAxis) {
                // Element should already be aligned horizontally
                return me.el.getTop();
            } else {
                // Using getAnchorXY instead of getTop/getBottom should give a correct placement when document is used
                // as the manager but is still 0 px high. Before rendering the viewport.
                if (me.position == 'br' || me.position == 'bl' || me.position == 'b') {
                    yPos += me.manager.el.getAnchorXY('b')[1];
                    yPos -= (me.el.getHeight() + me.paddingY);
                } else {
                    yPos += me.manager.el.getAnchorXY('t')[1];
                    yPos += me.paddingY;
                }
            }
        }
        return yPos;
    },
    getXposAlignedToSibling: function(sibling) {
        var me = this;
        if (me.useXAxis) {
            if (me.position == 'tl' || me.position == 'bl' || me.position == 'l') {
                // Using sibling's width when adding
                return (sibling.xPos + sibling.el.getWidth() + sibling.spacing);
            } else {
                // Using own width when subtracting
                return (sibling.xPos - me.el.getWidth() - me.spacing);
            }
        } else {
            return me.el.getLeft();
        }
    },
    getYposAlignedToSibling: function(sibling) {
        var me = this;
        if (me.useXAxis) {
            return me.el.getTop();
        } else {
            if (me.position == 'tr' || me.position == 'tl' || me.position == 't') {
                // Using sibling's width when adding
                return (sibling.yPos + sibling.el.getHeight() + sibling.spacing);
            } else {
                // Using own width when subtracting
                return (sibling.yPos - me.el.getHeight() - sibling.spacing);
            }
        }
    },
    getNotifications: function(alignment) {
        var me = this;
        if (!me.manager.notifications[alignment]) {
            me.manager.notifications[alignment] = [];
        }
        return me.manager.notifications[alignment];
    },
    setManager: function(manager) {
        var me = this;
        me.manager = manager;
        if (typeof me.manager == 'string') {
            me.manager = Ext.getCmp(me.manager);
        }
        // If no manager is provided or found, then the static object is used and the el property pointed to the body document.
        if (!me.manager) {
            me.manager = me.statics().defaultManager;
            if (!me.manager.el) {
                me.manager.el = Ext.getBody();
            }
        }
        if (typeof me.manager.notifications == 'undefined') {
            me.manager.notifications = {};
        }
    },
    beforeShow: function() {
        var me = this;
        if (me.stickOnClick) {
            if (me.body && me.body.dom) {
                Ext.fly(me.body.dom).on('click', function() {
                    me.cancelAutoClose();
                    me.addCls('notification-fixed');
                }, me);
            }
        }
        if (me.autoClose) {
            me.task = new Ext.util.DelayedTask(me.doAutoClose, me);
            me.task.delay(me.autoCloseDelay);
        }
        // Shunting offscreen to avoid flicker
        me.el.setX(-10000);
        me.el.setOpacity(1);
    },
    afterShow: function() {
        var me = this;
        me.callParent(arguments);
        var notifications = me.getNotifications(me.managerAlignment);
        if (notifications.length) {
            me.el.alignTo(notifications[notifications.length - 1].el, me.siblingAlignment, [
                0,
                0
            ]);
            me.xPos = me.getXposAlignedToSibling(notifications[notifications.length - 1]);
            me.yPos = me.getYposAlignedToSibling(notifications[notifications.length - 1]);
        } else {
            me.el.alignTo(me.manager.el, me.managerAlignment, [
                (me.paddingX * me.paddingFactorX),
                (me.paddingY * me.paddingFactorY)
            ], false);
            me.xPos = me.getXposAlignedToManager();
            me.yPos = me.getYposAlignedToManager();
        }
        Ext.Array.include(notifications, me);
        // Repeating from coordinates makes sure the windows does not flicker into the center of the viewport during animation
        me.el.animate({
            from: {
                x: me.el.getX(),
                y: me.el.getY()
            },
            to: {
                x: me.xPos,
                y: me.yPos,
                opacity: 1
            },
            easing: me.slideInAnimation,
            duration: me.slideInDuration,
            dynamic: true
        });
    },
    slideBack: function() {
        var me = this;
        var notifications = me.getNotifications(me.managerAlignment);
        var index = Ext.Array.indexOf(notifications, me);
        // Not animating the element if it already started to hide itself or if the manager is not present in the dom
        if (!me.isHiding && me.el && me.manager && me.manager.el && me.manager.el.dom && me.manager.el.isVisible()) {
            if (index) {
                me.xPos = me.getXposAlignedToSibling(notifications[index - 1]);
                me.yPos = me.getYposAlignedToSibling(notifications[index - 1]);
            } else {
                me.xPos = me.getXposAlignedToManager();
                me.yPos = me.getYposAlignedToManager();
            }
            me.stopAnimation();
            me.el.animate({
                to: {
                    x: me.xPos,
                    y: me.yPos
                },
                easing: me.slideBackAnimation,
                duration: me.slideBackDuration,
                dynamic: true
            });
        }
    },
    cancelAutoClose: function() {
        var me = this;
        if (me.autoClose) {
            me.task.cancel();
        }
    },
    doAutoClose: function() {
        var me = this;
        if (!(me.stickWhileHover && me.mouseIsOver)) {
            // Close immediately
            me.close();
        } else {
            // Delayed closing when mouse leaves the component.
            me.closeOnMouseOut = true;
        }
    },
    removeFromManager: function() {
        var me = this;
        if (me.manager) {
            var notifications = me.getNotifications(me.managerAlignment);
            var index = Ext.Array.indexOf(notifications, me);
            if (index != -1) {
                // Requires Ext JS 4.0.2
                Ext.Array.erase(notifications, index, 1);
                // Slide "down" all notifications "above" the hidden one
                for (; index < notifications.length; index++) {
                    notifications[index].slideBack();
                }
            }
        }
    },
    hide: function() {
        var me = this;
        if (me.isHiding) {
            if (!me.isFading) {
                me.callParent(arguments);
                // Must come after callParent() since it will pass through hide() again triggered by destroy()
                me.isHiding = false;
            }
        } else {
            // Must be set right away in case of double clicks on the close button
            me.isHiding = true;
            me.isFading = true;
            me.cancelAutoClose();
            if (me.el) {
                me.el.fadeOut({
                    opacity: 0,
                    easing: 'easeIn',
                    duration: me.hideDuration,
                    remove: me.destroyAfterHide,
                    listeners: {
                        afteranimate: function() {
                            me.isFading = false;
                            me.removeCls('notification-fixed');
                            me.removeFromManager();
                            me.hide(me.animateTarget, me.doClose, me);
                        }
                    }
                });
            }
        }
        return me;
    },
    destroy: function() {
        var me = this;
        if (!me.hidden) {
            me.destroyAfterHide = true;
            me.hide(me.animateTarget, me.doClose, me);
        } else {
            me.callParent(arguments);
        }
    }
});

