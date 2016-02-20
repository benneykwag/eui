Ext.define("g1.view.acc020101.ACC020101V", {
    extend: 'Ext.container.Container',
    xtype: 'ACC020101V',
    requires: [
        'g1.view.acc020101.ACC020101V04',
        'g1.view.acc020101.ACC020101V03',
        'g1.view.acc020101.ACC020101V05',
        'g1.view.acc020101.ACC020101V02',
        'g1.view.acc020101.ACC020101V06',
        'g1.view.acc020101.ACC020101V01',
        "g1.view.acc020101.ACC020101C"
//        "acc.view.acc020101.ACC020101M"
    ],
    controller: "ACC020101C",
//    viewModel: {
//        type: "ACC020101M"
//    },
    layout: 'border',
    viewModel: {

    },


    items: [
        {
            xtype: 'panel',
            layout: 'accordion',
            header : {
               // height: 35,
                titlePosition: 0,
                items: [
                    {
                        xtype: 'spbutton',
                       // disabled: true,
                        iconCls: 'x-fa fa-print'
                    },
                    {
                        xtype: 'spbutton',
                      //  disabled: true,
                        iconCls: 'x-fa fa-sign-out'
                    }
                ]
            },
            border: true,
            width: 350,
//            defaults: {
//                margin: 1
//            },
            title: 'Statement Information',
            region: 'west',
//            margin : '5 0 0 5',
            collapsible: true, // make collapsible
            split: true,
            items: [
                {
                    xtype: 'ACC020101V01',
                    title: '청구완료내역',
                    listeners: {
//                        baseformsearch: 'getCompleteInfo'
                    }
                },
                {
                    xtype: 'panel',
                    title: '청구진행내역',
                    items: [
                        {
                            padding: 2,
                            xtype: 'ACC020101V06',

                            listeners: {
                                //                        changeFinalRate: 'changeFinalRate'
                            }
                        }
                    ]
                },
                {
                    xtype: 'ACC020101V02',
                    minHeight: 300,
                    title: '미확정내역'
                }
            ]
        },

        {
            xtype: 'panel',
            flex: 1,
            scrollable: 'y',
            region: 'center',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'ACC020101V05',
                    margin: '0 5 5 5',
//                    padding: 5,
                    listeners: {
//                        baseformsearch: 'search'
                    }
//                    margin: 5
                },
                {
                    xtype: 'ACC020101V03',
                    bind: {
//                        store: '{ACC020101V03}'
                    },
                    margin: '0 5 0 5',
                    height: 350,
                    listeners: {
//                        searchDetail : 'searchDetail',
//                        saveDetail : 'saveDetail'
                    }
                },
                {
                    margin: '5 5 0 5',
                    xtype: 'ACC020101V04',
                    bind: {
//                        store: '{ACC020101V04}'
                    },
                    height: 200
                }
            ]
        }
    ]
});
