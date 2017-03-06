Ext.define('Eui.sample.view.ae.fms010106.FMS010106V02', {
    extend: 'Eui.sample.view.common.Grid',
    xtype: 'FMS010106V02',
    usePagingToolbar: true,
    hiddenRowAddBtn: false,
    hiddenRowDelBtn: false,
    hiddenRowRegBtn: false,
    hiddenRowModBtn: false,
    hiddenRowSaveBtn: false,
    listeners: {
        SPGridRowReg: function () {
            console.log('SPGridRowReg called..');
        },
        SPGridRowMod: function () {
            console.log('SPGridRowMod called..');
        },
        SPGridRowAdd: function () {

        },
        SPGridRowSave: 'onGridRowSave'
    },

//    onRowAdd: function () {
//        // this.callParent를 꼭 호출하고 arguments를 전달한다.
//        this.callParent([this, {
//            randomInt : Ext.Number.randomInt(1, 1000000000000),
//            CUSTOMER_NAME_ENG: 'SDS',
//            CUSTOMER_NAME_KO: 'SDS'
//        }, 0, function () {    // callback이 필요할 경우 구현한다.
//            console.log('그리드 내부에서 콜백철...')
//        }]);
//    },


    columns: [
        {
            xtype: 'rownumberer'
        },
        {
            text: 'COMPANY_NAME',
            width: 100,
            dataIndex: 'COMPANY_NAME',
            editor: {
                renderEditor: true,
                xtype: 'hcombobox',
                plugins: [
                    {
                        ptype: 'clearable'
                    }
                ],
                valueColumnDataIndex: 'COMPANY_CODE',
                nextBindFields: ['COUNTRY_CODE|COMPANY_CD'],
                bind: '{COMPANY_CODE}'
            }
        },
        {
            text: 'COMPANY_CODE',
            dataIndex: 'COMPANY_CODE'
        },
        {
            text: 'COUNTRY_NAME',
            width: 100,
            dataIndex: 'COUNTRY_NAME',
            editor: {
                renderEditor: true,
                xtype: 'hcombobox',
                valueColumnDataIndex: 'COUNTRY_CODE',

                nextBindFields: ['LOCALE_CODE|COUNTRY_CD'],
                bind: '{COUNTRY_CODE}'
            }
        },
        {
            text: 'COUNTRY_CODE',
            dataIndex: 'COUNTRY_CODE'
        },
        {
            text: 'LOCALE_NAME',
            width: 100,
            dataIndex: 'LOCALE_NAME',
            editor: {
                renderEditor: true,
                xtype: 'hcombobox',
                valueColumnDataIndex: 'LOCALE_CODE',
                bind: '{LOCALE_CODE}'
            }
        },
        {
            text: 'LOCALE_CODE',
            dataIndex: 'LOCALE_CODE'
        }
    ]
});