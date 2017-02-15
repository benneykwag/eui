Ext.define('crawnix.Panel', {
	requires: [
     'Ext.ux.IFrame',
     'crawnix.Util'
  ],
  config: {
			src: '',
			param: '',
			viewer: null
  },
	extend: 'Ext.panel.Panel',
	xtype: 'crawnixpanel',
	layout: 'fit',
	items: [
        {
        	xtype: 'uxiframe',
        	listeners: {
        		afterrender: function () {
        			var me = this,
        				p = this.up(),
        				win = this.getWin(),
        				doc = this.getDoc();

        			Ext.defer(function () {
        				me.mask('Now Loading...');
        			}, 300);

        			crawnixUtil.initCrawnix(win, function (w) {
          			Ext.defer(function () {
          				me.unmask();
          			}, 300);
        				var doc = w.document;
	                	var div = doc.createElement('div');
	                	div.id = 'target';
	                	div.style = 'position:absolute;width:100%;height:100%';
	                	doc.body.style.margin = '0px';
	                	doc.body.appendChild(div);
	                	if (p.fireEvent('beforeCrawnixViewInit', p, win) === false) return;
		    				var viewer = new w.m2soft.crownix.Viewer(crawnixUtil.config.serviceUrl, 'target');
		    				p.setViewer(viewer);
		    				if (p.fireEvent('crawnixViewInit', p, win, viewer) === false) return;
		    				if (!p.getSrc()) return;
		    				viewer.openFile(p.getSrc(), p.getParam());
		    				p.fireEvent('afterCrawnixViewInit', p, win, viewer);
        			});
        		}
        	}
        }
    ]
});
