Ext.define('Eui.sample.model.Base', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.validator.Length'],
    fields: [
        // 정의하지 않을 경우 model.getDate() 시 eui.Config.modelGetDataDateFormat 으로 전송.
        /*  {
         name: 'MONTHFIELD',
         type: 'date',
         dateFormat: "Y.m"
         },
         {
         name: 'DATEFIELD',
         type: 'date',
         dateFormat: "Y.m.d"
         },*/
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
            name: "col1",
            type: "string"
        },
        {
            name: "col2",
            type: "string",
            convert: function (v, record) {
                return record.get('col1') + '@' + record.get('col2');
            }
        },
        {
            name: "col3",
            type: "string",
            convert: function (v, record) {
                return record.get('col2') + '@' + record.get('col3');
            }
        },
        {
            name: "col6",
            type: "string",
            convert: function (v, record) {
                return record.get('col1') + '@' + record.get('col2') + '@' + record.get('col3') + '@' + record.get('col6');
            }
        },
        {
            name: 'VALIDATOR_CHK_NUMBER',
            validators: [
                {
                    type: 'euiformat',
                    chkType: 'N'
                }
            ]
        }
    ]
});