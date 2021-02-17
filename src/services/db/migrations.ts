export const migrations = [
  // All Songs
  ` 
  -- Up
  CREATE TABLE allsongs (
    _id VARCHAR(36) PRIMARY KEY,
    path TEXT,
    size TEXT NOT NULL,
    inode TEXT NOT NULL,
    deviceno TEXT NOT NULL,
    title TEXT,
    date TEXT,
    year TEXT,
    lyrics TEXT,
    releaseType TEXT,
    bitrate NUMBER,
    codec TEXT,
    container TEXT,
    duration NUMBER,
    sampleRate NUMBER,
    hash TEXT
  );
  -- Down
  DROP TABLE IF EXISTS 'allsongs';
  `,

  // Artists
  `
  -- Up
  CREATE TABLE artists (
    artist_id VARCHAR(36) PRIMARY KEY,
    artist_mbid TEXT,
    artist_name TEXT,
    artist_coverPath TEXT
  );

  CREATE TABLE artists_bridge (
    id integer PRIMARY KEY AUTOINCREMENT,
    song VARCHAR(36),
    artist VARCHAR(36),
    FOREIGN KEY(song) REFERENCES allsongs(_id),
    FOREIGN KEY(artist) REFERENCES artists(artist_id)
  );

  -- Down
  DROP TABLE IF EXISTS 'artists_bridge';
  DROP TABLE IF EXISTS 'artists';
  `,

  // Genre
  `
  -- Up
  CREATE TABLE genre (
    genre_id VARCHAR(36) PRIMARY KEY,
    genre_name text
  ); 

  CREATE TABLE genre_bridge (
    id integer PRIMARY KEY AUTOINCREMENT,
    song VARCHAR(36),
    genre VARCHAR(36),
    FOREIGN KEY(song) REFERENCES allsongs(_id),
    FOREIGN KEY(genre) REFERENCES genre(genre_id)
  );
  -- Down
  DROP TABLE IF EXISTS 'genre_bridge';
  DROP TABLE IF EXISTS 'genre';
  `,

  // Albums
  `
  -- Up
  CREATE TABLE albums (
    album_id VARCHAR(36) PRIMARY KEY,
    album_name TEXT,
    album_artist TEXT,
    album_coverPath TEXT
  );

  CREATE TABLE album_bridge (
    id integer PRIMARY KEY AUTOINCREMENT,
    song VARCHAR(36),
    album VARCHAR(36),
    FOREIGN KEY(song) REFERENCES allsongs(_id),
    FOREIGN KEY(album) REFERENCES albums(album_id)
  );

  -- Down
  DROP TABLE IF EXISTS 'album_bridge';
  DROP TABLE IF EXISTS 'albums';
  `,

  // Playlists
  `
  -- Up
  CREATE TABLE playlists (
    playlist_id integer PRIMARY KEY AUTOINCREMENT,
    playlist_name TEXT NOT NULL,
    playlist_coverPath TEXT
  );

  CREATE TABLE playlist_bridge (
    id integer PRIMARY KEY AUTOINCREMENT,
    song VARCHAR(36),
    playlist VARCHAR(36),
    FOREIGN KEY(song) REFERENCES allsongs(_id),
    FOREIGN KEY(playlist) REFERENCES genre(playlist_id)
  );

  -- Down
  DROP TABLE IF EXISTS 'playlist_bridge';
  DROP TABLE IF EXISTS 'playlists';
    `,
]
