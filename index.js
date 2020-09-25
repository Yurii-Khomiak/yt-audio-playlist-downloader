const PlaylistDownloader = require('./playlist_downloader');
const args = require('./args');

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

