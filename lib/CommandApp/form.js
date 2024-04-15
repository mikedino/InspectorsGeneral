"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandItemForm = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var strings_1 = require("../strings");
/**
 * IG Command Item Forms
 */
var CommandItemForm = /** @class */ (function () {
    function CommandItemForm() {
    }
    // Creates a new request
    CommandItemForm.create = function (onUpdated) {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the list
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.Directory;
        // Show the edit form
        dattatable_1.ItemForm.create({
            onCreateEditForm: function (props) {
                // Set the control rendering event
                props.onControlRendering = function (ctrl, field) {
                    // get URL column and format
                    if (field.InternalName == "url") {
                        //hide description part of url column
                        ctrl.showDescription = false;
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
    CommandItemForm.delete = function (item, onUpdated) {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setHeader("Delete Command");
        // Set the body
        dattatable_1.Modal.setBody("Are you sure you want to delete this command?  This will not delete the site.");
        // Set the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.Modal.FooterElement,
            content: "Click to delete the command.",
            btnProps: {
                text: "Delete",
                type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                onClick: function () {
                    // Close the modal
                    dattatable_1.Modal.hide();
                    // Show a loading dialog
                    dattatable_1.LoadingDialog.setHeader("Deleting Command " + item.Title);
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
                        console.error("[" + strings_1.default.ProjectName + "] Unable to delete command " + item.Title, item);
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
    CommandItemForm.edit = function (item, onUpdated) {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the list
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.Directory;
        // Show the edit form
        dattatable_1.ItemForm.edit({
            itemId: item.Id,
            onCreateEditForm: function (props) {
                // Set the control rendering event
                props.onControlRendering = function (ctrl, field) {
                    // get URL column and format
                    if (field.InternalName == "url") {
                        //hide description part of url column
                        ctrl.showDescription = false;
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
    // Views the request
    CommandItemForm.view = function (item) {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the list
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.Directory;
        // Show the item form
        dattatable_1.ItemForm.view({
            itemId: item.Id
        });
    };
    return CommandItemForm;
}());
exports.CommandItemForm = CommandItemForm;
