const yargs = require('yargs');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { argv } = yargs
    .option('destination', {
        alias: 'd',
        type: 'string',
        description: 'Path to a directory where output files\'ll be stored'
    })
    .option('album', {
        type: 'string',
        description: 'Album which\'ll be assigned to every downloaded file'
    })
    .option('artist', {
        type: 'string',
        description: 'Artist which\'ll be assigned to every downloaded file'
    })
    .help();

module.exports = {
    /** @type {string | null} */
    playlistUrl: argv._[0] || null,
    destination: argv.destination ||
        fs.mkdtempSync(`${os.tmpdir()}${path.sep}`),
    album: argv.album || '',
    artist: argv.artist || ''
};

