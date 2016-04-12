Ext.define('Eui.sample.model.Base', {
    extend: 'Ext.data.Model',
    identifier: {
        type: 'sequential',
        prefix: 'MSG'
    },
    fields: [
        {
            name: "MSG_ID",
            type: "string",
            validators: [
                {
                    type: "length",
                    min: 10,
                    minOnlyMessage: "MSG_ID must have at least 3 characters"
                }
            ]
        },
        {
            name: "MSG_LABEL",
            type: "string",
            validators: [
                {
                    type: "length",
                    min: 4,
                    minOnlyMessage: "MSG_LABEL must have at least 3 characters"
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
            create: 'resources/data/mygriddata.json?create',
            read: 'resources/data/mygriddata.json?read',
            update: 'resources/data/mygriddata.json?update',
            destroy: 'resources/data/mygriddata.json?destroy'
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