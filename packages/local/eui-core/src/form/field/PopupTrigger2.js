Ext.define('eui.form.field.PopupTrigger2', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.sppopup2',

    hideLabel: true,

    /***** Custom Config Start *****/
    config : {
        tempTitle : null
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
            url:  'api/COM050101SVC/getCode',
            convertparam: function (popupOption, trigger) {
                var sqlparams = {};
                Ext.each(popupOption.formConfig, function (p) {
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
        NONE: {
//            popupOption의 모든 내용을 외부에서 입력한다.
        }
    },

    /***** Custom Config End *****/
    selectedRecord: Ext.emptyFn,

    callBack: 'onTriggerCallback',

    /***
     * config의 유효성 체크.
     */
    validateConfig: function () {
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
    setPopupOption: function () {
        var me = this,
            config = Ext.clone(me.pConfigs[me.pType]);

            Ext.apply(config, me.popupOption);

            me.popupOption = config;
    },


    /***
     * 팝업 호출 전 한건인 경우 바로 설정한다.
     * @param field
     */
    checkSingleResult: function (field) {
        var me = this,
            popupOption = me.popupOption;
        /***
         * pConfig 내부에 각 pType별로 정의할 수 있다.
         * 존재하지 않는 경우 아래와 같이 기본 params를 반환하도록 한다.
         */
        if (!Ext.isFunction(popupOption.convertparam)) {
            popupOption.convertparam = function (a) {
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
            pCallback: function (component, id, results, params) {
                if (results && results.data.length == 1) {
                    var record = Ext.create('Ext.data.Model',
                        results.data[0]
                    );
                    me.onTriggerCallback(me, record, me.valueField, me.displayField);
                    retFlag = true;
                } else {
                    retFlag = false;
                }
            }
        });
        return retFlag;
    },

    onTriggerCallback: function (trigger, record, codeField, nameField) {

        if (record.isModel) {
            trigger.setValues(record.get(codeField), record.get(nameField), [record]);
        } else if (Ext.isArray(record)) {
            var ret = {
                code: '',
                name: ''
            };
            Ext.each(record, function (rec, idx) {
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

    setValues: function (code, name, records) {
        this.codeOldValue = this.getValue(),
            this.codeNewValue = code,
            this.nameOldValue = ((this.nextSibling() && this.nextSibling().xtype == 'sptextfield') ? this.nextSibling().getValue() : ''),
            this.nameNewValue = name;
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

    onTriggerClick: function () {


        var me = this;
        var options = {
            trigger: this,
            popupOption: me.popupOption,
            multiReturnValue: this.multiReturnValue,
            selectedRecord: this.selectedRecord()
        };

        me.validateConfig();

        Ext.apply(options, this.setSingleRowCondition());

        if(!me.popupOption.title && me.getTempTitle()){
            me.popupOption.title =  me.getTempTitle();
        }

        Util.commonPopup(this, me.popupOption.title,
            me.popupOption.popupClass,
            me.popupOption.width,
            me.popupOption.height,
            options,
            null,
            true).show();

        this.fireEvent("ontriggerclick", this, event);
    },

    initComponent: function () {
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
        me.on('blur', me.onBlurHandler,
            this, {
//            delay: 100,
                scope: this
            });
        me.on('afterrender', function(){
            var compare = this;
            if('sppopuptriggerset' === this.ownerCt.xtype
                || 'sptriggercombo' === this.ownerCt.xtype
                ){
                compare =  this.ownerCt;
            }
            var hlabel = compare.previousSibling();
            if(hlabel && hlabel.xtype === 'euilabel'){
                this.setTempTitle(hlabel.text);
            }
            if(this.ownerCt.xtype === 'editor'){
                this.setTempTitle(this.ownerCt.context.column.text);
            }
        });
    },

    resetValues: function () {
        var me = this;
        if (!me.readOnly) {
            me.setValue();
            if (me.nextSibling()) {
                me.nextSibling().setValue();
                me.resetNextEditField();
            } else if (me.column) {
                Ext.defer(function () {
                    // me.recorvery_selectedRecord.set(me.column.dataIndex, '');
                }, 10);
            }
        }
    },

    /***
     * 검색어를 수정하고 떠나면 리셋한다.
     */
    onBlurHandler: function () {
        var me = this;
        var grid = me.up('grid');
        if (grid) {
//            // 다음 컬럼을 리셋한다.
//            var selModel = grid.getSelectionModel();
//            selectedRecord = selModel.getLastSelected();
//            if(me.rowIndex == grid.store.indexOf(selectedRecord)){
//                if ((me.getValue() != this.codeNewValue) && !Ext.isEmpty(this.codeNewValue)) {
//                    me.resetValues();
//                }
//            }
        } else {
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
    setSingleRowCondition: function () {
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
    setSpecialKey: function (field, e, eOpts) {
        var me = this;
        if (e.getKey() === Ext.EventObject.ENTER && !Ext.isEmpty(this.getValue())) {
            console.log('setSpecialKey:', me.popupOption.groupCode, field.id)
            if (!this.checkSingleResult(field)) {
                field.onTriggerClick();
            }
        }
    },

    /***
     * 연계 설정된 컴포넌트를 찾아 리셋한다.
     */
    resetNextEditField: function () {
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

                Ext.each(grid.columns, function (col) {
                    if (me.nextEditField == col.dataIndex) {
                        plugin.startEdit(selectedRecord, col);
                    }
                });

            } else { // 폼에 경우
                var target = Util.getOwnerCt(me).down("[searchId=" + me.nextEditField + "]");
                if (!Ext.isEmpty(target)) {
                    target.setValue("");
                }
            }
        }
    }
});