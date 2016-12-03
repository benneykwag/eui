Ext.define('Eui.sample.view.common.BizField', {
    extend: 'eui.form.PopUpFieldContainer',
    alias: 'widget.bizfield',
    requires: ['Eui.sample.view.common.PopUp03'],
    fieldLabel: '사업자',
    defaultListenerScope: true,
    allowBlank: false,

    searchKeyField : 'SEARCHKEY',

    multiSelect: false,
    proxyUrl : 'resources/data/template/data04.json',

    popupWidth: 500,

    popupHeight: 250,

    // 별도 팝업을 띄울 경우 없다면 기본 팝업 호출.
//    popupWidget: 'popup03',

//    popupConfig: {
//        popupWidget: 'popup03',
//        title: '사업자 검색',
//        width: 500,
//        height: 250
//    },

    simpleColumns: [
        {
            text: 'CUSTOMER_NAME',
            dataIndex: 'CUSTOMER_NAME'
        }
    ],
    normalColumns: [
        {
            text: 'CUSTOMER_CODE',
            dataIndex: 'CUSTOMER_CODE'
        },
        {
            text: 'CUSTOMER_NAME',
            dataIndex: 'CUSTOMER_NAME'
        },
        {
            text: 'ADDR_ENG',
            dataIndex: 'ADDR_ENG'
        }
    ],
    formConfig: {
        xtype: 'euiform',
        title: '사업자 검색1',
        tableColumns: 1,
        items: [
            {
                xtype: 'euitext',
                name: 'SEARCHKEY',
                fieldLabel: '사업자코드'
            },
            {
                xtype: 'euitext',
                name: 'SEARCHKEYNAME',
                fieldLabel: '사업자명'
            }
        ]
    },

    setPopupValues: function (trigger, record, valueField, displayField) {
        var me = this,
            firstField = this.down('#firstField'),
            secondField = this.down('#secondField');
        if(Ext.isArray(record)) {
            // 복수 선택 처리.
        }else{
            firstField.setValue(record.get('CUSTOMER_CODE'));
            firstField.resetOriginalValue();
            secondField.setValue(record.get('CUSTOMER_NAME'));
            secondField.resetOriginalValue();
        }
    }
});