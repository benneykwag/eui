Ext.define('Eui.sample.view.tmp002.TMP002M', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TMP002M',
    data: {
        myRecord: {
            isOptedIn: 'I',
            firstName: 'Fou',
            lastName: 'Barr'
        }
    },
    formulas: {
        radioValue: {
            bind: '{customerRecord.field5}',
            get: function (value) {
                return {
                    field5: value
                };
            }
        },
        formStatus: {
            bind: {
                bindTo: '{customerRecord}',
                deep: true
            },
            get: function (user) {
                if (!user) {
                    return {
                        dirty: true,
                        valid: false,
                        phantom: true,
                        validAndDirty: false,
                        disabled: true
                    }
                }
                var status = {
                    dirty: user ? user.dirty : true,
                    valid: user ? user.isValid() : false,
                    phantom: user.phantom,
                    disabled: false
                };
                status.validAndDirty = status.dirty && status.valid;

                return status;
            }
        }
    },
    stores: {
        STORE01: {
            autoLoad: true,
            fields: [
                {
                    name: 'USEPRSN_NM',
                    validators: [
                        {
                            type: "presence",
                            message :"성명은 필수 입력 필드입니다."
                        }
                    ]
                },
                {
                    name: "field5",
                    type: "date",
                    dateFormat: "Ymd"
                }
            ],
            proxy: {
                type: 'rest',
                url: 'resources/data/template/data01.json',
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                },
                writer: {
                    type: 'json',
                    allowSingle: false,
                    writeAllFields: true
                }
            }
        }
    }
});