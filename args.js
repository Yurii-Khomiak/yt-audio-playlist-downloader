const yargs = require('yargs');

yargs
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
    ...yargs.argv,
    playlistUrl: yargs.argv._[0]
};

