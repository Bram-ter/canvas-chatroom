import fetch from 'node-fetch';
import { parseString } from 'xml2js';
import getRandomColor from '../events/getRandomColor.js';

const home = (req, res) => {
  try {
    const randomColor = getRandomColor();
    res.render('pages/index', { randomColor });
  } catch (error) {
    console.log('An error occurred:', error);
    res.status(500).send('An error occurred while generating the random color.');
  }
};

// const apiUrl = 'http://www.colourlovers.com/api/colors/random';

//   try {
//     fetch(apiUrl)
//     .then(response => response.text())
//     .then(xmlData => {
//       parseString(xmlData, (err, result) => {
//         if (err) {
//           console.log('Error parsing XML:', err);
//         } else {
//           const colors = result.colors.color;
//           const rgbValues = colors.map(color => {
//             const red = color.rgb[0].red[0];
//             const green = color.rgb[0].green[0];
//             const blue = color.rgb[0].blue[0];
//             return { red, green, blue };
//           });
//           console.log(rgbValues);
//           res.render('pages/index', { rgbValues });
//         }
//       });
//     })
//   } catch (error) {
//     console.log('An error occurred:', error);
//   }
// };

export default home; 