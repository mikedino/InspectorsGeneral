"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setContext = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
// Sets the context information
// This is for SPFx or Teams solutions
var setContext = function (context, sourceUrl) {
    // Set the context
    gd_sprest_bs_1.ContextInfo.setPageContext(context.pageContext);
    // Load SP Core libraries
    gd_sprest_bs_1.Helper.loadSPCore();
    // Update the source url
    Strings.SourceUrl = sourceUrl || gd_sprest_bs_1.ContextInfo.webServerRelativeUrl;
};
exports.setContext = setContext;
/**
 * Global Constants
 */
var Strings = {
    HomePageElementId: "command-inspection-home",
    MasterChecklistElementId: "master-checklist",
    SubWebAppElementId: "command-assessment",
    SubWebHomeElementId: "command-home",
    GlobalVariable: "InspectorGeneral",
    Lists: {
        CIProgramIdentification: "CI Program Identification",
        Checklist: "Checklist",
        CommandInspectionChecklists: "Command Inspection Checklists",
        Contacts: "Inspectors",
        Directory: "Directory",
        Documents: "Documents",
        HomePageLinks: "Home Page Links",
        IndividualProgramInspectionReports: "Individual Program Inspection Reports",
        InspectionSchedule: "Inspection Schedule",
        ISR: "ISR",
        OrgChart: "OrgChart",
        Programs: "Programs",
        SelfAssessmentOverview: "Self Assessment Overview",
        SitePages: "Site Pages"
    },
    ProjectName: "USFF Inspectors General",
    ProjectDescription: "Project for the USFF Inspectors General office",
    SourceUrl: gd_sprest_bs_1.ContextInfo.webServerRelativeUrl,
    Version: "2.0.4.2"
};
exports.default = Strings;
