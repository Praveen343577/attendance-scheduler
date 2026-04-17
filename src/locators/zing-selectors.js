// src/locators/zing-selectors.js

const ZingLocators = {
    auth: {
        url: 'https://portal.zinghr.com/2015/pages/authentication/login.aspx',
        companyCodeInput: '#txtCompanyCode',
        empCodeInput: '#txtEmpCode',
        passwordInput: '#txtPassword',
        loginButton: '#btnLogin',
        hiddenLatitudeId: 'Latitude', // ID strictly for document.getElementById evaluation
        hiddenLongitudeId: 'Longitude' // ID strictly for document.getElementById evaluation
    },
    dashboard: {
        urlRoutingMatch: 'https://zingnext.zinghr.com/portal',
        punchOutButton: 'div.MuiBox-root:has-text("Punch Out")',
        punchInButton: 'div.MuiBox-root:has-text("Punch In")',
        successToast: '.MuiAlert-message:has-text("Successfully")',
        avatarButton: 'button.navIcons:has(img.MuiAvatar-img)',
        logoutMenuOption: 'li[role="menuitem"]:has-text("Logout")'
    }
};

module.exports = ZingLocators;