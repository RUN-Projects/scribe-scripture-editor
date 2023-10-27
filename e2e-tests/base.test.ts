// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';
import {
  showLoginPage, userFile, userFolder, userJson, createProjectValidation,
  createProjects, userValidation, signOut, showActiveUsers,
  searchProject, checkProjectName, checkNotification, goToProjectPage,
  exportProjects, archivedProjects, unarchivedProjects, goToEditProject,
  changeAppLanguage, projectTargetLanguage, userProfileValidaiton,
  exportAudioProject, updateDescriptionAbbriviation, changeLicense,
  customAddEditLanguage, customProjectTargetLanguage, starUnstar, clickUserImageToLogout
} from './common';

const fs = require('fs');
const path = require('path');
const { _electron: electron } = require('@playwright/test');

let electronApp;
let appPath;
let window;

// This test case handles the user's login or logout actions and related operations.
// 'If logged IN then logout and delete that user from the backend'
test.beforeAll(async ({ userName }) => {
  electronApp = await electron.launch({ args: ['main/index.js'] });
  appPath = await electronApp.evaluate(async ({ app }) => {
    // This runs in the main Electron process, parameter here is always
    // the result of the require('electron') in the main app script
    return app.getAppPath();
  });
  window = await electronApp.firstWindow();
  expect(await window.title()).toBe('Scribe Scripture');
  // check if project text is visible 
  const textVisble = await window.locator('//*[@aria-label="projects"]').isVisible()
  if (textVisble) {
    // logut and delete the user
    await clickUserImageToLogout(window, expect, userName, path, fs, packageInfo)
  } else {
    //Retrieves and parses a JSON file containing user information
    const json = await userJson(window, packageInfo, fs, path)
    // Constructs the path to the users.json file.
    const file = await userFile(window, packageInfo, path)
    //  constructs the path to a folder/directory name
    const folder = await userFolder(window, userName, packageInfo, path)
    // If 'projects' is not visible, check the 'welcome' element
    const welcome = await window.locator('//*[@aria-label="welcome"]', { timeout: 5000 }).textContent()
    await expect(welcome).toBe(welcome)
    // On the login page, if the playwright user exists, reload the app and remove it
    const existUser = json.some((item) => item.username.toLowerCase() === userName.toLowerCase());
    if (existUser && await fs.existsSync(folder)) {
      await showLoginPage(fs, folder, userName, json, file, window, expect);
    }
  }

});

/* logout and delete the playwright user from the backend */
test.afterAll(async ({ userName }) => {
  await clickUserImageToLogout(window, expect, userName, path, fs, packageInfo)
})

// test status check
test.afterEach(async ({ }, testInfo) => {
  console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);

  if (testInfo.status !== testInfo.expectedStatus)
    console.log(`Did not run as expected, ended up at ${window.url()}`);
});

// This test case creates a new user and logs in.
test('Create a new user and login', async ({ userName }) => {
  // Here you create a new user and validate the login.
  await userValidation(window, expect)
  await window.locator('//input[@placeholder="Username"]').fill(userName)
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.click('[type=submit]');
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(title).toBe('Projects');
})


/*CREATE PROJECTS FOR ALL FLAVOR TYPE */
/* Translation Project    */
test('Click New and Fill project page details to create a new project for text translation with custom book', async ({ textProject, description, textAbbreviation }) => {
  // Here you create a new text translation project with custom settings.
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.locator('//a[@aria-label="new"]').click()
  await createProjectValidation(window, expect)
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible()
  await window.locator('//input[@id="project_name"]').fill(textProject)
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible()
  await window.locator('//textarea[@id="project_description"]').fill(description)
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible()
  await window.locator('//input[@id="version_abbreviated"]').fill(textAbbreviation)
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible()
  await window.locator('//*[@id="open-advancesettings"]').click()
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible()
  await window.locator('//*[@aria-label="custom-book"]').click()
  await window.locator('//*[@aria-label="nt-Matthew"]').click()
  await window.locator('//*[@id="save-canon"]').click()
  await window.locator('//button[@aria-label="create"]').click()
  const projectName = await window.innerText(`//div[@id="${textProject}"]`)
  await expect(projectName).toBe(textProject);
})

/* Obs translation project */
test('Click New and Fill project page details to create a new project for obs', async ({ obsProject, projectObsType, description, obsAbbreviation }) => {
  //  Here you create a new OBS project.
  await createProjects(window, expect, obsProject, projectObsType, description, obsAbbreviation)
})

