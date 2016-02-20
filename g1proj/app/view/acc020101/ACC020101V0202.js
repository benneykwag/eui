Ext.define("g1.view.acc020101.ACC020101V0202", {
    extend: "g1.view.common.Grid",
    xtype: 'ACC020101V0202',
    hiddenHeader : true,
    features: [{
        ftype: 'summary',
        id: 'summary',
        dock: 'bottom'
    }],
    columns: {
        items: [
            {
                text: '청구예정일',
                dataIndex: 'STMT_REQ_MONTH'
            },
            {
                text: '전표번호',
                dataIndex: 'SLIP_NO'
            },
            {
                text: '거래처코드',
                dataIndex: 'CUSTOMER_CODE'
            },
            {
                text: '거래처명',
                dataIndex: 'CUSTOMER_NAME'
            },
            {
                text: '근거번호',
                dataIndex: 'ACC_REF_NO'
            },
            {
                text: '정산통화단위',
                dataIndex: 'FINAL_CUR'
            },
            {
                text: '정산금액',
                dataIndex: 'SUM_FINAL_TOTAL_AMT',
                xtype : 'numbercolumn'
//                summaryType: 'sum',
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'

            },
            {
                text: '등록자아이디',
                dataIndex: 'ADD_USER_ID'
            },
            {
                text: '등록자명',
                dataIndex: 'ADD_USER_NAME'
            },
            {
                text: '최종수정일자',
                dataIndex: 'CHANGE_DATE'
            }

        ]
    }
});
