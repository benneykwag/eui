Ext.define('Eui.sample.view.template.tmp002.TMP002V04', {
    extend: 'Ext.container.Container',
    xtype: 'TMP002V04',
    items: [
        {
            xtype: 'toolbar',
            margin: 10,
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
                    width: 50,
                    text: '검색',
                    handler: 'dataSearch'
                },
                {
                    xtype: 'tbseparator'
                }
            ]
        },
        {
            xtype: 'toolbar',
            ui : 'plain',
            margin: '0 10 0 10',
            items: [
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
                {
                    xtype: 'euibutton',
                    text: 'CSV업로드',
                    handler: 'ExcelUpload'
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
})