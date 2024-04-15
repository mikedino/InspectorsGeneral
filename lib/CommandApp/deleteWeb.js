"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteWeb = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
/**
 * Create Web Dialog
 */
var DeleteWeb = /** @class */ (function () {
    // Constructor
    function DeleteWeb(props) {
        this._props = null;
        // Save the properties
        this._props = props;
        // Show the dialog
        this.show();
    }
    // Delete the web
    DeleteWeb.prototype.deleteWeb = function (url) {
        var _this = this;
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Deleting Site");
        dattatable_1.LoadingDialog.setBody("Deleting the sub web...");
        dattatable_1.LoadingDialog.show();
        // Delete the test site
        (0, gd_sprest_bs_1.Web)(url).delete().execute(
        // Success
        function (web) {
            // Update the source item
            _this._props.sourceItem.update({
                url: {
                    __metadata: { type: "SP.FieldUrlValue" },
                    Description: "",
                    Url: ""
                }
            }).execute(function () {
                // Update the loading dialog
                dattatable_1.LoadingDialog.setBody("Deleting the sub web...");
                // delete the associated security group
                var group = _this._props.name + " Command Inspections";
                (0, gd_sprest_bs_1.Web)().SiteGroups().removeByLoginName(group).execute(function () {
                    // Close the loading dialog
                    dattatable_1.LoadingDialog.hide();
                    // show success dialog
                    _this.showSuccess();
                    // Call the complete event
                    _this._props.onComplete ? _this._props.onComplete() : null;
                }, 
                // Site group may not exist
                function () {
                    // Close the loading dialog
                    dattatable_1.LoadingDialog.hide();
                    // show success dialog
                    _this.showSuccess();
                    // Call the complete event
                    _this._props.onComplete ? _this._props.onComplete() : null;
                });
            });
        }),
            // Error
            function (resp) {
                // Close the loading dialog
                dattatable_1.LoadingDialog.hide();
                // Error creating the site
                // TODO possible bug - not showing on error
                // Modal.clear();
                // Modal.setHeader("Error Deleting Site");
                // Modal.setBody("There was an error deleting the site.");
                // Modal.show();
                // Console Log
                console.error("Error deleting the site", resp);
            };
    };
    ;
    // Shows the dialog
    DeleteWeb.prototype.show = function () {
        var _this = this;
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setHeader("Delete Web");
        // Set the body
        dattatable_1.Modal.setBody("<p>Are you sure you want to delete the ".concat(this._props.name, " site and all of its contents?</p><p>This action cannot be undone!</p>"));
        // Set the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.Modal.FooterElement,
            content: "Deletes the site and all contents.",
            btnProps: {
                text: "Delete",
                type: gd_sprest_bs_1.Components.ButtonTypes.Danger,
                onClick: function () {
                    // Close the dialog
                    dattatable_1.Modal.hide();
                    // Delete the web
                    _this.deleteWeb(_this._props.url);
                }
            }
        });
        // Show the modal
        dattatable_1.Modal.show();
    };
    // Displays the success message after deleting the sub web
    DeleteWeb.prototype.showSuccess = function () {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setBody("Successfully deleted the ".concat(this._props.name, " sub web."));
        // Render a close button in the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.Modal.FooterElement,
            content: "Closes the modal.",
            btnProps: {
                text: "Close",
                type: gd_sprest_bs_1.Components.ButtonTypes.OutlineSuccess,
                onClick: function () {
                    // Close the modal
                    dattatable_1.Modal.hide();
                }
            }
        });
        // Show the modal
        dattatable_1.Modal.show();
    };
    return DeleteWeb;
}());
exports.DeleteWeb = DeleteWeb;
