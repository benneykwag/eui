/**
 * Uploader implementation which uses a FormData object to send files through XHR requests.
 *
 */
Ext.define('Ext.ux.upload.uploader.FormDataUploader', {
    extend : 'Ext.ux.upload.uploader.AbstractXhrUploader',

    requires : [
        'Ext.ux.upload.data.Connection'
    ],

    method : 'POST',
    xhr : null,

    initConnection : function() {
        if (this.params) {
//            this.url = Ext.urlAppend(this.url, Ext.urlEncode(this.params));
        }

        var xhr = new XMLHttpRequest(),
            method = this.method,
            url = this.url;

        xhr.open(method, url, true);

        this.abortXhr = function() {
            this.suspendEvents();
            xhr.abort();
            this.resumeEvents();
        };

        return xhr;
    },

    uploadItem : function(item) {
        var file = item.getFileApiObject();

        item.setUploading();

        var formData = new FormData();
        formData.append('file', file);
//        formData.append('S_FUNC_CODE', 'CH');
//        formData.append('FILE_MGT_CODE', '4c57c84ed70d4f7191c67c1c17544993');

//        formData.append('FILE_MGT_CODE', 'a77b2ee600064798b9903d0a9be18dfd');


        var params = this.params;
        if (this.params) {
            for (var test in params) {
                var value = params[test];
                formData.append(test, value);
            }
        }

        var xhr = this.initConnection();
//        xhr.setRequestHeader(this.filenameHeader, file.name);
//        xhr.setRequestHeader(this.sizeHeader, file.size);
//        xhr.setRequestHeader(this.typeHeader, file.type);


        xhr.onreadystatechange = function() {
            console.log('readyStatechange:  ' + xhr.readyState);
        };

//        if (!window.devMode) {
//            xhr.setRequestHeader('X-CSRF-TOKEN', globalVar.csrfToken);
//        }
        var loadendhandler = Ext.Function.bind(this.onLoadEnd, this, [
            item
        ], true);

        var progresshandler = Ext.Function.bind(this.onUploadProgress, this, [
            item
        ], true);

        xhr.addEventListener('loadend', loadendhandler, true);
        xhr.upload.addEventListener("progress", progresshandler, true);

        xhr.send(formData);
    },

    /**
     * Implements {@link Ext.ux.upload.uploader.AbstractUploader#abortUpload}
     */
    abortUpload : function() {
        this.abortXhr();
    },

    /**
     * @protected
     *
     * A placeholder for the abort procedure.
     */
    abortXhr : function() {
    },

    onLoadEnd : function(event, item) {
        var response = event.target;

        if (response.status != 200) {
            return this.onUploadFailure(response, null, item);
        }

        return this.onUploadSuccess(response, null, item);
    }
});