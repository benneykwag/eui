/*
 * File: app/view/Grid1.js
 *
 * This file was generated by Sencha Architect version 3.5.1.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 6.0.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 6.0.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('euisa.view.Grid1', {
    extend: 'eui.grid.Panel',
    alias: 'widget.grid1',

    requires: [
        'euisa.view.Grid1ViewModel',
        'Ext.grid.column.Number',
        'Ext.grid.column.Date',
        'Ext.grid.column.Boolean',
        'Ext.view.Table'
    ],

    viewModel: {
        type: 'grid1'
    },
    height: 250,
    width: 400,
    title: 'My Grid Panel',

    columns: [
        {
            xtype: 'gridcolumn',
            dataIndex: 'string',
            text: 'String'
        },
        {
            xtype: 'numbercolumn',
            dataIndex: 'number',
            text: 'Number'
        },
        {
            xtype: 'datecolumn',
            dataIndex: 'date',
            text: 'Date'
        },
        {
            xtype: 'booleancolumn',
            dataIndex: 'bool',
            text: 'Boolean'
        }
    ]

});