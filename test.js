const clientId = 'bb7ed959d49c4e4aa37504863df90a38';
const clientSecret = 'd158d2dba8ab4df7b2a6dfd4f805096d';

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

// async function getTracks(token) {
//     const result = await fetch('https://api.spotify.com/v1/tracks?ids=7ouMYWpwJ422jRcDASZB7P%2C4VqPOruhp5EdPBeR92t6lQ%2C2takcwOaAZWiXQijPHIx7B', {
//         method: "GET", headers: { Authorization: `Bearer ${token}` }
//     });
//     const data = await result.json();
//     var name = data.name;
//     return name;
// }

// (async () => {
//     const token = await _getToken();
//     const data = await getTracks(token);
//     console.log(data);
// })();



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

function showInvalidLink() {
    msg6.innerHTML = "GET ANOTHER LINK U GROMP";
}

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


async function myFunc() {
    var input = document.querySelector("#user-input");
    msg.innerHTML = "hello" + input.value;
}

    ( async () => {
    try {
    // sampling legend by tevvenz as it has an obvious base drop;
    // const id = '05EG9LwFCVjkoYEWzsrHHO?si=bd2e5fafdd3e48be';
    // sampling too cold by sickmode
    const id = '77y3caTFtC3n4tGgyPUF87';
    const token = await _getToken();
    const audio_data = await audioAnalysis(token, id);
    const data_sections = audio_data.sections;
     var i = 1;
    var loudest = -999;
    var time;
    var assurement;
    var vari;
    for (const section of data_sections) {
        const {start,
      duration,
      confidence,
      loudness,
      tempo,
      tempo_confidence,
      key,
      key_confidence,
      mode,
      mode_confidence,
      time_signature,
      time_signature_confidence} = section;
        // confidence subject to change.
        if (loudness > loudest && confidence > 0.7) {
            loudest = loudness;
            time = start;
            assurement = confidence * 100;
            vari = time_signature;
        } 
        console.log(`Section ${i}`);
        console.log("Start:", start);
        console.log("Confidence:", confidence);
        console.log("Loudness:", loudness);
        console.log(`time_signature ${time_signature}`);
        console.log(`mode ${mode}`);
        console.log(`key${key}`);

        console.log(`\n`);
        i++;
    }
    // Calculating time
     var min = 0;
        while (time > 60) {
            time = time - 60;
            min++;
        }

    console.log(time);
    console.log(loudest);
    console.log(`${min}mins and ${time} seconds`);
    } catch (error) {
      console.error('Error:', error);
    }
  })();