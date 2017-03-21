Ext.define('Eui.sample.view.ae.fms010106.FMS010106M', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.FMS010106M',
    data: {
        CUSTOMER_CODE : 'YUSEN',
        CUSTOMER_CODE2 : 'HTNSSHA',
        GUBUN1_CD :"0002"
    },
    stores: {
        FMS010106G1: {
            autoLoad: true,
            fields: [],
            proxy: {
                type: 'rest',
                api: {
                    create : 'resources/data/fileList.json',
                    read: 'resources/data/gridtest.json',
                    update: 'resources/data/fileList.json',
                    destroy: 'resources/data/fileList.json'

//                    read: 'api/FMS010106SVC/get',
//                    create: 'api/FMS010106SVC/save?create',
//                    create : 'resources/test.json',
//                    update: 'api/FMS010106SVC/save?update'
                },
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                },
                writer: {
                    type: 'json',
                    allowSingle: false,  // #2
                    writeAllFields: true    // #3
                }
            }
        },
        FMS010106G2: {
            fields: [],
            proxy: {
                type: 'rest',
                url:  'api/FMS010106SVC/getMBL',
                reader: {
                    type: 'json',
                    rootProperty: 'FMS010106G2'
                }
            }
        },
        FMS010106G3: {
            fields: [],
            proxy: {
                type: 'rest',
                url:  'api/FMS010106SVC/getMBL',
                reader: {
                    type: 'json',
                    rootProperty: 'FMS010106G2'
                }
            }
        }
    }
});
