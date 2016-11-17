Ext.define('Override.Ext.data.TreeModel', {
    override: 'Ext.data.TreeModel',

    listeners: {
        recusivechildcheck : function (record, field) {
            Ext.each(record.childNodes, function (child) {
                var flag = record.get(field);
                if(record.get(field)  === 'Y'){
                    flag = 'N';
                }
                child.set(field, flag);
                child.fireEvent('recusivechildcheck', child, field)
            })
        }
    }
});