Ext.define('Eui.sample.view.template.Style1',{
    extend: 'eui.panel.Panel',
    xtype: 'style1',

    items: [
        {
            xtype: 'toolbar',
            ui: 'plain',
            items: [
                {
                    xtype: 'euiheader',
                    width: 200,
                    title: 'PAGE TITLE 페이지 타이틀'
                },
                '->',
                {
                    scale: 'medium',

                    showPrintBtn: true,
                    showRowAddBtn: true,
                    showRowDelBtn: true,
                    showRegBtn: true,
                    showReloadBtn: true,
                    showModBtn: true,
                    showSaveBtn: true,
                    showCloseBtn: true,
                    showExcelDownBtn: true,

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
            xtype : 'euiform',
            margin: 10,
            iconCls: null,
            title: 'PAGE TITLE 페이지 타이틀',
            header: {
                xtype: 'header',
                titlePosition: 0,
                items: [
                    {
                        hideTextPrintBtn: true,
                        hideTextReloadBtn: true,
                        hideAddBtnICon: true,
                        hideDelBtnICon: true,
                        hideRegBtnICon: true,
                        hideModBtnICon: true,
                        hideSaveBtnICon: true,
                        showReloadBtn: true,
                        showPrintBtn: true,
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
            items: [
                {
                    xtype: 'euitext',
                    fieldLabel: 'FORM FIELD'
                },
                {
                    xtype: 'euitext',
                    fieldLabel: 'FORM FIELD'
                }
            ]
        },
        {
            xtype : 'euigrid',
            margin: 10,
            height: 200,
            iconCls: null,
            title: 'PAGE TITLE 페이지 타이틀',
            header: {
                xtype: 'header',
                titlePosition: 0,
                items: [
                    {
                        hideTextPrintBtn: true,
                        hideTextReloadBtn: true,
                        hideAddBtnICon: true,
                        hideDelBtnICon: true,
                        hideRegBtnICon: true,
                        hideModBtnICon: true,
                        hideSaveBtnICon: true,
                        showReloadBtn: true,
                        showPrintBtn: true,
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
            columns: [
                {
                    text: 'euitext',
                    fieldLabel: 'FORM FIELD'
                },
                {
                    text: 'euitext',
                    fieldLabel: 'FORM FIELD'
                }
            ]
        }
    ]
})