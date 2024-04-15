import { ContextInfo, Helper } from "gd-sprest-bs";

// Sets the context information
// This is for SPFx or Teams solutions
export const setContext = (context, sourceUrl?: string) => {
    // Set the context
    ContextInfo.setPageContext(context.pageContext);

    // Load SP Core libraries
    Helper.loadSPCore();

    // Update the source url
    Strings.SourceUrl = sourceUrl || ContextInfo.webServerRelativeUrl;
}

/**
 * Global Constants
 */
const Strings = {
    HomePageElementId: "command-inspection-home",
    MasterChecklistElementId: "master-checklist",
    SubWebAppElementId: "command-assessment",
    SubWebHomeElementId: "command-home",
    SubWebTrackerElementId: "command-tracker",
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
        ISRRollup: "ISRRollup",
        OrgChart: "OrgChart",
        Programs: "Programs",
        SelfAssessmentOverview: "Self Assessment Overview",
        SitePages: "Site Pages"
    },
    ProjectName: "USFF Inspectors General",
    ProjectDescription: "Project for the USFF Inspectors General office",
    SourceUrl: ContextInfo.webServerRelativeUrl,
    Version: "2.0.5.2"
};
export default Strings;