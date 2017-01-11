/***
 *
 * ## Summary
 *
 * 유틸리티 클래스 .
 */
Ext.define('eui.Util', {
    singleton: true,
    alternateClassName: ['Util'],

    /****
     * i18n 용
     */
    localeStoreValueField: 'MSG_ID',
    localeStoreDisplayField: 'MSG_CONTENTS',

    UrlPrefix: null,
    localeLang: "ko",
    webosShowWindowId: null,
    currentAjaxButtonId: null,  // 통신을 일으키는 버튼 아이디.

    /***
     *
     * @param observable
     */
    captureEvents: function (observable) {
        Ext.util.Observable.capture(
            observable,
            function (eventName) {
                console.info(Ext.Date.format(new Date(), 'Y년m월d일 A g시i분 s초 u'), observable.id, observable.xtype||observable.storeId,  'event :',eventName);
            },
            this
        );
    },

    /***
     * 통신중인 버튼을 disabled한다.
     * @param flag
     */
    ajaxButtonDisabled: function (flag) {
        if (flag) { // disabled해야할 대상을 판단.

        }
        var clickingButton = Ext.getCmp(Util.currentAjaxButtonId);
        if (clickingButton) {
            clickingButton.setDisabled(flag);
        }
        if (!flag) { // 통신이 종료된 경우.
            Util.currentAjaxButtonId = null;
        }
    },

    /****
     * override를 통해 전역설정
     */
    global_setOverride: function () {
        Ext.override(Ext.data.Store, {
//            pageSize: Util.sessionRecord.get("ROW_PER_PAGE")
        });
        Ext.require('Util', function () {
            Ext.Ajax.on('beforerequest', function (conn, response, eOpts) {	// #1
                Util.ajaxButtonDisabled(true);
            });
            Ext.Ajax.on('requestexception', function (conn, response, eOpts) {	// #1
                var result = Ext.JSON.decode(response.responseText, true);  // #1
                if (Util.webosShowWindowId) {
                    var window = Ext.getCmp(Util.webosShowWindowId);
                    if (window) {
                        var sb = Ext.getCmp(Util.webosShowWindowId).down('statusbar');
                        sb.setStatus({
                            text: result.MSG,
                            clear: false // auto-clear after a set interval
                        });
                    }
                }
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
                    })
                }
                var message = "관리자에게 문의하세요.";
                if (response.status == 404) {
                    message = "페이지가 존재하지 않습니다."
                    Ext.Msg.show({
                        title: 'WARNING',
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK,
                        message: message
                    });
                }
                Util.ajaxButtonDisabled(false);
            });

            Ext.Ajax.on('requestcomplete', function (conn, response, eOpts) {	// #1
                var result = Ext.JSON.decode(response.responseText, true);  // #1
                if (Util.webosShowWindowId) {
                    var window = Ext.getCmp(Util.webosShowWindowId);
                    if (window) {
                        var sb = Ext.getCmp(Util.webosShowWindowId).down('statusbar');
                        sb.setStatus({
                            text: result.MSG,
                            iconCls: 'ok-icon',
                            clear: true // auto-clear after a set interval
                        });

                    }
                }
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
    global_InitialProcess: function (retData) {

        var session = retData.data.session, // session정보
            message = retData.data.message, // 로케일정보
            dept = retData.data.dept,// 부서정보
            cmpsetting = retData.data.cmpsetting;   // 법인정보
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
//        Util.globalLoadLocaleScript('en');

        // 공통 콤보등 대량 코드 preload
//        Util.globalCodeData();

//        Util.global_setOzRept();
    },

    global_setLocale: function (message) {
        var store = Ext.create('Ext.data.Store', {
            fields: [],
            storeId: 'i18n'
        });
        store.loadData(message);
    },

    /***
     * 로그인 체크여부
     */
    globalCheckLogin: function () {
        Ext.require('Util', function () {
            // sessiong check
            var cfg = {
                url: "api/service/getInit",
                params: {
                },
                pSync: false,
                pCallback: function (pScope, params, retData) {
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

    globalLoginForm: function () {
        Ext.create('com.view.layout.login.HLogin');
    },


    globalLoadLocaleScript: function (languageCode) {
        var scriptSrc;
        if (location.pathname.indexOf('webos') != -1) {

            scriptSrc = Ext.util.Format.format('resources/js/ext-locale/ext-locale-{0}.js', languageCode);
        } else {
            scriptSrc = Ext.util.Format.format('../webos/resources/js/ext-locale/ext-locale-{0}.js', languageCode);
        }
        Ext.Loader.loadScript(
            {
                url: scriptSrc
            }
        );
    },


    /***
     * 최상위 부모를 찾는다.
     * @param component
     * @returns {*}
     */
    getOwnerCt: function (component) {

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

    createStore: function (component, options) {
        var store = Ext.create('Ext.data.Store', {
            autoDestroy: true,
            autoLoad: this.autoMaticLoad,
            storeId: this.generateUUID(),
            fields: options.fields,

            proxy: {
                type: 'rest',
//                type: 'ajax',

                noCache: false, // to remove param "_dc"
                pageParam: false, // to remove param "page"
                startParam: false, // to remove param "start"
                limitParam: false, // to remove param "limit"
                headers: { 'Content-Type': 'application/json;charset=utf-8' },
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

    commonPopup: function (ownerCt, title, className, width, height, params, windowOption, addParentMvvm) {
        var detailForm = function (ownerCt, title, className, params) {
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
            options: params
        };
        config.items = null;
        if (!Ext.isEmpty(windowOption)) {
            for (var test in windowOption) {
                var value = windowOption[test];
                config[test] = value;
            }
//            config = Ext.apply(config, windowOption);
//            config = Ext.apply(config, ownerCt.getViewModel());

        }
        config.items = [openForm];
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

    generateUUID: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    },

    commonTreeItem: function () {
        var retvalue = [];  // #7
        Ext.Ajax.request({
            async: false,   // #8
            url: 'resources/data/treesmpl.json',
            failure: function (conn, response, options, eOpts) {
                Ext.Msg.show({
                    title: 'Error!',
                    msg: conn.responseText,
                    icon: Ext.Msg.ERROR,
                    buttons: Ext.Msg.OK
                });
            },
            success: function (conn, response, options, eOpts) {
                var me = this;
                var result = Ext.JSON.decode(conn.responseText, true);  // #10
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
    CommonAjax: function (cfg) {

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

        var buildParam = function (option, pArg, pOutDs) {
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
        var setOptions = function (option, pArg, pInDs, pOutDs, pScope) {
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

        if(!Ext.isEmpty(Config.subUrlPrifix)){
            pURL = Config.subUrlPrifix + pURL;
        }
        // 주소 조정.
        if(!Ext.isEmpty(Config.baseUrlPrifix)){
            if(pURL.substring(0,1) == "/"){  // 상대경로는 처리하지 않는다
                pURL = Config.baseUrlPrifix + pURL;
            }
        }

        var rtnData = "";
        var options = {
            async: (pSync == null ? true: pSync),
            method: (pMethod ? pMethod : 'POST'),
            timeout: timeoutSeq,
            disableCaching: false,
            url: pURL,
            success: function (response, opts) {
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
                    if (__scopeGrid) {    // 그리드 공통 기능
                        Ext.callback(pCallBack, pScope || this, [__scopeGrid, pArg, returnData]);
                    } else {
                        Ext.callback(pCallBack, pScope || this, [pScope || this, pArg, returnData, pSvcID]);
                    }
                }
            },
            failure: function (response, opts) {
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
            }
        };
        options = setOptions(options, pArg, pInDs, pOutDs, pScope);
        Ext.Ajax.request(options);
        if (!pSync) {
            return rtnData;
        }
    },

    showGlobalMsg: function (result, iconType) {
        Ext.require('Ext.window.MessageBox', function () {

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
                })
            }
        });
    },

    getDatasetParam: function (store) {
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
            } else if (field.type === 'boolean') {// Ext.data.Types.BOOL){
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
            rtv = Ext.apply(rtv, {'__rowStatus': 'I'});
            returnDataset.data.push(rtv);
        }

        records = me.getUpdatedRecords(), len = records.length;
        for (var i = 0; i < len; i++) {
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {'__rowStatus': 'U'});
            returnDataset.data.push(rtv);
        }

        records = me.getRemovedRecords(), len = records.length;
        for (var i = 0; i < len; i++) {
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {'__rowStatus': 'D'});
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
    getAllDatasetParam: function () {
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
            rtv = Ext.apply(rtv, {'__rowStatus': ''});
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
    getIsDirty: function () {
        return (this.getNewRecords().length > 0 || this.getUpdatedRecords().length > 0 || this.getRemovedRecords().length > 0);
    },

    getLocaleValue: function (MSG_ID) {
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
    constructor: function (cfg) {
        this.initConfig(cfg);
        this.init();
    },

    init: function () {
//    	Ext.EventManager.on(Ext.isIE ? document : window, 'keydown', function(e, t) {
//    		if (e.getKey() == e.BACKSPACE && ((!/^input$/i.test(t.tagName) && !/^textarea$/i.test(t.tagName)) || t.disabled || t.readOnly)) {
//    			e.stopEvent();
//    		}
//    	});

        Ext.getDoc().on("contextmenu", function (ev) {
            ev.preventDefault();
        });

//    	Ext.direct.Manager.addProvider({
//    		id: 'euiprovider',
//    	    url: Ext.util.Format.format('/{0}/{1}/', this.getContextPath(), this.getBaseUrl()),
//    	    type: 'remoting',
//    	    enableBuffer:true,
//    	    maxRetries: 0,
//    	    actions: {}
//    	});
    },
    sessionValidation: function () {
        //TODO
        var option = {
            url: Ext.util.Format.format('/{0}/{1}/', this.getContextPath(), this.getBaseUrl()),
            async: true,
            method: 'POST',
            success: function (response, options) {
                if (!Ext.isEmpty(response.responseText)) {
                    var returnData = Ext.decode(response.responseText),
                        result = returnData[0].result;
                    this.sessionValidationCallback(result);
                }
            },
            failure: function (response, options) {
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
    sessionValidationCallback: function (response) {
        //TODO

    },
    /**
     * fgn(fully qualified name of the function. for example: my.app.service.MenuService.getMenu )
     * dn(dataset name. for example: ds_menulist)
     */
    createDirectStore: function (fqn, dn, fields) {
        return{
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
    pluck: function (array, propertyName) {
        var ret = [],
            i, ln, item;

        for (i = 0, ln = array.length; i < ln; i++) {

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

    loadNodeData: function (records) {
        var me = this;
        me.keyNameOfChildNode = 'CODE';
        me.keyNameOfNodeLevel = 'LEVEL';
        me.keyNameOfParentNode = 'PCODE';
        var crWindow = function (src) {

            var desktop = me.app.getDesktop();
            desktop.createCustomWindow(src.config.data);
        };

        var nodelist = Ext.Array.map(records.getRange(), function (record) {
            var obj = {
                data: {}
            };
            Ext.each(records.config.fields, function (field) {
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

        var temp = {}, results = [];
        for (var i = 0; i < nodelist.length; i++) {
            var e = nodelist[i];

            var id = e.data[me.keyNameOfChildNode];
            var pid = e.data[me.keyNameOfNodeLevel] === 1 ? 'root' : e.data[me.keyNameOfParentNode];
            temp[id] = e;
            if (!Ext.isEmpty(temp[pid])) {
                if (!temp[pid].menu) {
                    temp[pid].menu = {
                        items: []
                    }
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
    },

    /***
     * excel csv 파일 업로드.
     * delimiter는 필수로 "|" 지정할 것
     * @param params
     * @returns {*}
     */
    callExcelUploader: function (params) {
        var xtp = 'eui.ux.grid.CsvUploader';
        return Util.commonPopup(null, 'Excel Uploader', xtp, 500, 400, params, {}, false).show();
    },

    callFileManager: function (cfg, msgSend) {

        var me = this;
        var uploadPanel = Ext.create('Ext.ux.upload.Panel', {
            uploader: 'Ext.ux.upload.uploader.FormDataUploader',
            uploaderOptions: {
                params: cfg,
                url: Config.fileuploadUrl
            },
            synchronous: true//appPanel.syncCheckbox.getValue()
        });

        var uploadComplete = function (items, t) {
            t.up('window').close();

            var i = 0;
            var task = {
                run: function () {
                    if (items.length <= (i + 1)) {
                        Ext.TaskManager.stop(task);
                    }
                    var file = items[i];

                    i++;
                },
                interval: 1000
            }
            if(Ext.isBoolean(msgSend) && msgSend == true) {
                Ext.TaskManager.start(task);
            }
        }

        var rept = Ext.create('Ext.window.Window', {
            height: 330,
            width: 560,
            layout: 'fit',
            title: 'File Manager',
            scrollable: false,
            maximizable: true,
            buttons: [
                {
                    xtype: 'button',
                    text: 'Close',
                    handler: function () {
                        this.up('window').close();
                    }
                }
            ],
            items: [
                {
                    xtype: 'tabpanel',
                    items: [
                        {
                            xtype: 'filemanager',
                            title: 'File List',
                            fileParams: cfg
                        },
                        {
                            title: 'File Add',
                            xtype: 'uploaddialog',
                            panel: uploadPanel,
                            listeners: {
                                uploadcomplete: function (uploadPanel, manager, items, errorCount) {
                                    uploadComplete(items, this);
                                }
                            }
                        }
                    ]
                }

            ]
        }).show();


        return rept;
    },


    fileClick : function (S_FUNC_CODE, FILE_MGT_CODE, FILE_NAME) {
        var formData = new FormData();
        formData.append("S_FUNC_CODE", S_FUNC_CODE);
        formData.append("FILE_MGT_CODE", FILE_MGT_CODE);

        this.fileClickApi(formData, FILE_NAME, eui.Config.fileDownloadUrl);
    },

    fileClickApi : function (formData, FILE_NAME, API_PATH) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', encodeURI(API_PATH));
        xhr.responseType = 'arraybuffer';

        xhr.onload = function () {
            if (this.status === 200) {
                var type = xhr.getResponseHeader('Content-Type');

                var blob = new Blob([this.response], { type: type });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    window.navigator.msSaveBlob(blob, filename);
                } else {
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);

                    if (FILE_NAME) {
                        // use HTML5 a[download] attribute to specify filename
                        var a = document.createElement("a");
                        // safari doesn't support this yet
                        if (typeof a.download === 'undefined') {
                            window.location = downloadUrl;
                        } else {
                            a.href = downloadUrl;
                            a.download = FILE_NAME;
                            document.body.appendChild(a);
                            a.click();
                        }
                    } else {
                        window.location = downloadUrl;
                    }

                    setTimeout(function () {
                        URL.revokeObjectURL(downloadUrl);
                    }, 100); // cleanup
                }
            }
        };
        xhr.send(formData);
    }
});
