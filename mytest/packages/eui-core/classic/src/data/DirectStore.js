Ext.define('eui.data.DirectStore', {
    extend: 'Ext.data.DirectStore',
    
    constructor : function(config){
    	var me = this;
    	me.callParent([config]);
    	if(me.proxy){
    		var provider = Ext.direct.Manager.getProvider('euiprovider');
        	if(me.proxy.api){
        		for(p in me.proxy.api){
        			var action = me.proxy.api[p].substring(0,me.proxy.api[p].lastIndexOf('.'));
            		var method = me.proxy.api[p].substring(me.proxy.api[p].lastIndexOf('.')+1,me.proxy.api[p].length);
            		if(!provider.actions[action]){
            			provider.actions[action] = [{name:method,len:1}];
            		}else{
            			provider.actions[action].push({name:method,len:1});
            		}
        		}
        		provider.initAPI();
        	}
        	if(me.proxy.directFn){
        		var action = me.proxy.directFn.substring(0,me.proxy.directFn.lastIndexOf('.'));
        		var method = me.proxy.directFn.substring(me.proxy.directFn.lastIndexOf('.')+1,me.proxy.directFn.length);
        		if(!provider.actions[action]){
        			provider.actions[action] = [{name:method,len:1}];
        		}else{
        			provider.actions[action].push({name:method,len:1});
        		}
        		provider.initAPI();
        	}
        }    	
    },
    getPostData: function(isAll, trueText, falseText) {
    	var me = this,
    		returnDataset = {
    			deletedData:[],
    			data:[]
    		},
    		isAll = isAll || false,
    		records,
    		len;

    	function writeValue(data, field, record){
    		if(field.name === 'id') return;
    		var value = record.get(field.name);
    		if(field.type === Ext.data.Types.DATE && field.dateFormat && Ext.isDate(value)) {
    			data[field.name] = Ext.Date.format(value, field.dateFormat);
    		}else if(field.type === Ext.data.Types.BOOL.type){
    			data[field.name] = value ? trueText || '1' : falseText || '0';
    		}else{
    			data[field.name] = value;
    		}
    	}

    	function getRecordData(record){
    		var data = {},
    			fields = record.fields,
    			fieldItems = fields.items,
    			field,
    			len= fieldItems.length;
    		for(var i=0;i<len;i++){
    			field = fieldItems[i];
    			writeValue(data, field, record);
    		}
    		return data;
    	}
    	if(isAll){
    		records = me.getRange();
        	len = records.length;

        	for(var i=0;i<len;i++){
        		var rtv = getRecordData(records[i]);
        		rtv = Ext.apply(rtv,{'__rowStatus':''});
        		returnDataset.data.push(rtv);
        	}
    	}else{
    		records = me.getNewRecords();
        	len = records.length;

        	for(var i=0;i<len;i++){
        		var rtv = getRecordData(records[i]);
        		rtv = Ext.apply(rtv,{'__rowStatus':'I'});
        		returnDataset.data.push(rtv);
        	}
        	
        	records = me.getUpdatedRecords(), len = records.length;
        	for(var i=0;i<len;i++){
        		var rtv = getRecordData(records[i]);
        		rtv = Ext.apply(rtv,{'__rowStatus':'U'});
        		returnDataset.data.push(rtv);
        	}
        	
        	records = me.getRemovedRecords(), len = records.length;
        	for(var i=0;i<len;i++){
        		returnDataset.deletedData.push(getRecordData(records[i]));
        	}
    	}
    	
        return returnDataset;
    },
    getIsDirty: function() {
    	return (this.getNewRecords().length > 0 || this.getUpdatedRecords().length > 0 || this.getRemovedRecords().length > 0);
    }
});