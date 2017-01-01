/***
 * App전역 변수 설정.
 */
Ext.define('Override.eui.Config', {
    override: 'eui.Config',
    localeUrl: 'resources/data/i18n.json',
//    baseUrlPrifix : 'http://localhost:8080',

    commandButtonControllerUrl : 'resources/data/buttonControl.json',

    fileuploadListUrl : 'resources/data/fileList.json',

    message: [
        {"MSG_ID": "행추가2", "MSG_LABEL": "신청일자를 입력해 주세요."},
        {"MSG_ID": "CONFIRM", "MSG_LABEL": "확인"},
        {"MSG_ID": "M90001", "MSG_LABEL": "수정할 로우를 선택하세요."},
        {"MSG_ID": "M90002", "MSG_LABEL": "한건의 로우만 선택하세요."},
        {"MSG_ID": "M90003", "MSG_LABEL": "메시지 등록."},
        {"MSG_ID": "M90004", "MSG_LABEL": "삭제되었습니다."},
        {"MSG_ID": "M90005", "MSG_LABEL": "그리드 정보를 저장하시겠습니까?"},
        {"MSG_ID": "M90006", "MSG_LABEL": "저장되었습니다."},
        {"MSG_ID": "M90001", "MSG_LABEL": "수정할 로우를 선택하세요."}
    ],

    menuData: [
        // Grid Start..
        {
            "ICONCLS": "fa-dashboard",
            "SWIDGET": "",
            "TEXT": "Grid",
            "LEVEL": 1,
            "SCLASS": "",
            "CODE": "GRID",
            "PCODE": "*"
        },
        {
            "ICONCLS": "fa-circle-o text-aqua",
            "SWIDGET": "sample-basic-grid",
            "TEXT": "Basic Grid",
            "LEVEL": 2,
            "SCLASS": "Eui.sample.view.grid.Basic",
            "CODE": "GRID01",
            "PCODE": "GRID"
        },
        {
            "ICONCLS": "fa-circle-o text-aqua",
            "SWIDGET": "sample-mergegrid",
            "TEXT": "Merge Grid",
            "LEVEL": 2,
            "SCLASS": "Eui.sample.view.grid.MergeGrid",
            "CODE": "GRID02",
            "PCODE": "GRID"
        },
        {
            "ICONCLS": "fa-circle-o text-aqua",
            "SWIDGET": "TMP005V",
            "TEXT": "Tree Grid",
            "LEVEL": 2,
            "SCLASS": "Eui.sample.view.template.tmp005.TMP005V",
            "CODE": "GRID03",
            "PCODE": "GRID"
        },

        // Grid End..
        // Form Start..
        {
            "ICONCLS": "fa-th",
            "SWIDGET": "",
            "TEXT": "FORM",
            "LEVEL": 1,
            "SCLASS": "",
            "CODE": "FORM",
            "PCODE": "*"
        },
        {
            "ICONCLS": "fa-circle-o text-aqua",
            "SWIDGET": "sample-form",
            "TEXT": "기본 폼",
            "LEVEL": 2,
            "SCLASS": "Eui.sample.view.form.Panel",
            "CODE": "FORM01",
            "PCODE": "FORM"
        },
        {
            "ICONCLS": "fa-circle-o text-aqua",
            "SWIDGET": "TMP010V",
            "TEXT": "eui.form.field.PopUpPicker",
            "LEVEL": 2,
            "SCLASS": "Eui.sample.view.template.tmp010.TMP010V",
            "CODE": "FORM02",
            "PCODE": "FORM"
        },
        {
            "ICONCLS": "fa-circle-o text-aqua",
            "SWIDGET": "sample-combo",
            "TEXT": "eui.form.field.ComboBox",
            "LEVEL": 2,
            "SCLASS": "Eui.sample.view.form.Combo",
            "CODE": "FORM02",
            "PCODE": "FORM"
        },

        // Form End..
        // Template Start..
        {
            "ICONCLS": "fa-folder",
            "SWIDGET": "",
            "TEXT": "Template",
            "LEVEL": 1,
            "SCLASS": "",
            "CODE": "TEMPLATE",
            "PCODE": "*"
        },
        {
            "ICONCLS": "fa-circle-o text-aqua",
            "SWIDGET": "TMP001V",
            "TEXT": "TMP001V",
            "LEVEL": 2,
            "SCLASS": "Eui.sample.view.template.tmp001.TMP001V",
            "CODE": "TEMPLATE01",
            "PCODE": "TEMPLATE"
        },
        {
            "ICONCLS": "fa-circle-o text-aqua",
            "SWIDGET": "TMP002V",
            "TEXT": "TMP002V",
            "LEVEL": 2,
            "SCLASS": "Eui.sample.view.template.tmp002.TMP001V",
            "CODE": "TEMPLATE02",
            "PCODE": "TEMPLATE"
        }
    ]
});