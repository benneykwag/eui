Ext.define('Eui.sample.view.template.tmp010.TMP010V01',{
    extend: 'eui.form.Panel',
    xtype: 'TMP010V01',
    margin : 10,
    tableColumns: 2,
    requires: [
        'Eui.sample.view.common.PopUp01',
        'Eui.sample.view.common.AddressField'
    ],
    items: [

        {
            bindVar : {
                FIELD1 : '{FORMRECORD.BIZ_NO}',
                FIELD2 : '{FORMRECORD.BIZ_NAME}'
            },
            xtype: 'bizfield'

        },
        {
            fieldLabel: 'TEXT',
            xtype: 'euitext'
        },
        {
            xtype: 'euipopupfield',
            fieldLabel: '이름',
            bind: '{FORMRECORD.NAME}',
            valueField: 'CUSTOMER_NAME_ENG',    // 팝업 선택후 설정 필드.

            /*
            // 팝업 선택 후
            onTriggerCallback: function (trigger, record) {
                trigger.setValue(record.get(trigger.valueField));
                this.collapse();
            },*/

            popupConfig: {
                // 그리드 store 정의.
                store: {
                    proxy: {
                        type: 'rest',
                        url: 'resources/data/getPopup.json',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    }
                },
                formField: 'DT_CODE', //폼필드에 값이 설정된다..
                width: 600,
                height: 400,
                autoSearch: true,
                title: 'Port Search',
                columnConfig: {
                    "CUSTOMER_CODE": "고객코드",
                    "CUSTOMER_NAME_ENG": "영문고객명",
                    "CUSTOMER_NAME": "한글고객명",
                    "ADDR_ENG": "ADDR_ENG",
                    "COUNTRY_CODE": "COUNTRY_CODE",
                    "TEL_NO": "TEL_NO",
                    "FAX_NO": "FAX_NO",
                    "STAFF_SEQ_NO": "STAFF_SEQ_NO",
                    "STAFF_NAME": "STAFF_NAME",
                    "STAFF_ROLE": "STAFF_ROLE",
                    "MOBILE_NO": "MOBILE_NO",
                    "EMAIL_ADDR": "EMAIL_ADDR",
                    "POSITION": "POSITION",
                    "DEPT": "DEPT",
                    "IRS_NO": "IRS_NO",
                    "CUSTOMER_DIRECTOR": "CUSTOMER_DIRECTOR",
                    "INDUSTRY_TYPE": "INDUSTRY_TYPE",
                    "BUSINESS_TYPE": "BUSINESS_TYPE",
                    "SALES_ID_MASTER": "SALES_ID_MASTER",
                    "SALES_ID_SUB": "SALES_ID_SUB",
                    "DUE_DATE": "DUE_DATE",
                    "DEAL_UNIT": "DEAL_UNIT",
                    "PLANT_CODE": "PLANT_CODE",
                    "PLANT_NAME": "PLANT_NAME"
                },
                formConfig: [
                    {
                        name: 'DT_CODE',
                        fieldLabel: 'Port Code',
                        xtype: 'euitext'
                    },
                    {
                        name: 'LOC_VALUE',
                        fieldLabel: 'Port Name(Loc)',
                        xtype: 'euitext'
                    },
                    {
                        name: 'ENG_VALUE',
                        fieldLabel: 'Port Name(Eng)',
                        xtype: 'euitext'
                    },
                    {
                        name: 'ENG_VALUE2',
                        fieldLabel: 'Port Name(Eng)',
                        xtype: 'euitext'
                    }
                ]
            }
        },
        {
            xtype: 'euipopuppicker',
            fieldLabel: '영문이름',
            bind: '{FORMRECORD.ENG_NAME}',
            valueField: 'ENG_NAME',
            listeners: {
                popupsetvalues: 'setPopupValues'
            },
            popupConfig :{
                popupWidget : 'popup01',
                title: 'aa',
                width: 600,
                height : 500
            }
        },
        {
            xtype: 'euitext',
            name: 'age',
            bind: '{FORMRECORD.AGE}',
            fieldLabel: '나이'
        },
        {
            xtype: 'euitext',
            bind: '{FORMRECORD.ADDRR}',
            name: 'address',
            fieldLabel: '주소'
        },
        {
            colspan: 2,
            xtype: 'euitext',
            bind: '{FORMRECORD.DESC}',
            name: 'address',
            fieldLabel: '설명'
        },
        {
            colspan: 2,
            bindVar : {
                ZIPCODE : '{FORMRECORD.ZIPCODE}',
                ADDRESS1 : '{FORMRECORD.ADDRESS1}',
                ADDRESS2 : '{FORMRECORD.ADDRESS2}'
            },
            xtype: 'addressfield'

        }
    ]
});