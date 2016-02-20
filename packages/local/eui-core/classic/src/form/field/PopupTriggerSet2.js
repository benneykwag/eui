Ext.define('eui.form.field.PopupTriggerSet2', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.sppopupset2',
    requires: ['eui.form.field.PopupTrigger'],

    /***** Custom Config Start *****/
    codeFieldName: null,
    textFieldName: null,

    /***** Custom Config End *****/

    setCallBackData: function (trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records) {
        this.down('sptextfield').setValue(nameNewValue);
        this.fireEvent('popupvaluechange', trigger, codeNewValue,
            codeOldValue, nameNewValue, nameOldValue, records);
    },

    bindVar: {
        CD: null,
        NM: null
    },
    width: '100%',
    cellCls: 'fo-table-row-td',
    initComponent: function () {
        var me = this;
        var options = {
            width: '40%',
            allowBlank: me.allowBlank || true,  // 필수 처리 추가
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
            })
        }

        Ext.apply(me, {
            layout: 'column',

            items: [
                options,
                {
                    name: me.textFieldName,
                    allowBlank: me.allowBlank || true,  // 필수 처리 속성 추가
                    width: '60%',
                    readOnly: true,
                    bind: me.bindVar.NM,
                    xtype: 'sptextfield'
                }
            ]
        });
        me.callParent(arguments);

    }
});