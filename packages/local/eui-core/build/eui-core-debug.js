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
        var configurator = this.self.getConfigurator(),
            //this.getConfigurator(),
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
        var me = this,
            source = me.getDataSource(),
            items = source.items,
            len = items.length,
            i,
            retValue = true;
        for (i = 0; i < len; i++) {
            if (!items[i].recordValidationCheck()) {
                // 문제 레코드를 전달한다.
                me.fireEvent('focusgridrecord', items[i]);
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

Ext.define('Override.Ext.data.TreeModel', {
    override: 'Ext.data.TreeModel',
    listeners: {
        recusivechildcheck: function(record, field) {
            Ext.each(record.childNodes, function(child) {
                var flag = record.get(field);
                if (record.get(field) === 'Y') {
                    flag = 'N';
                }
                child.set(field, flag);
                child.fireEvent('recusivechildcheck', child, field);
            });
        }
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
                        if (model.isModel && this.get(recordVar).getFields().length > 0 && (this.get(recordVar).validate().map[name])) {
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
    defaultDateFormat: 'Y.m.d',
    defaultDateTimeFormat: 'Y.m.d H:i:s',
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
                "MSG_ID": "엑셀다운로드",
                "MSG_LABEL": "엑셀다운로드"
            },
            {
                "MSG_ID": "엑셀다운로드아이콘",
                "MSG_LABEL": "x-fa fa-download"
            },
            {
                "MSG_ID": "행추가",
                "MSG_LABEL": "추가"
            },
            {
                "MSG_ID": "행추가아이콘",
                "MSG_LABEL": "x-fa fa-plus-square"
            },
            {
                "MSG_ID": "행삭제",
                "MSG_LABEL": "삭제"
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
            },
            {
                "MSG_ID": "조회",
                "MSG_LABEL": "조회"
            },
            {
                "MSG_ID": "조회아이콘",
                "MSG_LABEL": "x-fa fa-search"
            },
            {
                "MSG_ID": "CONFIRM",
                "MSG_LABEL": "확인"
            },
            {
                "MSG_ID": "RECORD_DIRTY",
                "MSG_LABEL": "레코드가 수정중 입니다"
            },
            {
                "MSG_ID": "RECORD_DELETE",
                "MSG_LABEL": "레코드를 삭제하시겠습니까.?"
            },
            {
                "MSG_ID": "RECORD_DELETED",
                "MSG_LABEL": "레코드가 삭제되었습니다"
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
                    url: "api/service/getInit",
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
                //            deletedData: [],
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
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {
                '__rowStatus': 'D'
            });
            returnDataset.data.push(rtv);
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
        //    	Ext.EventManager.on(Ext.isIE ? document : window, 'keydown', function(e, t) {
        //    		if (e.getKey() == e.BACKSPACE && ((!/^input$/i.test(t.tagName) && !/^textarea$/i.test(t.tagName)) || t.disabled || t.readOnly)) {
        //    			e.stopEvent();
        //    		}
        //    	});
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
    },
    //=================== add end ========================================//
    pluck: function(array, propertyName) {
        var ret = [],
            i, ln, item;
        for (i = 0 , ln = array.length; i < ln; i++) {
            if (array[i].isModel) {
                item = array[i].getData();
                delete item['id'];
            } else {
                item = array[i];
            }
            if (propertyName) {
                ret.push(item[propertyName]);
            } else {
                ret.push(item);
            }
        }
        return ret;
    },
    loadNodeData: function(records) {
        var me = this;
        me.keyNameOfChildNode = 'CODE';
        me.keyNameOfNodeLevel = 'LEVEL';
        me.keyNameOfParentNode = 'PCODE';
        var crWindow = function(src) {
                var desktop = me.app.getDesktop();
                desktop.createCustomWindow(src.config.data);
            };
        var nodelist = Ext.Array.map(records.getRange(), function(record) {
                var obj = {
                        data: {}
                    };
                Ext.each(records.config.fields, function(field) {
                    if (Ext.isObject(field)) {
                        obj[field.name] = record.get(field.name);
                    } else {
                        if (field === 'PCODE' && (record.get(field) === '*')) {
                            obj.data[field] = record.get('CODE');
                        } else if (field === 'TEXT') {
                            obj.data[field] = record.get(field);
                            obj[Ext.util.Format.lowercase(field)] = record.get(field);
                        } else {
                            obj.data[field] = record.get(field);
                        }
                    }
                });
                return obj;
            }, me);
        var temp = {},
            results = [];
        for (var i = 0; i < nodelist.length; i++) {
            var e = nodelist[i];
            var id = e.data[me.keyNameOfChildNode];
            var pid = e.data[me.keyNameOfNodeLevel] === 1 ? 'root' : e.data[me.keyNameOfParentNode];
            temp[id] = e;
            if (!Ext.isEmpty(temp[pid])) {
                if (!temp[pid].menu) {
                    temp[pid].menu = {
                        items: []
                    };
                }
                temp[pid].menu.items.push(e);
            } else {
                results.push(e);
            }
        }
        function setLeafExtend(node) {
            if (node.menu && node.menu.items.length > 0) {
                node['expanded'] = true;
                for (var i = 0; i < node.menu.items.length; i++) {
                    arguments.callee(node.menu.items[i]);
                }
            } else {
                //                var hideTask = new Ext.util.DelayedTask(btn.hideMenu, btn);
                node['cls'] = 'arrow-none';
                node['leaf'] = true;
                node['handler'] = crWindow;
                //                node.menu = me.buildShortcutCtxMenu(node.data, true);
                delete node.children;
            }
        }
        for (var i = 0; i < results.length; i++) {
            setLeafExtend(results[i]);
        }
        return results;
    }
});

/***
 *
 * ## Summary
 *
 * Ext.button.Button 클래스를 확장합니다. toolbar 또는 기타 container의 자식으로 포함됩니다.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *          requires: ['eui.button.Button'],
 *          items: [
 *              {
 *                  xtype: 'euibutton',
 *                  text: '저장',
 *                  handler: 'onClickButton'
 *              }
 *         ],
 *         height: 500,
 *         width: 800,
 *         renderTo: Ext.getBody()
 *     });
 *
 */
Ext.define('eui.button.Button', {
    extend: 'Ext.button.Button',
    xtype: 'euibutton',
    //    text: 'SpButton',
    //    ui: 'basicbtn',
    config: {
        iconCls: null,
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

Ext.define('eui.container.BaseContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.euibasecontainer',
    mixins: [],
    //        'com.ux.mixin.BaseContainer'
    //    scrollable: 'y',
    //    layout: {
    //        type :'vbox',
    //        align: 'stretch'
    //    },
    //    style: {
    //        'background-color': 'white'
    //    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

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
    defaultListenerScope: true,
    listeners: {
        afterrender: 'setCheckboxGroupRadioGroupBindVar'
    },
    initComponent: function() {
        this.setAllowBlank();
        this.callParent(arguments);
    }
});

Ext.define('eui.form.FieldContainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.euifieldcontainer',
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
        hbuttons: null,
        /***
         * 브라우저 사이즈를 992이하로 줄일 경우 tableColumns의 값이 1로 변경되도록 조정한다.
         * 다시 사이즈를 늘리면 최초 지정한 tableColumns로 복원한다.
         */
        useRespColumn: true,
        usePagingToolbar: false
    },
    initComponent: function() {
        var me = this;
        //        me.setHeader();
        //        me.setBottomToolbar();
        me.setTableLayout();
        if (me.iconCls) {
            me.setHideHeaderICon(false);
        }
        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-pencil-square'
            });
        }
        me.callParent(arguments);
        me.on('afterrender', function() {
            me.isValid();
        }, me, {
            delay: 500
        });
        if (me.useRespColumn) {
            me.on('resize', me.responsiveColumn);
        }
    },
    /***
     * 브라우저 사이즈에 따라 table layout의 column값을 조정한다.
     * 사이즈를 줄일 경우 1로 변경하고 사이즈를 다시 늘릴 경우 최초 값으로
     * 복원한다.
     * @param ct
     * @param width
     * @param height
     */
    responsiveColumn: function(ct, width, height) {
        if (ct.tableColumns == 1) {
            return;
        }
        if (window.innerWidth < 992) {
            if (ct.getLayout().columns !== 1) {
                ct.beforeColumn = ct.getLayout().columns;
                ct.getLayout().columns = 1;
                ct.updateLayout();
            }
        } else {
            if (ct.getLayout().columns == 1) {
                ct.getLayout().columns = ct.beforeColumn;
                ct.updateLayout();
            }
        }
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
    defaultListenerScope: true,
    listeners: {
        afterrender: 'setCheckboxGroupRadioGroupBindVar'
    },
    initComponent: function() {
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
    alias: 'widget.euicheckbox',
    inputValue: 'Y',
    uncheckedValue: 'N',
    cellCls: 'fo-table-row-td',
    width: '100%',
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
                        if (viewClass.prototype.xtypesMap['euicombo']) {
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

/***
 * eui.grid.Merge에서 사용할 테이블 클래스
 * colspan, rowspan정보가 있다면 실행한다.
 * 이 정보는 eui.grid.Merge클래스에서 모델정보로 전달한다.
 */
Ext.define('eui.view.Merge', {
    extend: 'Ext.view.Table',
    xtype: 'mergetableview',
    cellTpl: [
        '<td <tpl if="colspan">colspan={colspan}</tpl> <tpl if="rowspan">rowspan={rowspan}</tpl> class="{tdCls}" role="{cellRole}" {tdAttr} {cellAttr:attributes}',
        ' style="width:{column.cellWidth}px;<tpl if="tdStyle">{tdStyle}</tpl>"',
        ' tabindex="-1" data-columnid="{[values.column.getItemId()]}">',
        '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner {innerCls}" ',
        'style="text-align:{align};<tpl if="style">{style}</tpl>" ',
        '{cellInnerAttr:attributes}>{value}</div>',
        '</td>',
        {
            priority: 0
        }
    ],
    renderCell: function(column, record, recordIndex, rowIndex, columnIndex, out) {
        var me = this,
            fullIndex,
            selModel = me.selectionModel,
            cellValues = me.cellValues,
            classes = cellValues.classes,
            fieldValue = record.data[column.dataIndex],
            cellTpl = me.cellTpl,
            value, clsInsertPoint,
            lastFocused = me.navigationModel.getPosition();
        if (record.data[column.dataIndex + 'hidden']) {
            return;
        }
        cellValues.rowspan = record.get(column.dataIndex + 'rowspan');
        cellValues.colspan = record.get(column.dataIndex + 'colspan');
        cellValues.record = record;
        cellValues.column = column;
        cellValues.recordIndex = recordIndex;
        cellValues.rowIndex = rowIndex;
        cellValues.columnIndex = cellValues.cellIndex = columnIndex;
        cellValues.align = column.align;
        cellValues.innerCls = column.innerCls;
        cellValues.tdCls = cellValues.tdStyle = cellValues.tdAttr = cellValues.style = "";
        cellValues.unselectableAttr = me.enableTextSelection ? '' : 'unselectable="on"';
        // Begin setup of classes to add to cell
        classes[1] = column.getCellId();
        // On IE8, array[len] = 'foo' is twice as fast as array.push('foo')
        // So keep an insertion point and use assignment to help IE!
        clsInsertPoint = 2;
        if (column.renderer && column.renderer.call) {
            fullIndex = me.ownerCt.columnManager.getHeaderIndex(column);
            value = column.renderer.call(column.usingDefaultRenderer ? column : column.scope || me.ownerCt, fieldValue, cellValues, record, recordIndex, fullIndex, me.dataSource, me);
            if (cellValues.css) {
                // This warning attribute is used by the compat layer
                // TODO: remove when compat layer becomes deprecated
                record.cssWarning = true;
                cellValues.tdCls += ' ' + cellValues.css;
                cellValues.css = null;
            }
            // Add any tdCls which was added to the cellValues by the renderer.
            if (cellValues.tdCls) {
                classes[clsInsertPoint++] = cellValues.tdCls;
            }
        } else {
            value = fieldValue;
        }
        cellValues.value = (value == null || value === '') ? column.emptyCellText : value;
        if (column.tdCls) {
            classes[clsInsertPoint++] = column.tdCls;
        }
        if (me.markDirty && record.dirty && record.isModified(column.dataIndex)) {
            classes[clsInsertPoint++] = me.dirtyCls;
        }
        if (column.isFirstVisible) {
            classes[clsInsertPoint++] = me.firstCls;
        }
        if (column.isLastVisible) {
            classes[clsInsertPoint++] = me.lastCls;
        }
        if (!me.enableTextSelection) {
            classes[clsInsertPoint++] = me.unselectableCls;
        }
        if (selModel && (selModel.isCellModel || selModel.isSpreadsheetModel) && selModel.isCellSelected(me, recordIndex, column)) {
            classes[clsInsertPoint++] = me.selectedCellCls;
        }
        if (lastFocused && lastFocused.record.id === record.id && lastFocused.column === column) {
            classes[clsInsertPoint++] = me.focusedItemCls;
        }
        // Chop back array to only what we've set
        classes.length = clsInsertPoint;
        cellValues.tdCls = classes.join(' ');
        //        cellValues.colspan=2;
        //        debugger;
        //        console.log(rowIndex, columnIndex)
        cellTpl.applyOut(cellValues, out);
        // Dereference objects since cellValues is a persistent var in the XTemplate's scope chain
        cellValues.column = cellValues.record = null;
    },
    renderRow: function(record, rowIdx, out) {
        var me = this,
            isMetadataRecord = rowIdx === -1,
            selModel = me.selectionModel,
            rowValues = me.rowValues,
            itemClasses = rowValues.itemClasses,
            rowClasses = rowValues.rowClasses,
            itemCls = me.itemCls,
            cls,
            rowTpl = me.rowTpl;
        // Define the rowAttr object now. We don't want to do it in the treeview treeRowTpl because anything
        // this is processed in a deferred callback (such as deferring initial view refresh in gridview) could
        // poke rowAttr that are then shared in tableview.rowTpl. See EXTJSIV-9341.
        //
        // For example, the following shows the shared ref between a treeview's rowTpl nextTpl and the superclass
        // tableview.rowTpl:
        //
        //      tree.view.rowTpl.nextTpl === grid.view.rowTpl
        //
        rowValues.rowAttr = {};
        // Set up mandatory properties on rowValues
        rowValues.record = record;
        rowValues.recordId = record.internalId;
        // recordIndex is index in true store (NOT the data source - possibly a GroupStore)
        rowValues.recordIndex = me.store.indexOf(record);
        // rowIndex is the row number in the view.
        rowValues.rowIndex = rowIdx;
        rowValues.rowId = me.getRowId(record);
        rowValues.itemCls = rowValues.rowCls = '';
        if (!rowValues.columns) {
            rowValues.columns = me.ownerCt.getVisibleColumnManager().getColumns();
        }
        itemClasses.length = rowClasses.length = 0;
        // If it's a metadata record such as a summary record.
        // So do not decorate it with the regular CSS.
        // The Feature which renders it must know how to decorate it.
        if (!isMetadataRecord) {
            itemClasses[0] = itemCls;
            if (!me.ownerCt.disableSelection && selModel.isRowSelected) {
                // Selection class goes on the outermost row, so it goes into itemClasses
                if (selModel.isRowSelected(record)) {
                    itemClasses.push(me.selectedItemCls);
                }
            }
            if (me.stripeRows && rowIdx % 2 !== 0) {
                itemClasses.push(me.altRowCls);
            }
            if (me.getRowClass) {
                cls = me.getRowClass(record, rowIdx, null, me.dataSource);
                if (cls) {
                    rowClasses.push(cls);
                }
            }
        }
        if (out) {
            rowTpl.applyOut(rowValues, out, me.tableValues);
        } else {
            return rowTpl.apply(rowValues, me.tableValues);
        }
    },
    rowTpl: [
        '{%',
        'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-row";',
        '%}',
        '<tr id="{rowId}" class="{[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]} {[dataRowCls]}"',
        ' data-boundView="{view.id}"',
        ' data-recordId="{record.internalId}"',
        ' data-recordIndex="{recordIndex}"',
        ' role="{rowRole}" {rowAttr:attributes}>',
        '<tpl for="columns">' + '{%',
        //                'if (parent.record.get("hidden") === true) {',
        'parent.view.renderCell(values, parent.record, parent.recordIndex, parent.rowIndex, xindex - 1, out, parent)',
        //                '}',
        '%}',
        '</tpl>',
        '</tr>',
        {
            priority: 0
        }
    ],
    renderRows: function(rows, columns, viewStartIndex, out) {
        var me = this,
            rowValues = me.rowValues,
            rowCount = rows.length,
            i;
        rowValues.view = me;
        rowValues.columns = columns;
        // The roles are the same for all data rows and cells
        rowValues.rowRole = me.rowAriaRole;
        me.cellValues.cellRole = me.cellAriaRole;
        for (i = 0; i < rowCount; i++ , viewStartIndex++) {
            rowValues.itemClasses.length = rowValues.rowClasses.length = 0;
            me.renderRow(rows[i], viewStartIndex, out);
        }
        // Dereference objects since rowValues is a persistent on our prototype
        rowValues.view = rowValues.columns = rowValues.record = null;
    },
    tpl: [
        '{%',
        'view = values.view;',
        'if (!(columns = values.columns)) {',
        'columns = values.columns = view.ownerCt.getVisibleColumnManager().getColumns();',
        '}',
        'values.fullWidth = 0;',
        // Stamp cellWidth into the columns
        'for (i = 0, len = columns.length; i < len; i++) {',
        'column = columns[i];',
        'values.fullWidth += (column.cellWidth = column.lastBox ? column.lastBox.width : column.width || column.minWidth);',
        '}',
        // Add the row/column line classes to the container element.
        'tableCls=values.tableCls=[];',
        '%}',
        '<div class="' + Ext.baseCSSPrefix + 'grid-item-container" role="presentation" style="width:{fullWidth}px">',
        '{[view.renderTHead(values, out, parent)]}',
        '<table id="{view.id}-table" class="{[tableCls]}" border="0" cellspacing="0" cellpadding="0" style="{tableStyle}" {ariaTableAttr}>',
        '<tbody id="{view.id}-body" {ariaTbodyAttr}>',
        '{%',
        'view.renderRows(values.rows, values.columns, values.viewStartIndex, out);',
        '%}',
        '</tbody>',
        '</table>',
        //'{[view.renderTFoot(values, out, parent)]}',
        '</div>',
        // This template is shared on the Ext.view.Table prototype, so we have to
        // clean up the closed over variables. Otherwise we'll retain the last values
        // of the template execution!
        '{% ',
        'view = columns = column = null;',
        '%}',
        {
            definitions: 'var view, tableCls, columns, i, len, column;',
            strict: true,
            priority: 0
        }
    ],
    outerRowTpl: [
        '{%',
        'this.nextTpl.applyOut(values, out, parent)',
        '%}'
    ],
    // Outer table
    bodySelector: 'div.' + Ext.baseCSSPrefix + 'grid-item-container table',
    // Element which contains rows
    nodeContainerSelector: 'div.' + Ext.baseCSSPrefix + 'grid-item-container tbody',
    // view item. This wraps a data row
    itemSelector: 'tr.' + Ext.baseCSSPrefix + 'grid-row',
    // Grid row which contains cells as opposed to wrapping item.
    rowSelector: 'tr.' + Ext.baseCSSPrefix + 'grid-row',
    // cell
    cellSelector: 'td.' + Ext.baseCSSPrefix + 'grid-cell',
    // Select column sizers and cells.
    // This may target `<COL>` elements as well as `<TD>` elements
    // `<COLGROUP>` element is inserted if the first row does not have the regular cell patten (eg is a colspanning group header row)
    sizerSelector: '.' + Ext.baseCSSPrefix + 'grid-cell',
    innerSelector: 'div.' + Ext.baseCSSPrefix + 'grid-cell-inner',
    getRowByRecord: function(record) {
        return this.retrieveNode(this.getRowId(record), false);
    }
});

/***
 *
 * ## Summary
 *
 * rowspan, colspan과 합계 , 총계를 지원한다. addSumRows, addTotalRow 변수에 의해 총계, 소계,합계를 보여줄 수 있다.
 * 기본은 모두 보여주지 않고 머지만 처리한다.
 * 이 클래스는 뷰모델의 store만 처리하므로 create에 의해 스토어를 생성 변수로 대입하지 않도록 한다. 아래 샘플처럼 뷰모델을
 * 정의하고 해당 뷰모델 내부 스토어를 바인딩 하여 사용한다.
 *
 *     @example
 *     Ext.create('eui.grid.Merge', {
 *         title: '셀머지',
 *         addSumRows: true,
 *         addTotalRow: true,
 *         viewModel: {
 *              stores: {
 *                  mystore: {
 *                      autoLoad: true,
 *                      sorters: [
 *                          'col3'
 *                      ],
 *                      fields:[
 *                          {
 *                              name: "col1",
 *                              type: "string"
 *                          },
 *                          {
 *                              name: "col2",
 *                              type: "string",
 *                              convert: function (v, record) {
 *                                  return record.get('col1')+'@'+record.get('col2');
 *                              }
 *                          },
 *                          {
 *                              name: "col3",
 *                              type: "string",
 *                              convert: function (v, record) {
 *                                  return record.get('col2')+'@'+record.get('col3');
 *                              }
 *                          }
 *                      ],
 *                      proxy: {
 *                          type: 'ajax',
 *                          url: 'eui-core/resources/data/statdata1.json',
 *                          reader: {
 *                              type: 'json',
 *                              rootProperty: 'data'
 *                          },
 *                          writer: {
 *                              type: 'json',
 *                              allowSingle: false,  // #2
 *                              writeAllFields: true    // #3
 *                          }
 *                      }
 *                  }
 *              }
 *         },
 *         bind: {
                store: '{mystore}'
            },
 *         groupFields: [
 *              {
 *                  field: 'col1',
 *                  mergeConfig: [
 *                      {
 *                          field: 'col2',
 *                          cond: 'colspan',
 *                          value: 2
 *                      },
 *                      {
 *                          field: 'col3',
 *                          cond: 'hidden',
 *                          value: true
 *                      }
 *                  ]
 *              },
 *              {
 *                  field: 'col2',
 *                  mergeConfig: []
 *              }
 *          ],
 *          lastMergeColumn: ['col3'],
 *          sumFields: ['col4', 'col5'],
 *         columns: [
 *              {
 *                  text: '구분',
 *                  columns: [
 *                      {
 *                          text: "수입/지출",
 *                          dataIndex: 'col1',
 *                          renderer: function (v) {
 *                              if(v == '합'){
 *                                  return '총계'
 *                              }
 *                              return v;
 *                          }
 *                      },
 *                      {
 *                          text: "대항목",
 *                          dataIndex: 'col2',
 *                          renderer: function (v) {
 *                              var value = v.split('@')[1];
 *                              if(value == '합'){
 *                                  return '합계'
 *                              }
 *                              return value;
 *                          }
 *                      },
 *                      {
 *                          text: "소항목",
 *                          dataIndex: 'col3',
 *                          renderer: function (v) {
 *                              var value = v.split('@')[2];
 *                              if(value == '합'){
 *                                  return '소계'
 *                              }
 *                              return value;
 *                          }
 *                      }
 *                  ]
 *              },
 *              {
 *                   width: 100,
 *                   xtype: 'euinumbercolumn',
 *                   text: "1월",
 *                   dataIndex: 'col4'
 *               },
 *               {
 *                   width: 100,
 *                   xtype: 'euinumbercolumn',
 *                   text: "2월",
 *                   dataIndex: 'col5'
 *               }
 *         ],
 *         height: 500,
 *         width: 800,
 *         renderTo: Ext.getBody()
 *     });
 *
 *
 * ## 모델의 field정의
 * 모델의 필드를 정의 할때 데이터의 정렬를 위해 각 필드들을 convert메소드를 이용해 연결해준다.
 * 이렇게 연결시켜야 원하는 소트와 머지가 이루어진다.
 *
 *      Ext.define('Eui.sample.model.Base', {
 *          extend: 'Ext.data.Model',
 *          fields: [
 *              {
 *                  name: "col1",
 *                  type: "string"
 *              },
 *              {
 *                  name: "col2",
 *                  type: "string",
 *                  convert: function (v, record) {
 *                      return record.get('col1')+'@'+record.get('col2');
 *                  }
 *              },
 *              {
 *                  name: "col3",
 *                  type: "string",
 *                  convert: function (v, record) {
 *                      return record.get('col2')+'@'+record.get('col3');
 *                  }
 *              }
 *          ]
 *      });
 *
 * ## Store 정의
 * 스토어 정의시 뷰모델 내부에서 정의해야하며 서버사이드의 데이터가 정렬되지 않았을 경우 sorters를 이용 필히 소트를 시켜줘야한다.
 *
 *      viewModel: {
            stores: {
                store: {
                    autoLoad: true,
                    proxy: {
                        type: 'ajax',
                        url: 'resources/data/statdata1.json',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    },
                    model: 'Eui.sample.model.Base',
                    sorters: [  //col3 필드로 소트한다.
                        'col3'
                    ]
                }
            }
        },

 *
 * ## groupFields 설정.
 * eui.grid.Merge클래스를 확장하고 관련 설정이 필요하다. groupFields는 머지할 컬럼정보로 아래 형식으로 채워준다.
 *
 *      groupFields: [
             {
                 field: 'col1',
                 mergeConfig: [ // 합계,소계처리에 필요하므로 머지만 적용시 비워둔다.
                    {
                        field: 'col2',
                        cond: 'colspan',
                        value: 2
                    },
                    {
                        field: 'col3',
                        cond: 'hidden',
                        value: true
                    }
                 ]
             },
             {
                 field: 'col2',
                 mergeConfig: []
             }
        ],
 *
 * ## lastMergeColumn 설정
 * 이 설정은 합계, 소계를 나타낼 경우 소계가 표시되는 마지막 컬럼을 기술한다.
 *
 *      lastMergeColumn: ['col3'],
 *
 * ## sumFields 설정
 * 이 설정은 합계를 구할 컬럼을 기술할 변수다.
 *
 *      sumFields: ['col4', 'col5'],
 *
 * ## 합계,총계,소계를 표시
 * addSumRows, addTotalRow
 *
 *
 * ## column renderer설정
 * 머지될 컬럼에 설정될 필드는 모델 정의 시 covert메소드를 이용 필드값을 @로 합져진 상태이므로 이를 원하는 값으로 보여지게하기 위해 사용한다.
 *
 *      columns: [
 *          {
 *               text: "수입/지출",
 *               dataIndex: 'col1',
 *               renderer: function (v) {
 *                   if(v == '합'){  // 머지만 적용할 경우 필요없음.
 *                       return '총계'
 *                   }
 *                   return v;
 *               }
 *           },
 *           {
 *               text: "대항목",
 *               dataIndex: 'col2',
 *               renderer: function (v) {
 *                   var value = v.split('@')[1];
 *                   if(value == '합'){  // 머지만 적용할 경우 필요없음.
 *                      return '합계'
 *                   }
 *                   return value;
 *               }
 *           },
 *           {
 *               text: "소항목",
 *               dataIndex: 'col3',
 *               renderer: function (v) {
 *                   var value = v.split('@')[2];
 *                   if(value == '합'){  // 머지만 적용할 경우 필요없음.
 *                      return '소계'
 *                   }
 *                   return value;
 *               }
 *           }
 *     ]
 */
Ext.define('eui.grid.Merge', {
    extend: 'Ext.panel.Table',
    requires: [
        'eui.view.Merge'
    ],
    alias: [
        'widget.euimergegrid'
    ],
    viewType: 'mergetableview',
    lockable: false,
    columnLines: true,
    sortableColumns: false,
    /***
     * @cfg {Array} groupFields Merge할 컬럼을 지정한다.
     *
     */
    groupFields: [],
    /**
     * @cfg {Boolean} rowLines 로우에 라인스타일 적용.
     */
    rowLines: true,
    /**
     * @cfg {Boolean} 합계, 소계를 표시한다.
     */
    addSumRows: false,
    /**
     * @cfg {Boolean} 로우 맨하단에 총계를 표시한다.
     */
    addTotalRow: false,
    lastMergeColumn: [],
    /**
     * 스토어를 복제해 계산에 사용하기 위한 스토어를 반환한다.
     * @returns {Ext.data.Store|*|eui.grid.Merge.tempStore}
     */
    getTempStore: function() {
        var me = this,
            rStore = this.store;
        if (!me.tempStore) {
            me.tempStore = Ext.create('Ext.data.Store', {
                fields: []
            });
            rStore.each(function(model) {
                me.tempStore.add(model.copy());
            });
        }
        return me.tempStore;
    },
    /**
     * @private
     * @cfg {String} cls
     * 셀 상단과 우측 보더를 설정하기 위한 css로 all.scss에 표기하였다.
     */
    cls: 'stat-tdstyle',
    /**
     * 그리드 최하단에 "총계"를 추가한다.
     */
    addTotoalRow: function() {
        if (!this.addTotalRow) {
            return;
        }
        var rStore = this.store;
        var store = this.getTempStore();
        var me = this;
        var col = me.groupFields[0].field;
        var retObj = {};
        retObj[col] = '합';
        var colArray = Ext.Array.merge(Ext.pluck(me.groupFields, 'field'), me.lastMergeColumn);
        retObj[col + 'colspan'] = colArray.length;
        Ext.each(colArray, function(v, z) {
            if (z > 0) {
                retObj[v + 'hidden'] = true;
            }
        });
        Ext.each(me.sumFields, function(sumcol) {
            retObj[sumcol] = store.sum(sumcol);
        });
        rStore.add(retObj);
    },
    /***
     *
     * @param rStore
     * @param groupField
     * @param scol
     * @param values
     */
    generaRow: function(rStore, groupField, scol, values) {
        var me = this;
        for (var test in values) {
            // 그룹핑한 갯수.
            // convert 와 sum을 함께 사용할 경우.
            var div = test.split('@');
            if (div[0] === div[1]) {
                div = div.slice(1, div.length);
            }
            var lastMergeColumnKey = me.lastMergeColumn;
            var findRecord = rStore.findRecord(lastMergeColumnKey, div.join('@') + '@합');
            if (findRecord) {
                findRecord.data[scol] = values[test];
            }
        }
    },
    setStore: function() {
        this.callParent(arguments);
        var rStore = this.store;
        var me = this;
        rStore.on('load', function() {
            rStore.suspendEvents();
            var store = me.getTempStore();
            // 총계 처리.
            me.addTotoalRow();
            // 합계, 소계를 처리.
            if (me.addSumRows) {
                Ext.each(me.groupFields, function(groupColumn, idx) {
                    store.group(groupColumn.field);
                    var values = store.sum(me.sumFields[0], true);
                    for (var test in values) {
                        // 그룹핑한 갯수.
                        var retObj = {};
                        var colArray = Ext.Array.merge(Ext.pluck(me.groupFields, 'field'), me.lastMergeColumn);
                        var i = 0;
                        Ext.each(colArray, function(v, z) {
                            var recValue = test.split('@')[z + i];
                            if (!recValue) {
                                recValue = '합';
                            }
                            retObj[v] = recValue;
                            var colConfig = groupColumn.mergeConfig[z];
                            if (groupColumn.mergeConfig[z]) {
                                retObj[colConfig.field + colConfig.cond] = colConfig.value;
                            }
                            i++;
                        });
                        rStore.add(retObj);
                    }
                    // 합계를 계산할 필드로
                    Ext.each(me.sumFields, function(scol, sIdx) {
                        var testObj = {};
                        var values2 = store.sum(scol, true);
                        me.generaRow(rStore, groupColumn, scol, values2);
                    });
                });
            }
            rStore.resumeEvents();
            // 최종 머지 처리.
            me.callMerge(rStore);
        });
    },
    /***
     * 중복된 셀값을 좌우로 합친다.
     * @param rStore
     */
    callMerge: function(rStore) {
        var me = this;
        Ext.each(me.groupFields, function(mergecol, idx) {
            var mergeKeyCol = mergecol.field;
            rStore.group(mergeKeyCol);
            var cols = rStore.count(mergeKeyCol);
            for (var test in cols) {
                var sumVar = test.split('@')[1];
                var rowIdx = rStore.findExact(mergeKeyCol, test);
                var value = cols[test];
                var recs = rStore.getRange(rowIdx, rowIdx + value - 1);
                recs[0].data[mergecol.field + 'rowspan'] = value;
                Ext.each(recs, function(item, idx) {
                    if (idx > 0) {
                        item.data[mergecol.field + 'hidden'] = true;
                    }
                });
            }
        });
        rStore.group(null);
        if (me.lastMergeColumn.length > 0) {
            rStore.sort([
                {
                    property: me.lastMergeColumn,
                    direction: 'ASC'
                }
            ]);
        }
        // #5
        me.getView().refresh();
    }
});

Ext.define('Ext.ux.grid.PageSize', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'plugin.pagesize',
    //    beforeText  : 'Show',
    //    afterText   : 'rows/page',
    mode: 'local',
    displayField: 'text',
    valueField: 'value',
    allowBlank: false,
    hideLabel: true,
    triggerAction: 'all',
    editable: false,
    width: 50,
    maskRe: /[0-9]/,
    /**
     * initialize the paging combo after the pagebar is randered
     */
    init: function(paging) {
        if (this.pageSize) {
            paging.store.pageSize = this.pageSize;
            this.setValue(this.pageSize);
        }
        paging.on('afterrender', this.onInitView, this);
    },
    /**
     * create a local store for availabe range of pages
     */
    store: new Ext.data.SimpleStore({
        fields: [
            'text',
            'value'
        ],
        data: [
            [
                '5',
                5
            ],
            [
                '10',
                10
            ],
            [
                '15',
                15
            ],
            [
                '20',
                20
            ],
            [
                '25',
                25
            ],
            [
                '50',
                50
            ],
            [
                '100',
                100
            ],
            [
                '200',
                200
            ],
            [
                '500',
                500
            ]
        ]
    }),
    /**
     * assing the select and specialkey events for the combobox
     * after the pagebar is rendered.
     */
    onInitView: function(paging) {
        this.setValue(paging.store.pageSize);
        paging.add('-', this.beforeText, this, this.afterText);
        this.on('select', this.onPageSizeChanged, paging);
        this.on('specialkey', function(combo, e) {
            if (13 === e.getKey()) {
                this.onPageSizeChanged.call(paging, this);
            }
        });
    },
    /**
     * refresh the page when the value is changed
     */
    onPageSizeChanged: function(combo) {
        this.store.pageSize = parseInt(combo.getRawValue(), 10);
        this.moveFirst();
    }
});

/**
 * Ext.grid.Panel 클래스를 확장했다.
 *
 * # Events
 *
 * eui.toolbar.Command를 배치할 경우 해당 클래스의 버튼에서 발생하는 이벤트를 감지합니다.
 *
 *     var cb = Ext.create('eui.grid.Panel', {
 *         // all of your config options
 *         columns: [
 *              {
 *                  text: 'MSG_ID',
 *                  width: 100,
 *                  dataIndex: 'MSG_ID'
 *              },
 *              {
 *                  text: 'MSG_LABEL',
 *                  flex: 1,
 *                  dataIndex: 'MSG_LABEL'
 *              }
 *         ]
 *         listeners:{  // 각 버튼들의 리스너 구현.
 *              regbtnclick: 'onRowReg',
 *              rowdeletebtnclick: 'onRowDelete',
 *              modbtnclick: 'onRowMod',
 *              rowaddbtnclick: 'onRowAdd',
 *              savebtnclick: 'onRowSave'
 *         }
 *     });
 *

 * # Multiple Selection
 *
 * ComboBox also allows selection of multiple items from the list; to enable multi-selection set the
 * {@link #multiSelect} config to `true`.
 *
 * # Filtered Stores
 *
 * If you have a local store that is already filtered, you can use the {@link #lastQuery} config option
 * to prevent the store from having the filter being cleared on first expand.
 *
 * ## Customized combobox
 *
 * Both the text shown in dropdown menu and text field can be easily customized:
 *
 *     @example
 *     var states = Ext.create('Ext.data.Store', {
 *         fields: ['abbr', 'name'],
 *         data : [
 *             {"abbr":"AL", "name":"Alabama"},
 *             {"abbr":"AK", "name":"Alaska"},
 *             {"abbr":"AZ", "name":"Arizona"}
 *         ]
 *     });
 *
 *     Ext.create('Ext.form.ComboBox', {
 *         fieldLabel: 'Choose State',
 *         store: states,
 *         queryMode: 'local',
 *         valueField: 'abbr',
 *         renderTo: Ext.getBody(),
 *         // Template for the dropdown menu.
 *         // Note the use of the "x-list-plain" and "x-boundlist-item" class,
 *         // this is required to make the items selectable.
 *         tpl: Ext.create('Ext.XTemplate',
 *             '<ul class="x-list-plain"><tpl for=".">',
 *                 '<li role="option" class="x-boundlist-item">{abbr} - {name}</li>',
 *             '</tpl></ul>'
 *         ),
 *         // template for the content inside text field
 *         displayTpl: Ext.create('Ext.XTemplate',
 *             '<tpl for=".">',
 *                 '{abbr} - {name}',
 *             '</tpl>'
 *         )
 *     });
 *
 * See also the {@link #listConfig} option for additional configuration of the dropdown.
 *
 */
Ext.define('eui.grid.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.euigrid',
    columnLines: true,
    //    ui: 'basicgrid',
    localeProperties: [
        'title'
    ],
    requires: [
        'Ext.ux.grid.PageSize'
    ],
    mixins: [
        'eui.mixin.Panel'
    ],
    cls: 'eui-form-table',
    /**
     * @event rowaddbtnclick
     * eui.toolbar.Command를 사용할 경우 "추가"버튼을 클릭하면 발생하는 이벤트.
     * @param {eui.grid.Panel} grid commandtoolbar를 사용하는 그리드나 폼
     */
    /**
     * @event rowdeletebtnClick
     * eui.toolbar.Command를 사용할 경우 "삭제"버튼을 클릭하면 발생하는 이벤트.
     * @param {eui.grid.Panel} grid commandtoolbar를 사용하는 그리드나 폼
     */
    /**
     * @event regbtnclick
     * eui.toolbar.Command를 사용할 경우 "등록"버튼을 클릭하면 발생하는 이벤트.
     * @param {eui.grid.Panel} grid commandtoolbar를 사용하는 그리드나 폼
     */
    /**
     * @event modbtnclick
     * eui.toolbar.Command를 사용할 경우 "수정"버튼을 클릭하면 발생하는 이벤트.
     * @param {eui.grid.Panel} grid commandtoolbar를 사용하는 그리드나 폼
     */
    config: {
        showRowAddBtn: false,
        showRowDelBtn: false,
        showRowRegBtn: false,
        showRowModBtn: false,
        showRowSaveBtn: false,
        // defaultButtons에 추가할 버튼을 정의한다.
        otherButtons: null,
        /**
         * @cfg {Boolean} [usePagingToolbar=`false`]
         * 페이징 툴바를 표시한다. 보이게 하려면 `true`로 설정한다.
         */
        usePagingToolbar: false,
        /**
         * @cfg {Boolean} [hideHeaderICon=`false`]
         * 기본 아이콘을 보이지 않게 한다. 보이게 하려면 `true`로 설정한다.
         */
        hideHeaderICon: false,
        /**
         * @cfg {Boolean} [showRowCountStatusBar=`true`]
         * 그리드 하단 기본 상태바를 표시한다. 없앨 경우  `false`로 설정한다.
         */
        showRowCountStatusBar: true
    },
    initComponent: function() {
        var me = this;
        me.setBottomToolbar();
        if (me.iconCls) {
            me.setHideHeaderICon(false);
        }
        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-table'
            });
        }
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
        var me = this;
        me.setStatusbar();
        me.setPagingToolbarStore();
        me.callParent(arguments);
        //
        focusgridrecord = function(record) {
            me.getSelectionModel().select(record);
        };
        if (this.bind && this.bind['store']) {
            var store = this.lookupViewModel().getStore(this.bind.store.stub.name);
            store.on('focusgridrecord', focusgridrecord, this);
        } else if (this.store) {
            this.store.on('focusgridrecord', focusgridrecord, this);
        }
    },
    setStatusbar: function() {
        var me = this,
            statusbar = this.down('statusbar[itemId=commonStatus]'),
            statusbarHandler = function(store) {
                if (statusbar)  {
                    statusbar.down('tbtext[itemId=rowcnt]').setText('Rows : ' + store.getCount());
                }
                
            },
            exceptionHandler = function(conn, response) {
                if (!response) {
                    return;
                }
                var result = Ext.JSON.decode(response.responseText, true);
                if (result && !Ext.isEmpty(result.MSG)) {
                    if (statusbar) {
                        statusbar.setStatus({
                            text: result.MSG
                        });
                    }
                }
            },
            loadHandler = function(store, records, successful, operation) {
                if (operation) {
                    exceptionHandler(null, operation._response);
                }
            };
        if (!me.getUsePagingToolbar()) {
            if (this.bind && this.bind['store']) {
                var store = this.lookupViewModel().getStore(this.bind.store.stub.name);
                if (store && store.getProxy() != null) {
                    //store.getProxy()가 없는경우대비 null체크 같은텝의 두그리드가 같은 store를 사용시 에러발생
                    store.on('datachanged', statusbarHandler, this);
                    store.on('load', loadHandler, this);
                    store.getProxy().on('exception', exceptionHandler, this);
                }
            } else if (this.store) {
                this.store.on('datachanged', statusbarHandler, this);
                this.store.getProxy().on('exception', exceptionHandler, this);
                this.store.on('load', loadHandler, this);
            }
        }
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
            title: Util.getLocaleValue('행삭제'),
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: Util.getLocaleValue('RECORD_DELETE'),
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
        if (Ext.isEmpty(me.dockedItems)) {
            me.dockedItems = [];
        }
        if (me.getUsePagingToolbar()) {
            me.dockedItems.push({
                xtype: 'pagingtoolbar',
                dock: 'bottom',
                displayInfo: true,
                plugins: [
                    {
                        ptype: "pagesize",
                        pageSize: 50
                    }
                ]
            });
        } else if (me.getShowRowCountStatusBar()) {
            me.dockedItems.push({
                dock: 'bottom',
                itemId: 'commonStatus',
                xtype: 'statusbar',
                items: [
                    {
                        xtype: 'tbtext',
                        itemId: 'rowcnt',
                        text: 'Rows : 0'
                    }
                ]
            });
        }
    }
});