/* Audio project */
test('Click New and Fill project page details to create a new project for audio', async ({ audioProject, projectAudioType, description, AudioAbbreviation }) => {
  // Here you create a new audio project
  await createProjects(window, expect, audioProject, projectAudioType, description, AudioAbbreviation)
})

/* STAR & UNSTAR PROJECT */
// text translation
test("Star the text translation project", async ({ textProject, starProject, unstarProject }) => {
  // Here you star a text translation project.
  await starUnstar(window, expect, textProject, starProject, unstarProject)
})

test("Unstar the text translation project", async ({ textProject, unstarProject, starProject }) => {
  // Here you unstar a text translation project.
  await starUnstar(window, expect, textProject, unstarProject, starProject)

})

// obs
test("Star the obs project", async ({ obsProject, starProject, unstarProject }) => {
  // Here you star a OBS project.
  await starUnstar(window, expect, obsProject, starProject, unstarProject)

})

test("Unstar the obs project", async ({ obsProject, unstarProject, starProject }) => {
  // Here you unstar a OBS project.
  await starUnstar(window, expect, obsProject, unstarProject, starProject)
})

// audio
test("Star the audio project", async ({ audioProject, starProject, unstarProject }) => {
  // Here you star a Audio project.
  await starUnstar(window, expect, audioProject, starProject, unstarProject)

})

test("Unstar the audio project", async ({ audioProject, unstarProject, starProject }) => {
  // Here you unstar a Audio project.
  await starUnstar(window, expect, audioProject, unstarProject, starProject)

})

/* text transaltion project */
test('Search a text translation project in all projects list', async ({ textProject }) => {
  await searchProject(window, expect, textProject, 'translation')
});

test('Click on a text translation project and Check the text Translation project name in the editor', async ({ textProject }) => {
  await checkProjectName(window, expect, textProject)
});

test('Check text Translation project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Return to the project page', async () => {
  await goToProjectPage(window, expect)
});

/* obs project */
test('Search an obs project in all projects list', async ({ obsProject }) => {
  await searchProject(window, expect, obsProject, 'obs')
});

test('Click on a obs project and Check the obs project name in the editor', async ({ obsProject }) => {
  await checkProjectName(window, expect, obsProject)
});

test('Check obs project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Add content in verses 1 and 2 in the obs story 1 editor', async () => {
  // Fill text in verse 2 and verse 3 fields
  await window.locator('div:nth-child(2) > .flex-grow').fill("God created heavens and earth");
  await window.locator('div:nth-child(3) > .flex-grow').fill("Story content added in verse 3");
  // Verify if the content was added to verse 2 and verse 3
  const verse2 = await window.textContent('div:nth-child(2) > .flex-grow');
  expect(verse2).toBe('God created heavens and earth');
  const verse3 = await window.textContent('div:nth-child(3) > .flex-grow');
  expect(verse3).toBe('Story content added in verse 3');
});

test('Increase the font size in the obs editor', async () => {
  await window.waitForSelector('//*[@aria-label="increase-font"]', { timeout: 5000 });
  await window.locator('//*[@aria-label="increase-font"]').click();
  await window.locator('//*[@aria-label="increase-font"]').click();

  // Get and verify the font size
  const div = await window.locator('//*[@aria-label="editor"]');
  const fontSize = await div.evaluate((ele) => {
    return window.getComputedStyle(ele).getPropertyValue('font-size');
  });
  expect(await fontSize).toBe('22.4px');
});

test('Decrease the font size in the obs editor', async () => {
  await window.waitForSelector('//*[@aria-label="decrease-font"]', { timeout: 5000 });
  await window.locator('//*[@aria-label="decrease-font"]').click();
  await window.locator('//*[@aria-label="decrease-font"]').click();

  // Get and verify the font size
  const div = await window.locator('//*[@aria-label="editor"]');
  const fontSize = await div.evaluate((ele) => {
    return window.getComputedStyle(ele).getPropertyValue('font-size');
  });
  expect(await fontSize).toBe('16px');
});

test('Change the obs navigation story from 1 to 12 and edit the title', async () => {
  await expect(window.locator('//*[@aria-label="obs-navigation"]')).toBeVisible();
  await window.locator('//*[@aria-label="obs-navigation"]').click();
  await window.locator('//*[@aria-label="12"]').click();

  // Edit the title of story 12 and verify the change
  await expect(window.locator('//*[@name="12. The Exodus"]')).toBeVisible();
  await window.locator('//*[@name="12. The Exodus"]').fill('12. The Exodus Edit title');
  const title = await window.textContent('//*[@name="12. The Exodus Edit title"]');
  expect(title).toBe('12. The Exodus Edit title');
});

