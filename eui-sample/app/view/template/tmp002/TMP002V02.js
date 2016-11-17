Ext.define('Eui.sample.view.tmp002.TMP002V02', {
    extend: 'eui.grid.Panel',
    xtype: 'TMP002V02',
    margin: 10,
    height: 400,
    plugins: {
        ptype: 'cellediting',   // 셀에디터를 추가.
        clicksToEdit: 2         // 더블클릭을 통해 에디터로 변환됨.
    },
    selModel: {     // 그리로우를 클릭시 체크박스를 통해 선택되며 체크와 체크해제
          selType: 'checkboxmodel'
    },
    tbar: [
        {
            showRowAddBtn: true,    // 행추가 버튼 활성화
            showRowDelBtn: true,    // 행삭제 버튼 활성화
            showRegBtn: true,       // 등록 버튼 활성화
            showModBtn: true,       // 수정 버튼 활성화
            showSaveBtn: true,      // 저장 버튼 활성화
            showReloadBtn: true,    // 조회 버튼 활성화
            showExcelDownBtn: true,    // 조회 버튼 활성화
            xtype: 'commandtoolbar' // eui.toolbar.Command 클래스
        }
    ],
    listeners: {                // ViewController클래스에 정의됨.
        select: 'onGridSelect',
        regbtnclick: 'onRowReg',
        rowdeletebtnclick: 'onRowDelete',
        modbtnclick: 'onRowMod',
        rowaddbtnclick: 'onRowAdd',
        savebtnclick: 'onRowSave'
    },
    columns: [
        {
            xtype: 'rownumberer'
        },
        {
            text: '사용자',
            dataIndex:'USEPRSN_NM',
            editor: {
            	bind: "{customerRecord.USEPRSN_NM}",
                xtype: 'euitext'
            }
        },
        {
            text: 'To-do List항목',
            dataIndex:'ITEM',
            editor: {
                xtype: 'euitext'
            }
        },
        {
            text: '조건',
            dataIndex: 'CNDT',
            editor: {
                xtype: 'euitext'
            }
        },
        {
            text:'기준일자',
            dataIndex:'STD_DT',
            editor: {
                xtype: 'euinumber'
            }
        },
        {
            text:'메시지',
            dataIndex:'MSG',
            editor: {
                xtype: 'euitext'
            }
        }
    ]
})