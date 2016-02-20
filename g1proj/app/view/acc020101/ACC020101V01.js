Ext.define("g1.view.acc020101.ACC020101V01", {
    extend: 'Ext.panel.Panel',
    xtype: 'ACC020101V01',
    requires: [
        'g1.view.acc020101.ACC020101V0101',
        'g1.view.acc020101.ACC020101V0102'
    ],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
        {
            padding: 2,
            xtype: 'ACC020101V0101',
            listeners: {
                baseformsearch: 'getCompleteInfo'
            }
        },
        {
            padding: 2,
            xtype: 'ACC020101V0102',
            bind: {
                store: '{ACC020101V01}'
            },
            flex: 1
        }
    ]
});
