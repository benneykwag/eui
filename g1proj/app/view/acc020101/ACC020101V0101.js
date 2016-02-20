Ext.define("g1.view.acc020101.ACC020101V0101", {
    extend: "eui.form.Panel",
    xtype: 'ACC020101V0101',
    hiddenHeader : true,

    hiddenCloseBtn: true,
    hiddenSearchBtn: false,
    hiddenPrintBtn: false,  //
    hiddenDeleteBtn: true,
    hiddenSaveBtn: true,
    hiddenClearBtn: true,

    tableColumns: 2,
//    defaultToolbarUi: 'footer',
    items: [

        {
            xtype: 'euilabel',
            text: '청구일자'
        },
        {
            xtype : 'spfieldcontainer',
            padding : '0 0 0 0',
            width : 200,
            name : 'Panel1',
            layout : 'column',
            items : [ {
                xtype : 'spdate',
                dateNum: -30,
                name : 'STMT_DATE_FROM'
            }, {
                xtype : 'spdate',
                name : 'STMT_DATE_TO'
            } ]
        },
        {
            xtype: 'euilabel',
            text: '거래처'
        },
        {
            xtype: 'sptext',
            codeFieldName: 'CUSTOMER_CODE',
            comboFieldName: 'CUSTOMER_NAME'

        },
        {
            xtype: 'euilabel',
            allowBlank : false,
            text: '전표구분'
        },
        {
            xtype: 'spfieldcontainer',
            items: [
                {
                    xtype: 'spradio',
                    name: 'ARAP_TYPE',
                    boxLabel: 'AR',
                    checked : true,
                    inputValue: 'AR'
                },
                {
                    xtype: 'spradio',
                    name: 'ARAP_TYPE',
                    boxLabel: 'AP',
                    inputValue: 'AP'
                }
            ]
        }
    ]
});
