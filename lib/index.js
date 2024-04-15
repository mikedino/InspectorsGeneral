"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var MasterChecklistApp_1 = require("./MasterChecklistApp");
var cfg_1 = require("./MasterChecklistApp/cfg");
var ds_1 = require("./ds");
var CommandInspectionsHome_1 = require("./CommandInspectionsHome");
var ds_2 = require("./CommandInspectionsHome/ds");
var cfg_2 = require("./CommandInspectionsHome/cfg");
var E3HomePage_1 = require("./E3HomePage");
var security_1 = require("./security");
var strings_1 = require("./strings");
// Create the global variable for this solution
var GlobalVariable = {
    Configuration: cfg_1.Configuration,
    // render the master checklist
    renderMasterChecklist: function (el, context, sourceUrl) {
        // See if the page context exists
        if (context) {
            // Set the context
            (0, strings_1.setContext)(context, sourceUrl);
            // Update the configuration
            cfg_1.Configuration.setWebUrl(sourceUrl || gd_sprest_bs_1.ContextInfo.webServerRelativeUrl);
        }
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Loading the Application");
        dattatable_1.LoadingDialog.setBody("Loading the Master Checklist...");
        dattatable_1.LoadingDialog.show();
        // Initialize the application
        ds_1.DataSource.init().then(
        // Success
        function () {
            dattatable_1.LoadingDialog.hide();
            // Create the application
            new MasterChecklistApp_1.MasterChecklistApp(el);
        }, 
        // Error
        function () {
            dattatable_1.LoadingDialog.hide();
            // See if an installation is required
            dattatable_1.InstallationRequired.requiresInstall(cfg_1.Configuration).then(function (installFl) {
                // See if an install is required
                if (installFl) {
                    // Show the dialog
                    dattatable_1.InstallationRequired.showDialog();
                }
                else {
                    // Log
                    console.error("[" + strings_1.default.ProjectName + "] Error initializing the solution.");
                }
            });
        });
    },
    // render the Command Inspections Home Page
    renderCommandInspectionsHome: function (el, context, sourceUrl) {
        // See if the page context exists
        if (context) {
            // Set the context
            (0, strings_1.setContext)(context, sourceUrl);
            // Update the configuration
            cfg_2.Configuration.setWebUrl(sourceUrl || gd_sprest_bs_1.ContextInfo.webServerRelativeUrl);
        }
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Loading the Page");
        dattatable_1.LoadingDialog.setBody("Loading the Data...");
        dattatable_1.LoadingDialog.show();
        // Initialize the datasource for the home page
        ds_2.DataSource.init().then(
        // Success
        function () {
            dattatable_1.LoadingDialog.hide();
            // Create the application
            new CommandInspectionsHome_1.InspectionHomePage(el);
        }, 
        // Error
        function () {
            dattatable_1.LoadingDialog.hide();
            // See if an installation is required
            dattatable_1.InstallationRequired.requiresInstall(cfg_2.Configuration).then(function (installFl) {
                // See if an install is required
                if (installFl) {
                    // Show the dialog
                    dattatable_1.InstallationRequired.showDialog();
                }
                else {
                    // Log
                    console.error("[" + strings_1.default.ProjectName + "] Error initializing the solution.");
                }
            });
        });
    },
    // render the E3 site Home Page
    renderE3Home: function (el, context, sourceUrl) {
        // See if the page context exists
        if (context) {
            // Set the context
            (0, strings_1.setContext)(context, sourceUrl);
            // Update the configuration
            cfg_1.Configuration.setWebUrl(sourceUrl || gd_sprest_bs_1.ContextInfo.webServerRelativeUrl);
        }
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Loading the Page");
        dattatable_1.LoadingDialog.setBody("Loading the Security Information...");
        dattatable_1.LoadingDialog.show();
        // Initialize the security
        security_1.Security.init(gd_sprest_bs_1.ContextInfo.webTitle).then(
        // Success
        function () {
            dattatable_1.LoadingDialog.hide();
            // Create the application
            new E3HomePage_1.E3HomePage(el);
        }, 
        // Error
        function () {
            dattatable_1.LoadingDialog.hide();
            // See if an installation is required
            dattatable_1.InstallationRequired.requiresInstall(cfg_1.Configuration).then(function (installFl) {
                // See if an install is required
                if (installFl) {
                    // Show the dialog
                    dattatable_1.InstallationRequired.showDialog();
                }
                else {
                    // Log
                    console.error("[" + strings_1.default.ProjectName + "] Error initializing the solution.");
                }
            });
        });
    }
};
// Make is available in the DOM
window[strings_1.default.GlobalVariable] = GlobalVariable;
// Get the element and render the master checklist app (parent site) if it is found
var elApp = document.querySelector("#" + strings_1.default.MasterChecklistElementId);
if (elApp) {
    // Render the application
    GlobalVariable.renderMasterChecklist(elApp);
}
// Get the element and render the Echelon III home page for the subweb
elApp = document.querySelector("#" + strings_1.default.HomePageElementId);
if (elApp) {
    // Render the application
    GlobalVariable.renderCommandInspectionsHome(elApp);
}
// Get the element and render the Echelon III home page for the subweb
elApp = document.querySelector("#" + strings_1.default.SubWebHomeElementId);
if (elApp) {
    // Render the application
    GlobalVariable.renderE3Home(elApp);
}
