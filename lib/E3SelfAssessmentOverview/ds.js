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
        // Return a promise
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
    DataSource.load = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // clear the array
            _this._items = [];
            // Load the data
            (0, gd_sprest_bs_1.Web)().Lists(strings_1.default.Lists.SelfAssessmentOverview).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Select: ["*"],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._items = items ? items.results : [];
                // Resolve the request
                resolve(_this._items);
            }, 
            // Error
            function () { reject(); });
        });
    };
    DataSource.getItemByProgram = function (program) {
        var ovItem = null;
        if (this.Items) {
            // Parse the items
            for (var i = 0; i < this.Items.length; i++) {
                var item = this.Items[i];
                // See if the program matches
                if (item.Title && item.Title == program) {
                    // Add the item
                    ovItem = item;
                }
            }
        }
        // Return the items
        return ovItem;
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
    return DataSource;
}());
exports.DataSource = DataSource;
