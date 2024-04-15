/*
    N01IG - Inspector General Inspections automation - ChecklistEditistration page
    version: 1.2
    developer:  John Hartung, USFF N61
				Mike Landino, USFF N61
	notes:	12/1/21 - refactor. eliminate calls to all groups, unused variables, extra work -MDL
*/

"use strict";

//Create namespace 
var ChecklistEdit = ChecklistEdit || {}

ChecklistEdit = {

    site: _spPageContextInfo.webAbsoluteUrl,
	path: _spPageContextInfo.serverRequestPath,
	currentUserId: _spPageContextInfo.userId,
	
	adminGroup: { id: 69117, title: "N01IG Inspections Administrators" },
    inspectorGroup: { id: 68531, title: "N01IG Inspectors" },

	groupCount: 0,
    isInspector: false,
    isOwner: false,
    isVisitor: false,
    isDebugMode: true,
       
	init: function(){
		this.getUserAssignedGroups();
	},

	getUserAssignedGroups: function(){
		//get all groups the current user is in and set flag accordingly
		var base =  ChecklistEdit.site + "/_api/web/GetUserById(" + ChecklistEdit.currentUserId + ")/Groups?",
			select = "$select=Id,Title",
			endpoint = base + select;
		$.ajax({
			url: endpoint,
			type: "GET",
			headers: { "Accept": "application/json;odata=verbose" }
		}).done(function(data) {
			$.each(data.d.results, function(i,val){
				switch (val.Id) {
					case ChecklistEdit.adminGroup.id:
						ChecklistEdit.isOwner = true;
						ChecklistEdit.isInspector = true;
						break;
					case ChecklistEdit.inspectorGroup.id:
						ChecklistEdit.isInspector = true;
						break;
					default:
						ChecklistEdit.isVisitor = true;
						break;
				}
			})
			ChecklistEdit.groupCount = data.d.results.length;
		})
		.then(ChecklistEdit.setPermissions())
		.fail(function (error) {
			ChecklistEdit.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving user's associated groups. Refresh the screen and try again, or contact IT Support if this problem persists.", "getUserAssignedGroups", JSON.stringify(error), "");
			console.log("Error retrieving user's associated groups. ERROR: " + JSON.stringify(error));
		});
	},

	renderForm: function(){
		$('.reqForm').each(function () {
			var fieldname = $(this).attr('data-fieldname');
			var elem = $(this)
			$('td.ms-formbody').each(function () {
				if (this.innerHTML.indexOf('FieldInternalName="' + fieldname + '"') !== -1) {
					$(this).contents().appendTo(elem);
				}
			});

		});
	},

	setPermissions: function(){

		setTimeout(() => {
			if(ChecklistEdit.groupCount > 0){
				//wait until ajax call is done since the .then is triggering first
				if (!ChecklistEdit.isInspector) {
					$("#form-container").addClass("hide");
					var simple = "Access Denied";
					var title = 'You are not authorized to use this form to view/edit this data';
					var details = 'Only administrators can access this data.  Use the selft-assessment checklist to view/edit.';
					var contact = 'Contact the IG admin if you have any questions';
					ChecklistEdit.utilities.logException(BootstrapDialog.TYPE_WARNING, simple, title, details, contact);	  
		
				} else {
					$("#form-container").removeClass("hide");		
					$("#selfAssessmentSection").removeClass('hide');
					$("#referenceSection").removeClass('hide');
					$("#inspectorSection").removeClass('hide');
				}
				ChecklistEdit.renderForm();
			} else ChecklistEdit.setPermissions();
		}, 10);

		
	},

    utilities: {
        // msgTypes: Info, Success, Error, Warning, Debug
    	logException: function(msgType, title, source, details, stackTrace) {
			var msgTypeSimple;
						
			switch (msgType) {
			case BootstrapDialog.TYPE_INFO:
				msgTypeSimple = 'Info';
				break;
			case  BootstrapDialog.TYPE_SUCCESS:
				msgTypeSimple = 'Success';
				break;
			case  BootstrapDialog.TYPE_WARNING:
				msgTypeSimple = 'Warning';
				break;
			case  BootstrapDialog.TYPE_DANGER:
				msgTypeSimple = 'Error';
				break;
				
			case  BootstrapDialog.TYPE_DEFAULT:
				msgTypeSimple = 'Debug';
				break;

			default:
				console.log('Invalid msgType passed to logException function');
				return;
			}
			
			
			var msg = msgTypeSimple + " - " + title + ", source:" + source + ", details:" + details + ", strackTrace:" + stackTrace;
			var msgToRender = "";
			var msgDlgSize = BootstrapDialog.SIZE_NORMAL;
			
			if (ChecklistEdit.isDebugMode) {
			msgToRender = "<div class='errMsgTitle'>"  + title + "</div>";
			msgToRender += "<p>";

			if (source != '') {
				msgToRender += "<div class='errMsgBody'><span class='errMsgLabel'>Source:</span> " + source + "</div>";
			}
			
			msgToRender += "<br>";            	
			if (details != '') {
				msgToRender += "<div class='errMsgBody'><span class='errMsgLabel'>Details:</span> " + details + "</div>";
				msgDlgSize = BootstrapDialog.SIZE_WIDE;

			}
			
			msgToRender += "<br>";
			if (stackTrace != '') {
				msgToRender += "<div class='errMsgBody'><span class='errMsgLabel'>StackTrace:</span> " + stackTrace + "</div><br>";
				BootstrapDialog.SIZE_WIDE
			}
			msgToRender += "</p>"

			}
			else {
			msgToRender = title;
			}

			BootstrapDialog.show({
			size: msgDlgSize,
			type: msgType,
			title: msgTypeSimple,
			message: msgToRender,
			buttons: [{
				cssClass: 'btn-primary',
				label: 'Close',
				action: function(dialogItself){
					dialogItself.close();
				}
			}]              
		
            });     		
    	
    	}
    }

}
SP.SOD.executeFunc('sp.js', 'SP.ClientContext', ChecklistEdit.init());