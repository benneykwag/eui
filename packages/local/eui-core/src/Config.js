/***
 * App전역 변수 설정.
 */
Ext.define('eui.Config', {
    singleton: true,
    alternateClassName: ['Config'],
    localeCode : 'kr',
    localeValueField: 'MSG_ID',
    localeDisplayField : 'MSG_LABEL',
    defaultDateFormat : 'Y.m.d',
    defaultDateTimeFormat : '',
    /***
     * 메시지 제공용 서버사이드 주소.
     *
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
        var me = this,
            store = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'i18n'
            });
        var cfg = {
            pMethod: 'GET',
            url : Config.localeUrl,
            params: {
                locale: Config.localeCode
            },
            pSync: false,
            pCallback: function (pScope, params, retData) {
                store.loadData(retData.data);
                store.add(Config.data.message);
                me.mergeMessageData();
            }
        };
        if(Config.localeUrl){
            Util.CommonAjax(cfg);
        }else{
            store.add(Config.data.message);
            me.mergeMessageData();
        }
    },

    /***
     * 사용자가 data.message의 일부를 교체할 경우사용된다.
     * eui-core를 사용하는 app에서 override할 경우.
     * Ext.define('Override.eui.Config', {
     *      override: 'eui.Config',
     *      message: [
     *          {"MSG_ID": "행추가", "MSG_LABEL": "로우추가"}
     *      ]
     * });
     */
    mergeMessageData: function () {
        var store = Ext.getStore('i18n');
        if(!Ext.isArray(Config.message)){
            return;
        }

        Ext.each(Config.message, function(msg){
            var record = store.findRecord(Config.localeValueField, msg[Config.localeValueField], 0, false, false, true);
            if(record){ // 존재하면 override한 데이터로 label을 교체한다.
                record.set(Config.localeDisplayField, msg[Config.localeDisplayField]);
            }else{  // 존재하지 않는다면 추가한다.
                store.add(msg);
            }
        });
    },

    data: {
        message : [
            {"MSG_ID": "행추가", "MSG_LABEL": "레코드추가"},
            {"MSG_ID": "행추가아이콘", "MSG_LABEL": "x-fa fa-plus-square"},
            {"MSG_ID": "행삭제", "MSG_LABEL": "레코드삭제"},
            {"MSG_ID": "행삭제아이콘", "MSG_LABEL": "x-fa fa-minus-square"},
            {"MSG_ID": "등록", "MSG_LABEL": "등록"},
            {"MSG_ID": "등록아이콘", "MSG_LABEL": "x-fa fa-table"},
            {"MSG_ID": "수정", "MSG_LABEL": "수정"},
            {"MSG_ID": "수정아이콘", "MSG_LABEL": "x-fa fa-th"},
            {"MSG_ID": "저장", "MSG_LABEL": "저장"},
            {"MSG_ID": "저장아이콘", "MSG_LABEL": "x-fa fa-save"},
            {"MSG_ID": "CONFIRM", "MSG_LABEL": "확인"},
            {"MSG_ID": "RECORD_DIRTY", "MSG_LABEL": "레코드가 수정중 입니다"},
            {"MSG_ID": "RECORD_DELETE", "MSG_LABEL": "레코드를 삭제하시겠습니까.?"},
            {"MSG_ID": "RECORD_DELETED", "MSG_LABEL": "레코드가 삭제되었습니다"}
        ]
    }
});