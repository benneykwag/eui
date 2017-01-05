


Ext.application({
    name: 'Eui.sample',

    extend: 'Eui.sample.Application',
    requires: [
    ],
    init: function () {
        eui.Config.initLocaleMessage();
//        Ext.ux.ajax.SimManager.init({
//            delay: 300,
//            defaultSimlet: null
//        }).register({
//            'resources/data/companys.json': {
//                data: [
//                    {
//                        "name":"마이크로소프트2",
//                        "code":"MICROSOFT"
//                    },
//                    {
//                        "name":"B회사",
//                        "code":"BCMP"
//                    },
//                    {
//                        "name":"C회사",
//                        "code":"CCMP"
//                    },
//                    {
//                        "name":"D회사",
//                        "code":"DCMP"
//                    }
//                ],
//                stype: 'json'
//            }
//        });
    },

    // The name of the initial view to create. With the classic toolkit this class
    // will gain a "viewport" plugin if it does not extend Ext.Viewport. With the
    // modern toolkit, the main view will be added to the Viewport.
    //
    mainView: 'Eui.sample.view.main.Main',
    launch : function() {
//        Ext.create('Ext.grid.Panel',{
//            plugins:[{ptype:"gridFilter"}],
//            renderTo: document.body,
//            forceFit: true,
//            store: {
//                autoLoad: true,
//                proxy: {
//                    fields: [
//                        'areaNm'
//                    ],
//                    type:'rest',
//                    url : 'http://extuxgroup.com/resources/data/Order.json?_dc=1483275314418&page=1&start=0&limit=10',
////                    url: '../Data/data1.json',
//                    reader: {
//                        type: 'json',
//                        rootProperty: 'entitys'
//                    }
//                }
//            },
//            columns: [
//                {
//                    text: 'areaNm',
//                    dataIndex: 'areaNm',
//                    filter: true
//                },
//                {
//                    text: 'customName',
//                    dataIndex: 'customName',
//                    filter: true
//                },
//                {
//                    text: 'areaNm',
//                    dataIndex: 'areaNm'
//                },
//                {
//                    text: 'areaNm',
//                    dataIndex: 'areaNm',
//                    filter: true
//                }
//            ]
//        })
    }
});
