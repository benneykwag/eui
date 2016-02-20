Ext.define("g1.view.acc020101.ACC020101V0201", {
    extend: "eui.form.Panel",
    xtype: 'ACC020101V0201',
    hiddenHeader : true,
    hiddenSearchBtn: false,
    tableColumns: 2,
    items: [

        {
            xtype: 'euilabel',
            text: '청구예정월'
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
                name : 'STMT_REQ_DATE_FROM'
            }, {
                xtype : 'spdate',
                name : 'STMT_REQ_DATE_TO'
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
            text: '정산근거번호'
        },
        {
            xtype: 'sptext',
            name: 'ACC_REF_NO'
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
