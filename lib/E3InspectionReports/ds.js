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
    Object.defineProperty(DataSource, "Items", {
        get: function () { return this._items; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSource, "ApprovedItems", {
        get: function () { return this._approvedItems; },
        enumerable: false,
        configurable: true
    });
    DataSource.load = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Load the data
            (0, gd_sprest_bs_1.Web)().Lists(strings_1.default.Lists.IndividualProgramInspectionReports).Items().query({
                GetAllItems: true,
                Expand: ["inpsectorName", "processOwner", "programLU"],
                OrderBy: ["Title"],
                Select: [
                    "*", "inpsectorName/EMail", "inpsectorName/Id", "inpsectorName/Title",
                    "processOwner/EMail", "processOwner/Id", "processOwner/Title",
                    "programLU/Id", "programLU/Title"
                ],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._items = items.results;
                // create array of only Approved items for command inspectors to view
                for (var i = 0; i < items.results.length; i++) {
                    var item = items.results[i];
                    if (item.approval == "Approved") {
                        _this._approvedItems.push(item);
                    }
                }
                // Resolve the request
                resolve(_this._items);
            }, 
            // Error
            function () { reject(); });
        });
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
    DataSource._items = null;
    DataSource._approvedItems = [];
    return DataSource;
}());
exports.DataSource = DataSource;
