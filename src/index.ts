import { InstallationRequired, LoadingDialog, Modal } from "dattatable";
import { ContextInfo } from "gd-sprest-bs";
import { MasterChecklistApp } from "./MasterChecklistApp";
import { Configuration } from "./MasterChecklistApp/cfg";
import { DataSource } from "./ds";
import { InspectionHomePage } from "./CommandInspectionsHome";
import { DataSource as DataSourceHome } from "./CommandInspectionsHome/ds";
import { Configuration as ConfigurationHome } from "./CommandInspectionsHome/cfg";
import { E3HomePage } from "./E3HomePage";
import { SelfAssessmentTracker } from "./E3SelfAssessmentTracker";
import { Security } from "./security";
import Strings, { setContext } from "./strings";

// Create the global variable for this solution
const GlobalVariable = {
    Configuration,
    // render the master checklist
    renderMasterChecklist: (el, context?, sourceUrl?: string) => {
        // See if the page context exists
        if (context) {
            // Set the context
            setContext(context, sourceUrl);

            // Update the configuration
            Configuration.setWebUrl(sourceUrl || ContextInfo.webServerRelativeUrl);
        }

        // Show a loading dialog
        LoadingDialog.setHeader("Loading the Application");
        LoadingDialog.setBody("Loading the Master Checklist...");
        LoadingDialog.show();

        // Initialize the application
        DataSource.init().then(
            // Success
            () => {
                LoadingDialog.hide();

                // Create the application
                new MasterChecklistApp(el);
            },

            // Error
            () => {
                LoadingDialog.hide();

                // See if an installation is required
                InstallationRequired.requiresInstall({ cfg: Configuration }).then(installFl => {
                    // See if an install is required
                    if (installFl) {
                        // Show the dialog
                        InstallationRequired.showDialog();
                    } else {
                        // Log
                        console.error("[" + Strings.ProjectName + "] Error initializing the solution.");
                    }
                });
            }
        );

    },

    // render the Command Inspections Home Page
    renderCommandInspectionsHome: (el, context?, sourceUrl?: string) => {
        // See if the page context exists
        if (context) {
            // Set the context
            setContext(context, sourceUrl);

            // Update the configuration
            ConfigurationHome.setWebUrl(sourceUrl || ContextInfo.webServerRelativeUrl);
        }

        // Show a loading dialog
        LoadingDialog.setHeader("Loading the Page");
        LoadingDialog.setBody("Loading the Data...");
        LoadingDialog.show();


        // Initialize the datasource for the home page
        DataSourceHome.init().then(
            // Success
            () => {
                LoadingDialog.hide();

                // Create the application
                new InspectionHomePage(el);
            },

            // Error
            () => {
                LoadingDialog.hide();

                // See if an installation is required
                InstallationRequired.requiresInstall({ cfg: ConfigurationHome }).then(installFl => {
                    // See if an install is required
                    if (installFl) {
                        // Show the dialog
                        InstallationRequired.showDialog();
                    } else {
                        // Log
                        console.error("[" + Strings.ProjectName + "] Error initializing the solution.");
                    }
                });
            }
        );
    },

    // render the E3 site Home Page
    renderE3Home: (el, context?, sourceUrl?: string) => {
        // See if the page context exists
        if (context) {
            // Set the context
            setContext(context, sourceUrl);

            // Update the configuration
            Configuration.setWebUrl(sourceUrl || ContextInfo.webServerRelativeUrl);
        }

        // Show a loading dialog
        LoadingDialog.setHeader("Loading the Page");
        LoadingDialog.setBody("Loading the Security Information...");
        LoadingDialog.show();



        // Initialize the security
        Security.init(ContextInfo.webTitle).then(
            // Success
            () => {
                LoadingDialog.hide();

                // Create the application
                new E3HomePage(el);
            },

            // Error
            () => {
                LoadingDialog.hide();

                // See if an installation is required
                InstallationRequired.requiresInstall({ cfg: Configuration }).then(installFl => {
                    // See if an install is required
                    if (installFl) {
                        // Show the dialog
                        InstallationRequired.showDialog();
                    } else {
                        // Log
                        console.error("[" + Strings.ProjectName + "] Error initializing the solution.");
                    }
                });
            }
        );
    },

    // render the E3 Self Assessment Tracker
    renderE3Tracker: (el, context?, sourceUrl?: string) => {
        // See if the page context exists
        if (context) {
            // Set the context
            setContext(context, sourceUrl);

            // Update the configuration
            Configuration.setWebUrl(sourceUrl || ContextInfo.webServerRelativeUrl);
        }

        // Create the application
        new SelfAssessmentTracker(el);

    },
};


// Make is available in the DOM
window[Strings.GlobalVariable] = GlobalVariable;

// Get the element and render the master checklist app (parent site) if it is found
let elApp = document.querySelector("#" + Strings.MasterChecklistElementId) as HTMLElement;
if (elApp) {
    // Render the application
    GlobalVariable.renderMasterChecklist(elApp);
}

// Get the element and render the IG (parent) home page for the subweb
elApp = document.querySelector("#" + Strings.HomePageElementId) as HTMLElement;
if (elApp) {
    // Render the application
    GlobalVariable.renderCommandInspectionsHome(elApp);
}

// Get the element and render the Echelon III home page for the subweb
elApp = document.querySelector("#" + Strings.SubWebHomeElementId) as HTMLElement;
if (elApp) {
    // Render the application
    GlobalVariable.renderE3Home(elApp);
}

// Get the element and render the Echelon III Self Assessment tracker for the subweb
elApp = document.querySelector("#" + Strings.SubWebTrackerElementId) as HTMLElement;
if (elApp) {
    // Render the application
    GlobalVariable.renderE3Tracker(elApp);
}