/*
    N01IG - Inspector General Inspections automation - Self Assessment Overview list form
    version: 1.0
    developer:  Mike Landino, USFF N611
*/

"use strict";

//Create namespace 
var SAT = SAT || {}

SAT = {

    site: _spPageContextInfo.webAbsoluteUrl,
    path: _spPageContextInfo.serverRequestPath,
     
	renderForm: function(){	
		
		$('.formfield').each(function () {
			var fieldname = $(this).attr('data-fieldname');
			var elem = $(this)
			$('td.ms-formbody').each(function () {
				if (this.innerHTML.indexOf('FieldInternalName="' + fieldname + '"') !== -1) {
					$(this).contents().appendTo(elem);
				}
			});
        });

        //move the attachments div
		$("#csrAttachmentUploadDiv").contents().appendTo('#attachmentDiv');

		//move the save/cancel buttons to the bottom of the custom table		
        $('.ms-formtoolbar:nth-child(2)').contents().appendTo($('.toolbar'));
        
        //make changes for display form
        if(SAT.path.indexOf("DispForm") >=0 ){
            SAT.displayForm();
        } else if(SAT.path.indexOf("NewForm") >=0) {
            SAT.setProgramName();
        }
        
    },

    displayForm: function(){
        $('.title-name').hide();
        $('.title-text').addClass('title-name');
        var elem = $('.colorBox');
        var assessColor = elem.text().replace(/\n|\t/g, '');
        elem.addClass('key-box').addClass(assessColor);
    },

    setProgramName: function(){
        var program = GetUrlKeyValue('program');
		$('input[id^="Title_"]').val(program);
    },

    documentReady : function(){
        // wait until jQuery is loaded to run these functions because apparently 
        // $(document).ready() doesn't work like it's supposed to
        if( typeof jQuery == undefined || document.readyState != "complete" ){
            setTimeout( function(){ SAT.documentReady(); }, 100);
        } else SAT.renderForm();

    }
}
//$(document).ready(SAT.documentReady());
// add the documentReady function to the list of functions to load after SP core dependencies
_spBodyOnLoadFunctionNames.push("SAT.documentReady");