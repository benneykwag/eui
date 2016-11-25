Ext.define('Eui.sample.view.template.tmp002.TMP002M', {
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