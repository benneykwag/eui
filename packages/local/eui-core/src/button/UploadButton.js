Ext.define('eui.button.UploadButton', {
    extend: 'Ext.form.field.FileButton',
    xtype: 'uploadbutton',
    defaultListenerScope: true,
    listeners: {
        change: function(fld) {
            var inputEl = fld.fileInputEl && fld.fileInputEl.dom,
                file = inputEl && inputEl.files,
                formData = new FormData(),
                xhr = new XMLHttpRequest(),
                msg,
                url = fld.url || '/APPS/npComponent/xssWorkImport.do';
            if (!file || !file.length) return;
            file = file[0];
            if (Ext.isObject(fld.params)) {
            	Ext.Object.each(fld.params, function (k, v) {
            		formData.append(k, v);
            	});
            }
            formData.append('file', file);
            xhr.open('POST', url);
            xhr.addEventListener('load', function() {
                inputEl.value = null;
                msg.close();
                Ext.Msg.show({
                	title: 'INFO',
                	icon: Ext.Msg.INFO,
                	buttons: Ext.Msg.OK,
                	msg: '업로드가 완료되었습니다'
                });
            });
            xhr.addEventListener('progress', function(progress) {
            	if (progress.loaded) {
            		msg.updateProgress(progress.loaded);
            	} else {
            		msg.close();
            		Ext.Msg.show({
            			title: 'ERROR',
            			icon: Ext.Msg.ERROR,
            			buttons: Ext.Msg.OK,
            			msg: '파일 업로드 중 에러가 발생하였습니다.'
            		});
            	}
            });
            Ext.apply(xhr, {
                onloadstart: function() {
                    msg = Ext.Msg.show({
                        msg: '업로드 중입니다',
                        wait: true
                    });
                }
            });
            xhr.send(formData);
        }
    }
});
