// src/locators/zing-selectors.js

const ZingLocators = {
    auth: {
        url: 'https://portal.zinghr.com/2015/pages/authentication/login.aspx',
        companyCodeInput: '#txtCompanyCode',
        empCodeInput: '#txtEmpCode',
        passwordInput: '#txtPassword',
        hiddenLatitudeId: 'Latitude', 
        hiddenLongitudeId: 'Longitude',
        punchInButton: 'button.PunchBtn[data-status="PUNCHIN"]',
        punchOutButton: 'button.PunchBtn[data-status="PUNCHOUT"]',
        botModalOkButton: 'button[data-bb-handler="ok"]'
    }
};

module.exports = ZingLocators;