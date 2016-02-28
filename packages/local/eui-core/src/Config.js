/***
 * App전역 변수 설정.
 */
Ext.define('eui.Config', {
    singleton: true,
    alternateClassName: ['Config'],
    localeCode : 'kr',
    localeValueField: 'MSG_ID',
    localeDisplayField : 'MSG_CONTENTS',

    /***
     *
     */
    internalLabelFile : 'resources/data/i18n.json',

    /***
     * eui-core에 필요한 텍스트 레이블 정보.
     */
    initLocale: function () {
        var cfg = {
            url : Config.internalLabelFile,
            params: {
                locale: Config.localeCode
            },
            pSync: false,
            pCallback: function (pScope, params, retData) {
                var store = Ext.create('Ext.data.Store', {
                    fields: [],
                    storeId: 'i18n'
                });
                store.loadData(retData.data);
            }
        };

        Util.CommonAjax(cfg);
    },

    initCustomLocale: function () {
        var store = Ext.getStore('i18n');
         if(Ext.isEmpty(store)){
             store = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'i18n'
            });
        }
        var cfg = {
            url : 'resources/data/customI18n.json',
            params: {
            },
            pSync: false,
            pCallback: function (pScope, params, retData) {
                store.add(retData.data);
            }
        };

        Util.CommonAjax(cfg);
    }
});