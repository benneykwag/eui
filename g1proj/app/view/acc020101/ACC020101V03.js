Ext.define("g1.view.acc020101.ACC020101V03", {
    extend: "g1.view.common.Grid",
    xtype: 'ACC020101V03',
    selModel: {
        selType: 'checkboxmodel',
        listeners: {
            selectionchange: 'setStmtInfo'
        }
    },
    features: [
        {
            ftype: 'summary',
            id: 'summary',
            dock: 'bottom'
        }
    ],
    otherButtons: [
        {
            xtype: 'spbutton',
            iconCls: 'x-fa fa-calculator',
            text: '계산',
            handler: 'calc'
        }
    ],
    columns: [
        {
            text: '정산번호',
            dataIndex: 'SLIP_NO',
            xtype: 'actioncolumn',
            tdCls: 'search',
            iconCls: 'x-form-search-trigger',
            handler: function (btn, obj) {
                var panel = btn.up('panel');
                panel.fireEvent('searchDetail', btn, obj);
            }
        },
        {
            text: '청구지불요청월',
            dataIndex: 'STMT_REQ_MONTH'
        },
        {
            text: '사용자지정번호',
            dataIndex: 'USER_DEF_NO',
            editor: {
                xtype: 'sptext'
            }
        },
        {
            text: '청구번호',
            dataIndex: 'STMT_NO'
        },
        {
            text: '대기능',
            dataIndex: 'L_FUNC_CODE'
        },
        {
            text: '소기능',
            dataIndex: 'S_FUNC_CODE'
        },
        {
            text: 'JOB일자',
            dataIndex: 'JOB_DATE'
        },
        {
            text: '정산유형',
            dataIndex: 'ACC_TYPE'
        },
        {
            text: '정산근거번호',
            dataIndex: 'ACC_REF_NO'
        },
        {
            text: '정산부서',
            dataIndex: 'ACC_DEPT'
        },
        {
            text: '세금계산서발행부서',
            dataIndex: 'TAX_DEPT'
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
            text: '계약번호',
            dataIndex: 'CONTRACT_NO'
        },
        {
            text: '거래단위',
            dataIndex: 'DEAL_UNIT'
        },
        {
            text: '정산통화단위',
            dataIndex: 'FINAL_CUR'
        },
        {
            text: '정산환율',
            xtype: 'spnumbercolumn',
            dataIndex: 'FINAL_EX_RATE'
        }
        ,
        {
            text: '정산금액합계',
            xtype: 'spnumbercolumn',
            dataIndex: 'SUM_FINAL_AMT',
            summaryType: 'sum'
//            renderer: 'currencyRenderer',
//            summaryRenderer: 'currencyRenderer'
        },
        {
            text: '정산세금합계',
            xtype: 'spnumbercolumn',
            dataIndex: 'SUM_FINAL_TAX_AMT',
            summaryType: 'sum'
//            renderer: 'currencyRenderer',
//            summaryRenderer: 'currencyRenderer'
        },
        {
            text: '최종비용합계',
            xtype: 'spnumbercolumn',
            dataIndex: 'SUM_FINAL_TOTAL_AMT',
            summaryType: 'sum'
//            renderer: 'currencyRenderer',
//            summaryRenderer: 'currencyRenderer'
        },
        {
            text: '현지금액합계',
            xtype: 'spnumbercolumn',
            dataIndex: 'SUM_LOC_AMT',
            summaryType: 'sum'
//            renderer: 'currencyRenderer',
//            summaryRenderer: 'currencyRenderer'
        },
        {
            text: '현지세금합계',
            xtype: 'spnumbercolumn',
            dataIndex: 'SUM_LOC_TAX_AMT',
            summaryType: 'sum'
//            renderer: 'currencyRenderer',
//            summaryRenderer: 'currencyRenderer'
        },
        {
            text: '현지비용합계',
            xtype: 'spnumbercolumn',
            dataIndex: 'SUM_LOC_TOTAL_AMT',
            summaryType: 'sum'
//            renderer: 'currencyRenderer',
//            summaryRenderer: 'currencyRenderer'
        }
        ,
        {
            text: '정산확정자아이디',
            dataIndex: 'ACC_CONFIRM_USER_ID'
        },
        {
            text: '정산확정자이름',
            dataIndex: 'ACC_CONFIRM_USER_NAME'
        },
        {
            text: '정산확정일자',
            dataIndex: 'ACC_CONFIRM_DATE'
        },
        {
            text: '파트너확인일자',
            dataIndex: 'PARTNER_CHECK_DATE'
        },
        {
            text: '파트너확정일자',
            dataIndex: 'PARTNER_CONFIRM_DATE'
        },
        {
            text: '파트너확정자아이디',
            dataIndex: 'PARTNER_CONFIRM_ID'
        },
        {
            text: '파트너확정담당자명',
            dataIndex: 'PARTNER_CONFIRM_NAME'
        },
        {
            text: '파트너의견',
            dataIndex: 'PARTNER_OPINION'
        },
        {
            text: '파트너정산서',
            dataIndex: 'PARTNER_SLIP_NO'
        },
        {
            text: '비고',
            dataIndex: 'REMARKS'
        },
        {
            text: '매입세금계산서번호',
            dataIndex: 'VENDOR_INV_NO'
        },
        {
            text: '매입세금계산서일자',
            dataIndex: 'VENDOR_INV_DATE'
        },
        {
            text: '등록자아이디',
            dataIndex: 'ADD_USER_ID'
        },
        {
            text: '등록일자',
            dataIndex: 'ADD_DATE'
        },
        {
            text: '등록자이름',
            dataIndex: 'ADD_USER_NAME'
        },
        {
            text: '수정자아이디',
            dataIndex: 'CHANGE_USER_ID'
        },
        {
            text: '수정일자',
            dataIndex: 'CHANGE_DATE'
        },
        {
            text: '수정자이름',
            dataIndex: 'CHANGE_USER_NAME'
        },
        {
            text: 'JOB번호',
            dataIndex: 'JOB_NO',
            hidden: true
        },
        {
            text: 'JOB 일자',
            dataIndex: 'JOB_DATE',
            hidden: true
        },
        {
            text: '거래처주소',
            dataIndex: 'CUSTOMER_ADDR',
            hidden: true
        }
    ]
});
