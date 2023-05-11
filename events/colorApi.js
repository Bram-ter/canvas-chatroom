import fetch from 'node-fetch';
import { parseString } from 'xml2js';

async function getColor() {
  const apiUrl = 'http://www.colourlovers.com/api/colors/random';

  try {
    const response = await fetch(apiUrl);
    const xmlData = await response.text();
  
    parseString(xmlData, (err, result) => {
      if (err) {
        console.log('Error parsing XML:', err);
      } else {
        const jsonData = JSON.stringify(result);
        console.log(jsonData);
      }
    });
  } catch (error) {
    console.log('An error occurred:', error);
  }
};

export default getColor;