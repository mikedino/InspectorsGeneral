"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Export = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var moment = require("moment");
var strings_1 = require("../strings");
/**
 * Generates CSV data from the items
 */
var Export = /** @class */ (function () {
    function Export() {
    }
    // Generates the csv from the items
    Export.generate = function (items) {
        var csv = [];
        // Add the header row
        csv.push('"' + this._headers.join('","') + '"');
        // Parse the items
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var row = [];
            // Parse the fields
            for (var j = 0; j < this._fields.length; j++) {
                var field = this._fields[j];
                var value = item[field.InternalName] || "";
                // See if this is a lookup field
                var lookupField = field.LookupField;
                if (lookupField) {
                    // Set the value
                    value = value[lookupField];
                }
                // See if this is a boolean
                if (typeof (value) === "boolean" || field.FieldTypeKind == gd_sprest_bs_1.SPTypes.FieldType.Boolean) {
                    // Update the value
                    value = value ? "Yes" : "No";
                }
                // See if this is a date/time field
                if (field.FieldTypeKind == gd_sprest_bs_1.SPTypes.FieldType.DateTime) {
                    // Determine the format
                    var format = "MM/DD/yyyy";
                    format += field.DisplayFormat == gd_sprest_bs_1.SPTypes.DateFormat.DateTime ? " hh:mm:ss" : "";
                    // Update the value
                    value = moment(item.referenceDate).format(format);
                }
                // Add the field value
                row.push(value);
            }
            // Add the row
            csv.push('"' + row.join('","') + '"');
        }
        // Return the csv
        return csv.join('\n');
    };
    /**
     * Public Methods
     */
    // Generates the csv data
    Export.generateCSV = function (items) {
        if (items === void 0) { items = []; }
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Generating the CSV");
        dattatable_1.LoadingDialog.setBody("This will close after the csv file is generated...");
        dattatable_1.LoadingDialog.show();
        // Generate the data
        var csv = this.generate(items);
        // Close the dialog
        dattatable_1.LoadingDialog.hide();
        // See if this is IE or Mozilla
        if (Blob && navigator && navigator["msSaveBlob"]) {
            // Download the file
            navigator["msSaveBlob"](new Blob([csv], { type: "data:text/csv;charset=utf-8;" }), "checklist_data.csv");
        }
        else {
            // Generate an anchor
            var anchor = document.createElement("a");
            anchor.download = "checklist_data.csv";
            anchor.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
            anchor.target = "__blank";
            // Download the file
            anchor.click();
        }
    };
    // Initalizes the component
    Export.init = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Clear the fields & headers
            _this._fields = [];
            _this._headers = [];
            // Load the default fields
            (0, gd_sprest_bs_1.List)(strings_1.default.Lists.Checklist).ContentTypes().query({ Top: 1, Expand: ["Fields"] }).execute(function (ct) {
                // Parse the default content type fields
                var fields = ct.results[0].Fields.results;
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    // Ignore the content type field
                    if (field.InternalName == "ContentType") {
                        continue;
                    }
                    // Add the field and header
                    _this._fields.push(field);
                    _this._headers.push(field.Title);
                }
                // Resolve the request
                resolve();
            }, reject);
        });
    };
    Export._fields = null;
    Export._headers = null;
    return Export;
}());
exports.Export = Export;
