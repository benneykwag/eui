/***
 *
 * ## Summary
 *
 * 팝업을 호출하고 선택된 값을 설정한다.
 *
 **/

Ext.define('eui.form.field.PopUpPicker', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.euipopuppicker',
    triggerCls: 'x-form-search-trigger',
    cellCls: 'fo-table-row-td',
    callBack: 'onTriggerCallback',

    defaultListenerScope: true,

    config: {
        simpleMode: false,
        displayField: 'NAME',
        valueField: 'CODE'
    },

    matchFieldWidth: false,

    onTriggerCallback: function (trigger, record, valueField, displayField) {
        if(!Ext.isArray(record)){
            this.setValue(record.get(this.getValueField()));
        }
    },

    enableKeyEvents: true,

//    checkBlur: function () {
//        var me = this;
//        if (me.originalValue != me.getValue()) {
//            me.setValue('');
//        }
//    },

    listeners: {
//        blur: 'checkBlur',
        // 팝업 내부에서 값설정후 close
        popupclose : {
            delay: 100,
            scope: 'this',
            fn: 'collapse'
        },
        afterrender: {
            delay: 1000,
            fn: function (cmp) {
                // originalValue를 최초 설정된 값으로 만든다.
                cmp.resetOriginalValue();
            }
        }
    },

    createPicker: function (C) {        // #4
        var me = this;
        if (!me.picker) {
            me.picker = Ext.create('Ext.panel.Panel', {
                title: me.popupConfig.title,
                floating: true,
                defaultFocus: 'textfield',
                listeners: {
                    beforeshow: function () {
                        me.suspendEvent('blur');
                    },
                    hide: function () {
                        me.resumeEvent('blur');
                    }
                },
                height: (me.simpleMode ? 300 : me.popupConfig.height),
                width: me.popupConfig.width,
                layout: 'fit',
                items: [
                    {
                        xtype: (me.popupConfig.popupWidget?me.popupConfig.popupWidget:'euipopup'),
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
    }
});