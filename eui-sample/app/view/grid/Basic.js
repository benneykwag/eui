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
//    tbar: [
//        {
//            bind: '{mystore}',
//            xtype: 'euicommand',
//            params: {
//                PGMID: 'A000',
//                POSIT: '1'
//            },
//            listeners: {
//                rowaddbtnclick: 'onRowAdd',
//                regbtnclick: 'onRowReg',
//                rowdeletebtnclick: 'onRowDelete',
//                modbtnclick: 'onRowMod',
//                savebtnclick: 'onRowSave'
//            }
//        }
//    ],
    items: [
        {
//            itemId: 'mygrid',
            xtype: 'euigrid',
            plugins: [
                {
                    ptype: 'cellediting',   // 셀에디터를 추가.
                    clicksToEdit: 2         // 더블클릭을 통해 에디터로 변환됨.
                },
                {
                    ptype: "gridFilter"
                }
            ],
            selModel: {     // 그리로우를 클릭시 체크박스를 통해 선택되며 체크와 체크해제
                mode: 'SIMPLE',
                selType: 'checkboxmodel'
            },
//            그리드에 페이징 툴바를 추가.
//            usePagingToolbar: true,

            tbar: [
                {
                    xtype: 'euicommand',
                    params: {
                        PGMID: 'A000',
                        POSIT: '1'
                    },
                    listeners: {
                        rowaddbtnclick: 'onRowAdd',
                        regbtnclick: 'onRowReg',
                        rowdeletebtnclick: 'onRowDelete',
                        modbtnclick: 'onRowMod',
                        savebtnclick: 'onRowSave'
                    }
                }
            ],

            bind: '{mystore}',
//            store: {
//                model: 'Eui.sample.model.Message',
//                autoLoad: true
//            },
            listeners: {
                viewready: function () {
                    console.log('사우이 .....viewready')
                }
            },

            columns: [
                {
                    text: '#{행추가2}',
                    width: 100,
                    dataIndex: 'MSG_ID',
                    filter: true,
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