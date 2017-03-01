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

    stores: {
        STORE01: {
            autoLoad: true,
            fields: [
                {
                    name: 'USEPRSN_NM',
                    validators: [
                        {
                            type: "presence",
                            message: "성명은 필수 입력 필드입니다."
                        },
                        {
                            type: 'euiformat',
                            chkType: 'K',
                            message: "성명은 한글만 허용합니다"
                        }
                    ]
                },
                {
                    name: 'MSG',
                    validators: [
                        {
                            type: 'euiformat',
                            chkType: 'Ee',
                            message: "메시지는 영문대소문자 만 허용합니다"
                        }
                    ]
                },
                {
                    name: 'NUMBERTYPE_STRING',
                    validators: [
                        {
                            type: 'euiformat',
                            chkType: 'N',
                            message: "숫자만 허용합니다"
                        }
                    ]
                },
                {
                    name: "OUTPUT_DT",
                    type: "date"
                },
                {
                    name: "INPUT_DT",
                    type: "date"
                },
                {
                    name: "UPDATE_DT",
//                    dateFormat: 'Y.m.d',
                    type: "date"
                },
                {
                    name: "RELEASE_DT",
                    type: "date"
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