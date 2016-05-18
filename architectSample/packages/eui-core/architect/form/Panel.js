{
    "classAlias": "widget.euiform",
    "className": "eui.form.Panel",
    "inherits": "Ext.form.Panel",
    "autoName": "Form_Panel",
    "helpText": "Form_Panel",
    "toolbox": {
        "name": "Form",
        "category": "EUI Form",
        "groups": ["EUI"]
    },
    "events":[
        {
            "name":"baseformsearch",
            "params":[
                {
                    "name":"form",
                    "type":"object"
                }
            ]
        }
    ],
    "configs": [
        {
            "name":"tableColumns",
            "type":"number"
        },
        {
            "name": "layout",
            "type":"string",
            "initialValue":"table"

        }
    ]
}