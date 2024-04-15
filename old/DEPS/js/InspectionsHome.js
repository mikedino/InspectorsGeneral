/*
    N01IG - Inspector General Inspections automation - Administration page
    version: 1.2
    developer:  John Hartung, USFF N61
                Mike Landino, USFF N61
*/

"use strict";

//Create namespace 
var Home = Home || {}

Home = {
    site: _spPageContextInfo.webAbsoluteUrl,
	path: _spPageContextInfo.serverRequestPath,
	siteTitle: _spPageContextInfo.webTitle,
    //permissionBaseURL: "https://usff.navy.deps.mil/sites/hq/N01/N01IG/Inspections/",
    //N01IGSitePath: "https://usff.navy.deps.mil/sites/hq/N01/N01IG",
	permissionBaseURL: _spPageContextInfo.webAbsoluteUrl,
	N01IGSitePath: _spPageContextInfo.webAbsoluteUrl,

	homeLinksGuid: "f0895fc2-7bbd-49d9-9ab0-4fdeabe82ed8",
	inspectorPOCListGuid: "b7e22086-2fb4-493c-a176-2a03738a01be",
	directoryListGuid: "34a96c36-1f47-42dc-8d86-95f44bbf96f3",
    isDebugMode: true,
   
	init: function(){
		//this.utilities.getCurrentUser();
		this.get.homeLinks();
    },

    get:{

		homeLinks: function(){
			$.ajax({
				url: Home.site + "/_api/web/lists(guid'" + Home.homeLinksGuid + "')/items?$select=ID,Title,URL",
				type: "GET",
				headers: { "Accept": "application/json;odata=verbose" }
			}).done(function (data) {
				$.each(data.d.results, function(i,val){
					$('#link' + val.ID).attr("onclick", "window.open('"+val.URL+"');");
					$('#title' + val.ID).text(val.Title);
				});
			})
			.then(Home.get.InspectorPOC())
			.fail(function (error) {
				Home.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving E3 Commands", "Home.get.E3Commands()", JSON.stringify(error), "");
			});
		},
       
        InspectorPOC: function(){
            var api = Home.permissionBaseURL + "/_api/web/lists(guid'" + Home.inspectorPOCListGuid +"')/items?",
			    select = "$select=Title,InspectorName/Name,InspectorName/Title,InspectorName/EMail,InspectorName/WorkPhone&$expand=InspectorName",
                order = "&$orderby=sortOrder",
                endpoint = api + select + order;
                
            $.ajax({
                url: endpoint,
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function (data) {
				//console.log(data.d.results);
				
				//get Ech 3 commands
				Home.get.E3Commands();
				//set site title dynamically
				$('.siteTitle').text(Home.siteTitle);

             	var cList = $("#contactsContent");
                $.each(data.d.results, function(i,val){
					var phone = ( val.InspectorName.WorkPhone ? val.InspectorName.WorkPhone : 'no phone');
					var contact = '<p class="ui-menu-item"><span class="contact-title">'+val.Title+'</span><br/><a href="mailto:'+val.InspectorName.EMail+'">'+val.InspectorName.Title+'</a>, '+phone+'</p>';
					cList.append(contact);
                });
            }).fail(function (error) {
            	Home.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving Inspector POCs", "Home.get.InspectorPOC()", JSON.stringify(error), "");
            });
        },
        E3Commands: function(){
            var api = Home.permissionBaseURL + "/_api/web/lists(guid'" + Home.directoryListGuid + "')/items?",
			    select = "$select=ID,Title,SiteURL,active",
                order = "&$orderby=Title",
                endpoint = api + select + order;
                
            $.ajax({
                url: endpoint,
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function (data) {
             	var cList = $("#echelon3Content");
                $.each(data.d.results, function(i,val){
					var link = "<a href='" + val.SiteURL.Url + "' target='_blank'>" + val.Title + "</a>",
						text = val.Title,
						html = "<div class='E3Commands'>"+ ( val.active ? link : text) +"</span></div>";
					cList.append(html);
                });
            }).fail(function (error) {
            	Home.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving E3 Commands", "Home.get.E3Commands()", JSON.stringify(error), "");
            });
        }

    },

    utilities: {
		getCurrentUser: function(){
            $.ajax({
                url: Home.site + "/_api/web/currentuser",
                type: "GET",
                headers: {
                    "Accept": "application/json;odata=verbose"
                }
            }).done(function (data) {
                Home.user = data.d.Title; 
                if (Home.isDebugMode) {
                	console.log('Current user:' + Home.user);
                }
               // $('#user').text(data.d.Title);
            //    Greenboard.fetch.getUserStatus(data.d.Id, true);
            }).fail(function (err) {
                Home.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving current user", "Home.utilities.getCurrentUser()", JSON.stringify(err.statusText), "");  
            });
        },
        
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
           //  console.log(msg);
             var msgToRender = "";
             var msgDlgSize = BootstrapDialog.SIZE_NORMAL;
             
             if (Home.isDebugMode) {
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

$(document).ready(Home.init());