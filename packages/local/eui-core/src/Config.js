/***
 * App전역 변수 설정.
 */
Ext.define('eui.Config', {
    singleton: true,
    alternateClassName: ['Config'],
    localeCode : 'kr',
    localeValueField: 'MSG_ID',
    localeDisplayField : 'MSG_LABEL',

    /***
     * "data": [
     *      {"MSG_ID": "F000000119", "MSG_LABEL": "삭제할 데이터를 선택해 주세요."},
     *      {"MSG_ID": "F000000122", "MSG_LABEL": "신청일자를 입력해 주세요."},
     *      {"MSG_ID": "F000000129", "MSG_LABEL": "시간은 0~23 사이만 입력 가능합니다."},
     *      {"MSG_ID": "F000000130", "MSG_LABEL": "성명을 입력해 주시기 바랍니다."},
     * ]
     */
    localeUrl : null,

    /***
     * eui-core에 필요한 텍스트 레이블 정보.
     */
    initLocaleMessage: function () {
        var store = Ext.create('Ext.data.Store', {
            fields: [],
            storeId: 'i18n'
        });
        var cfg = {
            url : Config.localeUrl,
            params: {
                locale: Config.localeCode
            },
            pSync: false,
            pCallback: function (pScope, params, retData) {
                store.loadData(retData.data);
                store.add(Config.data.message);
            }
        };
        if(Config.localeUrl){
            Util.CommonAjax(cfg);
        }else{
            store.add(Config.data.message);
        }
    },

    data: {
        message : [
            {"MSG_ID": "F000000119", "MSG_LABEL": "신청일자를 입력해 주세요."}
        ]
    }
});