/*
    N01IG - Inspector General Inspections - COMMAND  HOME page
    version: 1.1
    developer:  John Hartung, USFF N611
                Mike Landino, USFF N611
*/

"use strict";

//Create namespace 
var Home = Home || {}

Home = {
    site: _spPageContextInfo.webAbsoluteUrl,
	siteTitle: _spPageContextInfo.webTitle,
    permissionBaseURL: "https://usff.navy.deps.mil/sites/hq/N01/N01IG/Inspections/",
    N01IGSitePath: "https://usff.navy.deps.mil/sites/hq/N01/N01IG",
    N01IGInspectorsGroupName: "HQ - N01IG Inspectors",
    checklistListName: "Command Inspection Checklists",
	inspectorPOCListName: "Inspectors",
	orgChartListName: "OrgChart",
	scheduleListName: "Inspection Schedule",
    isDebugMode: true,

   
	init: function(){
		this.get.orgChart();
		this.get.schedule();
    },
    

    get:{
		orgChart: function(){
			var api = Home.site + "/_api/web/lists/getbytitle('" + Home.orgChartListName +"')/items?$select=*&$top=1",
                order = "&$orderby=Modified desc",
                endpoint = api + order;
            $.ajax({
                url: endpoint,
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function (data) {
				if(data.d.results.length > 0){
					//set latest org chart link
					$('#orgChartLink').attr('href', data.d.results[0].OData__dlc_DocIdUrl.Url);
				} else {
					$('#orgChartLink').text('Org Chart not posted').removeAttr('href');
				}
				//set site title dynamically
				$('.siteTitle').text(Home.siteTitle);
			}).fail(function (error) {
            	Home.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving Inspector Org Chart link", "Home.get.orgChart()", JSON.stringify(error), "");
            });
		},

		schedule: function(){
			var api = Home.site + "/_api/web/lists/getbytitle('" + Home.scheduleListName +"')/items",
				select = "?$select=ID,Title,EventDate,EndDate,fAllDayEvent",
				order = "&$orderby=EventDate asc",
                endpoint = api + select + order;
            $.ajax({
                url: endpoint,
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function (data) {
				if(data.d.results.length > 0){
					var today = new Date().toISOString();
					//console.log(data.d.results);
					$.each(data.d.results, function(i,val){
						var endDate = new Date(val.EndDate).toISOString(); //only show current events (filter in /lists API will not work EndDate 'datetime')
						if(today <= endDate){
							var start = "";
							var end = "";
							if(val.fAllDayEvent){
								//have to use UTC format for All Day events for some reason
								start = moment.utc(val.EventDate).format('MM/DD/YY HH:mm');
								end = moment.utc(val.EndDate).format('MM/DD/YY HH:mm');
							} else {
								start = moment(val.EventDate).format('MM/DD/YY HH:mm');
								end = moment(val.EndDate).format('MM/DD/YY HH:mm');
							}
							var html = 	"<div class='col-sm-6 text-left'><a onclick='javascript:ShowPopupDialog(&#39;"+Home.site+"/Lists/schedule/DispForm.aspx?ID="+val.ID+"&#39;)' href='javascript:'>"+val.Title+"</a></div>" +
										"<div class='col-sm-3'>"+start+"</div>" +
										"<div class='col-sm-3'>"+end+"</div>";
							$('#scheduleContent').append(html);
						}
					});
				} else {
					$('#scheduleContent').html('<div class="col-sm-12">There are no events currently scheduled.</div>');
				}
			}).fail(function (error) {
            	Home.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving Inspection Schedule", "Home.get.schedule()", JSON.stringify(error), "");
            });
		}

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