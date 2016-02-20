Ext.define("g1.view.acc020101.ACC020101V04", {
    extend: "g1.view.common.Grid",
    xtype: 'ACC020101V04',
    features: [{
        ftype: 'summary',
        id: 'summary',
        dock: 'bottom'
    }],
    selModel: {
        selType: 'checkboxmodel'
    },
    plugins: {
        ptype: 'cellediting',
        clicksToEdit: 1
    },
    spbuttons: [
        {
            xtype: 'spbutton',
            text: '저장',
            handler :'saveDetail'
        }
    ],
    hiddenRowAddBtn: true,
    hiddenRowDelBtn: true,
    columns: {
        items: [
            {
                text: '일련번호',
                dataIndex: 'CHARGE_SEQ_NO'
            },
            {
                text: '귀속부서',
                dataIndex: 'REVERT_DEPT_NAME',
                editor: {
                    xtype: 'spcombo',
                    groupCode: 'CO0009',
                    sql: {},
                    setFieldName : 'REVERT_DEPT',
                    displayField: 'HQCODE',
                    valueField: 'HQNAME'
                }
            },
            {
                text: '비용명',
                dataIndex: 'CHARGE_NAME'
            },
            {
                text: '비용코드',
                dataIndex: 'CHARGE_CODE'
            },
            {
                text : 'PROXY_YN_NAME',
                dataIndex : 'PROXY_YN',
                hidden : true
            },
            {
                text: '대납여부',
                width: 80,
                dataIndex: 'PROXY_YN_NAME'
            },
            {
                text: '적용요율',
                dataIndex: 'APPLY_RATE',
                xtype : 'spnumbercolumn'
            },
            {
                text : 'APPLY_UNIT_NAME',
                dataIndex : 'APPLY_UNIT',
                hidden : true
            },
            {
                text: '적용단위',
                dataIndex: 'APPLY_UNIT_NAME'
            },
            {
                text: '계약통화단위',
                dataIndex: 'CONTRACT_CUR'
            },

            {
                text: '계약환율',
                dataIndex: 'CONTRACT_EX_RATE',
                xtype : 'spnumbercolumn'
            },
            {
                text: '계약단가',
                dataIndex: 'CONTRACT_UNIT_PRICE',
                xtype : 'spnumbercolumn'
            },
            {
                text: '계약금액',
                dataIndex: 'CONTRACT_AMT',
                xtype : 'spnumbercolumn',
                summaryType: 'sum',
                renderer: 'currencyRenderer',
                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '정산통화단위',
                dataIndex: 'FINAL_CUR'
            },
            {
                text: '정산환율',
                dataIndex: 'FINAL_EX_RATE',
                xtype : 'spnumbercolumn',
                renderer: Ext.util.Format.numberRenderer('0.000000')

            },
            {
                text: '정산금액',
                dataIndex: 'FINAL_AMT',
                xtype : 'spnumbercolumn',
                summaryType: 'sum'
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '정산세율(%)',
                dataIndex: 'FINAL_TAX_RATE',
                xtype : 'spnumbercolumn'

            },
            {
                text: '정산세금',
                dataIndex: 'FINAL_TAX_AMT',
                xtype : 'spnumbercolumn',
                summaryType: 'sum'
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '세무구분',
                dataIndex: 'TAX_TYPE'
            },
            {
                text: '정산금액합계',
                dataIndex: 'FINAL_TOTAL_AMT',
                summaryType: 'sum'
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '현지통화단위',
                width: 80,
                dataIndex: 'LOC_CUR'
            },
            {
                text: '현지금액',
                dataIndex: 'LOC_AMT',
                xtype: 'spnumbercolumn',
                summaryType: 'sum'
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '현지세율(%)',
                xtype : 'spnumbercolumn',
                dataIndex: 'LOC_TAX_RATE'
            },
            {
                text: '현지세금',
                dataIndex: 'LOC_TAX_AMT',
                xtype: 'spnumbercolumn',
                summaryType: 'sum'
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '현지정산합계',
                dataIndex: 'LOC_TOTAL_AMT',
                xtype: 'spnumbercolumn',
                summaryType: 'sum'
//                renderer: 'currencyRenderer',
//                summaryRenderer: 'currencyRenderer'
            },
            {
                text: '계정과목코드',
                dataIndex: 'ACCOUNT_CODE'
            },
            {
                text : 'REVERT_DEPT_NAME',
                dataIndex : 'REVERT_DEPT',
                hidden : true
            },
            {
                text: '조정여부',
                dataIndex: 'ADJUSTMENT_YN'
            },
            {
                text: '자동생성여부',
                dataIndex: 'AUTO_YN'
            },
            {
                text: '비고',
                dataIndex: 'REMARKS'
            },
            {
                text: '전표번호',
                dataIndex: 'SLIP_NO'
            }
        ]
    }
});
