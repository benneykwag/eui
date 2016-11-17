Ext.define('Eui.sample.view.template.tmp002.TMP002V01',{
    extend: 'eui.panel.Panel',
    xtype: 'TMP002V01',
    margin : 10,
    tbar: [
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
            fieldLabel: '사용자',
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
        },
        {
            xtype: 'euibutton',
            iconCls: 'x-fa fa-save',
            width: 50,
            text: '저장',
            handler: 'onSave'
        }
    ],
    header: {
        xtype: 'header',
        titlePosition: 0,
        items: [
            {
                xtype: 'component',
                html : '메뉴관리 > 메뉴'
            }
        ]
    },
    title: '데이터기초관리'
})