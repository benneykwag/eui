Ext.define('Eui.sample.model.Base',{
    extend: 'Ext.data.Model',
    fields: [
        {
            name: "MSG_ID",
            type: "string",
            validators: [
                {
                    type: "length",
                    min: 3,
                    minOnlyMessage: "Customer name must have at least 3 characters"
                }
            ]
        }
    ],

    proxy: {
        type: 'ajax',
        actionMethods: {
            read: 'GET',
            create: 'POST',
            update: 'POST',
            destroy: 'POST'
        },

        api: {
            create: 'resources/data/mygriddata.json',
            read: 'resources/data/mygriddata.json',
            update: 'resources/data/mygriddata.json',
            destroy: 'resources/data/mygriddata.json?'
        },
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        writer: {
            type: 'json',
            allowSingle: false,
            writeAllFields: true
        },
        listeners: {
            exception: function (proxy, response, operation) {
                console.log('excepation')
                var json = Ext.decode(response.responseText);
                if (json) {
                    Ext.MessageBox.show({
                        title: 'Save Failed',
                        msg: json.message,
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK
                    });
                } else
                    Ext.MessageBox.show({
                        title: 'EXCEPTION',
                        msg: operation.getError(),
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK
                    });
            }
        }
    }
});