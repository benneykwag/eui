Ext.define('Eui.sample.view.template.tmp005.TMP005V01',{
    extend: 'Ext.container.Container',
    xtype: 'TMP005V01',
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
            iconCls: 'x-fa fa-folder-open',
            xtype: 'euibutton',
            text: '조회',
            handler: 'onLoadData'
        },
        {
            iconCls: 'x-fa fa-folder-open',
            xtype: 'euibutton',
            text: '저장',
            handler: 'onSave'
        }
    ]
});