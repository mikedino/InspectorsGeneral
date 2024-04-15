"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSource = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var strings_1 = require("../strings");
/**
 * Data Source
 */
var DataSource = /** @class */ (function () {
    function DataSource() {
    }
    // Initializes the application
    DataSource.init = function () {
        var _this = this;
        //narrative Return a promise
        return new Promise(function (resolve, reject) {
            Promise.all([
                // Load the data
                _this.load()
            ]).then(resolve, reject);
        });
    };
    Object.defineProperty(DataSource, "StatusReportItems", {
        get: function () { return this._statusReportItems; },
        enumerable: false,
        configurable: true
    });
    DataSource.load = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Load the data
            (0, gd_sprest_bs_1.Web)().Lists(strings_1.default.Lists.ISR).Items().query({
                GetAllItems: true,
                Expand: ["reportLU", "Editor"],
                OrderBy: ["number"],
                Select: ["*", "reportLU/Id", "reportLU/Title", "Editor/Title"],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._statusReportItems = items.results;
                // Resolve the request
                resolve(_this._statusReportItems);
            }, 
            // Error
            function () { reject(); });
        });
    };
    // get deficiencies for selected inspection report item
    DataSource.getRelatedISR = function (type, reportId) {
        var items = [];
        // Parse the ISR's
        for (var i = 0; i < this.StatusReportItems.length; i++) {
            var item = this.StatusReportItems[i];
            // See if the program matches
            if (item.reportLUId && item.reportLUId == reportId && item.rtype == type) {
                // Add the item
                items.push(item);
            }
        }
        return items;
    };
    // Refreshes the application data
    DataSource.refresh = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            Promise.all([
                // Load the data
                _this.load(),
            ]).then(resolve, reject);
        });
    };
    // Loads the list data
    DataSource._statusReportItems = null;
    return DataSource;
}());
exports.DataSource = DataSource;
