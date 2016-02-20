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
            convertparam: function (popupConfig, trigger) {
                var sqlparams = {};
                Ext.each(popupConfig.formConfig, function (p) {
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
        NONE: {
        }
    },

    /***** Custom Config End *****/
    selectedRecord: Ext.emptyFn,

    callBack: 'onTriggerCallback',

    /***
     * config의 유효성 체크.
     */
    validateConfig: function () {

    },
    /****
     * 클래스 내부 기본 설정과 외부 설정을 합쳐야한다.
     *
     */
    setpopupConfig: function () {

    },


    /***
     * 팝업 호출 전 한건인 경우 바로 설정한다.
     * @param field
     */
    checkSingleResult: function (field) {

    },

    onTriggerCallback: function (trigger, record, valueField, displayField) {
        trigger.setValues(record.get(valueField), record.get(displayField), [record]);
    },

    setValues: function (code, name, records) {
        this.codeOldValue = this.getValue(),
            this.codeNewValue = code,
            this.nameOldValue = ((this.nextSibling() && this.nextSibling().xtype == 'sptext') ? this.nextSibling().getValue() : ''),
            this.nameNewValue = name;
        this.setValue(code);

        this.fireEvent('select', this, code, name, records, this.codeOldValue, this.nameOldValue);
    },

    onTriggerClick: function () {
        var me = this;
        var options = {
            trigger: this,
            popupConfig: me.popupConfig,
            multiReturnValue: this.multiReturnValue,
            selectedRecord: this.selectedRecord()
        };

        me.validateConfig();

        Ext.apply(options, this.setSingleRowCondition());

        if(!me.popupConfig.title && me.getTempTitle()){
            me.popupConfig.title =  me.getTempTitle();
        }

        Util.commonPopup(this, me.popupConfig.title,
            me.popupConfig.popupClass,
            me.popupConfig.width,
            me.popupConfig.height,
            options,
            null,
            true).show();

    },

    initComponent: function () {
        var me = this;

        Ext.apply(me, {
            enableKeyEvents: true
        });

        me.setpopupConfig();

        me.callParent(arguments);
        me.addListener('specialkey', this.setSpecialKey, this);
        me.on('blur', me.onBlurHandler,
            this, {
//            delay: 100,
                scope: this
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
            console.log('setSpecialKey:', me.popupConfig.groupCode, field.id)
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