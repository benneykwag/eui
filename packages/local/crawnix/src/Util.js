Ext.define('crawnix.Util', {
	alternateClassName: 'crawnixUtil',
	singleton: true,
	config: {
		jqueryUrl: 'http://172.20.101.133:7001/ReportingServer/html5/js/jquery-1.11.0.min.js',
		crawnixUrl: 'http://172.20.101.133:7001/ReportingServer/html5/js/crownix-viewer.min.js',
		cssUrl: 'http://172.20.101.133:7001/ReportingServer/html5/css/crownix-viewer.min.css',
		serviceUrl: 'http://172.20.101.133:7001/ReportingServer/service'
	},
	
	initCrawnix: function (win, cb) {
		var doc = win.document,
			me = this;
		// 관련 리소스 동적 로딩
		Ext.Promise.all([
            new Ext.Promise(function (res) {
            	var jquery  = doc.createElement('script'),
            		crawnix = doc.createElement('script');
            	
            	jquery.src = me.config.jqueryUrl;
            	crawnix.src = me.config.crawnixUrl;
            	jquery.onload = function () {
            		doc.head.appendChild(crawnix);
            	}
            	crawnix.onload = function () {
            		res();
            	}
            	doc.head.appendChild(jquery);
            }),
            new Ext.Promise(function (res) {
            	var link = doc.createElement('link');
                link.setAttribute("rel", "stylesheet");
                link.setAttribute("type", "text/css");
                link.setAttribute('href', me.config.cssUrl);
                link.onload = function () {
                	res();
                }
                doc.head.appendChild(link);
            })
        ]).then(function () {
        	if (Ext.isFunction(cb)) {
        		cb(win);
        	}
        });
	},
	
	openPopup: function (param) {
		var me = this,
			size,
			win;
		size = Ext.apply({}, {
			width: param.width || 300,
			height: param.height || 500
		});
		size = Ext.Object.toQueryString(size).replace(/&/g, ',');
		win = window.open('', 'report', size);
		me.initCrawnix(win, function (w) {
			if (param && Ext.isFunction(param.callback)) {
				var doc = w.document;
            	var div = doc.createElement('div');
            	div.id = Ext.id();
            	div.style = 'position:absolute;width:100%;height:100%';
            	doc.body.style.margin = '0px';
            	doc.body.appendChild(div);
				param.callback(w, div.id);
			}
		});
	}
});