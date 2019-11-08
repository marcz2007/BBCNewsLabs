/**
 * ScriptParser.js contains the router.post handler and specifies the response using the parseJson function.
 * This enables the response to contain the properly formatted json from the unformatted POST request.
 * @type {createApplication}
 */
const express = require('express');
const router = express.Router();

/**
 * Function parses an unformatted json and returns an object array of the formatted version.
 * @param json The unformatted JSON found in the body of the POST request.
 * @returns {Array} Obj which has the properly formatted text for the JSON.
 */
function parseJson(json) {

    let meta = [];
    let finishedMeta = false;
    let english = [];
    let persian = [];
    let jsonRemovedNull = [];
    let intCounter = 0;

    let split = [];
    let characterSpeech = "";

    // First, remove all the empty parentheses
    json.forEach((text) => {
        if (text != '') {
            jsonRemovedNull[intCounter] = text;
            intCounter++;
        }
    });
    // console.log(jsonRemovedNull);

    let obj = [];
    // After creating the empty arrays for meta, english, persian and creating the obj array which will store them all,
    // the for loop will loop through all the lines in the json and provide checks for each type of incoming json line
    for (let i = 0; i < jsonRemovedNull.length; i++) {
        // The first if is only satisfied at the end of a complete set i.e when persian, the last in the set, has at least
        // one entry and the current entry is not persian (i.e it is meta). At this point, the arrays are pushed into the
        // obj array using an object literal. Then, the arrays are emptied, and the finishedMeta boolean is set back to false
        if (persian.length > 0 && jsonRemovedNull[i].charAt(0).match(/[a-z,A-Z, 0-9]/gm)) {
            obj.push({Meta: meta, English: english.join(''), Persian: persian.join('')});
            meta = [];

            english = [];
            persian = [];
            finishedMeta = false;
        }

        // The second if statement checks first for the inclusion of ':' which usually signifies the end of the meta tags
        // and the beginning of the english and persian script. In order to accomodate the times where a character name
        // is used e.g 'Dave:' followed by speech, I have split the string on the colon.
        if (jsonRemovedNull[i].includes(":") && !finishedMeta) {
            split = JSON.stringify(jsonRemovedNull[i]).split(":");
            // If the colon is followed by english words then the first half of the split is sent to meta and the second
            // half of the string is pushed to english. Otherwise, in the case of their being numbers such as with 'GFX: 5 - 6',
            // it is simply set to meta. In both cases, a colon signifies the end of meta so finishedMeta is set to true.
            if (split[1].charAt(2).match(/[a-z,A-Z]/gm)) {

                meta.push(split[0].substring(1,split[0].length) + ":");
                characterSpeech = split[1];
                english.push(split[1].substring(0, split[1].length-1).trim());
                finishedMeta = true;

            } else {
                meta.push(jsonRemovedNull[i]);
                finishedMeta = true;
            }
            // The third if conditional checks if the characters match english characters or numbers. If so and all the meta
            // tags have finished, then the string is pushed to the english array. Otherwise, there must still be meta tags
            // so it is pushed to meta.
        } else if (jsonRemovedNull[i].charAt(0).match(/[a-z,A-Z,0-9,...]/gm)) {
            if (finishedMeta) {
                english.push(jsonRemovedNull[i]);
            } else {
                meta.push(jsonRemovedNull[i]);
            }
            // The final conditional occurs where it is not english, and meta does not have anything inside its array - in
            // this case, it must be persian. But if meta is empty, it must be a meta tag so it is pushed to the meta array.
        } else {
            if (meta.length === 0) {
                meta.push(jsonRemovedNull[i]);
            } else {
                persian.push(jsonRemovedNull[i]);
            }


        }


    }
    // Finally, we return obj which contains all the neatly structured JSONs as an array object.
    return obj;
}

/**
 * The router.post handles all post requests sent to localhost:8080/scriptParser . The entire body of the post request
 * is sent to the parseJson function. The constant extractedData stores the result and this is then used as the
 * body of the request's return.
 */
router.post('/', (req, res, next) => {
    const entireData = req.body;
    const extractedData = parseJson(entireData);

    res.status(200).json({
        message: 'Handling POST requests to /scriptParser',
        script: extractedData
    });
});

module.exports = router;
