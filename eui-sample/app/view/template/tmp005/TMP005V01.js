Ext.define('Eui.sample.view.template.tmp005.TMP005V01',{
    extend: 'eui.panel.Panel',
    xtype: 'TMP005V01',
    margin : 10,
    tbar: [
        {
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
            handler:'onLoadData'
        },
        {
            xtype: 'tbseparator'
        },
        {
            xtype: 'euibutton',
            iconCls: 'x-fa fa-save',
            width: 50,
            text: '저장'
        }
    ],
    header: {
        xtype: 'header',
        titlePosition: 0,
        items: [
            {
                xtype: 'component',
                html : '임상관리 > 임대운영사 정보 > 기초정보관리'
            }
        ]
    },
    title: '기초정보관리'
})