/***
 * ## Summary
 * 체크박스용 컬럼 : true/false를 사용하지 않고 Y/N을 사용한다.
 */
Ext.define('eui.grid.column.Check', {
    extend: 'Ext.grid.column.Check',
    alias: 'widget.euicheckcolumn',
    isRecordChecked: function(record) {
        var prop = this.property;
        if (prop) {
            return record[prop] == 'Y';
        }
        return record.get(this.dataIndex) == 'Y';
    },
    setRecordCheck: function(record, recordIndex, checked, cell) {
        var me = this,
            prop = me.property,
            result,
            val = checked ? 'Y' : 'N';
        // Only proceed if we NEED to change
        if (prop ? record[prop] : record.get(me.dataIndex) != val) {
            if (prop) {
                record[prop] = val;
            } else {
                record.set(me.dataIndex, val);
            }
            me.updater(cell, checked);
        }
    },
    defaultRenderer: function(value, cellValues) {
        var me = this,
            cls = me.checkboxCls,
            tip = me.tooltip,
            value = (value == 'Y' ? true : false);
        if (me.invert) {
            value = !value;
        }
        if (me.disabled) {
            cellValues.tdCls += ' ' + me.disabledCls;
        }
        if (value) {
            cls += ' ' + me.checkboxCheckedCls;
            tip = me.checkedTooltip || tip;
        }
        if (me.useAriaElements) {
            cellValues.tdAttr += ' aria-describedby="' + me.id + '-cell-description' + (!value ? '-not' : '') + '-selected"';
        }
        // This will update the header state on the next animation frame
        // after all rows have been rendered.
        me.updateHeaderState();
        return '<span ' + (tip || '') + ' class="' + cls + '" role="' + me.checkboxAriaRole + '"' + (!me.ariaStaticRoles[me.checkboxAriaRole] ? ' tabIndex="0"' : '') + '></span>';
    }
});

