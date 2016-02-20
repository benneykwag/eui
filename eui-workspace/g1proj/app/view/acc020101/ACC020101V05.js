Ext.define("g1.view.acc020101.ACC020101V05", {
    extend: "eui.form.Panel",
    xtype: 'ACC020101V05',
    title: '청구대상정보',
    tableColumns: 4,
    hiddenSearchBtn: false,
    items: [
        {
            xtype: 'euilabel',
            text: '대기능'
        },
        {
            xtype: 'sptext',
            name: 'L_FUNC_CODE'
        },
        {
            xtype: 'euilabel',
            text: '소기능'
        },
        {
            xtype: 'spcombo',
            name: 'S_FUNC_CODE',
            groupCode: 'CO0017',
            sql : {
                DEPT_CODE : ""
            },
            displayField: 'S_FUNC_CODE',
            valueField: 'S_FUNC_CODE',
            hiddenField: 'L_FUNC_CODE',
            setFormFieldName : 'L_FUNC_CODE'
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
            layout: 'column',
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
        },
        {
            xtype: 'euilabel',
            text: '근거번호'
        },
        {
            xtype : "sptext",
            name: 'ACC_REF_NO'
        },
        {
            xtype: 'euilabel',
            allowBlank : false,
            text: '정산확정일자'
        },
        {
            xtype : 'spfieldcontainer',
            name : 'Panel1',
            items : [ {
                xtype : 'spdate',
                dateNum: -30,
                name : 'ACC_CONFIRM_DATE_FROM'
            }, {
                xtype : 'spdate',
                name : 'ACC_CONFIRM_DATE_TO'
            } ]
        },
        {
            xtype: 'euilabel',
            text: '청구요청일'
        },
        {
            xtype : "sptext",
            name: 'STMT_REQ_MONTH'
        },
        {
            xtype: 'euilabel',
            text: '사용자지정번호'
        },
        {
            xtype : "sptext",
            name: 'USER_DEF_NO'
        }
    ]

});