test('Return to projects list page from obs editor', async () => {
  await goToProjectPage(window, expect)
});


/* audio project */
test('Search an audio project in all projects list', async ({ audioProject }) => {
  await searchProject(window, expect, audioProject, 'audio')
});

test('Click on a audio project and Check the audio project name in the editor', async ({ audioProject }) => {
  await checkProjectName(window, expect, audioProject)
});

test('Check audio project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Return to the projects from audio editor page', async () => {
  await goToProjectPage(window, expect)
});

/* about the scribe */
test("About scribe Application and License", async () => {
  await window.locator('//*[@aria-label="about-button"]').click()
  const developedby = await window.locator('[aria-label=developed-by]').textContent();
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.click('[aria-label=license-button]');
  await window.locator('//*[@aria-label="about-description"]').click()
  await window.click('[aria-label=close-about]');
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(title).toBe('Projects');
})

/* exports project */
test("Export text translation project in the Downloads folder", async ({ textProject }) => {
  await exportProjects(window, expect, textProject)
})

test("Export the obs project in the Downloads folder", async ({ obsProject }) => {
  await exportProjects(window, expect, obsProject)
})

test("Export the audio project in the Downloads folder", async ({ audioProject }) => {
  await exportProjects(window, expect, audioProject)
})

/* export chapter wise project */
test("Export chapter wise audio project in the Downloads folder", async ({ audioProject }) => {
  await exportAudioProject(window, expect, audioProject, "Chapter")
})

/* export full audio project */
test("Export full audio project in the Downloads folder", async ({ audioProject }) => {
  await exportAudioProject(window, expect, audioProject, "full")
})

/* archive and unarchive project */
// text translation
test("Archive text translation project", async ({ textProject }) => {
  await archivedProjects(window, expect, textProject)
})

test("Restore text translation project from archived page", async ({ textProject }) => {
  await unarchivedProjects(window, expect, textProject)
})

// obs project
test("Archive obs project", async ({ obsProject }) => {
  await archivedProjects(window, expect, obsProject)
})

test("Restore the obs project from archived page", async ({ obsProject }) => {
  await unarchivedProjects(window, expect, obsProject)
})

// audio project
test("Archive audio project", async ({ audioProject }) => {
  await archivedProjects(window, expect, audioProject)
})

test("Restore the audio project from the archived page", async ({ audioProject }) => {
  await unarchivedProjects(window, expect, audioProject)
})

/* Update/Edit the text translation project */
test("Update/Edit text translation project of description and abbreviation", async ({ textProject, description, textAbbreviation }) => {
  await goToEditProject(window, expect, textProject)
  await updateDescriptionAbbriviation(window, expect, description, textAbbreviation)
})

test("Update/Edit text translation project scope mark and luke", async ({ textProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Select the custom book option
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible();
  await window.locator('//*[@aria-label="custom-book"]').click();

  // Select NT-Mark and NT-Luke
  await window.locator('//*[@aria-label="nt-Mark"]').click();
  await window.locator('//*[@aria-label="nt-Luke"]').click();

  // Save the changes and return to the projects page
  await window.locator('//*[@id="save-canon"]').click();
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  await window.waitForTimeout(2500);

  // Verify that the title is "Projects"
  const title = await window.textContent('[aria-label=projects]');
  expect(await title).toBe('Projects');
})

test("Update/Edit text translation project scope custom book into NT", async ({ textProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Select the New Testament option
  await expect(window.locator('//*[@aria-label="new-testament"]')).toBeVisible();
  await window.locator('//*[@aria-label="new-testament"]').click();

  // Confirm the change and save
  await window.locator('//button[contains(text(),"Ok")]').click();
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  await window.waitForTimeout(3000);

  // Verify that the title is "Projects"
  const title = await window.textContent('[aria-label=projects]');
  expect(await title).toBe('Projects');
})

test("Update/Edit text transaltion project scope custom book genesis and exodus from OT", async ({ textProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Select the custom book option
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible();
  await window.locator('//*[@aria-label="custom-book"]').click();

  // Select OT-Genesis and OT-Exodus
  await window.locator('//*[@aria-label="ot-Genesis"]').click();
  await window.locator('//*[@aria-label="ot-Exodus"]').click();

  // Save the changes and return to the projects page
  await window.locator('//*[@id="save-canon"]').click();
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  await window.waitForTimeout(3000);

  // Verify that the title is "Projects"
  const title = await window.textContent('[aria-label=projects]');
  expect(await title).toBe('Projects');
})

test("Update/Edit text translation project license", async ({ textProject, currentLicense, newLicense }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Change the license from "CC BY-SA" to "CC BY"
  await changeLicense(window, expect, currentLicense, newLicense);
})

/* Update/Edit the obs project */
test("Update/Edit obs project of description and abbreviation", async ({ obsProject, description, obsAbbreviation }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, obsProject);

  // Update description and abbreviation
  await updateDescriptionAbbriviation(window, expect, description, obsAbbreviation);
})

test("Update/Edit obs project license", async ({ obsProject, currentLicense, newLicense }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, obsProject);

  // Change the license from "CC BY-SA" to "CC BY"
  await changeLicense(window, expect, currentLicense, newLicense);
})

/* Update/Edit the audio project */
test("Update/Edit audio project of description and abbreviation", async ({ audioProject, description, AudioAbbreviation }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, audioProject);

  // Update description and abbreviation
  await updateDescriptionAbbriviation(window, expect, description, AudioAbbreviation)
})

