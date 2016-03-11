Ext.define('Eui.sample.view.grid.BasicModel', {
    extend : "Ext.app.ViewModel",
    alias: 'viewmodel.sample-basic-grid',
    requires: ['Eui.sample.model.Base'],
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
        },
        status : {
            bind : {
                bindTo : "{messageRecord}",
                deep : true
            },
            get : function(c) {
                var d = {
                    dirty : c ? c.dirty : false,
                    valid : c && c.isModel ? c.isValid() : false
                };
                d.dirtyAndValid = d.dirty && d.valid;
                return d
            }
        },
        userStatus: {
            bind: {
                bindTo: '{messageRecord}',
                deep: true
            },
            set: function () {
                console.log('set', arguments)
            },
            get: function (user) {
                console.log('user', user.isValid())
                var status = {
                    dirty: user ? user.dirty : true,
                    valid : user ? user.isValid(): false
                };
                status.validAndDirty = status.dirty && status.valid;
                return status;
            }
        }
    },
    stores: {
        mystore: {
            model: 'Eui.sample.model.Base',
            session: true,
            autoLoad: true
        }
    }
});