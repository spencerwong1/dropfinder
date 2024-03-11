const clientId = 'bb7ed959d49c4e4aa37504863df90a38';
const clientSecret = 'd158d2dba8ab4df7b2a6dfd4f805096d';
//////////////////////////////////////////////////////////////////////////////////
// Gets the token from spotify
const _getToken = async() => { 
    try {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa( clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        console.log(`Token retrival successful!\n.\n.\n.`);
        return data.access_token;
    } catch (error) {
        console.log("Token retrival unsuccessful");
    } 
}

// Returns the track name
const getTrackName = async(token, id) => {
    const result = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    const data = await result.json();
    var name = data.name;
    return name;
}

// Gets the songid from link
function getSongId(songLink) {
    // 2 cases
    if (songLink.includes("open.spotify.com/")) {
        // Song Link
        var split = songLink.split("/")
        return split[split.length - 1].split("?")[0];
    } else if (songLink.includes("spotify:track:")) {
        // Spotify URL
        return songLink.split(":")[2];
    }
}

// get the analysis of the song from spotify
async function audioAnalysis(token, id) {
    const result = await fetch(`https://api.spotify.com/v1/audio-analysis/${id}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    const data = await result.json();
    return data;
}

const _getTrack = async (token, trackEndPoint) => {
    const result = await fetch(`${trackEndPoint}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });
    const data = await result.json();
    return data;
}

// Calculate time
const timeCalc = (time) => {
    var min = 0;
    while (time > 60) {
        time = time - 60;
        min++;
    }
    return `${min}mins and ${time}secs`;
}

//////////////////////////////////////////////////////////////////////////////////
///////////////////////     Html printing functions      /////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// show invalid Link was used
function showInvalidLink() {
    msg6.innerHTML = "GET ANOTHER LINK U GROMP";
}


// Run when button is pressed
async function main() {
    try {
        var input = document.querySelector("#user-input");

        var id = getSongId(input.value);
        if (id === undefined) {
            showInvalidLink();
            exit(1);
        }

        // sampling legend by tevvenz as it has an obvious base drop;
        // id = '05EG9LwFCVjkoYEWzsrHHO?si';
        // sampling too cold by sickmode
        // id = '0vBOyqICis94fkSwJbfUeF?si';

        const token = await _getToken();
        const audio_data = await audioAnalysis(token, id);
        const data_sections = audio_data.sections;
        const song_length = audio_data.track.duration;

        // Get track name:
        const name = await getTrackName(token, id);
        msg3.innerHTML = `your song is: ${name}`;

        var loudest1 = -999;
        var time1;
        var loudest2 = -999;
        var time2;
        let flag = false;

        // Confidence didnt prove to be useful
        for (const section of data_sections) {
            const {start, confidence, loudness} = section;
            if (start > (song_length / 2)) {
                flag = true;
            }

            if (loudness > loudest1  && flag === false) {
                loudest1 = loudness;
                time1 = start;
            } else if (flag === true && loudness > loudest2) {
                loudest2 = loudness;
                time2 = start;
            }
        }
        
        msg4.innerHTML = `FIRST BASE DROP IS AT TIME: ` + timeCalc(time1);
        msg5.innerHTML = `FIRST VOLUME IS LOUDEST AT ${loudest1}`;

        msg6.innerHTML = `SECOND BASE DROP IS AT TIME: ` + timeCalc(time2);
        msg7.innerHTML = `SECOND VOLUME IS LOUDEST AT ${loudest2}`;
    } catch (error) {
        console.error('Error:', error);
    }
    };


//////////////////////////////////////////////////////////////////////////////////
///////////////////////////BUTTONS AND THEIR LISTENERS////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
const playlistBtn = document.getElementById("playlist-btn");
const songBtn = document.getElementById("sample-song-btn");
var link = document.getElementById("link");

playlistBtn.addEventListener("click", function() {
    const newPageURL = 'https://open.spotify.com/playlist/75R6F1Alnm18z65A0NwYpe?si=9a326815b80b484f';
    window.location.href = newPageURL;
});

const copyLink = () => {
    var copyText = document.getElementById("link");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    showCopiedLink(copyText.value);
}

const showCopiedLink = (text) => {
    document.getElementById("sample-song-btn").innerHTML = "Link copied";
}