Ext.define('eui.grid.column.Column', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.euicolumn',
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
            return Ext.Date.format(v, eui.Config.defaultDateFormat);
        } else if (Ext.Date.parse(v, 'Ymd')) {
            date = Ext.Date.parse(v, 'Ymd');
            return Ext.Date.format(date, eui.Config.defaultDateFormat);
        } else if (Ext.Date.parse(v, 'YmdHis')) {
            date = Ext.Date.parse(v, 'YmdHis');
            return Ext.Date.format(date, eui.Config.defaultDateTimeFormat);
        } else {
            return v;
        }
    },
    currencyRenderer: function(v) {
        if (Ext.isNumber(v)) {
            return Ext.util.Format.number(v, '#,###.###');
        } else {
            return v;
        }
    },
    descRowRenderer: function(value, meta, record, row, col, store) {
        // set up the meta styles appropriately, etc.
        // then:
        return store.getCount() - row;
    }
});

Ext.define('eui.grid.column.Date', {
    extend: 'Ext.grid.column.Date',
    alias: 'widget.euidatecolumn',
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
    alias: 'widget.euinumbercolumn',
    align: 'right',
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    config: {
        /**
         * @cfg {Boolean} [isCurrency=`true`]
         * currencyRenderer가 기본 적용되고 이를 피하고 싶을 경우 `false`로 설정한다.
         * false로 지정하고 포맷을 지정할 경우
         * 예 ) 소숫점 3자리로 모두 통일 할 경우
         * isCurrency: false,
         * format:'0,000.000/i',
         */
        isCurrency: true
    },
    initComponent: function() {
        var me = this;
        if (!me.renderer && me.isCurrency) {
            me.renderer = me.currencyRenderer;
        }
        me.callParent(arguments);
    }
});

Ext.define('eui.grid.column.RowNumberer', {
    extend: 'Ext.grid.column.Number',
    alias: 'widget.euirownumberer',
    align: 'right',
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    text: 'No',
    width: 40,
    initComponent: function() {
        var me = this;
        if (!me.renderer) {
            me.renderer = me.descRowRenderer;
        }
        me.callParent(arguments);
    }
});

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
    alias: 'widget.euipanel',
    cls: 'eui-form-table',
    config: {
        usePagingToolbar: false
    },
    initComponent: function() {
        var me = this;
        if (me.iconCls) {
            me.setHideHeaderICon(false);
        }
        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-pencil-square'
            });
        }
        me.callParent(arguments);
    }
});

Ext.define('eui.panel.BasePanel', {
    extend: 'eui.panel.Panel',
    alias: 'widget.euibasepanel'
});

/***
 *
 * ## Summary
 * Ext.tab.Panel클래스를 확장했다.
 *
 **/
