/*
 * proxy Rest 관련 Default 설정
 * */
Ext.define('Override.data.proxy.Rest', {
    override : 'Ext.data.proxy.Rest',

    config: {
        actionMethods: {
            create: 'POST',
            read: 'POST',
            update: 'POST',
            destroy: 'POST'
        },
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        paramsAsJson: true/*,
         noCache: false,
         pageParam: false,
         startParam: false,
         limitParam: false*/
    }
});