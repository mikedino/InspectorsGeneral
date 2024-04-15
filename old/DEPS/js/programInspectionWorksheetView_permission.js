/*
    Individual Program Inspection Reports - Views
    version: 1.0
    developer:  Mike Landino, USFF N61
    notes:	12/6/21 - Add to a web part page and it will toggle the web part visibility on/off depending on what
                    group you're in.  IG Admin & Inspectors can see custom views.  All others cannot.
*/

"use strict";

//Create namespace 
var IPIR = IPIR || {}

IPIR = {

    site: _spPageContextInfo.webAbsoluteUrl,
	path: _spPageContextInfo.serverRequestPath,
	currentUserId: _spPageContextInfo.userId,
	
	adminGroup: { id: 69117, title: "N01IG Inspections Administrators" },
    inspectorGroup: { id: 68531, title: "N01IG Inspectors" },

    isInspector: false,
    isOwner: false,
    isVisitor: false,
    groupCount: 0,
       
	init: function(){
        //setTimeout(() => {
		//	if(document.readyState === "complete" && jQuery != undefined){
				this.getUserAssignedGroups();
		//	} else this.init();
        //}, 1);
	},

	getUserAssignedGroups: function(){
		//get all groups the current user is in and set flag accordingly
		var base =  IPIR.site + "/_api/web/GetUserById(" + IPIR.currentUserId + ")/Groups?",
			select = "$select=Id,Title",
			endpoint = base + select;
		$.ajax({
			url: endpoint,
			type: "GET",
			headers: { "Accept": "application/json;odata=verbose" }
		}).done(function(data) {
			$.each(data.d.results, function(i,val){
				switch (val.Id) {
					case IPIR.adminGroup.id:
						IPIR.isOwner = true;
                        IPIR.isInspector = true;
						break;
					case IPIR.inspectorGroup.id:
                        IPIR.isInspector = true;
						break;
					default:
                        IPIR.isVisitor = true;
						break;
                }
            });
            IPIR.groupCount = data.d.results.length;
        })
        .then(IPIR.hideTable())
        .fail(function (error) {
            IPIR.hideTable();
            $jq('#errorMessage').html("<h1>Error retrieving user groups:</h1><br/>" + error.responseJSON.error.message.value);
			console.log("Error retrieving user's associated groups. ERROR: " + JSON.stringify(error));
		});
	},

	hideTable: function(){
        setTimeout(() => {
			if(IPIR.groupCount > 0){
                //wait until ajax call is done since the .then is triggering first
                if(!this.isOwner && !this.isInspector){
                    // if not an owner or not an inspector, hide the web part
                    $jq('table[summary="Individual Program Inspection Reports"]').parentsUntil( $jq('div[id^="MSOZoneCell_WebPartWPQ"]') ).hide();
                    $jq('#errorMessage').show();
                }
            } else this.hideTable();
        }, 10);
        
    }
}
SP.SOD.executeFunc('sp.js', 'SP.ClientContext', IPIR.init());