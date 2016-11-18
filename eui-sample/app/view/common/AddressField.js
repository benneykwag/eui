Ext.define('Eui.sample.view.common.AddressField', {
    extend: 'eui.form.FieldContainer',
    alias: 'widget.addressfield',
    requires: ['Eui.sample.view.common.PopUp02'],
    fieldLabel: '주소찾기',
    defaultListenerScope: true,

    setPopupValues: function (trigger, record, valueField, displayField) {
        this.down('euipopuppicker').setValue(record.get('ZIPCODE'));
        this.down('[itemId=ADDRESS1]').setValue(record.get('ADDRESS1'));
        this.down('[itemId=ADDRESS2]').setValue(record.get('ADDRESS2'));
//        debugger;
//        var formrecord = this.getViewModel().get('FORMRECORD');
//        formrecord.set(record.getData());
//        formrecord.set('DESC', record.get('NAME') + '('+ record.get('ENG_NAME') +')'+ record.get('AGE') + record.get('ADDRR'));
    },

    bindVar: {
        ZIPCODE: null,
        ADDRESS1: null,
        ADDRESS2: null
    },
    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            items: [
                {
                    width: '20%',
                    xtype: 'euipopuppicker',
                    bind: me.bindVar.ZIPCODE,
                    valueField: 'ENG_NAME',
                    listeners: {
                        popupsetvalues: 'setPopupValues'
                    },
                    popupConfig :{
                        popupWidget : 'popup02',
                        title: 'aa',
                        width: 600,
                        height : 500
                    }
                },
                {
                    width: '40%',
                    bind: me.bindVar.ADDRESS1,
                    itemId: 'ADDRESS1',
                    xtype: 'euitext'
                },
                {
                    bind: me.bindVar.ADDRESS2,
                    width: '40%',
                    itemId: 'ADDRESS2',
                    xtype: 'euitext'
                }
            ]
        })
        this.callParent(arguments);
    }


});