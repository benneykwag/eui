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
        }
    ]
});