Ext.define('Eui.sample.view.ae.fms010106.FMS010106V02', {
    extend: 'eui.grid.Panel',
    xtype: 'FMS010106V02',
    usePagingToolbar: true,
    plugins: {
        ptype: 'cellediting',
        clicksToEdit: 2
    },
    columns: [
        {
            text: 'COMPANY_NAME',
            width: 100,
            dataIndex: 'COMPANY_NAME',
            editor: {
                id: 'combo1',
                renderEditor: true,
                xtype: 'hcombobox',
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
        },
        {
            text: 'AREA_NAME',
            width: 100,
            dataIndex: 'AREA_NAME',
            editor: {
                xtype: 'hcombobox',
                valueColumnDataIndex: 'AREA_CODE',
                bind: '{AREA_CODE}'
            }
        },
        {
            text: 'AREA_CODE',
            dataIndex: 'AREA_CODE'
        }
    ]
});