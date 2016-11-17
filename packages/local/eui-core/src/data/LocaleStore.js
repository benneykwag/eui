Ext.define('eui.store.LocaleStore', {
    extend: 'Ext.data.Store'
/*,

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        console.log('before', arguments);
        var cfg = {
            url: Util.HurlPrefix + 'api/ADM020106SVC/getWebOSInitLvl',
            pSync: false,
            pScope: me,
            pCallback: function(a,b,c){
                console.log('callback', arguments);
                me.superclass.constructor([Ext.apply({
                    storeId: 'i18n',
                    autoLoad: true,
                    fields: [
                        {
                            name: 'name'
                        }
                    ],
                    proxy: {
                        type: 'rest',
                        url: 'http://211.196.150.66:18080/api/ADM020106SVC/getWebOSInitLvl22',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    }
                }, cfg)]);
            }
        };
        console.log('before1', arguments);
        Util.CommonAjax(cfg);
        console.log('before2', arguments);


    }*/
});