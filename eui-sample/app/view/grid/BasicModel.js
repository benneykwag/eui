Ext.define('Eui.sample.view.grid.BasicModel', {
    extend : "Ext.app.ViewModel",
    alias: 'viewmodel.sample-basic-grid',
    data: {
        xx: '1111'
    },
    formulas : {
        messageRecord: {
            bind: {
                bindTo: "{myGrid.selection}",
                deep: true
            },
            get: function (b) {
                return b
            }
        }
    },
    stores: {
        mystore: {
            model: 'Eui.sample.model.Base',
            autoLoad: true
        }
    }
});