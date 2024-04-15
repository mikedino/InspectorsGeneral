"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSource = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var export_1 = require("./MasterChecklistApp/export");
var security_1 = require("./security");
var strings_1 = require("./strings");
/**
 * Data Source
 */
var DataSource = /** @class */ (function () {
    function DataSource() {
    }
    // Loads the command checklist data
    DataSource.loadCommandData = function (commandUrl) {
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Load the data
            (0, gd_sprest_bs_1.Web)(commandUrl).Lists(strings_1.default.Lists.CommandInspectionChecklists).Items().query({
                GetAllItems: true,
                OrderBy: ["MasterId"],
                Select: ["Id", "MasterId"],
                Top: 5000
            }).execute(function (items) {
                var mapper = {};
                // Parse the items
                for (var i = 0; i < items.results.length; i++) {
                    var item = items.results[i];
                    // Add the item to the mapper
                    mapper[item["MasterId"]] = item.Id;
                }
                // Resolve the request
                resolve(mapper);
            }, reject);
        });
    };
    Object.defineProperty(DataSource, "Directories", {
        get: function () { return this._directories; },
        enumerable: false,
        configurable: true
    });
    DataSource.loadDirectories = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Clear the directories
            _this._directories = [];
            // Load the data
            (0, gd_sprest_bs_1.Web)(strings_1.default.SourceUrl).Lists(strings_1.default.Lists.Directory).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._directories = items.results;
                // Resolve the request
                resolve(_this._directories);
            }, 
            // Error
            function () { reject(); });
        });
    };
    DataSource.getActiveDirectories = function () {
        var items = [];
        for (var i = 0; i < this.Directories.length; i++) {
            var item = this.Directories[i];
            if (item.active) {
                items.push(item);
            }
        }
        return items;
    };
    // Initializes the application
    DataSource.init = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            Promise.all([
                // Load the data
                _this.load(),
                // Load the directories
                _this.loadDirectories(),
                // Load the programs
                _this.loadPrograms(),
                // Initialize the export component
                export_1.Export.init(),
                // Initialize the security
                security_1.Security.init()
            ]).then(resolve, reject);
        });
    };
    Object.defineProperty(DataSource, "Items", {
        get: function () { return this._items; },
        enumerable: false,
        configurable: true
    });
    //static load(programId: string = "0"): PromiseLike<IChecklistItem[]> {
    DataSource.load = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Load the data
            (0, gd_sprest_bs_1.Web)(strings_1.default.SourceUrl).Lists(strings_1.default.Lists.Checklist).Items().query({
                Expand: ["program"],
                //Filter: "programId eq " + programId,
                GetAllItems: true,
                OrderBy: ["questionNumber"],
                Select: [
                    "*", "program/Id", "program/Title"
                ],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._items = items.results;
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
            if (item.program && item.program.Title == program) {
                // Add the item
                items.push(item);
            }
        }
        // Return the items
        return items;
    };
    Object.defineProperty(DataSource, "Programs", {
        get: function () { return this._programs; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSource, "ProgramsCBItems", {
        get: function () { return this._programsCBItems; },
        enumerable: false,
        configurable: true
    });
    DataSource.loadPrograms = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Clear the programs
            _this._programs = [];
            _this._programsCBItems = [];
            // Load the data
            (0, gd_sprest_bs_1.Web)(strings_1.default.SourceUrl).Lists(strings_1.default.Lists.Programs).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Parse the programs
                for (var i = 0; i < items.results.length; i++) {
                    var item = items.results[i];
                    // Add the program
                    _this._programs.push({
                        data: item,
                        text: item.Title,
                        value: item.Id.toString()
                    });
                    // Add program to the checkbox items object
                    _this._programsCBItems.push({
                        data: item,
                        label: item.Title,
                        isSelected: true
                    });
                }
                // Resolve the request
                resolve(_this._programs);
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
                // Load the directories
                _this.loadDirectories(),
                // Load the programs
                _this.loadPrograms()
            ]).then(resolve, reject);
        });
    };
    // Directories (commands)
    DataSource._directories = null;
    // Loads the list data
    DataSource._items = null;
    // Programs
    DataSource._programs = null;
    DataSource._programsCBItems = null;
    return DataSource;
}());
exports.DataSource = DataSource;
