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
                    reloadBtnICon : 'x-fa fa-download',
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
                        printBtnText: '출력버튼',
                        rowAddBtnText: '추가버튼',
                        rowDelBtnText: '삭제버튼',
                        regBtnText: '등록버튼',
                        reloadBtnText: '조회버튼',
                        modBtnText: '수정버튼',
                        saveBtnText: '저장버튼',
                        closeBtnText: '닫기버튼',
                        excelDownBtnText: '엑셀다운로드버튼',

                        showPrintBtn: true,
                        showRowAddBtn: true,
                        showRowDelBtn: true,
                        showRegBtn: true,
                        showReloadBtn: true,
                        showModBtn: true,
                        showSaveBtn: true,
                        showCloseBtn: true,
                        showExcelDownBtn: true,
                        xtype: 'euicommand'
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