Ext.define('Eui.sample.view.grid.Basic', {
    extend: 'Ext.panel.Panel',
    xtype: 'sample-basic-grid',
    title: '#{행추가2}',
    requires: [
        'eui.grid.Panel',   // Ext.grid.Panel클래스를 확장한 eui-core용 그리드 클래스.
        'eui.toolbar.Command',                  // 명령버튼 제공
        'Eui.sample.view.grid.RecordForm',      // 등록 및 수정 폼
        'Eui.sample.view.grid.BasicModel',      // 뷰모델 클래스
        'Eui.sample.view.grid.BasicController'  // 뷰컨트롤러 클래스
    ],
    controller: 'sample-basic-grid',
    viewModel: 'sample-basic-grid',
    layout: 'fit',

    items: [
        {
//            itemId: 'mygrid',
            xtype: 'euigrid',
            plugins: {
                ptype: 'cellediting',   // 셀에디터를 추가.
                clicksToEdit: 2         // 더블클릭을 통해 에디터로 변환됨.
            },
            selModel: {     // 그리로우를 클릭시 체크박스를 통해 선택되며 체크와 체크해제
                mode: 'SIMPLE',
                selType: 'checkboxmodel'
            },
//            그리드에 페이징 툴바를 추가.
//            usePagingToolbar: true,

            tbar: [
                {
//            ownerGrid : 'sample-basic-grid@mygrid',
                    showRowAddBtn: true,    // 행추가 버튼 활성화
                    showRowDelBtn: true,    // 행삭제 버튼 활성화
                    showRegBtn: true,       // 등록 버튼 활성화
                    showModBtn: true,       // 수정 버튼 활성화
                    showSaveBtn: true,      // 저장 버튼 활성화
                    showReloadBtn: true,    // 조회 버튼 활성화
                    showExcelDownBtn: true,
                    xtype: 'commandtoolbar' // eui.toolbar.Command 클래스
                }
            ],
            bind: {
                store: '{mystore}'      // ViewModel클래스에 정의됨.
            },
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
                    text: '#{행추가2}',
                    width: 100,
                    dataIndex: 'MSG_ID',
                    editor: {
                        bind: "{messageRecord.MSG_ID}",
                        xtype: 'textfield'
                    }
                },
                {
                    text: 'MSG_LABEL',
                    flex: 1,
                    dataIndex: 'MSG_LABEL',
                    editor: {
                        bind: "{messageRecord.MSG_LABEL}",
                        xtype: 'textfield'
                    }
                }
            ]
        }
    ]
});