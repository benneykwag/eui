Ext.define('Eui.sample.view.template.tmp002.TMP002V01',{
    extend: 'Ext.container.Container',
    xtype: 'TMP002V01',
    layout: 'hbox',
    height: 50,
    margin: 10,
    defaults: {
        margin: '27 5 0 0'
    },
    items: [
        {
            xtype: 'container',
            margin: 0,
            layout: 'vbox',
            flex: 1,
            items: [
                {
                    width: 100,
                    hideHeaderICon: false,
                    xtype: 'euipanel',
                    title: '운영관리'
                },
                {
                    margin: '5 0 5 5',
                    xtype: 'component',
                    html : '임대관리 > 임대운영사 정보 > 운영기초관리'
                }
            ]
        },

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
                rowaddbtnclick: function(){

                },
                regbtnclick: 'onRowReg',
                rowdeletebtnclick: function () {

                },
                savebtnclick: 'onRowSave'
            }
        }

    ]
})