/* custom project with custom language for text translation */
test("Create custom text translation with custom language project", async ({ customTextProject, description, textAbbreviation, customTextLanguage }) => {
  // Navigate to the new project creation page
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible();
  await window.locator('//a[@aria-label="new"]').click();

  // Perform initial project creation steps and provide details
  await createProjectValidation(window, expect);
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible();
  await window.locator('//input[@id="project_name"]').fill(customTextProject);
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible();
  await window.locator('//textarea[@id="project_description"]').fill(`custom text translation project ${description}`);
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible();
  await window.locator('//input[@id="version_abbreviated"]').fill(`c${textAbbreviation}`);

  // Adding a new custom text translation language
  await customAddEditLanguage(window, expect, "add-language", customTextLanguage, 'cttl', "RTL", "edit-language");

  // Open advanced settings and configure project scope
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible();
  await window.locator('//*[@aria-label="custom-book"]').click();
  await window.locator('//*[@aria-label="nt-Matthew"]').click();
  await window.locator('//*[@id="save-canon"]').click();

  // Create the project and verify the project name
  await window.locator('//button[@aria-label="create"]').click();
  const projectName = await window.innerText(`//div[@id="${customTextProject}"]`);
  await expect(projectName).toBe(customTextProject);
})

/* Obs and Audio custom target language RTL project */
test("Create custom obs project with custom language project", async ({ customObsProject, projectObsType, description, obsAbbreviation, customObsLanguage }) => {
  // Create a custom OBS project with a custom language
  await customProjectTargetLanguage(window, expect, customObsProject, projectObsType, description, obsAbbreviation, "add-language", customObsLanguage, 'copl', "RTL", "edit-language")
})

test("Create custom audio project with custom language project", async ({ customAudioProject, projectAudioType, description, AudioAbbreviation, customAudioLanguage }) => {
  // Create a custom audio project with a custom language
  await customProjectTargetLanguage(window, expect, customAudioProject, projectAudioType, description, AudioAbbreviation, "add-language", customAudioLanguage, 'capl', "RTL", "edit-language")
})

/* Changing text translation project target language */
//text translation project
test("Changing text translation project language from English to Persian", async ({ textProject }) => {
  // Change the text translation project language
  await projectTargetLanguage(window, expect, textProject, "persian", "Persian (Farsi)")
})

test("Changing text translation project language from Persian to English", async ({ textProject, english }) => {
  // Change the text translation project language
  await projectTargetLanguage(window, expect, textProject, english.toLowerCase(), english)
})

test("Changing text translation project language from English to new custom text translation language", async ({ textProject, customTextLanguage }) => {
  // Change the text translation project language
  await projectTargetLanguage(window, expect, textProject, "custom text", customTextLanguage)
  await checkProjectName(window, expect, textProject)
  await goToProjectPage(window, expect)
})

// obs project
test("Changing obs project language from English to new custom obs project language", async ({ obsProject, customObsLanguage }) => {
  // Change the OBS project language
  await projectTargetLanguage(window, expect, obsProject, "custom obs", customObsLanguage)
  await checkProjectName(window, expect, obsProject)
  await goToProjectPage(window, expect)
})

