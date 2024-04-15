export default class pageTemplate {
    public static tmplt: string = `
<div>
	<div class="header">Command Inspections Master Checklist</div>
	<div style="padding-top:15px;">
		<span class="fieldName">Program</span>
		<br>
		<div class="reqForm" id="kendoProgramDiv">
			<input id="kendoProgramDDL" style="width:450px;">
		</div>
	</div>
</div>


<script type="text/x-kendo-template" id="toolbarTemplate">
	<button class="k-button primary inline marginLeft" type="button" id="exportButton" onclick="window.location.href='../SiteAssets/exportquery.iqy'" title="Export Entire Checklist" alt="Export Entire Checklist">Export to Excel</button>
    <button class="k-button primary inline marginLeft-10" type="button" id="copyButton" onclick="Admin.copy.toggleCopySection()" disabled="disabled">Copy</button>
    <button class="k-button primary inline marginLeft-10" type="button" id="sendToInspectionChecklistButton" onclick="Admin.copy.toggleSendToSection()" disabled="disabled">Send to E3 Command Inspections Checklist</button>
</script>

<div id="copyToSection" style="display:none;" style="clear:both">
	<div><h2>Select the copy destination:</h2></div>
	
	<div class="inline">
		<div class="fieldName">Program</div>
		<div class="reqForm" id="kendoProgramDiv">
			<input id="kendoProgramDestDDL" style="width:450px;">
		</div>
	</div>
	<div class="inline marginLeft"><button class="k-button primary" type="button" id="submitCopyButton" onclick="Admin.copy.copyQuestions()" disabled="disabled" alt="Copies the questions displayed in the grid to the selected Program" title="Copies the questions displayed in the grid to the selected Program">Copy Grid Questions Now</button></div>
	<div class="inline marginLeft-10"><button class="k-button " type="button" id="cancelCopyButton" onclick="Admin.copy.toggleCopySection()" >Cancel Copy Action</button></div>
	<div class="inline marginLeft-10"><button class="k-button primary" type="button" id="cancelCopyButton" onclick="Admin.utilities.prompt()" alt="Creates a new Program and repopulates the dropdown so you can select it" title="Creates a new Program and repopulates the dropdown so you can select it">Create New Program</button></div>

</div>

<div id="sendToInspectionChecklistSection" style="display:none;" style="clear:both">
	<div><h2>Select the Destination Echelon 3 Command</h2></div>
	<div class="inline">
		<span class="fieldName">(Only Active Commmands Available)</span>
		<br>
		<div class="reqForm" id="kendoE3CommandDiv">
			<input id="kendoE3CommandDDL" style="width:300px;">
		</div>
	</div>
	<div class="inline marginLeft"><button class="k-button primary" type="button" id="submitSendToInspectionChecklistButton" onclick="Admin.ajax.getExistingEch3Program()" disabled="disabled" alt="Sends the questions in the current grid over to the selected Ech III site" title="Sends the questions in the current grid over to the selected Ech III site">Send Grid Questions Now</button></div>
	<div class="inline marginLeft-10"><button class="k-button primary" type="button" id="sendAllButton" onclick="Admin.copy.confirmCopyAll()" disabled="disabled" alt="Sends the entire master checklist over to the selected Ech III site" title="Sends the entire master checklist over to the selected Ech III site">Send ALL Questions</button></div>
	<div class="inline marginLeft-10"><button class="k-button " type="button" id="cancelCopyButton" onclick="Admin.copy.toggleSendToSection()" >Cancel Send Action</button></div>
	<div class="inline marginLeft-10"><button class="k-button secondary" type="button" id="batchDelete" onclick="Admin.utilities.confirmBatchDelete()" disabled="disabled" alt="Deletes every question in the Ech III site checklist" title="Deletes every question in the Ech III site checklist">Delete ALL Questions</button></div>
</div>


<div style="clear:both"></div>
<br>
<div id="checklistGrid" >
</div>
<div id="dialog"></div>`;
}