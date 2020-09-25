const path = require('path');
const EventEmitter = require('events');
const args = require('./args');

const ytdl = require('youtube-dl');
const ffmpeg = require('fluent-ffmpeg');

const AUDIO_FORMAT = Object.freeze({
    MP3: 'mp3'
});

/**
 * Names of properties of this object exactly match ffmpeg's metadata options.
 * @typedef {object} AudioFileMetadata
 * @property {string} [title]
 * @property {string} [album]
 * @property {string} [artist]
 * @property {number} [track]
 */

/**
 * @param {AudioFileMetadata} metadata
 * @returns {string[]}
 */
const getMetadataOutputOptions = metadata => Reflect.ownKeys(metadata)
    .map(property => ['-metadata', `${property}=${metadata[property]}`])
    .reduce((options, metadataOption) => [...options, ...metadataOption], []);

/**
 * @typedef {object} ConvertationConfiguration
 * @property {string} outputFile
 * @property {AudioFileMetadata} metadata
 */

/**
 * @param {import('stream').Readable} stream
 * @param {ConvertationConfiguration} configuration
 */
const convertToAudioAndWriteToFile = (stream, configuration) => (
    new Promise((resolve, reject) => new ffmpeg(stream)
        .output(configuration.outputFile)
        .outputOptions(
            ...getMetadataOutputOptions(configuration.metadata || {})
        )
        .on('end', () => resolve())
        .on('error', err => reject(err))
        .run()
    )
);

class PlaylistDownloader {
    /**
     * @typedef {object} OutputConfiguration
     * @property {string} destinationDirectory
     * @property {string} [audioFormat]
     * @property {AudioFileMetadata} [metadata]
     */

    /**
     * @param {string} url
     * @param {OutputConfiguration} configuration
     */
    constructor(url, {
        destinationDirectory,
        audioFormat = AUDIO_FORMAT.MP3,
        metadata = {}
    } = {}) {
        this._emitter = new EventEmitter();
        this._currentIndex = 0;

        this._url = url;
        this._destinationDirectory = destinationDirectory;
        this._audioFormat = audioFormat;
        this._metadata = metadata;
    }

    /**
     * @param {(title: string) => void} listener
     */
    onDownloadedFile(listener) {
        this._emitter.on('downloadedFile', listener);
    }

    download() {
        this._downloadNext(this._url);
    }

    _downloadNext(url) {
        const stream = ytdl(url);
        stream.on('error', this._logError.bind(this));
        stream.on('info', info => this._convertAndWriteToFile(stream, info));
        stream.on('next', url => this._downloadNext(url));
    }

    async _convertAndWriteToFile(stream, { title }) {
        const outputFile = this._getOutputFilepath(title);

        await convertToAudioAndWriteToFile(stream, {
            outputFile,
            metadata: {
                ...this._metadata,
                title,
                track: this._currentIndex + 1
            }
        });

        this._currentIndex++;
        this._emitter.emit('downloadedFile', title, this._currentIndex);
    }

    _getOutputFilepath(title) {
        const outputFilename =
            `${this._sanitizeTitle(title)}.${this._audioFormat}`;
        const outputFile = path.join(
            this._destinationDirectory,
            outputFilename
        );
        return outputFile;
    }

    _sanitizeTitle(title) {
        return title
            .replace(/\\/g, 'BACKSLASH')
            .replace(/\//g, 'SLASH')
            .replace(/\|/g, 'BAR')
            .replace(/\"/g, 'DQUOTE')
            .replace(/\*/g, 'STAR')
            .replace(/\&/g, 'AND')
            .replace(/\?/g, 'QSTNMRK');
    }

    _logError(err) {
        console.error(err);
    }
}

const download = ({
    playlistUrl,
    destination,
    album,
    artist
}) => {
    const downloader = new PlaylistDownloader(playlistUrl, {
        destinationDirectory: destination,
        metadata: { album, artist }
    });
    downloader.onDownloadedFile((title, index) => {
        console.log(`${index}. Downloaded "${title}".`);
    });

    downloader.download();
    console.log(`Downloading into "${destination}".`);
};

const main = () => {
    if (!args.playlistUrl) {
        console.log('Playlist URL wasn\'t provided.');
        process.exit(1);
    }

    download(args);
};

main();

