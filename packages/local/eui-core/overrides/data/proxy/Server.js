/*
 * proxy Rest 관련 Default 설정
 * */
Ext.define('Override.data.proxy.Server', {
    override : 'Ext.data.proxy.Server',

    buildUrl: function(request) {
        var me = this,
            url = me.getUrl(request);

        //<debug>
        if (!url) {
            Ext.raise("You are using a ServerProxy but have not supplied it with a url.");
        }
        //</debug>

        if (me.getNoCache()) {
            url = Ext.urlAppend(url, Ext.String.format("{0}={1}", me.getCacheString(), Ext.Date.now()));
        }

        if(!Ext.isEmpty(Config.subUrlPrifix)){
            url = Config.subUrlPrifix + url;
        }
        // 주소 조정.
        if(!Ext.isEmpty(Config.baseUrlPrifix)){
            if(url.substring(0,1) == "/"){  // 상대경로는 처리하지 않는다
                url = Config.baseUrlPrifix + url;
            }
        }

        return url;
    }
});