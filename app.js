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
const getTrackDetails = async(token, id) => {
    const result = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    const data = await result.json();
    return data;
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
const timeCalc = (seconds) => {
    var min = 0;
    while (seconds > 60) {
        seconds = seconds - 60;
        min++;
    }
    var flag = false;
    if (min === 1) {
        flag = true;
    }
    if (Math.floor(seconds) === 0) {
        if (flag === true) {
            return `${min}:00 min`;
        }
        return `${min}:00 mins`;
    }
    if (flag === true) {
        return `${min}:${Math.floor(seconds)} min`;
    }
    return `${min}:${Math.floor(seconds)} mins`;
}

//////////////////////////////////////////////////////////////////////////////////
///////////////////////     Html printing functions      /////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// show invalid Link was used
function showInvalidLink() {
    document.getElementById("result-page").classList.add("invalid");
    document.getElementById("invalid").classList.add("show");
    document.getElementById("invalid-btn").classList.add("show");
    invalid.innerHTML = "Link is invalid";
    document.getElementById("action-container").classList.add("hide");
}

var hidden = true;
// Run when button is pressed
async function main() {
    try {
        // Scoll page
        var targetDiv = document.getElementById("action-container");

        // Scroll to the top position of the target div
        targetDiv.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        var input = document.querySelector("#user-input");
        var id = getSongId(input.value);
        if (id === undefined && hidden === false) {
            document.getElementById("result-page").classList.remove("show");
            showInvalidLink();
            return;
        } else if (id === undefined) {
            showInvalidLink();
            return;
        }

        // Make results div appear
        document.getElementById("result-page").classList.add("show");

        // sampling legend by tevvenz as it has an obvious base drop;
        // id = '05EG9LwFCVjkoYEWzsrHHO?si';
        // sampling too cold by sickmode
        // id = '0vBOyqICis94fkSwJbfUeF?si';

        const token = await _getToken();
        const audio_data = await audioAnalysis(token, id);
        const data_sections = audio_data.sections;
        const song_length = audio_data.track.duration;

        // Get track name: if cut if too long
        const data = await getTrackDetails(token, id);
        if (data.name.length > 15) {
            data.name= data.name.substring(0, 15) + "...";
            document.getElementById("artistName").style.marginTop = "60px";
        }

        songName.innerHTML = data.name;
        artistName.innerHTML = data.artists[0].name;
        
        var songImg = document.getElementById("songImg");
        songImg.src = data.album.images[0].url;

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

            if (loudness > loudest1 && flag === false) {
                loudest1 = loudness;
                time1 = start;
            } else if (flag === true && loudness > loudest2) {
                loudest2 = loudness;
                time2 = start;
            }
        }
        intro.innerHTML = 'Predicted drop times: ';
        calculated1.innerHTML = timeCalc(time1)
        // msg5.innerHTML = `FIRST VOLUME IS LOUDEST AT ${loudest1}`;

        calculated2.innerHTML = timeCalc(time2);
        // msg7.innerHTML = `SECOND VOLUME IS LOUDEST AT ${loudest2}`;
        hidden = false;
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

// Get a reference to the refresh button
var refreshButton = document.getElementById("invalid-btn");
refreshButton.addEventListener("click", function() {
    // refresh the page
    location.reload();
    window.scrollTo({
        top: 0,
        left: 0,
    });
});
