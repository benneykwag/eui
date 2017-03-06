Ext.define('Eui.sample.view.ae.fms010106.FMS010106V', {
    extend: 'Ext.container.Container',
    xtype: 'FMS010106V',
    requires: [
        "Eui.sample.view.ae.fms010106.FMS010106V01",
        "Eui.sample.view.ae.fms010106.FMS010106V02",
        "Eui.sample.view.ae.fms010106.FMS010106V03",
        "Eui.sample.view.ae.fms010106.FMS010106C",
        "Eui.sample.view.ae.fms010106.FMS010106M"
    ],
    controller: 'FMS010106C',
    viewModel: {
        type: 'FMS010106M'
    },

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {
            title: 'ULD Plan',
            xtype: 'FMS010106V01'
        }/*,
        {
            flex:1,
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    flex:1,
                    margin: 10,
                    bind: {
                        title: '{MYTEXT}',
                        store: '{FMS010106G1}'
                    },
                    xtype: 'FMS010106V02',
                    minHeight: 200
                },
                {
                    flex:1,
                    margin: 10,
                    bind: {
                        title: '{MYTEXT}'
                    },
                    xtype: 'FMS010106V03',
                    minHeight: 200
                }
            ]

        }*/
    ]
})