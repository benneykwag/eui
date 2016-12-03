Ext.define('Eui.sample.view.common.PopUp03', {
    extend: 'eui.container.Popup',
    alias: 'widget.popup03',

    multiSelect: false,
    html: 'aaa',
    store: {
        type: 'buffered',
        remoteSort: true,
        fields: [],
        leadingBufferZone: 50,
        pageSize: 50,
        proxy: {
            type: 'rest',
            url: 'resources/data/template/data04.json',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }
    }
});