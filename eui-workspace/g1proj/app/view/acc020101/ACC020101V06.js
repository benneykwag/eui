Ext.define("g1.view.acc020101.ACC020101V06", {
    extend: "eui.form.Panel",
    xtype: 'ACC020101V06',
    tableColumns: 2,
    hiddenHeader : true,
    hiddenClearBtn: false,
    otherButtons: [
        {
            xtype: 'spbutton',
            text: '청구',
            iconCls: 'x-fa fa-cart-plus',
            handler :'makeStmt'
        }
    ],

    items: [
        {
            xtype: 'euilabel',
            text: '거래처코드'
        },
        {
            xtype: 'sptext',
            name: 'CUSTOMER_CODE',
            searchId: 'CUSTOMER_CODE',
            allowBlank: false,
            readOnly : true
        },
        {
            xtype: 'euilabel',
            text: '거래처명'
        },
        {
            xtype: 'sptext',
            name: 'CUSTOMER_NAME',
            readOnly : true
        },
        {
            xtype: 'euilabel',
            text: '거래처주소',
            allowBlank : false
        },
        {
            xtype: 'sptext',
            name: 'CUSTOMER_ADDR',
            readOnly : true
        },
        {
            xtype: 'euilabel',
            text: '거래처담당자',
            allowBlank : false
        },
        {
            xtype: 'sptext',
            name:'CUSTOMER_STAFF',
            allowBlank : false,
            popupOption: {
                groupCode: 'SP9968',
                addSearchOption: [
                    {
                        searchId: 'CUSTOMER_CODE'
                    }
                ],
                sql: {
                    'CUSTOMER_CODE': ''
//                      'STAFF_NAME' :'',
//                      'CUSTOMER_NAME' : ''
                },
                formConfig: [
                    {
                        name: 'CUSTOMER_NAME',
                        label: 'Customer Name',
                        xtype: 'sptext'
                    },
                    {
                        singleCheckParam: true,
                        name: 'STAFF_NAME',
                        label: 'Staff Name',
                        xtype: 'sptext'
                    }
                ]
            },
            listeners: {
                popupvaluechange: function (trigger, code, name, rec) {
                    var form = this.up('ACC020101V06');
                    form.down('[name=CUSTOMER_ADDR]').setValue(rec[0].getData()['ADDR_ENG']);
                    form.down('[name=CUSTOMER_STAFF_TEL]').setValue(rec[0].getData()['MOBILE_NO']);
                    form.down('[name=CUSTOMER_STAFF]').setValue(rec[0].getData()['STAFF_NAME']);


                }
            }
        },
        {
            xtype: 'euilabel',
            text: '담당자전화번호'
        },
        {
            xtype: 'sptext',
            name: 'CUSTOMER_STAFF_TEL',
            readOnly : true
        },
        {
            xtype: 'euilabel',
            text: '계좌번호',
            allowBlank : false
        },
        {
            xtype: 'spcombo',
            name: 'BANK_ACCOUNT_NO',
            groupCode: 'SP9967',
            sql : {

            }
        },
        {
            xtype: 'euilabel',
            text: '청구일자',
            allowBlank : false
        },
        {
            xtype: 'spdate',
            name: 'STMT_DATE'
        },
        {
            xtype: 'euilabel',
            text: '청구번호'
        },
        {
            xtype: 'sptext',
            name: 'STMT_NO',
            readOnly : true
        },
        {
            xtype: 'euilabel',
            text: '청구통화단위'
        },
        {
            xtype: 'sptext',
            name: 'FINAL_CUR',
            readOnly : true
        },
        {
            xtype: 'euilabel',
            text: '청구환율'
        },
        {
            xtype: 'spnumber',
            name: 'FINAL_EX_RATE',
            listeners : {
                blur : function(cmp, event, eOpts ){
                    var panel = cmp.up('panel');
                    panel.fireEvent('changeFinalRate',cmp);
                }
            }
        },
        {
            xtype: 'euilabel',
            text: '청구금액'
        },
        {
            xtype: 'spnumber',
            name: 'FINAL_AMT',
            readOnly : true
        },
        {
            xtype: 'euilabel',
            text: '청구세액'
        },
        {
            xtype: 'spnumber',
            name: 'FINAL_TAX_AMT',
            readOnly : true
        },
        {
            xtype: 'euilabel',
            text: '청구합계금액'
        },
        {
            xtype: 'spnumber',
            name: 'FINAL_TOTAL_AMT',
            readOnly : true
        },
        {
            xtype: 'euilabel',
            text: '현지금액',
            hidden : true
        },
        {
            xtype: 'spnumber',
            name: 'LOC_AMT',
            readOnly : true,
            hidden : true
        },
        {
            xtype: 'euilabel',
            text: '현지세액',
            hidden : true
        },
        {
            xtype: 'spnumber',
            name: 'LOC_TAX_AMT',
            readOnly : true,
            hidden : true
        },
        {
            xtype: 'euilabel',
            text: '현지합계금액',
            hidden : true
        },
        {
            xtype: 'spnumber',
            name: 'LOC_TOTAL_AMT',
            readOnly : true,
            hidden : true
        },
        {
            xtype: 'euilabel',
            text: '비고'
        },
        {
            xtype: 'sptextarea',
            name: 'REMARKS'
        }
    ]

});
