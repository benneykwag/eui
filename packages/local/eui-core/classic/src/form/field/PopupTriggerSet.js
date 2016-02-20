Ext.define('eui.form.field.PopupTriggerSet', {
    extend: 'eui.form.FieldContainer',
    alias: 'widget.sppopupset',
    requires: ['eui.form.field.PopupTrigger'],

    /***** Custom Config Start *****/
    codeFieldName: null,
    textFieldName: null,

    /***** Custom Config End *****/

    setCallBackData: function (trigger, codeNewValue, nameNewValue, codeOldValue, nameOldValue, records) {
        this.down('sptext').setValue(nameNewValue);
    },

    bindVar: {
        CD: null,
        NM: null
    },
    initComponent: function () {
        var me = this;
        var options = {
            width: '60%',
            allowBlank: me.allowBlank || true,  // 필수 처리 추가
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
                    allowBlank: me.allowBlank || true,  // 필수 처리 속성 추가
                    width: '40%',
                    readOnly: true,
                    bind: me.bindVar.NM,
                    xtype: 'sptext'
                }
            ]
        });

        me.callParent(arguments);

    }
});