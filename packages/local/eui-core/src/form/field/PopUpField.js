/***
 *
 * ## Summary
 *
 * 팝업을 호출하고 선택된 값을 설정한다.
 *
 **/

Ext.define('eui.form.field.PopUpField', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.euipopupfield',
    triggerCls: 'x-form-search-trigger',
    cellCls: 'fo-table-row-td',
    callBack: 'onTriggerCallback',

    defaultListenerScope: true,

    matchFieldWidth: false,

    enableKeyEvents: true,
    onFocusLeave: function (e) {
    },

    collapseIf: function (e) {
    },

    onTriggerCallback: function (trigger, record) {
        trigger.setValue(record.get(trigger.valueField));
        this.collapse();
    },

    createPicker: function (C) {        // #4
        var me = this;
        if (!me.picker) {
            me.picker = Ext.create('Ext.window.Window', {
                fitContainer: function (animate) {
                    var me = this,
                        parent = me.floatParent,
                        container = me.container,
                        newBox = container.getViewSize(),
                        newPosition = parent || (container.dom !== document.body) ?
                            // If we are a contained floater, or rendered to a div, maximized position is (0,0)
                            [0, 0] :
                            // If no parent and rendered to body, align with origin of container el.
                            container.getXY();

                    newBox.x = newPosition[0];
                    newBox.y = newPosition[1];
                    me.setBox(newBox, animate);
                },
                padding: 0,
                width: me.popupConfig.width,
                height: me.popupConfig.height,
                maximizable: true,
                modal: true,
                closeAction: 'hide',
                layout: 'fit',
                items: [
                    {
                        xtype: (me.popupConfig.popupWidget ? me.popupConfig.popupWidget : 'euipopup'),
//                        formConfig : me.formConfig,
//                        multiSelect : me.multiSelect,
//                        simpleColumns : me.popupConfig.simpleColumns,
//                        normalColumns : me.popupConfig.normalColumns,
                        height: (me.simpleMode ? 290 : me.popupConfig.height - 10),
                        tableColumns: 2,
                        trigger: me,
                        valueField: me.valueField,
                        popupConfig: me.popupConfig,
                        __PARENT: me,
                        __PARAMS: {
                            popupConfig: me.popupConfig
                        },
                        multiReturnValue: false
                    }
                ]
            });
            me.relayEvents(me.picker.items.items[0], [
                'popupclose'
            ]);
        }

        return me.picker;
    },
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        me.addListener('specialkey', this.setSpecialKey, this);
    },

    setSpecialKey: function (field, e, eOpts) {
        var me = this;
        if ((e.getKey() === Ext.EventObject.ENTER
            && !Ext.isEmpty(this.getValue()))
            || (e.getKey() === Ext.EventObject.TAB && !Ext.isEmpty(this.getValue()))) {
            if (!me.checkSingleResult(field)) {
                field.expand();
            }
        }
    },

    /***
     * 한건인지 확인한다.
     * 그외 메일주소를 수동으로 입력할 경우 처리한다
     * 휴대폰 번호를 수기로 입력할 경우 처리한다.
     * @param field
     * @returns {boolean}
     */
    checkSingleResult: function (field) {
        var me = this,
            retFlag = false;

        if (me.popupConfig.store) {
            var params = {};
            params[me.popupConfig.formField] = me.getValue();
            Ext.apply(me.popupConfig.store, {
                autoDestroy: true,
                storeId :  Util.generateUUID()
            });
            var store = Ext.create('Ext.data.Store', me.popupConfig.store);
            store.load({
                params: params,
                callback: function (records) {
                    if (records.length === 1) {
                        me.onTriggerCallback(me, records[0]);
                        retFlag = true;
                    }
                }
            });
            me._store = store;
        }

        return retFlag;
    }
});