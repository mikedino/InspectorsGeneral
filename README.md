# usff-inspectors-general

## Summary

Custom web parts for the USFF Inspectors General site collection (USFF-HQ-N01IG). Contains the Master Checklist and Command Checklist webparts along with custom Kendo component dependencies.

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.13-green.svg)

## Used Kendo UI Version
@progress/kendo-ui: "^2022.1.301"

## Used jQuery UI Version
jquery: "^2.2.4"

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

For the Master Checklist to function, the site must contain the following lists:
-Checklist
-Directory
-Functional Areas
-Programs

and it must contain 2 groups:
-Admin group (any name)
-Inspector group (any name)

These lists are configurable in the web part properties

## Solution

Solution|Author(s)
--------|---------
USFF Inspectors General | Mike Landino, USFF N61

## Version history

Version|Date|Comments
-------|----|--------
2.0.5.1|Sep 5, 2023|Upgrade SPFx from 1.14 to 1.17.4 & Incorporate all change requests from CR list
1.0.0.4|May 3, 2022|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
  - git clone https://sync.git.mil/USFF/N6/N61/SPO/spfx-inspectors-general.git
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

> Include any additional steps as needed.

## Features

Description of the extension that expands upon high-level summary above.

This extension illustrates the following concepts:

Master Checklist webpart with a Program selected
![ScreenShot](/src/webparts/commandInspectionsMasterChecklist/assets/screenshots/masterChecklist.PNG)

Master Checklist webpart property pane
![ScreenShot2](/src/webparts/commandInspectionsMasterChecklist/assets/screenshots/webpartProperties.PNG)


> Share your web part with others through Microsoft 365 Patterns and Practices program to get visibility and exposure. More details on the community, open-source projects and other activities from http://aka.ms/m365pnp.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development