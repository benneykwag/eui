    public ActionForward doExecute(ActionMapping mapping, ActionForm form, HttpServletRequest request, HttpServletResponse response) throws Exception {

    	
    	if (request instanceof MultipartRequestWrapper) {  
    		_logger.debug("found a multipart wrapped request");  
            // when enctype=multipart/form-data, struts wraps the request.  
            // for our work here, we just want the original request parameters.  
            MultipartRequestWrapper wrapper = (MultipartRequestWrapper) request;  
            CommonsMultipartRequestHandler handler = new CommonsMultipartRequestHandler();  
            handler.setMapping(mapping);  
            try {  
                handler.handleRequest(request);  
            } catch (ServletException ex) {  
            	_logger.error(ex, ex);  
            }  
            Map<Object, String[]> paramMap = handler.getTextElements();  
            
            for (Map.Entry<Object, String[]> entry : paramMap.entrySet())
            {
            	String value = entry.getValue()[0];
                String key = entry.getKey().toString();
                _logger.debug("map key: " + key + "=" + value);  
                wrapper.setParameter(key, value); 
            }
        } 

        // get the action from parameter
        String userAction = request.getParameter("userAction");
        _logger.debug("Export File userAction is: " + userAction);
        if (userAction != null) {
            if(userAction.equals("download")) {
            	String filename = request.getParameter("filename");
            	String mimeType = request.getParameter("mimeType");
            	String charset = request.getParameter("charset");
            	String data = request.getParameter("data");
            	byte[] fileBytes = data.getBytes(charset);
            	ServletOutputStream outputStream = response.getOutputStream();
          	  	
                //response.setContentLength(fileBytes.length);
	            response.setContentType(mimeType);
	            //response.setContentType("application/octet-stream");
	          	response.setHeader("Content-disposition","attachment;filename=\"" + filename + "\"");
                response.setHeader("Pragma", "Public");
                response.setHeader("Cache-Control", "no-store");
                response.setHeader("Connection", "close");
                
                response.flushBuffer();
                outputStream.write(fileBytes);
                
                outputStream.flush();
                outputStream.close();
                
            }
        	
        }
                    
        return null;
    }