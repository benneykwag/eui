Ext.define('Eui.sample.view.template.tmp008.TMP008V', {
    // 하나의 프로그램 최상단 일경우 확장.
    extend: 'eui.container.BaseContainer',
    xtype: 'TMP008V',
    title: 'TMP008V',
    requires: [
        'Eui.sample.view.template.tmp008.TMP008V01',
        'Eui.sample.view.template.tmp008.TMP008V02',
        'Eui.sample.view.template.tmp008.TMP008V03',
        'Eui.sample.view.template.tmp008.TMP008C',
        'Eui.sample.view.template.tmp008.TMP008M'
    ],
    controller: 'TMP008C',
    viewModel: 'TMP008M',

    margin: 10,
    items: [
        {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretchmax'
            },
            items: [
                {
                    width: 200,
                    xtype: 'TMP008V01',
                    bind: '{STORE01}',
                    margin: '0 10',
                    listeners: {
                        itemdblclick: 'onGridDblClick'
                    }
                },
                {
                    flex: 1,
                    xtype: 'TMP008V02'
                }
            ]
        },

        {
            margin: 10,
            flex:1,
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    margin: '0 5 0 0',
                    flex:1,
                    title: 'SUB DETAIL 1',
                    xtype: 'TMP008V03',
                    listeners: {
                        itemclick: 'onRightGridLoad'
                    },
                    bind: {
                        store: '{STORE03}'
                    }

                },
                {
                    reference: 'rightGrid',
                    title: 'SUB DETAIL 2',
                    margin: '0 0 0 5',
                    flex: 1,
                    xtype: 'TMP008V03',
                    bind: {
                        store: '{STORE04}'
                    }

                }
            ]
        }
    ]
});