Ext.define('Eui.sample.model.Base', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.validator.Length'],
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
        },
        {
            name: "col1key",
            type: "string",
            convert: function (v, record) {
                return record.get('col1');
            }
        },
        {
            name: "col2key",
            type: "string",
            convert: function (v, record) {
                return record.get('col1')+'@'+record.get('col2');
            }
        },
        {
            name: "col3key",
            type: "string",
            convert: function (v, record) {
                return record.get('col1')+'@'+record.get('col2')+'@'+record.get('col3');
            }
        },
        {
            name: "col6key",
            type: "string",
            convert: function (v, record) {
                return record.get('col1')+'@'+record.get('col2')+'@'+record.get('col3')+'@'+record.get('col6');
            }
        }
    ]
});