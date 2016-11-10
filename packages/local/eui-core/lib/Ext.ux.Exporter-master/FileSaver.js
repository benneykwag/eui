/**
 * @Class Ext.ux.exporter.FileSaver
 * @author Yogesh
 * Class that allows saving file via blobs: URIs or data: URIs or download remotely from server
 */
Ext.define('Ext.ux.exporter.FileSaver', {
    statics: {
        saveAs: function(data, mimeType, charset, filename, link, remote, cb, scope) {
                window.URL = window.URL || window.webkitURL;
                try { //If browser supports Blob(Gecko,Chrome,IE10+)
                    var blob = new Blob([data], { //safari 5 throws error
                        type: mimeType + ";charset=" + charset + ","
                    });
                    if (link && "download" in link) {
                        blobURL = window.URL.createObjectURL(blob);
                        link.href = blobURL;
                        link.download = filename;
                        if(cb) cb.call(scope);
                        this.cleanBlobURL(blobURL);
                        return;
                    } else if (window.navigator.msSaveOrOpenBlob) { //IE 10+
                        window.navigator.msSaveOrOpenBlob(blob, filename);
                        if(cb) cb.call(scope);
                        return;
                    }
                } catch (e) { //open using data:URI 
                	Ext.log("Browser doesn't support Blob: " + e.message);
                }
				//Browser doesn't support Blob save
                if(remote) {//send data to sever to download
                	this.downloadUsingServer(data, mimeType, charset, filename, cb, scope);
                } else{//open data in new window
                	this.openUsingDataURI(data, mimeType, charset);
                	if(cb) cb.call(scope);
                }
        },
        downloadUsingServer: function(data, mimeType, charset, filename, cb, scope) {
        	var form = Ext.getDom('formDummy');
        	if(!form) {
	            form = document.createElement('form');
	            form.id = 'formDummy';
	            form.name = 'formDummy';
	            form.className = 'x-hidden';
	            document.body.appendChild(form);        	
        	}
            Ext.Ajax.request({
                url: '/ExportFileAction',
                method: 'POST',
                form: form,
                isUpload: true,
                params: {
                	userAction: 'download',
                    data: data,
                    mimeType: mimeType,
                    charset: charset,
                    filename: filename
                },
                callback: function() {
                	if(cb) cb.call(scope);
                }
            });
        },
        openUsingDataURI: function(data, mimeType, charset) {
        	if (Ext.isIE9m) { //for IE 9 or lesser
                w = window.open();
                doc = w.document;
                doc.open(mimeType, 'replace');
                doc.charset = charset;
                doc.write(data);
                doc.close();
                doc.execCommand("SaveAs", null, filename);
            } else {
	            window.open("data:" + mimeType + ";charset=" + charset + "," + encodeURIComponent(data), "_blank");
            }
        },
        cleanBlobURL: function(blobURL) {
            // Need a some delay for the revokeObjectURL to work properly.
            setTimeout(function() {
                window.URL.revokeObjectURL(blobURL);
            }, 10000);
        }
    }
});