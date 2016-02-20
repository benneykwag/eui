Ext.define("g1.view.acc020101.ACC020101V0102", {
    extend: 'g1.view.common.Grid',
    xtype: 'ACC020101V0102',
    hiddenHeader : true,
    hiddenRowAddBtn: true,
    hiddenRowDelBtn: true,
    hiddenRowRegBtn: true,
    hiddenRowModBtn: true,
    hiddenRowSaveBtn: true,
//    features: [{
//        ftype: 'summary',
//        id: 'summary',
//        dock: 'bottom'
//    }],
//    selModel: {
//        selType: 'checkboxmodel'
//    },
    otherButtons: [
        {
            iconCls: 'x-fa fa-search-plus',
            text: '청구취소',
            handler :'deleteStmt'
        }
    ],
    columns: {
        items: [
            {
                text: '청구일',
                dataIndex: 'STMT_DATE'
            },
            {
                text: '청구번호',
                dataIndex: 'STMT_NO'
            },
            {
                text: '거래처',
                dataIndex: 'CUSTOMER_CODE'
            },
            {
                text: '거래처명',
                dataIndex: 'CUSTOMER_NAME'
            },
            {
                text: '청구통화단위',
                dataIndex: 'FINAL_CUR'
            },
            {
                text: '청구금액',
                dataIndex: 'FINAL_AMT'
//                xtype : 'hnumbercolumn',
//                summaryType: 'sum',
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '청구세액',
                dataIndex: 'FINAL_TAX_AMT'
//                xtype : 'hnumbercolumn',
//                summaryType: 'sum',
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '현지통화단위',
                dataIndex: 'LOC_CUR'
            },
            {
                text: '현지금액',
                dataIndex: 'LOC_AMT'
//                xtype : 'hnumbercolumn',
//                summaryType: 'sum',
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '현지세액',
                dataIndex: 'LOC_TAX_AMT'
//                xtype : 'hnumbercolumn',
//                summaryType: 'sum',
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            }

        ]
    }
});
