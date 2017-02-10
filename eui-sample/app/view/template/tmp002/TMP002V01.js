Ext.define('Eui.sample.view.template.tmp002.TMP002V01',{
    extend: 'Ext.container.Container',
    xtype: 'TMP002V01',
    items: [
        {
            xtype: 'toolbar',
            margin: '0 10 10 10',
            ui: 'plain',
            items: [
                {
                    xtype: 'euiheadernav',
                    text: '임대관리 > 임대운영사 정보 > 운영기초'
                },
                '->',
                {
                    bind: '{STORE01}',
                    showPrintBtn: true,
                    rowAddBtnText: '신규',
                    showRowAddBtn: true,
                    showRowDelBtn: true,
                    showSaveBtn: true,
                    xtype: 'euicommand',
                    params: {
                        PGMID: 'A000',
                        POSIT: '1'
                    },
                    listeners: {
                        rowaddbtnclick: function () {

                        },
                        regbtnclick: 'onRowReg',
                        rowdeletebtnclick: function () {

                        },
                        savebtnclick: 'onRowSave'
                    }
                }
            ]
        },
        {
            xtype: 'toolbar',
            margin: '0 10 10 10',
            items: [
                {
                    reference: 'cmpKey',
                    xtype: 'euitext',
                    triggers: {
                        search: {
                            cls: 'x-form-search-trigger',
                            handler: 'onClearClick',
                            scope: 'this'
                        }
                    },
                    cellCls: 'null',
                    fieldLabel: '플랫폼사용자',
                    width: 200
                },
                '->',

                {
                    xtype: 'euibutton',
                    iconCls: 'x-fa fa-filter',
                    text: '검색',
                    handler: 'dataSearch'
                }
            ]
        },
        {
            xtype: 'toolbar',
            ui: 'plain',
            margin: '0 10 10 10',
            items: [
                {
                    margin: '0 10 0 10',
                    boxLabel: '전체',
                    xtype: 'checkbox'
                },
                {
                    margin: '0 10 0 10',
                    boxLabel: '협력사',
                    xtype: 'checkbox'
                },
                {
                    margin: '0 10 0 10',
                    boxLabel: '직영',
                    xtype: 'checkbox'
                },
                {
                    xtype: 'euibutton',
                    text: '영업점'
                },
                {
                    xtype: 'fieldcontainer',
                    layout:'hbox',
                    items: [
                        {
                            bind: '{ROWPOSITION}',
                            xtype:'euinumber',
                            allowBlank: false,
                            width: 20
                        },
                        {
                            bind: '{COLPOSITION}',
                            xtype: 'euinumber',
                            allowBlank: false,
                            width: 20
                        },
                        {
                            xtype: 'euibutton',
                            text: '에디터 활성화',
                            handler: 'openEditor'
                        }
                    ]
                },
                '->',
                {
                    bind: '{STORE01}',
                    showReloadBtn: true,
                    showExcelDownBtn: true,
                    showRowAddBtn: true,
                    showRowDelBtn: true,
                    showRegBtn: true,       // 등록 버튼 활성화
                    showModBtn: true,
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
                        savebtnclick: 'onRowSave',
                        printbtnclick: function () {

                        }
                    }
                }
            ]
        }
    ]
});