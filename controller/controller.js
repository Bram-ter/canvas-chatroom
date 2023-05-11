import fetch from 'node-fetch';
import { parseString } from 'xml2js';

const home = (req, res) => {
  const apiUrl = 'http://www.colourlovers.com/api/colors/random';

  // try {
  //   const response = fetch(apiUrl);
  //   const xmlData = response.text();
  
  //   parseString(xmlData, (err, result) => {
  //     if (err) {
  //       console.log('Error parsing XML:', err);
  //     } else {
  //       const jsonData = JSON.stringify(result);
  //       console.log(jsonData);
  //     }
  //   });
  // } catch (error) {
  //   console.log('An error occurred:', error);
  // }
  res.render('pages/index');
};

export default home; 