const yargs = require('yargs');

yargs
    .option('destination', {
        alias: 'd',
        type: 'string',
        description: 'Path to a directory where output files\'ll be stored'
    })
    .option('', {

    });

module.exports = yargs.argv;

