/*Ext.define('d',*/
{
    "classAlias": "widget.euimergegrid",
    "className": "eui.grid.Merge",
    "inherits": "Ext.panel.Table",
    "autoName": "MergeGrid",
    "helpText": "Merge Grid",
    "toolbox": {
        "name": "MergeGrid",
        "category": "EUI Grid",
        "groups": ["EUI"]
    },
    configs: [
        {
            name:"groupFields",
            type:"array"
        },
        {
            name: 'lastMergeColumn',
            type: 'array'
        },
        {
            name: 'sumFields',
            type: 'array'
        }
    ],
    "events": [
        {
            "name": "regbtnclick",
            "params": [
                {
                    "name": "owner",
                    "type": "object"
                }
            ]
        },
        {
            "name": "rowdeletebtnclick",
            "params": [
                {
                    "name": "grid",
                    "type": "object"
                }
            ]
        },
        {
            "name": "modbtnclick",
            "params": [
                {
                    "name": "owner",
                    "type": "object"
                }
            ]
        },
        {
            "name": "rowaddbtnclick",
            "params": [
                {
                    "name": "grid",
                    "type": "object"
                }
            ]
        },
        {
            "name": "savebtnclick",
            "params": [
                {
                    "name": "owner",
                    "type": "object"
                }
            ]
        }
    ]
}
/*)*/
