"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSource = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var strings_1 = require("../strings");
/**
 * Data Source for the Command Inspections Home Page
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
                // Load the icon links
                _this.loadLinks(),
                // Load the Inspectors
                _this.loadContacts(),
                // Load the Commands
                _this.loadCommands()
            ]).then(resolve, reject);
        });
    };
    Object.defineProperty(DataSource, "ContactItems", {
        get: function () { return this._contactItems; },
        enumerable: false,
        configurable: true
    });
    DataSource.loadContacts = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Load the data
            (0, gd_sprest_bs_1.Web)().Lists(strings_1.default.Lists.Contacts).Items().query({
                GetAllItems: true,
                Expand: ["inspector"],
                OrderBy: ["sortOrder"],
                Select: ["*", "inspector/Title", "inspector/EMail", "inspector/WorkPhone", "inspector/Id"],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._contactItems = items.results;
                // Resolve the request
                resolve(_this._contactItems);
            }, 
            // Error
            function (err) { reject(); });
        });
    };
    Object.defineProperty(DataSource, "Commands", {
        get: function () { return this._commands; },
        enumerable: false,
        configurable: true
    });
    DataSource.loadCommands = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Clear the directories
            _this._commands = [];
            // Load the data
            (0, gd_sprest_bs_1.Web)(strings_1.default.SourceUrl).Lists(strings_1.default.Lists.Directory).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._commands = items.results;
                // Resolve the request
                resolve(_this._commands);
            }, 
            // Error
            function () { reject(); });
        });
    };
    Object.defineProperty(DataSource, "Links", {
        get: function () { return this._links; },
        enumerable: false,
        configurable: true
    });
    DataSource.loadLinks = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Clear the directories
            _this._links = [];
            // Load the data
            (0, gd_sprest_bs_1.Web)(strings_1.default.SourceUrl).Lists(strings_1.default.Lists.HomePageLinks).Items().query({
                GetAllItems: true,
                Top: 5000
            }).execute(
            // Success
            function (items) {
                // Set the items
                _this._links = items.results;
                // Resolve the request
                resolve(_this._links);
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
                // Load the icon links
                _this.loadLinks(),
                // Load the contacts
                _this.loadContacts(),
                // Load the commands
                _this.loadCommands()
            ]).then(resolve, reject);
        });
    };
    // Loads the Contacts list ("Inspectors") data
    DataSource._contactItems = null;
    // Directories (commands)
    DataSource._commands = null;
    // Home page links (for icons)
    DataSource._links = null;
    return DataSource;
}());
exports.DataSource = DataSource;
