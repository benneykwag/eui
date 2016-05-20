/*Ext.define('d',*/
{
    "classAlias": "widget.commandtoolbar",
    "className": "eui.toolbar.Command",
    "inherits": "Ext.toolbar.Toolbar",
    "autoName": "Commandtoolbar",
    "helpText": "Commandtoolbar",
    "toolbox": {
    "name": "Commandtoolbar",
        "category": "EUI Toolbar",
        "groups": ["EUI"]
    },
    configs: [
        {
            name:"showRowAddBtn",
            type:"boolean"
        },
        {
            name: 'showRowDelBtn',
            type: 'boolean'
        },
        {
            name: 'showRegBtn',
            type: 'boolean'
        },
        {
            name: 'showReloadBtn',
            type: 'boolean'
        },
        {
            name: 'showModBtn',
            type: 'boolean'
        },
        {
            name: 'showSaveBtn',
            type: 'boolean'
        },
        {
            name: 'showCloseBtn',
            type: 'boolean'
        }
    ]
}
/*)*/
