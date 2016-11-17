Ext.define('eui.form.field.TriggerCombo', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.sptriggercombo',
    requires: ['eui.form.field.PopupTrigger'],

    /***** Custom Config Start *****/
    codeFieldName: null,
    textFieldName: null,
    comboFieldName: null,
    /***** Custom Config End *****/

    setCallBackData: function (trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records) {
        this.down('hcombobox').setValue(nameNewValue);
        this.fireEvent('popupvaluechange', trigger, codeNewValue,
            codeOldValue, nameNewValue, nameOldValue, records);
    },
    width: '100%',
    bindVar: {
        CD: null,
        NM: null
    },

    cellCls: 'fo-table-row-td',
    initComponent: function () {
        var me = this;
        var options = {

            width: '40%',
            allowBlank: me.allowBlank || true,  // 필수 처리 추가
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
            })
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
                    allowBlank: me.allowBlank || true,  // 필수 처리 속성 추가
                    groupCode: ((me.popupOption)?me.popupOption.groupCode:''),
                    sql: ((me.popupOption)?me.popupOption.sql:''),
                    bind: me.bindVar.NM,
                    xtype: 'spcombo',
                    listeners: {
                        select: {
                            fn: function(combo, record) {
                                // Ext 5.0 array - > 5.1 model
                                if(Ext.isArray(record)){
                                    record = record[0];
                                }
                                var codeField = this.down('sppopuptrigger');
                                codeField.codeNewValue = record.get(this.valueField);
                                codeField.setValue(record.get(this.valueField));
                                this.fireEvent('popupvaluechange', combo, null,
                                    null, null, null, [record]);
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