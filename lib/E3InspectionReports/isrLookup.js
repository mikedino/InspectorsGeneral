"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISRLookup = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var pencilSquare_1 = require("gd-sprest-bs/build/icons/svgs/pencilSquare");
var ds_1 = require("../E3StatusReport/ds");
var form_1 = require("../E3StatusReport/form");
/**
 * ISR Lookup Control
 */
var ISRLookup = /** @class */ (function () {
    // Constructor
    function ISRLookup(el, type, item, isApproved) {
        this._el = null;
        // Save the properties
        this._el = el;
        this._type = type;
        this._item = item;
        this._isApproved = isApproved;
        // Render the control
        this.render();
    }
    // Method to render the control
    ISRLookup.prototype.render = function () {
        var _this = this;
        // define columns for ISR table
        var columns = [
            {
                name: "number",
                title: "No."
            },
            {
                name: "rtype",
                title: "Type"
            },
            {
                name: "observation",
                title: "Observation"
            },
            {
                name: "status",
                title: "Status"
            }
        ];
        // if worksheet is not approved, add EDIT button to ISR table(s)
        if (!this._isApproved) {
            columns.unshift({
                // edit button,
                name: "",
                title: "",
                onRenderCell: function (el, col, item) {
                    // render a button group
                    gd_sprest_bs_1.Components.Button({
                        el: el,
                        type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                        isSmall: true,
                        iconSize: 14,
                        iconType: pencilSquare_1.pencilSquare,
                        onClick: function () {
                            // Display the edit form
                            form_1.StatusReportForms.editIR(item, function () {
                                // Refresh the datatable
                                ds_1.DataSource.refresh();
                            }, _this._item);
                        }
                    });
                }
            });
        }
        // render a table
        gd_sprest_bs_1.Components.Table({
            el: this._el,
            rows: ds_1.DataSource.getRelatedISR(this._type, this._item.Id),
            columns: columns
        });
        // render a NEW button
        gd_sprest_bs_1.Components.Button({
            el: this._el,
            text: "+ New " + this._type,
            className: "isrButton",
            isDisabled: this._isApproved,
            isSmall: true,
            onClick: function () {
                // Show the item form
                form_1.StatusReportForms.create(_this._type, function () {
                    // Refresh the dashboard
                    ds_1.DataSource.refresh();
                }, _this._item);
            }
        });
    };
    return ISRLookup;
}());
exports.ISRLookup = ISRLookup;
