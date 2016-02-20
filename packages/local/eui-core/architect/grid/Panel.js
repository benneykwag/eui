/*Ext.define('d',*/
{
    "classAlias": "widget.spgrid",
    "className": "sprr.grid.Panel",
    "inherits": "Ext.grid.Panel",
    "autoName": "MyGrid",
    "helpText": "MyGrid",
    "toolbox": {
        "name": "SPGrid",
        "category": "Sprr Grids Grid",
        "groups": ["Sprr"]
    },
    configs: [
        {
            name: 'hiddenRowAddBtn',
            type: 'boolean'
        },
        {
            name: 'hiddenRowDelBtn',
            type: 'boolean'
        },
        {
            name: 'hiddenRowRegBtn',
            type: 'boolean'
        },
        {
            name: 'hiddenRowModBtn',
            type: 'boolean'
        },
        {
            name: 'hiddenRowSaveBtn',
            type: 'boolean'
        },
        {
            name: 'onRowAddHandler',
            type: 'string'
        },
        {
            name: 'onRowDelHandler',
            type: 'string'
        },
        {
            name: 'onRowRegHandler',
            type: 'string'
        },
        {
            name: 'onRowModHandler',
            type: 'string'
        },
        {
            name: 'onRowSaveHandler',
            type: 'string'
        },
        {
            "name":"hbuttons",
            "type": "array"
        }
    ]
}
/*)*/
