Ext.define('Eui.sample.view.grid.BasicModel', {
    extend : "Ext.app.ViewModel",
    alias: 'viewmodel.sample-basic-grid',
    requires: ['Eui.sample.model.Message'],
    data: {
        current: {
            user: null,
            editMode: 'Edit'
        }
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
            model: 'Eui.sample.model.Message',
            autoLoad: true
        }
    }
});