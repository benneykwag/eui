Ext.define('Eui.sample.model.Message', {
    extend: 'Eui.sample.model.Base',
    identifier: {
        type: 'sequential',
        prefix: 'MSG'
    },
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