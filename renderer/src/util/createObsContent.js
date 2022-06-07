import moment from 'moment';
import { environment } from '../../environment';
import * as logger from '../logger';
import OBSData from '../lib/OBSData.json';
import OBSFront from '../lib/OBSfront.md';
import OBSBack from '../lib/OBSback.md';
import OBSLicense from '../lib/OBSLicense.md';
import JsonToMd from '../obsRcl/JsonToMd/JsonToMd';

const path = require('path');
const md5 = require('md5');

const bookAvailable = (list, id) => list.some((obj) => obj.id === id);

export const createObsContent = (username, project, direction, id,
  importedFiles, copyright) => {
  logger.debug('createObsContent.js', 'In OBS md content creation');

  return new Promise((resolve) => {
    const ingredients = {};
    const newpath = localStorage.getItem('userPath');
    const folder = path.join(newpath, 'autographa', 'users', username, 'projects', `${project.projectName}_${id}`, 'content');
    const licenseFolder = path.join(newpath, 'autographa', 'users', username, 'projects', `${project.projectName}_${id}`);
    const fs = window.require('fs');

    logger.debug('createObsContent.js', 'Creating the story md files');
    // eslint-disable-next-line import/no-dynamic-require
    OBSData.forEach(async (storyJson) => {
      const currentFileName = `${storyJson.storyId.toString().padStart(2, 0)}.md`;
      if (bookAvailable(importedFiles, currentFileName)) {
        logger.debug('createObsContent.js', `${currentFileName} is been Imported`);
        const file = importedFiles.filter((obj) => (obj.id === currentFileName));
        const fs = window.require('fs');
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }
        fs.writeFileSync(path.join(folder, currentFileName), file[0].content, 'utf-8');
        const stats = fs.statSync(path.join(folder, currentFileName));
        ingredients[path.join('content', currentFileName)] = {
          checksum: {
            md5: md5(file[0].content),
          },
          mimeType: 'text/markdown',
          size: stats.size,
          scope: {},
        };
        // ingredients[path.join('content', currentFileName)].scope[book] = [];
      } else {
        logger.debug('createObsContent.js', 'Creating the md file using RCL fuvntion JsonToMd');
        const file = JsonToMd(storyJson, '');
        const fs = window.require('fs');
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }
        logger.debug('createObsContent.js', 'Writing File to the Content Directory');
        fs.writeFileSync(path.join(folder, currentFileName), file);
        const stats = fs.statSync(path.join(folder, currentFileName));
        ingredients[path.join('content', currentFileName)] = {
          checksum: {
            md5: md5(file),
          },
          mimeType: 'text/markdown',
          size: stats.size,
          scope: {},
        };
        // ingredients[path.join('content', currentFileName)].scope[book] = [];
      }
    });
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    // OBS front and back files add to content
    logger.debug('createObsContent.js', 'Creating OBS front and back md file in content');
    fs.writeFileSync(path.join(folder, 'front.md'), OBSFront);
    let obsstat = fs.statSync(path.join(folder, 'front.md'));
    ingredients[path.join('content', 'front.md')] = {
      checksum: {
        md5: md5(OBSFront),
      },
      mimeType: 'text/markdown',
      size: obsstat.size,
      role: 'pubdata',
    };
    fs.writeFileSync(path.join(folder, 'back.md'), OBSBack);
    obsstat = fs.statSync(path.join(folder, 'back.md'));
    ingredients[path.join('content', 'back.md')] = {
      checksum: {
        md5: md5(OBSBack),
      },
      mimeType: 'text/plain',
      size: obsstat.size,
      role: 'title',
    };
    // OBS License
    fs.writeFileSync(path.join(licenseFolder, 'LICENSE.md'), OBSLicense);
    obsstat = fs.statSync(path.join(licenseFolder, 'LICENSE.md'));
    ingredients[path.join('LICENSE.md')] = {
      checksum: {
        md5: md5(OBSLicense),
      },
      mimeType: 'text/markdown',
      size: obsstat.size,
    };
    // ag setting creation
    const settings = {
      version: environment.AG_SETTING_VERSION,
      project: {
        textStories: {
          scriptDirection: direction,
          starred: false,
          description: project.description,
          copyright: copyright.title,
          lastSeen: moment().format(),
          refResources: [],
          bookMarks: [],
        },
      },
    };
    logger.debug('createObsContent.js', 'Creating ag-settings.json file in content');
    fs.writeFileSync(path.join(folder, 'ag-settings.json'), JSON.stringify(settings));
    const stat = fs.statSync(path.join(folder, 'ag-settings.json'));
    ingredients[path.join('content', 'ag-settings.json')] = {
      checksum: {
        md5: md5(settings),
      },
      mimeType: 'application/json',
      size: stat.size,
      role: 'x-autographa',
    };

      resolve(ingredients);
  });
  };
