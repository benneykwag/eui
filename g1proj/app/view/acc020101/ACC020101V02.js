Ext.define("g1.view.acc020101.ACC020101V02", {
    extend: 'Ext.panel.Panel',
    xtype: 'ACC020101V02',
    requires: [
        'g1.view.acc020101.ACC020101V0201',
        'g1.view.acc020101.ACC020101V0202'
    ],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
        {
            padding: 2,
            xtype: 'ACC020101V0201',
            listeners: {
                baseformsearch: 'getNotConfirm'
            }

        },
        {
            margin : '0 2 2 2',
            xtype: 'ACC020101V0202',
            bind: {
                store: '{ACC020101V02}'
            },
            flex : 1
        }
    ]
});