Ext.define('eui.tab.Panel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.euitabpanel',
    ui: 'euitabpanel',
    /**
     * @event euitabload
     * 탭 변경에 따른 하위 자식의 데이터 재로드 처리.
     * @param {Object[]} 파라메터
     */
    initComponent: function() {
        var me = this;
        if (me.title) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-bars'
            });
        }
        me.callParent(arguments);
    },
    listeners: {
        /***
         * 탭 변경시마다 파라메터를 비교해 다를 경우 euitabload이벤트를 발생시킨다.
         * @param tabPanel
         * @param newCard
         * @param oldCard
         */
        tabchange: function(tabPanel, newCard, oldCard) {
            if (JSON.stringify(tabPanel.tabLoadParameters) != JSON.stringify(newCard.tabLoadParameters)) {
                newCard.fireEvent('euitabload', tabPanel.tabLoadParameters);
                newCard.tabLoadParameters = tabPanel.tabLoadParameters;
            }
        },
        /***
         * 하위 아이템에게 euitabload이벤트를 발생시켜 데이터를 로드하도록 한다.
         * @param parameters
         * @param e
         */
        euitabload: function(parameters, e) {
            var activeItem = this.getLayout().getActiveItem();
            activeItem.fireEvent('euitabload', parameters, e);
            this.tabLoadParameters = activeItem.tabLoadParameters = parameters;
        }
    }
});

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
        showCloseBtn: false,
        showGridCount: false,
        showExcelDownBtn: false
    },
    initComponent: function() {
        var me = this,
            owner = this.up('grid,form');
        Ext.apply(me, {
            items: [
                {
                    xtype: 'component',
                    itemId: 'status',
                    tpl: '({count}개)',
                    margin: '0 10 0 20',
                    hidden: !me.getShowGridCount()
                },
                {
                    xtype: 'euibutton',
                    text: '#{행추가}',
                    iconCls: '#{행추가아이콘}',
                    scope: me,
                    showText: me.getShowText(),
                    hidden: !me.getShowRowAddBtn(),
                    listeners: {
                        click: function() {
                            if (owner.hasListeners['rowaddbtnclick'.toLowerCase()]) {
                                owner.fireEvent('rowaddbtnclick', owner);
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
                            if (owner.hasListeners['rowdeletebtnclick'.toLowerCase()]) {
                                owner.fireEvent('rowdeletebtnclick', owner);
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
                            owner.fireEvent('regbtnclick', owner);
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
                            owner.fireEvent('modbtnclick', owner);
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
                            if (owner.hasListeners['savebtnclick'.toLowerCase()]) {
                                owner.fireEvent('savebtnclick', owner);
                            } else {
                                owner.onSave(owner);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{조회}',
                    iconCls: '#{조회아이콘}',
                    hidden: !me.getShowReloadBtn(),
                    listeners: {
                        click: function() {
                            if (owner.hasListeners['reloadbtnclick'.toLowerCase()]) {
                                owner.fireEvent('reloadbtnclick', owner);
                            } else {
                                owner.onReload();
                            }
                        }
                    }
                },
                {
                    text: '#{엑셀다운로드}',
                    iconCls: '#{엑셀다운로드아이콘}',
                    hidden: !me.getShowExcelDownBtn(),
                    xtype: 'exporterbutton'
                },
                //                    targetGrid: owner
                //Or you can use
                //component: someGrid
                //component: someTree
                //component: '#someGridItemId'
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
        var store = owner.store;
        if (owner.bind && owner.bind['store']) {
            store = owner.bind.store.owner.get(owner.bind.store.stub.path);
        }
        store.on('datachanged', function() {
            owner.down('#status').update({
                count: store.getTotalCount()
            });
        });
    }
});

Ext.define('eui.tree.Panel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.euitreepanel',
    cls: 'eui-form-table',
    rootVisible: false,
    useArrows: true,
    config: {},
    initComponent: function() {
        var me = this;
        if (me.iconCls) {
            me.setHideHeaderICon(false);
        }
        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-pencil-square'
            });
        }
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

/***
 * eui.grid.Merge에서 사용할 테이블 클래스
 * colspan, rowspan정보가 있다면 실행한다.
 * 이 정보는 eui.grid.Merge클래스에서 모델정보로 전달한다.
 */
Ext.define('eui.ux.table.TableCellMerge', {
    extend: 'Ext.panel.Panel',
    xtype: 'tablecellmerge',
    listeners: {
        afterrender: function() {
            var id = this.table_merge_id;
            var rt = REDIPS.table;
            rt.onmousedown(id, true);
            rt.color.cell = '#9BB3DA';
        }
    },
    layout: 'fit',
    initComponent: function() {
        var id = this.id + '-merge-table';
        this.table_merge_id = id;
        Ext.apply(this, {
            tbar: [
                {
                    xtype: 'button',
                    text: '합치기',
                    iconCls: 'x-fa fa-plus-square',
                    handler: function() {
                        REDIPS.table.merge('h', false);
                        // and then merge cells vertically and clear cells (second parameter is true by default)
                        REDIPS.table.merge('v');
                    }
                },
                {
                    xtype: 'button',
                    text: '가로분할',
                    handler: function() {
                        REDIPS.table.split('h');
                    }
                },
                {
                    xtype: 'button',
                    text: '세로분할',
                    handler: function() {
                        REDIPS.table.split('v');
                    }
                },
                {
                    xtype: 'button',
                    text: '로우추가',
                    handler: function() {
                        REDIPS.table.row(id, 'insert');
                    }
                },
                {
                    xtype: 'button',
                    text: '로우삭제',
                    handler: function() {
                        REDIPS.table.row(id, 'delete');
                    }
                },
                {
                    xtype: 'button',
                    text: '컬럼추가',
                    handler: function() {
                        REDIPS.table.column(id, 'insert');
                    }
                },
                {
                    xtype: 'button',
                    text: '컬럼삭제',
                    handler: function() {
                        REDIPS.table.column(id, 'delete');
                    }
                }
            ],
            html: '<table width="100%" class="table-cell-merge-table" id=' + id + '><tbody>' + '<tr height="47"><td></td><td></td><td></td></tr>' + '<tr height="47"><td></td><td></td><td></td></tr>' + '<tr height="47"><td></td><td></td><td></td></tr>' + '</tbody></table>'
        });
        this.callParent(arguments);
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

/**
 * @class Ext.ux.exporter.Formatter
 * @author Ed Spencer (http://edspencer.net)
 * @cfg {Ext.data.Store} store The store to export
 */
Ext.define("Ext.ux.exporter.Formatter", {
    /**
     * Performs the actual formatting. This must be overridden by a subclass
     */
    format: Ext.emptyFn,
    constructor: function(config) {
        config = config || {};
        Ext.applyIf(config, {});
    }
});

/**
 * @class Ext.ux.exporter.csvFormatter.CsvFormatter
 * @extends Ext.ux.Exporter.Formatter
 * Specialised Format class for outputting .csv files
 * modification from Yogesh to extract value if renderers returning html
 */
Ext.define("Ext.ux.exporter.csvFormatter.CsvFormatter", {
    extend: "Ext.ux.exporter.Formatter",
    mimeType: 'text/csv',
    charset: 'UTF-8',
    separator: ",",
    extension: "csv",
    format: function(store, config) {
        this.columns = config.columns || (store.fields ? store.fields.items : store.model.prototype.fields.items);
        this.parserDiv = document.createElement("div");
        return this.getHeaders() + "\n" + this.getRows(store);
    },
    getHeaders: function(store) {
        var columns = [],
            title;
        Ext.each(this.columns, function(col) {
            var title;
            if (col.getXType() != "rownumberer") {
                if (col.text != undefined) {
                    title = col.text;
                } else if (col.name) {
                    title = col.name.replace(/_/g, " ");
                    title = Ext.String.capitalize(title);
                }
                columns.push(title);
            }
        }, this);
        return columns.join(this.separator);
    },
    getRows: function(store) {
        var rows = [];
        store.each(function(record, index) {
            rows.push(this.getCell(record, index));
        }, this);
        return rows.join("\n");
    },
    getCell: function(record, index) {
        var cells = [];
        Ext.each(this.columns, function(col) {
            var name = col.name || col.dataIndex || col.stateId;
            if (name && col.getXType() != "rownumberer") {
                if (Ext.isFunction(col.renderer)) {
                    var value = col.renderer(record.get(name), {}, record);
                    //to handle specific case if renderer returning html(img tags inside div)
                    this.parserDiv.innerHTML = value;
                    var values = [];
                    var divEls = this.parserDiv.getElementsByTagName('div');
                    if (divEls && divEls.length > 0) {
                        Ext.each(divEls, function(divEl) {
                            var innerValues = [];
                            var imgEls = divEl.getElementsByTagName('img');
                            Ext.each(imgEls, function(imgEl) {
                                innerValues.push(imgEl.getAttribute('title'));
                            });
                            innerValues.push(divEl.innerText || divEl.textContent);
                            values.push(innerValues.join(':'));
                        });
                    } else {
                        values.push(this.parserDiv.innerText || this.parserDiv.textContent);
                    }
                    value = values.join('\n');
                } else {
                    var value = record.get(name);
                }
                cells.push("\"" + value + "\"");
            }
        }, this);
        return cells.join(this.separator);
    }
});

/**
 * @class Ext.ux.exporter.excelFormatter.Cell
 * @extends Object
 * Represents a single cell in a worksheet
 */
Ext.define("Ext.ux.exporter.excelFormatter.Cell", {
    constructor: function(config) {
        Ext.applyIf(config, {
            type: "String"
        });
        Ext.apply(this, config);
        Ext.ux.exporter.excelFormatter.Cell.superclass.constructor.apply(this, arguments);
    },
    render: function() {
        return this.tpl.apply(this);
    },
    tpl: new Ext.XTemplate('<ss:Cell ss:StyleID="{style}">', '<ss:Data ss:Type="{type}">{value}</ss:Data>', '</ss:Cell>')
});

/**
 * @class Ext.ux.exporter.excelFormatter.ExcelFormatter
 * @extends Ext.ux.exporter.Formatter
 * Specialised Format class for outputting .xls files
 */
Ext.define("Ext.ux.exporter.excelFormatter.ExcelFormatter", {
    extend: "Ext.ux.exporter.Formatter",
    uses: [
        "Ext.ux.exporter.excelFormatter.Cell",
        "Ext.ux.exporter.excelFormatter.Style",
        "Ext.ux.exporter.excelFormatter.Worksheet",
        "Ext.ux.exporter.excelFormatter.Workbook"
    ],
    //contentType: 'data:application/vnd.ms-excel;base64,',
    //contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
    //mimeType: "application/vnd.ms-excel",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //charset:"base64",
    charset: "UTF-8",
    extension: "xls",
    format: function(store, config) {
        var workbook = new Ext.ux.exporter.excelFormatter.Workbook(config);
        workbook.addWorksheet(store, config || {});
        return workbook.render();
    }
});

/**
 * @class Ext.ux.exporter.excelFormatter.Style
 * @extends Object
 * Represents a style declaration for a Workbook (this is like defining CSS rules). Example:
 *
 * new Ext.ux.exporter.excelFormatter.Style({
 *   attributes: [
 *     {
 *       name: "Alignment",
 *       properties: [
 *         {name: "Vertical", value: "Top"},
 *         {name: "WrapText", value: "1"}
 *       ]
 *     },
 *     {
 *       name: "Borders",
 *       children: [
 *         name: "Border",
 *         properties: [
 *           {name: "Color", value: "#e4e4e4"},
 *           {name: "Weight", value: "1"}
 *         ]
 *       ]
 *     }
 *   ]
 * })
 *
 * @cfg {String} id The ID of this style (required)
 * @cfg {Array} attributes The attributes for this style
 * @cfg {String} parentStyle The (optional parentStyle ID)
 */
Ext.define("Ext.ux.exporter.excelFormatter.Style", {
    constructor: function(config) {
        config = config || {};
        Ext.apply(this, config, {
            parentStyle: '',
            attributes: []
        });
        Ext.ux.exporter.excelFormatter.Style.superclass.constructor.apply(this, arguments);
        if (this.id == undefined)  {
            throw new Error("An ID must be provided to Style");
        }
        
        this.preparePropertyStrings();
    },
    /**
   * Iterates over the attributes in this style, and any children they may have, creating property
   * strings on each suitable for use in the XTemplate
   */
    preparePropertyStrings: function() {
        Ext.each(this.attributes, function(attr, index) {
            this.attributes[index].propertiesString = this.buildPropertyString(attr);
            this.attributes[index].children = attr.children || [];
            Ext.each(attr.children, function(child, childIndex) {
                this.attributes[index].children[childIndex].propertiesString = this.buildPropertyString(child);
            }, this);
        }, this);
    },
    /**
   * Builds a concatenated property string for a given attribute, suitable for use in the XTemplate
   */
    buildPropertyString: function(attribute) {
        var propertiesString = "";
        Ext.each(attribute.properties || [], function(property) {
            propertiesString += Ext.String.format('ss:{0}="{1}" ', property.name, property.value);
        }, this);
        return propertiesString;
    },
    render: function() {
        return this.tpl.apply(this);
    },
    tpl: new Ext.XTemplate('<tpl if="parentStyle.length == 0">', '<ss:Style ss:ID="{id}">', '</tpl>', '<tpl if="parentStyle.length != 0">', '<ss:Style ss:ID="{id}" ss:Parent="{parentStyle}">', '</tpl>', '<tpl for="attributes">', '<tpl if="children.length == 0">', '<ss:{name} {propertiesString} />', '</tpl>', '<tpl if="children.length != 0">', '<ss:{name} {propertiesString}>', '<tpl for="children">', '<ss:{name} {propertiesString} />', '</tpl>', '</ss:{name}>', '</tpl>', '</tpl>', '</ss:Style>')
});

/**
 * @class Ext.ux.exporter.excelFormatter.Workbook
 * @extends Object
 * Represents an Excel workbook
 */
Ext.define("Ext.ux.exporter.excelFormatter.Workbook", {
    constructor: function(config) {
        config = config || {};
        Ext.apply(this, config, {
            /**
       * @property title
       * @type String
       * The title of the workbook (defaults to "Workbook")
       */
            title: "Workbook",
            /**
       * @property worksheets
       * @type Array
       * The array of worksheets inside this workbook
       */
            worksheets: [],
            /**
       * @property compileWorksheets
       * @type Array
       * Array of all rendered Worksheets
       */
            compiledWorksheets: [],
            /**
       * @property cellBorderColor
       * @type String
       * The colour of border to use for each Cell
       */
            cellBorderColor: "#e4e4e4",
            /**
       * @property styles
       * @type Array
       * The array of Ext.ux.Exporter.ExcelFormatter.Style objects attached to this workbook
       */
            styles: [],
            /**
       * @property compiledStyles
       * @type Array
       * Array of all rendered Ext.ux.Exporter.ExcelFormatter.Style objects for this workbook
       */
            compiledStyles: [],
            /**
       * @property hasDefaultStyle
       * @type Boolean
       * True to add the default styling options to all cells (defaults to true)
       */
            hasDefaultStyle: true,
            /**
       * @property hasStripeStyles
       * @type Boolean
       * True to add the striping styles (defaults to true)
       */
            hasStripeStyles: true,
            windowHeight: 9000,
            windowWidth: 50000,
            protectStructure: false,
            protectWindows: false
        });
        if (this.hasDefaultStyle)  {
            this.addDefaultStyle();
        }
        
        if (this.hasStripeStyles)  {
            this.addStripedStyles();
        }
        
        this.addTitleStyle();
        this.addHeaderStyle();
    },
    render: function() {
        this.compileStyles();
        this.joinedCompiledStyles = this.compiledStyles.join("");
        this.compileWorksheets();
        this.joinedWorksheets = this.compiledWorksheets.join("");
        return this.tpl.apply(this);
    },
    /**
   * Adds a worksheet to this workbook based on a store and optional config
   * @param {Ext.data.Store} store The store to initialize the worksheet with
   * @param {Object} config Optional config object
   * @return {Ext.ux.Exporter.ExcelFormatter.Worksheet} The worksheet
   */
    addWorksheet: function(store, config) {
        var worksheet = new Ext.ux.exporter.excelFormatter.Worksheet(store, config);
        this.worksheets.push(worksheet);
        return worksheet;
    },
    /**
   * Adds a new Ext.ux.Exporter.ExcelFormatter.Style to this Workbook
   * @param {Object} config The style config, passed to the Style constructor (required)
   */
    addStyle: function(config) {
        var style = new Ext.ux.exporter.excelFormatter.Style(config || {});
        this.styles.push(style);
        return style;
    },
    /**
   * Compiles each Style attached to this Workbook by rendering it
   * @return {Array} The compiled styles array
   */
    compileStyles: function() {
        this.compiledStyles = [];
        Ext.each(this.styles, function(style) {
            this.compiledStyles.push(style.render());
        }, this);
        return this.compiledStyles;
    },
    /**
   * Compiles each Worksheet attached to this Workbook by rendering it
   * @return {Array} The compiled worksheets array
   */
    compileWorksheets: function() {
        this.compiledWorksheets = [];
        Ext.each(this.worksheets, function(worksheet) {
            this.compiledWorksheets.push(worksheet.render());
        }, this);
        return this.compiledWorksheets;
    },
    tpl: new Ext.XTemplate('<?xml version="1.0" encoding="utf-8"?>', '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:o="urn:schemas-microsoft-com:office:office">', '<o:DocumentProperties>', '<o:Title>{title}</o:Title>', '</o:DocumentProperties>', '<x:ExcelWorkbook>', '<x:WindowHeight>{windowHeight}</x:WindowHeight>', '<x:WindowWidth>{windowWidth}</x:WindowWidth>', '<x:ProtectStructure>{protectStructure}</x:ProtectStructure>', '<x:ProtectWindows>{protectWindows}</x:ProtectWindows>', '</x:ExcelWorkbook>', '<ss:Styles>', '{joinedCompiledStyles}', '</ss:Styles>', '{joinedWorksheets}', '</ss:Workbook>'),
    /**
   * Adds the default Style to this workbook. This sets the default font face and size, as well as cell borders
   */
    addDefaultStyle: function() {
        var borderProperties = [
                {
                    name: "Color",
                    value: this.cellBorderColor
                },
                {
                    name: "Weight",
                    value: "1"
                },
                {
                    name: "LineStyle",
                    value: "Continuous"
                }
            ];
        this.addStyle({
            id: 'Default',
            attributes: [
                {
                    name: "Alignment",
                    properties: [
                        {
                            name: "Vertical",
                            value: "Top"
                        },
                        {
                            name: "WrapText",
                            value: "1"
                        }
                    ]
                },
                {
                    name: "Font",
                    properties: [
                        {
                            name: "FontName",
                            value: "arial"
                        },
                        {
                            name: "Size",
                            value: "10"
                        }
                    ]
                },
                {
                    name: "Interior"
                },
                {
                    name: "NumberFormat"
                },
                {
                    name: "Protection"
                },
                {
                    name: "Borders",
                    children: [
                        {
                            name: "Border",
                            properties: [
                                {
                                    name: "Position",
                                    value: "Top"
                                }
                            ].concat(borderProperties)
                        },
                        {
                            name: "Border",
                            properties: [
                                {
                                    name: "Position",
                                    value: "Bottom"
                                }
                            ].concat(borderProperties)
                        },
                        {
                            name: "Border",
                            properties: [
                                {
                                    name: "Position",
                                    value: "Left"
                                }
                            ].concat(borderProperties)
                        },
                        {
                            name: "Border",
                            properties: [
                                {
                                    name: "Position",
                                    value: "Right"
                                }
                            ].concat(borderProperties)
                        }
                    ]
                }
            ]
        });
    },
    addTitleStyle: function() {
        this.addStyle({
            id: "title",
            attributes: [
                {
                    name: "Borders"
                },
                {
                    name: "Font"
                },
                {
                    name: "NumberFormat",
                    properties: [
                        {
                            name: "Format",
                            value: "@"
                        }
                    ]
                },
                {
                    name: "Alignment",
                    properties: [
                        {
                            name: "WrapText",
                            value: "1"
                        },
                        {
                            name: "Horizontal",
                            value: "Center"
                        },
                        {
                            name: "Vertical",
                            value: "Center"
                        }
                    ]
                }
            ]
        });
    },
    addHeaderStyle: function() {
        this.addStyle({
            id: "headercell",
            attributes: [
                {
                    name: "Font",
                    properties: [
                        {
                            name: "Bold",
                            value: "1"
                        },
                        {
                            name: "Size",
                            value: "10"
                        }
                    ]
                },
                {
                    name: "Interior",
                    properties: [
                        {
                            name: "Pattern",
                            value: "Solid"
                        },
                        {
                            name: "Color",
                            value: "#A3C9F1"
                        }
                    ]
                },
                {
                    name: "Alignment",
                    properties: [
                        {
                            name: "WrapText",
                            value: "1"
                        },
                        {
                            name: "Horizontal",
                            value: "Center"
                        }
                    ]
                }
            ]
        });
    },
    /**
   * Adds the default striping styles to this workbook
   */
    addStripedStyles: function() {
        this.addStyle({
            id: "even",
            attributes: [
                {
                    name: "Interior",
                    properties: [
                        {
                            name: "Pattern",
                            value: "Solid"
                        },
                        {
                            name: "Color",
                            value: "#CCFFFF"
                        }
                    ]
                }
            ]
        });
        this.addStyle({
            id: "odd",
            attributes: [
                {
                    name: "Interior",
                    properties: [
                        {
                            name: "Pattern",
                            value: "Solid"
                        },
                        {
                            name: "Color",
                            value: "#CCCCFF"
                        }
                    ]
                }
            ]
        });
        Ext.each([
            'even',
            'odd'
        ], function(parentStyle) {
            this.addChildNumberFormatStyle(parentStyle, parentStyle + 'date', "[ENG][$-409]dd-mmm-yyyy;@");
            this.addChildNumberFormatStyle(parentStyle, parentStyle + 'int', "0");
            this.addChildNumberFormatStyle(parentStyle, parentStyle + 'float', "0.00");
        }, this);
    },
    /**
   * Private convenience function to easily add a NumberFormat style for a given parentStyle
   * @param {String} parentStyle The ID of the parentStyle Style
   * @param {String} id The ID of the new style
   * @param {String} value The value of the NumberFormat's Format property
   */
    addChildNumberFormatStyle: function(parentStyle, id, value) {
        this.addStyle({
            id: id,
            parentStyle: "even",
            attributes: [
                {
                    name: "NumberFormat",
                    properties: [
                        {
                            name: "Format",
                            value: value
                        }
                    ]
                }
            ]
        });
    }
});

/**
 * @class Ext.ux.exporter.excelFormatter.Worksheet
 * @extends Object
 * Represents an Excel worksheet
 * @cfg {Ext.data.Store} store The store to use (required)
 */
Ext.define("Ext.ux.exporter.excelFormatter.Worksheet", {
    constructor: function(store, config) {
        config = config || {};
        this.store = store;
        Ext.applyIf(config, {
            hasTitle: true,
            hasHeadings: true,
            stripeRows: true,
            parserDiv: document.createElement("div"),
            title: "Workbook",
            columns: store.fields == undefined ? {} : store.fields.items
        });
        Ext.apply(this, config);
        Ext.ux.exporter.excelFormatter.Worksheet.superclass.constructor.apply(this, arguments);
    },
    /**
     * @property dateFormatString
     * @type String
     * String used to format dates (defaults to "Y-m-d"). All other data types are left unmolested
     */
    dateFormatString: "Y-m-d",
    worksheetTpl: new Ext.XTemplate('<ss:Worksheet ss:Name="{title}">', '<ss:Names>', '<ss:NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'{title}\'!R1:R2" />', '</ss:Names>', '<ss:Table x:FullRows="1" x:FullColumns="1" ss:ExpandedColumnCount="{colCount}" ss:ExpandedRowCount="{rowCount}">', '{columns}', '<ss:Row ss:Height="38">', '<ss:Cell ss:StyleID="title" ss:MergeAcross="{colCount - 1}">', '<ss:Data xmlns:html="http://www.w3.org/TR/REC-html40" ss:Type="String">', '<html:B><html:U><html:Font html:Size="15">{title}', '</html:Font></html:U></html:B></ss:Data><ss:NamedCell ss:Name="Print_Titles" />', '</ss:Cell>', '</ss:Row>', '<ss:Row ss:AutoFitHeight="1">', '{header}', '</ss:Row>', '{rows}', '</ss:Table>', '<x:WorksheetOptions>', '<x:PageSetup>', '<x:Layout x:CenterHorizontal="1" x:Orientation="Landscape" />', '<x:Footer x:Data="Page &amp;P of &amp;N" x:Margin="0.5" />', '<x:PageMargins x:Top="0.5" x:Right="0.5" x:Left="0.5" x:Bottom="0.8" />', '</x:PageSetup>', '<x:FitToPage />', '<x:Print>', '<x:PrintErrors>Blank</x:PrintErrors>', '<x:FitWidth>1</x:FitWidth>', '<x:FitHeight>32767</x:FitHeight>', '<x:ValidPrinterInfo />', '<x:VerticalResolution>600</x:VerticalResolution>', '</x:Print>', '<x:Selected />', '<x:DoNotDisplayGridlines />', '<x:ProtectObjects>False</x:ProtectObjects>', '<x:ProtectScenarios>False</x:ProtectScenarios>', '</x:WorksheetOptions>', '</ss:Worksheet>'),
    /**
     * Builds the Worksheet XML
     * @param {Ext.data.Store} store The store to build from
     */
    render: function(store) {
        return this.worksheetTpl.apply({
            header: this.buildHeader(),
            columns: this.buildColumns().join(""),
            rows: this.buildRows().join(""),
            colCount: this.columns.length,
            rowCount: this.store.getCount() + 2,
            title: this.title
        });
    },
    buildColumns: function() {
        var cols = [];
        Ext.each(this.columns, function(column) {
            cols.push(this.buildColumn());
        }, this);
        return cols;
    },
    buildColumn: function(width) {
        return Ext.String.format('<ss:Column ss:AutoFitWidth="1" ss:Width="{0}" />', width || 164);
    },
    buildRows: function() {
        var rows = [];
        this.store.each(function(record, index) {
            rows.push(this.buildRow(record, index));
        }, this);
        return rows;
    },
    buildHeader: function() {
        var cells = [];
        Ext.each(this.columns, function(col) {
            var title;
            //if(col.dataIndex) {
            if (col.text != undefined) {
                title = col.text;
            } else if (col.name) {
                //make columns taken from Record fields (e.g. with a col.name) human-readable
                title = col.name.replace(/_/g, " ");
                title = Ext.String.capitalize(title);
            }
            cells.push(Ext.String.format('<ss:Cell ss:StyleID="headercell"><ss:Data ss:Type="String">{0}</ss:Data><ss:NamedCell ss:Name="Print_Titles" /></ss:Cell>', title));
        }, //}
        this);
        return cells.join("");
    },
    buildRow: function(record, index) {
        var style,
            cells = [];
        if (this.stripeRows === true)  {
            style = index % 2 == 0 ? 'even' : 'odd';
        }
        
        Ext.each(this.columns, function(col) {
            var name = col.name || col.dataIndex;
            if (name) {
                //if given a renderer via a ColumnModel, use it and ensure data type is set to String
                if (Ext.isFunction(col.renderer) && col.xtype !== 'hcheckcolumn') {
                    var value = col.renderer(record.get(name), {}, record),
                        type = "String";
                    var values = [];
                    //to extract value if renderers returning html
                    this.parserDiv.innerHTML = value;
                    var divEls = this.parserDiv.getElementsByTagName('div');
                    if (divEls && divEls.length > 0) {
                        Ext.each(divEls, function(divEl) {
                            var innerValues = [];
                            var imgEls = divEl.getElementsByTagName('img');
                            Ext.each(imgEls, function(imgEl) {
                                innerValues.push(imgEl.getAttribute('title'));
                            });
                            innerValues.push(divEl.innerText || divEl.textContent);
                            values.push(innerValues.join(':'));
                        });
                    } else {
                        values.push(this.parserDiv.innerText || this.parserDiv.textContent);
                    }
                    value = values.join(' ');
                } else {
                    var value = record.get(name),
                        type = 'String';
                }
                //this.typeMappings[col.type || record.fields.get(name).type.type];
                //                    var value = record.get(name),
                //                        type = this.typeMappings[col.getXType() || record.fields.get(name).type.type];
                cells.push(this.buildCell(value, type, style).render());
            }
        }, this);
        return Ext.String.format("<ss:Row>{0}</ss:Row>", cells.join(""));
    },
    buildCell: function(value, type, style) {
        if (type == "DateTime" && Ext.isFunction(value.format)) {
            value = value.format(this.dateFormatString);
        }
        value = value.replace(/</g, "&lt;");
        return new Ext.ux.exporter.excelFormatter.Cell({
            value: value,
            type: type,
            style: style
        });
    },
    /**
     * @property typeMappings
     * @type Object
     * Mappings from Ext.data.Record types to Excel types
     */
    typeMappings: {
        'int': "Number",
        //        'string': "String",
        'gridcolumn': 'String',
        'float': "Number",
        'date': "DateTime"
    }
});

/**
 * @class Ext.ux.exporter.Exporter
 * @author Ed Spencer (http://edspencer.net), with modifications from iwiznia, with modifications from yogesh
 * Class providing a common way of downloading data in .xls or .csv format
 */
Ext.define("Ext.ux.exporter.Exporter", {
    uses: [
        "Ext.ux.exporter.ExporterButton",
        "Ext.ux.exporter.csvFormatter.CsvFormatter",
        "Ext.ux.exporter.excelFormatter.ExcelFormatter",
        "Ext.ux.exporter.FileSaver"
    ],
    statics: {
        /**
         * Exports a grid, using formatter
         * @param {Ext.grid.Panel/Ext.data.Store/Ext.tree.Panel} componet/store to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         * @return {Object} with data, mimeType, charset, ext(extension)
         */
        exportAny: function(component, format, config) {
            var func = "export";
            if (!component.is) {
                func = func + "Store";
            } else if (component.is("gridpanel")) {
                func = func + "Grid";
            } else if (component.is("treepanel")) {
                func = func + "Tree";
            } else {
                func = func + "Store";
                component = component.getStore();
            }
            var formatter = this.getFormatterByName(format);
            return this[func](component, formatter, config);
        },
        /**
         * Exports a grid, using formatter
         * @param {Ext.grid.Panel} grid The grid to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         */
        exportGrid: function(grid, formatter, config) {
            config = config || {};
            formatter = this.getFormatterByName(formatter);
            var store = grid.getStore() || config.store;
            if (grid.store_) {
                store = grid.store_;
            }
            var columns = Ext.Array.filter(grid.getColumns(), function(col) {
                    if (col.hidden || Ext.isEmpty(col.dataIndex)) {
                        return false;
                    }
                    return true;
                });
            //                return !col.hidden || Ext.isEmpty(col.dataIndex); // && (!col.xtype || col.xtype != "actioncolumn");
            //return !col.hidden; // && (!col.xtype || col.xtype != "actioncolumn");
            Ext.applyIf(config, {
                title: grid.title,
                columns: columns
            });
            return {
                data: formatter.format(store, config),
                mimeType: formatter.mimeType,
                charset: formatter.charset,
                ext: formatter.extension
            };
        },
        /**
         * Exports a grid, using formatter
         * @param {Ext.data.Store} store to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         */
        exportStore: function(store, formatter, config) {
            config = config || {};
            formatter = this.getFormatterByName(formatter);
            Ext.applyIf(config, {
                columns: store.fields ? store.fields.items : store.model.prototype.fields.items
            });
            return {
                data: formatter.format(store, config),
                mimeType: formatter.mimeType,
                charset: formatter.charset,
                ext: formatter.extension
            };
        },
        /**
         * Exports a tree, using formatter
         * @param {Ext.tree.Panel} store to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         */
        exportTree: function(tree, formatter, config) {
            config = config || {};
            formatter = this.getFormatterByName(formatter);
            var store = tree.getStore() || config.store;
            Ext.applyIf(config, {
                title: tree.title
            });
            return {
                data: formatter.format(store, config),
                mimeType: formatter.mimeType,
                charset: formatter.charset,
                ext: formatter.extension
            };
        },
        /**
         * Method returns the instance of {Ext.ux.exporter.Formatter} based on format
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @return {Ext.ux.exporter.Formatter}
         */
        getFormatterByName: function(formatter) {
            formatter = formatter ? formatter : "excel";
            formatter = !Ext.isString(formatter) ? formatter : Ext.create("Ext.ux.exporter." + formatter + "Formatter." + Ext.String.capitalize(formatter) + "Formatter");
            return formatter;
        }
    }
});

/**
 * @Class Ext.ux.exporter.FileSaver
 * @author Yogesh
 * Class that allows saving file via blobs: URIs or data: URIs or download remotely from server
 */
Ext.define('Ext.ux.exporter.FileSaver', {
    statics: {
        saveAs: function(data, mimeType, charset, filename, link, remote, cb, scope) {
            window.URL = window.URL || window.webkitURL;
            try {
                //If browser supports Blob(Gecko,Chrome,IE10+)
                var blob = new Blob([
                        data
                    ], {
                        //safari 5 throws error
                        type: mimeType + ";charset=" + charset + ","
                    });
                if (link && "download" in link) {
                    blobURL = window.URL.createObjectURL(blob);
                    link.href = blobURL;
                    link.download = filename;
                    if (cb)  {
                        cb.call(scope);
                    }
                    
                    this.cleanBlobURL(blobURL);
                    return;
                } else if (window.navigator.msSaveOrOpenBlob) {
                    //IE 10+
                    window.navigator.msSaveOrOpenBlob(blob, filename);
                    if (cb)  {
                        cb.call(scope);
                    }
                    
                    return;
                }
            } catch (e) {
                //open using data:URI 
                Ext.log("Browser doesn't support Blob: " + e.message);
            }
            //Browser doesn't support Blob save
            if (remote) {
                //send data to sever to download
                this.downloadUsingServer(data, mimeType, charset, filename, cb, scope);
            } else {
                //open data in new window
                this.openUsingDataURI(data, mimeType, charset);
                if (cb)  {
                    cb.call(scope);
                }
                
            }
        },
        downloadUsingServer: function(data, mimeType, charset, filename, cb, scope) {
            var form = Ext.getDom('formDummy');
            if (!form) {
                form = document.createElement('form');
                form.id = 'formDummy';
                form.name = 'formDummy';
                form.className = 'x-hidden';
                document.body.appendChild(form);
            }
            Ext.Ajax.request({
                url: '/ExportFileAction',
                method: 'POST',
                form: form,
                isUpload: true,
                params: {
                    userAction: 'download',
                    data: data,
                    mimeType: mimeType,
                    charset: charset,
                    filename: filename
                },
                callback: function() {
                    if (cb)  {
                        cb.call(scope);
                    }
                    
                }
            });
        },
        openUsingDataURI: function(data, mimeType, charset) {
            if (Ext.isIE9m) {
                //for IE 9 or lesser
                w = window.open();
                doc = w.document;
                doc.open(mimeType, 'replace');
                doc.charset = charset;
                doc.write(data);
                doc.close();
                doc.execCommand("SaveAs", null, filename);
            } else {
                window.open("data:" + mimeType + ";charset=" + charset + "," + encodeURIComponent(data), "_blank");
            }
        },
        cleanBlobURL: function(blobURL) {
            // Need a some delay for the revokeObjectURL to work properly.
            setTimeout(function() {
                window.URL.revokeObjectURL(blobURL);
            }, 10000);
        }
    }
});

/**
 * @class Ext.ux.Exporter.Button
 * @extends Ext.Button
 * @author Nige White, with modifications from Ed Spencer, with modifications from iwiznia with modifications from yogesh
 * Internally, this is just a link.
 * Pass it either an Ext.Component subclass with a 'store' property, or componentQuery of that component or just a store or nothing and it will try to grab the first parent of this button that is a grid or tree panel:
 * new Ext.ux.Exporter.ExporterButton({component: someGrid});
 * new Ext.ux.Exporter.ExporterButton({store: someStore});
 * new Ext.ux.Exporter.ExporterButton({component: '#itemIdSomeGrid'});
 * @cfg {Ext.Component} component The component the store is bound to
 * @cfg {Ext.data.Store} store The store to export (alternatively, pass a component with a getStore method)
 */
Ext.define("Ext.ux.exporter.ExporterButton", {
    extend: "Ext.Button",
    requires: [
        'Ext.ux.exporter.Exporter',
        'Ext.ux.exporter.FileSaver'
    ],
    alias: "widget.exporterbutton",
    config: {
        iconCls: null,
        showText: true
    },
    localeProperties: [
        'text',
        'iconCls'
    ],
    /**
     * @cfg {String} text
     * The button text to be used as innerHTML (html tags are accepted).
     */
    text: 'Download',
    /**
     * @cfg {String} format
     * The Exported File formatter
     */
    format: 'excel',
    /**
     * @cfg {Boolean} preventDefault
     * False to allow default action when the {@link #clickEvent} is processed.
     */
    preventDefault: false,
    /**
     * @cfg {Number} saveDelay
     * Increased buffer to avoid clickEvent fired many times within a short period.
     */
    saveDelay: 300,
    //iconCls: 'save',
    /**
     * @cfg {Boolean} remote
     * To remotely download file only if browser doesn't support locally
     * otherwise it will try to open in new window
     */
    remote: false,
    /**
     * @cfg {String} title
     * To set name to eported file, extension will be appended based on format
     */
    title: 'export',
    constructor: function(config) {
        var me = this;
        Ext.ux.exporter.ExporterButton.superclass.constructor.call(me, config);
        me.on("afterrender", function() {
            //wait for the button to be rendered, so we can look up to grab the component
            if (me.component) {
                me.component = !Ext.isString(me.component) ? me.component : Ext.ComponentQuery.query(me.component)[0];
            }
            me.setComponent(me.store || me.component || me.up("gridpanel") || me.up("treepanel") || me.targetGrid, config);
        });
    },
    onClick: function(e) {
        var me = this,
            blobURL = "",
            format = me.format,
            title = me.title,
            remote = me.remote,
            dt = new Date(),
            link = me.el.dom,
            res, fullname;
        me.fireEvent('start', me);
        res = Ext.ux.exporter.Exporter.exportAny(me.component, format, {
            title: title
        });
        filename = title + "_" + Ext.Date.format(dt, "Y-m-d h:i:s") + "." + res.ext;
        Ext.ux.exporter.FileSaver.saveAs(res.data, res.mimeType, res.charset, filename, link, remote, me.onComplete, me);
        me.callParent(arguments);
    },
    setComponent: function(component, config) {
        var me = this;
        me.component = component;
        var store = component.getStore(),
            total = store.getCount();
        //            extraParam = store.getProxy().getExtraParams()||{};
        //        if (component.getStore().pageSize) {
        //            Ext.getCmp(me.up('menu').getId()).mask("Updating... Please wait...", 'loading');
        //            extraParam['limit'] = 5000;
        //            extraParam['page'] = 1;
        //            extraParam['start'] = 0;
        //            component.store_ = Ext.create('Ext.data.Store', {
        //                fields: [],
        //                proxy: {
        //                    type: 'memory',
        //                    reader: {
        //                        type: 'json',
        //                        rootProperty: 'data'
        //                    }
        //                }
        //            });
        //            Ext.defer(function () {
        //                Util.CommonAjax({
        //                    url: component.getStore().getProxy().getUrl(),
        ////                    params: extraParam,
        //                    pSync: false,
        //                    pCallback: function (pScope, params, retData) {
        //                        component.store_.loadData(retData[component.getStore().getProxy().getReader().getRootProperty()]);
        //                        Ext.getCmp(me.up('menu').getId()).unmask();
        //                    }
        //                });
        //            },1000)
        //
        //        }
        me.store = !component.is ? component : component.getStore();
    },
    // only components or stores, if it doesn't respond to is method, it's a store
    onComplete: function() {
        this.fireEvent('complete', this);
    }
});

/*
Copyright (c)  2008-2012, www.redips.net  All rights reserved.
Code licensed under the BSD License: http://www.redips.net/license/
http://www.redips.net/javascript/table-td-merge-split/
Version 1.1.0
May 15, 2012.
*/
"use strict";
var REDIPS = REDIPS || {};
REDIPS.table = (function() {
    var onmousedown, handler_onmousedown, merge, merge_cells, max_cols, split, get_table, mark, cell_init, row, column, cell_list, relocate, remove_selection, cell_index, cell_ignore,
        tables = [],
        td_event, show_index,
        color = {
            cell: false,
            row: false,
            column: false
        },
        mark_nonempty = true;
    onmousedown = function(el, flag, type) {
        var td, i, t, get_tables;
        get_tables = function(el) {
            var arr = [],
                nodes, i;
            nodes = el.getElementsByTagName('table');
            for (i = 0; i < nodes.length; i++) {
                arr.push(nodes[i]);
            }
            return arr;
        };
        td_event = flag;
        if (typeof (el) === 'string') {
            if (type === 'classname') {
                tables = get_tables(document);
                for (i = 0; i < tables.length; i++) {
                    if (tables[i].className.indexOf(el) === -1) {
                        tables.splice(i, 1);
                        i--;
                    }
                }
            } else {
                el = document.getElementById(el);
            }
        }
        if (el && typeof (el) === 'object') {
            if (el.nodeName === 'TABLE') {
                tables[0] = el;
            } else {
                tables = get_tables(el);
            }
        }
        for (t = 0; t < tables.length; t++) {
            td = tables[t].getElementsByTagName('td');
            for (i = 0; i < td.length; i++) {
                cell_init(td[i]);
            }
        }
        cell_index();
    };
    cell_init = function(c) {
        if (c.className.indexOf('ignore') > -1) {
            return;
        }
        if (td_event === true) {
            REDIPS.event.add(c, 'mousedown', handler_onmousedown);
        } else {
            REDIPS.event.remove(c, 'mousedown', handler_onmousedown);
        }
    };
    cell_ignore = function(c) {
        if (typeof (c) === 'string') {
            c = document.getElementById(c);
        }
        REDIPS.event.remove(c, 'mousedown', handler_onmousedown);
    };
    handler_onmousedown = function(e) {
        var evt = e || window.event,
            td = evt.target || evt.srcElement,
            mouseButton, empty;
        empty = (/^\s*$/.test(td.innerHTML)) ? true : false;
        if (REDIPS.table.mark_nonempty === false && empty === false) {
            return;
        }
        if (evt.which) {
            mouseButton = evt.which;
        } else {
            mouseButton = evt.button;
        }
        if (mouseButton === 1) {
            td.redips = td.redips || {};
            if (td.redips.selected === true) {
                mark(false, td);
            } else {
                mark(true, td);
            }
        }
    };
    merge = function(mode, clear, table) {
        var tbl, tr, c, rc1, rc2, marked, span, id, cl, t, i, j,
            first = {
                index: -1,
                span: -1
            };
        remove_selection();
        tbl = (table === undefined) ? tables : get_table(table);
        for (t = 0; t < tbl.length; t++) {
            cl = cell_list(tbl[t]);
            tr = tbl[t].rows;
            rc1 = (mode === 'v') ? max_cols(tbl[t]) : tr.length;
            rc2 = (mode === 'v') ? tr.length : max_cols(tbl[t]);
            for (i = 0; i < rc1; i++) {
                first.index = first.span = -1;
                for (j = 0; j <= rc2; j++) {
                    id = (mode === 'v') ? (j + '-' + i) : (i + '-' + j);
                    if (cl[id]) {
                        c = cl[id];
                        c.redips = c.redips || {};
                        marked = c ? c.redips.selected : false;
                        span = (mode === 'v') ? c.colSpan : c.rowSpan;
                    } else {
                        marked = false;
                    }
                    if (marked === true && first.index === -1) {
                        first.index = j;
                        first.span = span;
                    } else if ((marked !== true && first.index > -1) || (first.span > -1 && first.span !== span)) {
                        merge_cells(cl, i, first.index, j, mode, clear);
                        first.index = first.span = -1;
                        if (marked === true) {
                            if (clear === true || clear === undefined) {
                                mark(false, c);
                            }
                            marked = false;
                        }
                    }
                    if (cl[id]) {
                        j += (mode === 'v') ? c.rowSpan - 1 : c.colSpan - 1;
                    }
                }
                if (marked === true) {
                    merge_cells(cl, i, first.index, j, mode, clear);
                }
            }
        }
        cell_index();
    };
    merge_cells = function(cl, idx, pos1, pos2, mode, clear) {
        var span = 0,
            id, fc, c, i;
        fc = (mode === 'v') ? cl[pos1 + '-' + idx] : cl[idx + '-' + pos1];
        for (i = pos1 + 1; i < pos2; i++) {
            id = (mode === 'v') ? (i + '-' + idx) : (idx + '-' + i);
            if (cl[id]) {
                c = cl[id];
                span += (mode === 'v') ? c.rowSpan : c.colSpan;
                relocate(c, fc);
                c.parentNode.deleteCell(c.cellIndex);
            }
        }
        if (fc !== undefined) {
            if (mode === 'v') {
                fc.rowSpan += span;
            } else {
                fc.colSpan += span;
            }
            if (clear === true || clear === undefined) {
                mark(false, fc);
            }
        }
    };
    max_cols = function(table) {
        var tr = table.rows,
            span,
            max = 0,
            i, j;
        if (typeof (table) === 'string') {
            table = document.getElementById(table);
        }
        for (i = 0; i < tr.length; i++) {
            span = 0;
            for (j = 0; j < tr[i].cells.length; j++) {
                span += tr[i].cells[j].colSpan || 1;
            }
            if (span > max) {
                max = span;
            }
        }
        return max;
    };
    split = function(mode, table) {
        var tbl, tr, c, cl, rs, n, cols, max, t, i, j, get_rowspan;
        get_rowspan = function(c, row, col) {
            var rs, last, i;
            rs = 0;
            last = row + c.rowSpan - 1;
            for (i = col - 1; i >= 0; i--) {
                if (cl[last + '-' + i] === undefined) {
                    rs++;
                }
            }
            return rs;
        };
        remove_selection();
        tbl = (table === undefined) ? tables : get_table(table);
        for (t = 0; t < tbl.length; t++) {
            cl = cell_list(tbl[t]);
            max = max_cols(tbl[t]);
            tr = tbl[t].rows;
            for (i = 0; i < tr.length; i++) {
                cols = (mode === 'v') ? max : tr[i].cells.length;
                for (j = 0; j < cols; j++) {
                    if (mode === 'v') {
                        c = cl[i + '-' + j];
                        if (c !== undefined) {
                            c.redips = c.redips || {};
                        }
                        if (c !== undefined && c.redips.selected === true && c.rowSpan > 1) {
                            rs = get_rowspan(c, i, j);
                            n = tr[i + c.rowSpan - 1].insertCell(j - rs);
                            n.colSpan = c.colSpan;
                            c.rowSpan -= 1;
                            cell_init(n);
                            cl = cell_list(tbl[t]);
                        }
                    } else {
                        c = tr[i].cells[j];
                        c.redips = c.redips || {};
                        if (c.redips.selected === true && c.colSpan > 1) {
                            cols++;
                            n = tr[i].insertCell(j + 1);
                            n.rowSpan = c.rowSpan;
                            c.colSpan -= 1;
                            cell_init(n);
                        }
                    }
                    if (c !== undefined) {
                        mark(false, c);
                    }
                }
            }
        }
        cell_index();
    };
    get_table = function(table) {
        var tbl = [];
        if (table !== undefined) {
            if (typeof (table) === 'string') {
                table = document.getElementById(table);
            }
            if (table && typeof (table) === 'object' && table.nodeName === 'TABLE') {
                tbl[0] = table;
            }
        }
        return tbl;
    };
    row = function(table, mode, index) {
        var nc,
            nr = null,
            fr, c, cl,
            cols = 0,
            i, j, k;
        remove_selection();
        if (typeof (table) !== 'object') {
            table = document.getElementById(table);
        }
        if (index === undefined) {
            index = -1;
        }
        if (mode === 'insert') {
            fr = table.rows[0];
            for (i = 0; i < fr.cells.length; i++) {
                cols += fr.cells[i].colSpan;
            }
            nr = table.insertRow(index);
            for (i = 0; i < cols; i++) {
                nc = nr.insertCell(i);
                cell_init(nc);
            }
            cell_index();
        } else {
            if (table.rows.length === 1) {
                return;
            }
            table.deleteRow(index);
            cl = cell_list(table);
            index = table.rows.length - 1;
            cols = max_cols(table);
            for (i = 0; i < cols; i++) {
                c = cl[index + '-' + i];
                if (c === undefined) {
                    for (j = index , k = 1; j >= 0; j-- , k++) {
                        c = cl[j + '-' + i];
                        if (c !== undefined) {
                            c.rowSpan = k;
                            break;
                        }
                    }
                } else if (c.rowSpan > 1) {
                    c.rowSpan -= 1;
                }
                i += c.colSpan - 1;
            }
        }
        return nr;
    };
    column = function(table, mode, index) {
        var c, idx, nc, i;
        remove_selection();
        if (typeof (table) !== 'object') {
            table = document.getElementById(table);
        }
        if (index === undefined) {
            index = -1;
        }
        if (mode === 'insert') {
            for (i = 0; i < table.rows.length; i++) {
                nc = table.rows[i].insertCell(index);
                cell_init(nc);
            }
            cell_index();
        } else {
            c = table.rows[0].cells;
            if (c.length === 1 && (c[0].colSpan === 1 || c[0].colSpan === undefined)) {
                return;
            }
            for (i = 0; i < table.rows.length; i++) {
                if (index === -1) {
                    idx = table.rows[i].cells.length - 1;
                } else {
                    idx = index;
                }
                c = table.rows[i].cells[idx];
                if (c.colSpan > 1) {
                    c.colSpan -= 1;
                } else {
                    table.rows[i].deleteCell(index);
                }
                i += c.rowSpan - 1;
            }
        }
    };
    mark = function(flag, el, row, col) {
        var cl;
        if (typeof (flag) !== 'boolean') {
            return;
        }
        if (typeof (el) === 'string') {
            el = document.getElementById(el);
        } else if (typeof (el) !== 'object') {
            return;
        }
        if (el.nodeName === 'TABLE') {
            cl = cell_list(el);
            el = cl[row + '-' + col];
        }
        if (!el || el.nodeName !== 'TD') {
            return;
        }
        el.redips = el.redips || {};
        if (typeof (REDIPS.table.color.cell) === 'string') {
            if (flag === true) {
                el.redips.background_old = el.style.backgroundColor;
                el.style.backgroundColor = REDIPS.table.color.cell;
            } else {
                el.style.backgroundColor = el.redips.background_old;
            }
        }
        el.redips.selected = flag;
    };
    remove_selection = function() {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection && document.selection.type === "Text") {
            try {
                document.selection.empty();
            } catch (error) {}
        }
    };
    cell_list = function(table) {
        var matrix = [],
            matrixrow,
            lookup = {},
            c, ri, rowspan, colspan, firstAvailCol, tr, i, j, k, l;
        tr = table.rows;
        for (i = 0; i < tr.length; i++) {
            for (j = 0; j < tr[i].cells.length; j++) {
                c = tr[i].cells[j];
                ri = c.parentNode.rowIndex;
                rowspan = c.rowSpan || 1;
                colspan = c.colSpan || 1;
                matrix[ri] = matrix[ri] || [];
                for (k = 0; k < matrix[ri].length + 1; k++) {
                    if (typeof (matrix[ri][k]) === 'undefined') {
                        firstAvailCol = k;
                        break;
                    }
                }
                lookup[ri + '-' + firstAvailCol] = c;
                for (k = ri; k < ri + rowspan; k++) {
                    matrix[k] = matrix[k] || [];
                    matrixrow = matrix[k];
                    for (l = firstAvailCol; l < firstAvailCol + colspan; l++) {
                        matrixrow[l] = 'x';
                    }
                }
            }
        }
        return lookup;
    };
    relocate = function(from, to) {
        var cn, i, j;
        if (from === to) {
            return;
        }
        cn = from.childNodes.length;
        for (i = 0 , j = 0; i < cn; i++) {
            if (from.childNodes[j].nodeType === 1) {
                to.appendChild(from.childNodes[j]);
            } else {
                j++;
            }
        }
    };
    cell_index = function(flag) {
        if (flag === undefined && show_index !== true) {
            return;
        }
        if (flag !== undefined) {
            show_index = flag;
        }
        var tr, c, cl, cols, i, j, t;
        for (t = 0; t < tables.length; t++) {
            tr = tables[t].rows;
            cols = max_cols(tables[t]);
            cl = cell_list(tables[t]);
            for (i = 0; i < tr.length; i++) {
                for (j = 0; j < cols; j++) {
                    if (cl[i + '-' + j]) {
                        c = cl[i + '-' + j];
                        c.innerHTML = (show_index) ? i + '-' + j : '';
                    }
                }
            }
        }
    };
    return {
        color: color,
        mark_nonempty: mark_nonempty,
        onmousedown: onmousedown,
        mark: mark,
        merge: merge,
        split: split,
        row: row,
        column: column,
        cell_index: cell_index,
        cell_ignore: cell_ignore
    };
}());
if (!REDIPS.event) {
    REDIPS.event = (function() {
        var add, remove;
        add = function(obj, eventName, handler) {
            if (obj.addEventListener) {
                obj.addEventListener(eventName, handler, false);
            } else if (obj.attachEvent) {
                obj.attachEvent('on' + eventName, handler);
            } else {
                obj['on' + eventName] = handler;
            }
        };
        remove = function(obj, eventName, handler) {
            if (obj.removeEventListener) {
                obj.removeEventListener(eventName, handler, false);
            } else if (obj.detachEvent) {
                obj.detachEvent('on' + eventName, handler);
            } else {
                obj['on' + eventName] = null;
            }
        };
        return {
            add: add,
            remove: remove
        };
    }());
}

/*
Copyright (c)  2008-2012, www.redips.net  All rights reserved.
Code licensed under the BSD License: http://www.redips.net/license/
http://www.redips.net/javascript/table-td-merge-split/
Version 1.1.0
May 15, 2012.
*/
/*jslint white: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 14 */
/*global window: false */
/* enable strict mode */
"use strict";
// create REDIPS namespace (if is not already defined in another REDIPS package)
var REDIPS = REDIPS || {};
/**
 * @namespace
 * @description REDIPS.table is a JavaScript library which enables dynamically merging and splitting table cells.
 * @name REDIPS.table
 * @author Darko Bunic
 * @see
 * <a href="http://www.redips.net/javascript/table-td-merge-split/">Merge and split table cells with JavaScript</a>
 * @version 1.1.0
 */
REDIPS.table = (function() {
    // methods declaration
    var onmousedown, // method attaches onmousedown event listener to table cells
        handler_onmousedown, // onmousedown handler
        merge, // method merges marked cells
        merge_cells, // method merges/deletes table cells (used by merge_h & merge_v)
        max_cols, // method returns maximum number of columns in a table
        split, // method splits merged cells (if cell has colspan/rowspan greater then 1)
        get_table, // method sets reference to the table (it's used in "merge" and "split" public methods) 
        mark, // method marks table cell
        cell_init, // method attaches "mousedown" event listener and creates "redips" property to the newly created table cell
        row, // method adds/deletes table row
        column, // method adds/deletes table column
        cell_list, // method returns cell list with new coordinates
        relocate, // relocate element nodes from source cell to the target cell
        remove_selection, // method removes text selection
        cell_index, // method displays cellIndex (debug mode)
        cell_ignore,
        // method removes onmousedown even listener in case of active REDIPS.table.onmousedown mode
        // private properties
        tables = [],
        // table collection
        td_event, // (boolean) if set to true then cell_init will attach event listener to the table cell
        show_index,
        // (boolean) show cell index
        // variables in the private scope revealed as public properties
        color = {
            cell: false,
            // color of marked cell
            row: false,
            // color of marked row
            column: false
        },
        // color of marked column
        mark_nonempty = true;
    // enable / disable marking not empty table cells.
    /**
	 * Method attaches or removes onmousedown event listener on TD elements depending on second parameter value (default is true).
	 * If third parameter is set to "classname" then tables will be selected by class name (named in first parameter).
	 * All found tables will be saved in internal array.
	 * Sending reference in this case will not be needed when calling merge or split method.
	 * Table cells marked with class name "ignore" will not have attached onmousedown event listener (in short, these table cells will be ignored).
	 * @param {String|HTMLElement} el Container Id. TD elements within container will have added onmousewdown event listener.
	 * @param {Boolean} [flag] If set to true then onmousedown event listener will be attached to every table cell.
	 * @param {String} [type] If set to "class name" then all tables with a given class name (first parameter is considered as class name) will be initialized. Default is container/table reference or container/table id.
	 * @example
	 * // activate onmousedown event listener on cells within table with id="mainTable"
	 * REDIPS.table.onmousedown('mainTable', true);
	 *  
	 * // activate onmousedown event listener on cells for tables with class="blue"
	 * REDIPS.table.onmousedown('blue', true, 'classname');
	 * @public
	 * @function
	 * @name REDIPS.table#onmousedown
	 */
    onmousedown = function(el, flag, type) {
        var td, // collection of table cells within container
            i, t, // loop variables
            get_tables;
        // private method returns array
        // method returns array with table nodes for a DOM node
        get_tables = function(el) {
            var arr = [],
                // result array
                nodes, // node collection
                i;
            // loop variable
            // collect table nodes
            nodes = el.getElementsByTagName('table');
            // open node loop and push to array
            for (i = 0; i < nodes.length; i++) {
                arr.push(nodes[i]);
            }
            // return result array
            return arr;
        };
        // save event parameter to td_event private property
        td_event = flag;
        // if third parameter is set to "classname" then select tables by given class name (first parameter is considered as class name) 
        if (typeof (el) === 'string') {
            if (type === 'classname') {
                // collect all tables on the page
                tables = get_tables(document);
                // open loop
                for (i = 0; i < tables.length; i++) {
                    // if class name is not found then cut out table from tables collection
                    if (tables[i].className.indexOf(el) === -1) {
                        tables.splice(i, 1);
                        i--;
                    }
                }
            } else // first parameter is string and that should be id of container or id of a table
            {
                // set object reference (overwrite el parameter)
                el = document.getElementById(el);
            }
        }
        // el is object
        if (el && typeof (el) === 'object') {
            // if container is already a table
            if (el.nodeName === 'TABLE') {
                tables[0] = el;
            } else // else collect tables within container
            {
                tables = get_tables(el);
            }
        }
        // at this point tables should contain one or more tables
        for (t = 0; t < tables.length; t++) {
            // collect table cells from the selected table
            td = tables[t].getElementsByTagName('td');
            // loop goes through every collected TD
            for (i = 0; i < td.length; i++) {
                // add or remove event listener
                cell_init(td[i]);
            }
        }
        // show cell index (if show_index public property is set to true)
        cell_index();
    };
    /**
	 * Method attaches "mousedown" event listener to the newly created table cell or removes event listener if needed.
	 * @param {HTMLElement} c Table cell element.
	 * @private
	 * @memberOf REDIPS.table#
	 */
    cell_init = function(c) {
        // if cell contains "ignore" class name then ignore this table cell
        if (c.className.indexOf('ignore') > -1) {
            return;
        }
        // if td_event is set to true then onmousedown event listener will be attached to table cells
        if (td_event === true) {
            REDIPS.event.add(c, 'mousedown', handler_onmousedown);
        } else {
            REDIPS.event.remove(c, 'mousedown', handler_onmousedown);
        }
    };
    /**
	 * Method removes attached onmousedown event listener.
	 * Sometimes is needed to manually ignore some cells in table after row/column were dynamically added.
	 * @param {HTMLElement|String} c Cell id or cell reference of table that should be ignored (onmousedown event listener will be removed).
	 * @public
	 * @function
	 * @name REDIPS.table#cell_ignore
	 */
    cell_ignore = function(c) {
        // if input parameter is string then overwrite it with cell reference
        if (typeof (c) === 'string') {
            c = document.getElementById(c);
        }
        // remove onmousedown event listener
        REDIPS.event.remove(c, 'mousedown', handler_onmousedown);
    };
    /**
	 * On mousedown event attached to the table cell. If left mouse button is clicked and table cell is empty then cell will be marked or cleaned.
	 * This event handler is attached to every TD element.
	 * @param {Event} e Event information.
	 * @private
	 * @memberOf REDIPS.table#
	 */
    handler_onmousedown = function(e) {
        var evt = e || window.event,
            td = evt.target || evt.srcElement,
            mouseButton, empty;
        // set empty flag for clicked TD element
        // http://forums.asp.net/t/1409248.aspx/1
        empty = (/^\s*$/.test(td.innerHTML)) ? true : false;
        // if "mark_nonempty" is set to false and current cell is not empty then do nothing (just return from the event handler)
        if (REDIPS.table.mark_nonempty === false && empty === false) {
            return;
        }
        // define which mouse button was pressed
        if (evt.which) {
            mouseButton = evt.which;
        } else {
            mouseButton = evt.button;
        }
        // if left mouse button is pressed and target cell is empty
        if (mouseButton === 1) /*&& td.childNodes.length === 0*/
        {
            // if custom property "redips" doesn't exist then create custom property
            td.redips = td.redips || {};
            // cell is already marked
            if (td.redips.selected === true) {
                // return original background color and reset selected flag
                mark(false, td);
            } else // cell is not marked
            {
                mark(true, td);
            }
        }
    };
    /**
	 * Method merges marked table cells horizontally or vertically.
	 * @param {String} mode Merge type: h - horizontally, v - vertically. Default is "h".
	 * @param {Boolean} [clear] true - cells will be clean (without mark) after merging, false -  cells will remain marked after merging. Default is "true". 
	 * @param {HTMLElement|String} [table] Table id or table reference.
	 * @public
	 * @function
	 * @name REDIPS.table#merge
	 */
    merge = function(mode, clear, table) {
        var tbl, // table array (loaded from tables array or from table input parameter)
            tr, // row reference in table
            c, // current cell
            rc1, // row/column maximum value for first loop
            rc2, // row/column maximum value for second loop
            marked, // (boolean) marked flag of current cell
            span, // (integer) rowspan/colspan value
            id, // cell id in format "1-2", "1-4" ...
            cl, // cell list with new coordinates
            t, // table reference
            i, j,
            // loop variables
            first = {
                index: -1,
                // index of first cell in sequence
                span: -1
            };
        // span value (colspan / rowspan) of first cell in sequence
        // remove text selection
        remove_selection();
        // if table input parameter is undefined then use "tables" private property (table array) or set table reference from get_table method
        tbl = (table === undefined) ? tables : get_table(table);
        // open loop for each table inside container
        for (t = 0; t < tbl.length; t++) {
            // define cell list with new coordinates
            cl = cell_list(tbl[t]);
            // define row number in current table
            tr = tbl[t].rows;
            // define maximum value for first loop (depending on mode)
            rc1 = (mode === 'v') ? max_cols(tbl[t]) : tr.length;
            // define maximum value for second loop (depending on mode)
            rc2 = (mode === 'v') ? tr.length : max_cols(tbl[t]);
            // first loop
            for (i = 0; i < rc1; i++) {
                // reset marked cell index and span value
                first.index = first.span = -1;
                // second loop
                for (j = 0; j <= rc2; j++) {
                    // set cell id (depending on horizontal/verical merging)
                    id = (mode === 'v') ? (j + '-' + i) : (i + '-' + j);
                    // if cell with given coordinates (in form like "1-2") exists, then process this cell
                    if (cl[id]) {
                        // set current cell
                        c = cl[id];
                        // if custom property "redips" doesn't exist then create custom property
                        c.redips = c.redips || {};
                        // set marked flag for current cell
                        marked = c ? c.redips.selected : false;
                        // set opposite span value
                        span = (mode === 'v') ? c.colSpan : c.rowSpan;
                    } else {
                        marked = false;
                    }
                    // if first marked cell in sequence is found then remember index of first marked cell and span value
                    if (marked === true && first.index === -1) {
                        first.index = j;
                        first.span = span;
                    }
                    // sequence of marked cells is finished (naturally or next cell has different span value)
                    else if ((marked !== true && first.index > -1) || (first.span > -1 && first.span !== span)) {
                        // merge cells in a sequence (cell list, row/column, sequence start, sequence end, horizontal/vertical mode)
                        merge_cells(cl, i, first.index, j, mode, clear);
                        // reset marked cell index and span value
                        first.index = first.span = -1;
                        // if cell is selected then unmark and reset marked flag
                        // reseting marked flag is needed in case for last cell in column/row (so merge_cells () outside for loop will not execute)
                        if (marked === true) {
                            // if clear flag is set to true (or undefined) then clear marked cell after merging
                            if (clear === true || clear === undefined) {
                                mark(false, c);
                            }
                            marked = false;
                        }
                    }
                    // increase "j" counter for span value (needed for merging spanned cell and cell after when index is not in sequence)
                    if (cl[id]) {
                        j += (mode === 'v') ? c.rowSpan - 1 : c.colSpan - 1;
                    }
                }
                // if loop is finished and last cell is marked (needed in case when TD sequence include last cell in table row)
                if (marked === true) {
                    merge_cells(cl, i, first.index, j, mode, clear);
                }
            }
        }
        // show cell index (if show_index public property is set to true)
        cell_index();
    };
    /**
	 * Method merges and deletes table cells in sequence (horizontally or vertically).
	 * @param {Object} cl Cell list (output from cell_list method)
	 * @param {Integer} idx Row/column index in which cells will be merged.
	 * @param {Integer} pos1 Cell sequence start in row/column.
	 * @param {Integer} pos2 Cell sequence end in row/column.
	 * @param {String} mode Merge type: h - horizontally, v - vertically. Default is "h".
	 * @param {Boolean} [clear] true - cells will be clean (without mark) after merging, false -  cells will remain marked after merging. Default is "true".
	 * @private
	 * @memberOf REDIPS.table#
	 */
    merge_cells = function(cl, idx, pos1, pos2, mode, clear) {
        var span = 0,
            // set initial span value to 0
            id, // cell id in format "1-2", "1-4" ...
            fc, // reference of first cell in sequence
            c, // reference of current cell 
            i;
        // loop variable
        // set reference of first cell in sequence
        fc = (mode === 'v') ? cl[pos1 + '-' + idx] : cl[idx + '-' + pos1];
        // delete table cells and sum their colspans
        for (i = pos1 + 1; i < pos2; i++) {
            // set cell id (depending on horizontal/verical merging)
            id = (mode === 'v') ? (i + '-' + idx) : (idx + '-' + i);
            // if cell with given coordinates (in form like "1-2") exists, then process this cell
            if (cl[id]) {
                // define next cell in column/row
                c = cl[id];
                // add colSpan/rowSpan value
                span += (mode === 'v') ? c.rowSpan : c.colSpan;
                // relocate content before deleting cell in merging process
                relocate(c, fc);
                // delete cell
                c.parentNode.deleteCell(c.cellIndex);
            }
        }
        // if cell exists
        if (fc !== undefined) {
            // vertical merging
            if (mode === 'v') {
                fc.rowSpan += span;
            } else // set new rowspan value
            // horizontal merging
            {
                fc.colSpan += span;
            }
            // set new rowspan value
            // if clear flag is set to true (or undefined) then set original background color and reset selected flag
            if (clear === true || clear === undefined) {
                mark(false, fc);
            }
        }
    };
    /**
	 * Method returns number of maximum columns in table (some row may contain merged cells).
	 * @param {HTMLElement|String} table TABLE element.
	 * @private
	 * @memberOf REDIPS.table#
	 */
    max_cols = function(table) {
        var tr = table.rows,
            // define number of rows in current table
            span,
            // sum of colSpan values
            max = 0,
            // maximum number of columns
            i, j;
        // loop variable
        // if input parameter is string then overwrite it with table reference
        if (typeof (table) === 'string') {
            table = document.getElementById(table);
        }
        // open loop for each TR within table
        for (i = 0; i < tr.length; i++) {
            // reset span value
            span = 0;
            // sum colspan value for each table cell
            for (j = 0; j < tr[i].cells.length; j++) {
                span += tr[i].cells[j].colSpan || 1;
            }
            // set maximum value
            if (span > max) {
                max = span;
            }
        }
        // return maximum value
        return max;
    };
    /**
	 * Method splits marked table cell only if cell has colspan/rowspan greater then 1.
	 * @param {String} mode Split type: h - horizontally, v - vertically. Default is "h".
	 * @param {HTMLElement|String} [table] Table id or table reference.
	 * @public
	 * @function
	 * @name REDIPS.table#split
	 */
    split = function(mode, table) {
        var tbl, // table array (loaded from tables array or from table input parameter)
            tr, // row reference in table
            c, // current table cell
            cl, // cell list with new coordinates
            rs, // rowspan cells before
            n, // reference of inserted table cell
            cols, // number of columns (used in TD loop)
            max, // maximum number of columns
            t, // table reference
            i, j, // loop variables
            get_rowspan;
        // method returns number of rowspan cells before current cell (in a row)
        get_rowspan = function(c, row, col) {
            var rs, last, i;
            // set rs
            rs = 0;
            // set row index of bottom row for the current cell with rowspan value
            last = row + c.rowSpan - 1;
            // go through every cell before current cell in a row
            for (i = col - 1; i >= 0; i--) {
                // if cell doesn't exist then rowspan cell exists before
                if (cl[last + '-' + i] === undefined) {
                    rs++;
                }
            }
            return rs;
        };
        // remove text selection
        remove_selection();
        // if table input parameter is undefined then use "tables" private property (table array) or set table reference from get_table method
        tbl = (table === undefined) ? tables : get_table(table);
        // loop TABLE
        for (t = 0; t < tbl.length; t++) {
            // define cell list with new coordinates
            cl = cell_list(tbl[t]);
            // define maximum number of columns in table
            max = max_cols(tbl[t]);
            // define row number in current table
            tr = tbl[t].rows;
            // loop TR
            for (i = 0; i < tr.length; i++) {
                // define column number (depending on mode)
                cols = (mode === 'v') ? max : tr[i].cells.length;
                // loop TD
                for (j = 0; j < cols; j++) {
                    // split vertically
                    if (mode === 'v') {
                        // define current table cell
                        c = cl[i + '-' + j];
                        // if custom property "redips" doesn't exist then create custom property
                        if (c !== undefined) {
                            c.redips = c.redips || {};
                        }
                        // if marked cell is found and rowspan property is greater then 1
                        if (c !== undefined && c.redips.selected === true && c.rowSpan > 1) {
                            // get rowspaned cells before current cell (in a row)
                            rs = get_rowspan(c, i, j);
                            // insert new cell at last position of rowspan (consider rowspan cells before)
                            n = tr[i + c.rowSpan - 1].insertCell(j - rs);
                            // set the same colspan value as it has current cell
                            n.colSpan = c.colSpan;
                            // decrease rowspan of marked cell
                            c.rowSpan -= 1;
                            // add "redips" property to the table cell and optionally event listener
                            cell_init(n);
                            // recreate cell list after vertical split (new cell is inserted)
                            cl = cell_list(tbl[t]);
                        }
                    } else // split horizontally
                    {
                        // define current table cell
                        c = tr[i].cells[j];
                        // if custom property "redips" doesn't exist then create custom property
                        c.redips = c.redips || {};
                        // if marked cell is found and cell has colspan property greater then 1
                        if (c.redips.selected === true && c.colSpan > 1) {
                            // increase cols (because new cell is inserted)
                            cols++;
                            // insert cell after current cell
                            n = tr[i].insertCell(j + 1);
                            // set the same rowspan value as it has current cell
                            n.rowSpan = c.rowSpan;
                            // decrease colspan of marked cell
                            c.colSpan -= 1;
                            // add "redips" property to the table cell and optionally event listener
                            cell_init(n);
                        }
                    }
                    // return original background color and reset selected flag (if cell exists)
                    if (c !== undefined) {
                        mark(false, c);
                    }
                }
            }
        }
        // show cell index (if show_index public property is set to true)
        cell_index();
    };
    /**
	 * Method sets reference to the table. It is used in "merge" and "split" public methods. 
	 * @param {HTMLElement|String} table Table id or table reference.
	 * @return {Array} Returns empty array or array with one member (table node).
	 * @private
	 * @memberOf REDIPS.table#
	 */
    get_table = function(table) {
        // define output array
        var tbl = [];
        // input parameter should exits
        if (table !== undefined) {
            // if table parameter is string then set reference and overwrite input parameter
            if (typeof (table) === 'string') {
                table = document.getElementById(table);
            }
            // set table reference if table is not null and table is object and node is TABLE
            if (table && typeof (table) === 'object' && table.nodeName === 'TABLE') {
                tbl[0] = table;
            }
        }
        // return table reference as array
        return tbl;
    };
    /**
	 * Method adds / deletes table row. If index is omitted then index of last row will be set.
	 * @param {HTMLElement|String} table Table id or table reference.
	 * @param {String} mode Insert/delete table row
	 * @param {Integer} [index] Index where row will be inserted or deleted. Last row will be assumed if index is not defined.
	 * @return {HTMLElement} Returns reference of inserted row or NULL (in case of deleting row).
	 * @public
	 * @function
	 * @name REDIPS.table#row
	 */
    row = function(table, mode, index) {
        var nc,
            // new cell
            nr = null,
            // new row
            fr, // reference of first row
            c, // current cell reference
            cl,
            // cell list
            cols = 0,
            // number of columns
            i, j, k;
        // loop variables
        // remove text selection
        remove_selection();
        // if table is not object then input parameter is id and table parameter will be overwritten with table reference
        if (typeof (table) !== 'object') {
            table = document.getElementById(table);
        }
        // if index is not defined then index of the last row
        if (index === undefined) {
            index = -1;
        }
        // insert table row
        if (mode === 'insert') {
            // set reference of first row
            fr = table.rows[0];
            // define number of columns (it is colspan sum)
            for (i = 0; i < fr.cells.length; i++) {
                cols += fr.cells[i].colSpan;
            }
            // insert table row (insertRow returns reference to the newly created row)
            nr = table.insertRow(index);
            // insert table cells to the new row
            for (i = 0; i < cols; i++) {
                nc = nr.insertCell(i);
                // add "redips" property to the table cell and optionally event listener
                cell_init(nc);
            }
            // show cell index (if show_index public property is set to true)
            cell_index();
        } else // delete table row and update rowspan for cells in upper rows if needed
        {
            // last row should not be deleted
            if (table.rows.length === 1) {
                return;
            }
            // delete last row
            table.deleteRow(index);
            // prepare cell list
            cl = cell_list(table);
            // set new index for last row
            index = table.rows.length - 1;
            // set maximum number of columns that table has
            cols = max_cols(table);
            // open loop for each cell in last row
            for (i = 0; i < cols; i++) {
                // try to find cell in last row
                c = cl[index + '-' + i];
                // if cell doesn't exist then update colspan in upper cells
                if (c === undefined) {
                    // open loop for cells up in column
                    for (j = index , k = 1; j >= 0; j-- , k++) {
                        // try to find cell upper cell with rowspan value
                        c = cl[j + '-' + i];
                        // if cell is found then update rowspan value
                        if (c !== undefined) {
                            c.rowSpan = k;
                            break;
                        }
                    }
                }
                // if cell in last row has rowspan greater then 1
                else if (c.rowSpan > 1) {
                    c.rowSpan -= 1;
                }
                // increase loop variable "i" for colspan value
                i += c.colSpan - 1;
            }
        }
        // in case of inserting new table row method will return TR reference (otherwise it will return NULL)
        return nr;
    };
    /**
	 * Method adds / deletes table column. Last column will be assumed if index is omitted.
	 * @param {HTMLElement|String} table Table id or table reference.
	 * @param {String} mode Insert/delete table column
	 * @param {Integer} [index] Index where column will be inserted or deleted. Last column will be assumed if index is not defined.  
	 * @public
	 * @function
	 * @name REDIPS.table#column
	 */
    column = function(table, mode, index) {
        var c, // current cell
            idx, // cell index needed when column is deleted
            nc, // new cell
            i;
        // loop variable
        // remove text selection
        remove_selection();
        // if table is not object then input parameter is id and table parameter will be overwritten with table reference
        if (typeof (table) !== 'object') {
            table = document.getElementById(table);
        }
        // if index is not defined then index will be set to special value -1 (means to remove the very last column of a table or add column to the table end)
        if (index === undefined) {
            index = -1;
        }
        // insert table column
        if (mode === 'insert') {
            // loop iterates through each table row
            for (i = 0; i < table.rows.length; i++) {
                // insert cell
                nc = table.rows[i].insertCell(index);
                // add "redips" property to the table cell and optionally event listener
                cell_init(nc);
            }
            // show cell index (if show_index public property is set to true)
            cell_index();
        } else // delete table column
        {
            // set reference to the first row
            c = table.rows[0].cells;
            // test column number and prevent deleting last column
            if (c.length === 1 && (c[0].colSpan === 1 || c[0].colSpan === undefined)) {
                return;
            }
            // row loop
            for (i = 0; i < table.rows.length; i++) {
                // define cell index for last column
                if (index === -1) {
                    idx = table.rows[i].cells.length - 1;
                } else // if index is defined then use "index" value
                {
                    idx = index;
                }
                // define current cell (it can't use special value -1)
                c = table.rows[i].cells[idx];
                // if cell has colspan value then decrease colspan value
                if (c.colSpan > 1) {
                    c.colSpan -= 1;
                } else // else delete cell
                {
                    table.rows[i].deleteCell(index);
                }
                // increase loop variable "i" for rowspan value
                i += c.rowSpan - 1;
            }
        }
    };
    /**
	 * Method sets or removes mark from table cell. It can be called on several ways:
	 * with direct cell address (cell reference or cell id) or with cell coordinates (row and column).
	 * @param {Boolean} flag If set to true then TD will be marked, otherwise table cell will be cleaned.
	 * @param {HTMLElement|String} el Cell reference or id of table cell. Or it can be table reference or id of the table.  
	 * @param {Integer} [row] Row of the cell.
	 * @param {Integer} [col] Column of the cell.
	 * @example
	 * // set mark to the cell with "mycell" reference
	 * REDIPS.table.mark(true, mycell);
	 *  
	 * // remove mark from the cell with id "a1"
	 * REDIPS.table.mark(false, "a1");
	 *  
	 * // set mark to the cell with coordinates (1,2) on table with reference "mytable"   
	 * REDIPS.table.mark(true, mytable, 1, 2);
	 *  
	 * // remove mark from the cell with coordinates (4,5) on table with id "t3"
	 * REDIPS.table.mark(false, "t3", 4, 5);
	 * @public
	 * @function
	 * @name REDIPS.table#mark
	 */
    mark = function(flag, el, row, col) {
        // cell list with new coordinates
        var cl;
        // first parameter "flag" should be boolean (if not, then return from method
        if (typeof (flag) !== 'boolean') {
            return;
        }
        // test type of the second parameter (it can be string or object)
        if (typeof (el) === 'string') {
            // set reference to table or table cell (overwrite input el parameter)
            el = document.getElementById(el);
        }
        // if el is not string and is not an object then return from the method
        else if (typeof (el) !== 'object') {
            return;
        }
        // at this point, el should be an object - so test if it's TD or TABLE
        if (el.nodeName === 'TABLE') {
            // prepare cell list
            cl = cell_list(el);
            // set reference to the cell (overwrite input el parameter)
            el = cl[row + '-' + col];
        }
        // if el doesn't exist (el is not set in previous step) or el is not table cell either then return from method
        if (!el || el.nodeName !== 'TD') {
            return;
        }
        // if custom property "redips" doesn't exist then create custom property
        el.redips = el.redips || {};
        // if color property is string, then TD background color will be changed (REDIPS.table.color.cell can be set to false)
        if (typeof (REDIPS.table.color.cell) === 'string') {
            // mark table cell
            if (flag === true) {
                // remember old color
                el.redips.background_old = el.style.backgroundColor;
                // set background color
                el.style.backgroundColor = REDIPS.table.color.cell;
            } else // umark table cell
            {
                // return original background color and reset selected flag
                el.style.backgroundColor = el.redips.background_old;
            }
        }
        // set flag (true/false) to the cell "selected" property
        el.redips.selected = flag;
    };
    /**
	 * Method removes text selection.
	 * @private
	 * @memberOf REDIPS.table#
	 */
    remove_selection = function() {
        // remove text selection (Chrome, FF, Opera, Safari)
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        // IE8
        else if (document.selection && document.selection.type === "Text") {
            try {
                document.selection.empty();
            } catch (error) {}
        }
    };
    // ignore error to as a workaround for bug in IE8
    /**
	 * Determining a table cell's X and Y position/index.
	 * @see <a href="http://www.javascripttoolbox.com/temp/table_cellindex.html">http://www.javascripttoolbox.com/temp/table_cellindex.html</a>
	 * @see <a href="http://www.barryvan.com.au/2012/03/determining-a-table-cells-x-and-y-positionindex/">http://www.barryvan.com.au/2012/03/determining-a-table-cells-x-and-y-positionindex/</a>
	 * @private
	 * @memberOf REDIPS.table#
	 */
    cell_list = function(table) {
        var matrix = [],
            matrixrow,
            lookup = {},
            c, // current cell
            ri, // row index
            rowspan, colspan, firstAvailCol, tr, // TR collection
            i, j, k, l;
        // loop variables
        // set HTML collection of table rows
        tr = table.rows;
        // open loop for each TR element
        for (i = 0; i < tr.length; i++) {
            // open loop for each cell within current row
            for (j = 0; j < tr[i].cells.length; j++) {
                // define current cell
                c = tr[i].cells[j];
                // set row index
                ri = c.parentNode.rowIndex;
                // define cell rowspan and colspan values
                rowspan = c.rowSpan || 1;
                colspan = c.colSpan || 1;
                // if matrix for row index is not defined then initialize array
                matrix[ri] = matrix[ri] || [];
                // find first available column in the first row
                for (k = 0; k < matrix[ri].length + 1; k++) {
                    if (typeof (matrix[ri][k]) === 'undefined') {
                        firstAvailCol = k;
                        break;
                    }
                }
                // set cell coordinates and reference to the table cell
                lookup[ri + '-' + firstAvailCol] = c;
                for (k = ri; k < ri + rowspan; k++) {
                    matrix[k] = matrix[k] || [];
                    matrixrow = matrix[k];
                    for (l = firstAvailCol; l < firstAvailCol + colspan; l++) {
                        matrixrow[l] = 'x';
                    }
                }
            }
        }
        return lookup;
    };
    /**
	 * Method relocates element nodes from source cell to the target table cell.
	 * It is used in case of merging table cells.
	 * @param {HTMLElement} from Source table cell.
	 * @param {HTMLElement} to Target table cell.
	 * @private
	 * @memberOf REDIPS.table#
	 */
    relocate = function(from, to) {
        var cn, // number of child nodes
            i, j;
        // loop variables
        // test if "from" cell is equal to "to" cell then do nothing
        if (from === to) {
            return;
        }
        // define childnodes length before loop
        cn = from.childNodes.length;
        // loop through all child nodes in table cell
        // 'j', not 'i' because NodeList objects in the DOM are live
        for (i = 0 , j = 0; i < cn; i++) {
            // relocate only element nodes
            if (from.childNodes[j].nodeType === 1) {
                to.appendChild(from.childNodes[j]);
            } else // skip text nodes, attribute nodes ...
            {
                j++;
            }
        }
    };
    /**
	 * Method displays cellIndex for each cell in tables. It is useful in debuging process.
	 * @param {Boolean} flag If set to true then cell content will be replaced with cell index.
	 * @public
	 * @function
	 * @name REDIPS.table#cell_index
	 */
    cell_index = function(flag) {
        // if input parameter isn't set and show_index private property is'nt true, then return
        // input parameter "flag" can be undefined in case of internal calls 
        if (flag === undefined && show_index !== true) {
            return;
        }
        // if input parameter is set, then save parameter to the private property show_index
        if (flag !== undefined) {
            // save flag to the show_index private parameter
            show_index = flag;
        }
        // variable declaration
        var tr, // number of rows in a table
            c, // current cell
            cl, // cell list
            cols, // maximum number of columns that table contains
            i, j, t;
        // loop variables
        // open loop for each table inside container
        for (t = 0; t < tables.length; t++) {
            // define row number in current table
            tr = tables[t].rows;
            // define maximum number of columns (table row may contain merged table cells)
            cols = max_cols(tables[t]);
            // define cell list
            cl = cell_list(tables[t]);
            // open loop for each row
            for (i = 0; i < tr.length; i++) {
                // open loop for every TD element in current row
                for (j = 0; j < cols; j++) {
                    // if cell exists then display cell index
                    if (cl[i + '-' + j]) {
                        // set reference to the current cell
                        c = cl[i + '-' + j];
                        // set innerHTML with cellIndex property
                        c.innerHTML = (show_index) ? i + '-' + j : '';
                    }
                }
            }
        }
    };
    return {
        /* public properties */
        /**
		 * color.cell defines background color for marked table cell. If not set then background color will not be changed.
		 * @type Object
		 * @name REDIPS.table#color
		 * @default null
		 * @example
		 * // set "#9BB3DA" as color for marked cell
		 * REDIPS.table.color.cell = '#9BB3DA';
		 */
        color: color,
        /**
		 * Enable / disable marking not empty table cells.
		 * @type Boolean
		 * @name REDIPS.table#mark_nonempty
		 * @default true
		 * @example
		 * // allow marking only empty cells
		 * REDIPS.table.mark_nonempty = false;
		 */
        mark_nonempty: mark_nonempty,
        /* public methods are documented in main code */
        onmousedown: onmousedown,
        mark: mark,
        merge: merge,
        split: split,
        row: row,
        column: column,
        cell_index: cell_index,
        cell_ignore: cell_ignore
    };
}());
// if REDIPS.event isn't already defined (from other REDIPS file) 
if (!REDIPS.event) {
    REDIPS.event = (function() {
        var add, // add event listener
            remove;
        // remove event listener
        // http://msdn.microsoft.com/en-us/scriptjunkie/ff728624
        // http://www.javascriptrules.com/2009/07/22/cross-browser-event-listener-with-design-patterns/
        // http://www.quirksmode.org/js/events_order.html
        // add event listener
        add = function(obj, eventName, handler) {
            if (obj.addEventListener) {
                // (false) register event in bubble phase (event propagates from from target element up to the DOM root)
                obj.addEventListener(eventName, handler, false);
            } else if (obj.attachEvent) {
                obj.attachEvent('on' + eventName, handler);
            } else {
                obj['on' + eventName] = handler;
            }
        };
        // remove event listener
        remove = function(obj, eventName, handler) {
            if (obj.removeEventListener) {
                obj.removeEventListener(eventName, handler, false);
            } else if (obj.detachEvent) {
                obj.detachEvent('on' + eventName, handler);
            } else {
                obj['on' + eventName] = null;
            }
        };
        return {
            add: add,
            remove: remove
        };
    }());
}
// end of public (return statement)	