/* updating user profile */
test("Update user Profile", async () => {
  // Validate user profile page elements
  await userProfileValidaiton(window, expect);
  await expect(window.locator('input[name="given-name"]')).toBeVisible();
  await window.locator('input[name="given-name"]').fill("Bobby");
  await expect(window.locator('input[name="family-name"]')).toBeVisible();
  await window.locator('input[name="family-name"]').fill("kumar");
  await expect(window.locator('input[name="email"]')).toBeVisible();
  await window.locator('input[name="email"]').fill("kumar@gamil.com");
  await expect(window.locator('input[name="organization"]')).toBeVisible();
  await window.locator('input[name="organization"]').fill("vidya foundation");
  await expect(window.locator('input[name="selectedregion"]')).toBeVisible();
  await window.locator('input[name="selectedregion"]').fill("India");

  // Save the updated profile
  expect(await window.locator('//*[@id="save-profile"]')).toBeVisible();
  await window.locator('//*[@id="save-profile"]').click();

  // Verify the success message
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').textContent();
  expect(snackbar).toBe("Updated the Profile.");
})

/*changing app language english to hindi */
test("App language change English to hindi", async ({ english, hindi }) => {
  // Change the app language from English to Hindi
  await changeAppLanguage(window, expect, english, hindi);

  // Verify the language change and UI update
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').textContent();
  expect(snackbar).toBe("Updated the Profile.");

  const textHindi = await window.locator('//*[@aria-label="projects"]').allTextContents();
  expect(await textHindi[0]).toBe("प्रोफ़ाइल");
})

/*changing app language hindi to english */
test("App language change Hindi to English", async ({ hindi, english }) => {
  expect(await window.locator('//*[@aria-label="projectList"]')).toBeVisible();
  await window.locator('//*[@aria-label="projectList"]').click();
  await window.waitForTimeout(2000);

  // Verify the current page title
  const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
  expect(await title).toBe('प्रोजेक्ट्स');

  // Change the app language from Hindi to English
  await changeAppLanguage(window, expect, hindi, english);

  // Verify the language change and UI update
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').textContent();
  expect(snackbar).toBe("Updated the Profile.");
  const profile = await window.locator('//*[@aria-label="projects"]').allTextContents();
  expect(await profile[0]).toBe("Profile");
})

/*signing out */
test("Sign out the Application", async () => {
  await signOut(window, expect)
})

/* view users */
test("Click the view users button, log in with playwright user, and sign out", async ({ userName }) => {
  await showActiveUsers(window, expect)
  const tabContent = await window.locator('//*[@id="active-tab-content"]')
  const div = await tabContent.locator("div > div")
  for (let i = 0; i < await div.count(); i++) {
    if (await div.nth(i).textContent() === userName.toLowerCase()) {
      await div.nth(i).click()
      await window.waitForTimeout(1000)
      const title = await window.locator('//*[@aria-label="projects"]').textContent();
      await expect(title).toBe('Projects')
      await signOut(window, expect)
      break
    }
  }
})

/* user delete, check in archive and restore */
test("Delete the user from the active tab and check in the archived tab", async ({ userName }) => {
  await showActiveUsers(window, expect)
  const tabContent = await window.locator('//*[@id="active-tab-content"]', { timeout: 5000 })
  const items = await tabContent.locator('div > div')
  const div = await tabContent.locator("div > button")
  const archiveTabContent = await window.locator('//*[@id="archive-tab-content"]')
  const archiveItems = await archiveTabContent.locator('div > div')
  const archiveDiv = await archiveTabContent.locator('div > button')
  for (let i = 0; i < await items.count(); i++) {
    if (await items.nth(i).textContent() === userName.toLowerCase()) {
      await div.nth(i).click()
      await expect(window.locator('//*[@id="archived-tab"]')).toBeVisible()
      await window.locator('//*[@id="archived-tab"]').click()
      const text = await window.locator('//*[@id="archived-tab"]').textContent()
      await expect(text).toBe('Archived')
      if (await archiveItems.nth(i).textContent() === userName.toLowerCase()) {
        await archiveDiv.nth(i).click()
      }
      await window.locator('//*[@id="active-tab"]').click()
      await window.locator(`//*[@dataId="${userName.toLowerCase()}"]`).click()
      break
    }
  }
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(title).toBe('Projects')
})