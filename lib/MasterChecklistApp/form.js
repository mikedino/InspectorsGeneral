"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IGItemForm = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var strings_1 = require("../strings");
/**
 * IG Item Forms
 */
var IGItemForm = /** @class */ (function () {
    function IGItemForm() {
    }
    // Creates a new request
    IGItemForm.create = function (selectedProgram, onUpdated) {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the list
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.Checklist;
        // Show the edit form
        dattatable_1.ItemForm.create({
            onCreateEditForm: function (props) {
                // Set the control rendering method
                props.onControlRendering = function (ctrl, field) {
                    // See if this is the program field
                    if (field.InternalName == "program") {
                        // Default the value
                        ctrl.value = selectedProgram;
                        // Prepend a blank option
                        var ddlProps = ctrl;
                        ddlProps.items = [{
                                text: "",
                                value: null
                            }].concat(ddlProps.items);
                        // Add validation (Need to troubleshoot)
                        ddlProps.onValidate = function (ctrl, results) {
                            // Set the validation
                            results.isValid = ctrl.value ? parseInt(ctrl.value) > 0 : false;
                            results.invalidMessage = "Please select a program.";
                            // Return the results
                            return results;
                        };
                    }
                };
                // Return the properties
                return props;
            },
            onUpdate: function (item) {
                // Call the update event
                onUpdated();
            }
        });
    };
    // Deletes the request
    IGItemForm.delete = function (item, onUpdated) {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setHeader("Delete Question");
        // Set the body
        dattatable_1.Modal.setBody("Are you sure you want to delete the question?");
        // Set the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.Modal.FooterElement,
            content: "Click to delete the question.",
            btnProps: {
                text: "Delete",
                type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                onClick: function () {
                    // Close the modal
                    dattatable_1.Modal.hide();
                    // Show a loading dialog
                    dattatable_1.LoadingDialog.setHeader("Deleting Question #" + item.questionNumber);
                    dattatable_1.LoadingDialog.setBody("This dialog will close after it is removed...");
                    dattatable_1.LoadingDialog.show();
                    // Delete the item
                    item.delete().execute(
                    // Success
                    function () {
                        // Close the dialog
                        dattatable_1.LoadingDialog.hide();
                        // Call the update event
                        onUpdated();
                    }, 
                    // Error
                    function () {
                        // TODO
                        // I'll leave this for you to do :)
                        // Log
                        console.error("[" + strings_1.default.ProjectName + "] Unable to delete question # " + item.questionNumber + " for program " + item.program.Title, item);
                        // Close the dialog
                        dattatable_1.LoadingDialog.hide();
                    });
                }
            }
        });
        // Show the modal
        dattatable_1.Modal.show();
    };
    // Edits the request
    IGItemForm.edit = function (item, onUpdated) {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the list
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.Checklist;
        // Show the edit form
        dattatable_1.ItemForm.edit({
            itemId: item.Id,
            onCreateEditForm: function (props) {
                // Set the control rendering event
                props.onControlRendering = function (ctrl, field) {
                    // See if this is the obsolete field
                    if (field.InternalName == "obsoleteQuestion") {
                        // Make this a switch
                        ctrl.type = gd_sprest_bs_1.Components.FormControlTypes.Switch;
                    }
                };
                // Return the properties
                return props;
            },
            onSetHeader: function (el) {
                // Set the header value
                el.innerHTML = "<h5 class=\"m-0\">Edit Question #".concat(item.questionNumber, "</h5>");
            },
            onUpdate: function (item) {
                // Call the update event
                onUpdated();
            }
        });
    };
    // Views the request
    IGItemForm.view = function (item) {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the list
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.Checklist;
        // Show the item form
        dattatable_1.ItemForm.view({
            itemId: item.Id,
            onSetHeader: function (el) {
                // Set the header value
                el.innerHTML = "<h5 class=\"m-0\">View Question #".concat(item.questionNumber, "</h5>");
            }
        });
    };
    return IGItemForm;
}());
exports.IGItemForm = IGItemForm;
