"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSource = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var export_1 = require("./export");
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
                _this.load(),
                // Load program id data
                _this.loadProgramIdItems(),
                // Initialize the export component
                export_1.Export.init()
            ]).then(resolve, reject);
        });
    };
    Object.defineProperty(DataSource, "Items", {
        get: function () { return this._items; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSource, "Programs", {
        get: function () { return this._programs; },
        enumerable: false,
        configurable: true
    });
    DataSource.load = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // clear the array
            _this._programs = [];
            // Load the data
            (0, gd_sprest_bs_1.Web)().Lists(strings_1.default.Lists.CommandInspectionChecklists).Items().query({
                GetAllItems: true,
                OrderBy: ["QuestionNumber"],
                Select: ["*"],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._items = items.results;
                // Parse the items and figure out the unique programs
                var programs = {};
                for (var i = 0; i < _this._items.length; i++) {
                    // check if program has a value to prevent null programs in filters
                    var program = _this._items[i]["Title"];
                    if (program) {
                        // Set the program
                        programs[program] = true;
                    }
                }
                // Parse the categories and generate the items
                for (var program in programs) {
                    // Add the item
                    _this._programs.push({
                        text: program
                    });
                }
                // Sort the programs array
                _this._programs = _this._programs.sort(function (a, b) {
                    if (a.text < b.text) {
                        return -1;
                    }
                    if (a.text > b.text) {
                        return 1;
                    }
                    return 0;
                });
                // Resolve the request
                resolve(_this._items);
            }, 
            // Error
            function () { reject(); });
        });
    };
    DataSource.getItemsByProgram = function (program) {
        var items = [];
        // Parse the items
        for (var i = 0; i < this.Items.length; i++) {
            var item = this.Items[i];
            // See if the program matches
            if (item.Title && item.Title == program) {
                // Add the item
                items.push(item);
            }
        }
        // Return the items
        return items;
    };
    Object.defineProperty(DataSource, "ProgramIdItems", {
        get: function () { return this._programIdItems; },
        enumerable: false,
        configurable: true
    });
    DataSource.loadProgramIdItems = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // clear the array
            _this._programIdItems = [];
            // Load the data
            (0, gd_sprest_bs_1.Web)().Lists(strings_1.default.Lists.CIProgramIdentification).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Select: ["*"],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._programIdItems = items.results;
                // Resolve the request
                resolve(_this._items);
            }, 
            // Error
            function () { reject(); });
        });
    };
    // gets the related program item for the selected program
    DataSource.getProgramByTitle = function (programText) {
        var pidItem = null;
        if (this.Items) {
            // Parse the items
            for (var i = 0; i < this.ProgramIdItems.length; i++) {
                var item = this.ProgramIdItems[i];
                // See if the program matches
                if (item.Title && item.Title == programText) {
                    // Add the item
                    pidItem = item;
                }
            }
        }
        // Return the item
        return pidItem;
    };
    // Refreshes the application data
    DataSource.refresh = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            Promise.all([
                // Load the data
                _this.load(),
                // Load program id data
                _this.loadProgramIdItems()
            ]).then(resolve, reject);
        });
    };
    // Loads the list data
    DataSource._items = null;
    DataSource._programs = null;
    // Loads the program identificaiton list data
    DataSource._programIdItems = null;
    return DataSource;
}());
exports.DataSource = DataSource;
