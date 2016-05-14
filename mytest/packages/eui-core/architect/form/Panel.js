/*Ext.define('d',*/
    {
        "classAlias": "widget.spform",
        "className": "sprr.form.Panel",
        "inherits": "Ext.form.Panel",
        "autoName": "Form_Panel",
        "helpText": "Form_Panel",
        "toolbox": {
            "name": "Form",
            "category": "Sprr Forms Containers",
            "groups": ["Sprr"]
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
                "name": "hiddenBtmTbar",
                "type": "boolean"
            },
            {
                "name": "hiddenCloseBtn",
                "type": "boolean"
            },
            {
                "name": "hiddenHeader",
                "type": "boolean"/*,
                // 아래 코드 오류 발생시킴
                "initialValue":"false"*/
            },
            {
                "name": "hiddenSearchBtn",
                "type": "boolean"
            },
            {
                "name": "hiddenPrintBtn",
                "type": "boolean"
            },
            {
                "name": "hiddenDeleteBtn",
                "type": "boolean"
            },
            {
                "name": "hiddenSaveBtn",
                "type": "boolean"
            },
            {
                "name": "hiddenClearBtn",
                "type": "boolean"
            },
            {
                "name": "useTableLayout",
                "type": "boolean"
            },
            {
                "name":"tableColumns",
                "type":"number"
            },
            {
                "name":"hbuttons",
                "type": "array"
            }
        ],
        "items": [
        {
            "type": "basiceventbinding",
            "configs":{
                "fn": "onContainer_Onload",
                "name": "onload",
                "implHandler": [
                    "\/\/ 1-1.화면 Load 완료시 실행 스크립트\n\n",
                    "\/\/ 공통코드 조회 및 화면 기본 이벤트 자동설정\n\n",
                    "gfn_InitForm(container);\n\n",
                    "\/\/ 전체 공통버튼 활성화\n",
                    "\/\/ 조회(1혹은0), 신규(1혹은0), 삭제(1혹은0), 저장(1혹은0) , 인쇄(1혹은0),\n",
                    "\/\/ 사용자버튼1(1혹은0), 사용자버튼2(1혹은0), 사용자버튼3(1혹은0), 사용자버튼4(1혹은0), 사용자버튼5(1혹은0),\n",
                    "\/\/ 사용자버튼6(1혹은0), 사용자버튼7(1혹은0), 사용자버튼8(1혹은0), 사용자버튼9(1혹은0), 사용자버튼10(1혹은0)\n",
                    "\/\/ gfn_SetButton(container, '111110101010110');\n\n",
                    "\/\/ 화면 초기화 처리\n",
                    "container.fn_init();\n"
                ]
            }
        }
        ]
    }

/*
)*/
