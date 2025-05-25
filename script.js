
console.log('loading..');
let currentSong = new Audio();
var currentFolder = "BeatFlare";
let songs = [];  // Add this for global songs array
var currentSongIndex = 0; // Add this for global song index

async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let responce = await a.text();
    let div = document.createElement('div');
    div.innerHTML = responce;
    let tds = div.getElementsByTagName('a');

    // Clear and update the global songs array
    songs = []; // Reset global songs array when switching folders

    for (let index = 0; index < tds.length; index++) {
        const element = tds[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href); // Add each song's URL to the global array
        }
    }

    // Update the UI with the songs
    let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0];
    songUL.innerHTML = '';
    songs.forEach((song, index) => {
        let temp = song;
        songUL.innerHTML += `<li>
                                <div class="musiclogo">
                                    <img src="data/music-logo.png" alt="music-logo" width="36px" height="36px" />
                                </div>
                                <div class="info">
                                    <div class="name">
                                        ${decodeURI(temp.replace(".mp3", '').replaceAll('%2C', ',').split(`/${currentFolder}/`)[1])}
                                    </div>
                                    <div class="artist">Beat Flare</div>
                                </div>
                            </li>`;
    });

    // Attach event listeners to the songs in the list
    Array.from(document.querySelector(".songlist").getElementsByTagName('li')).forEach((e, index) => {
        e.addEventListener('click', () => {
            const songName = e.querySelector(".name").innerHTML.trim();
            playMusic(songName, index);  // Pass song name and index
        });
    });

    return songs;
}


function secondsToMinuts(seconds) {
    // Convert to an integer to discard any floating point values
    seconds = Math.floor(seconds);
    
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad with zeros if necessary to ensure two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
let playMusic = (track, index) => {
    currentSong.src = `/${currentFolder}/` + track + ".mp3";
    currentSong.play();
    play.src = "data/pause-player.png";
    document.querySelector('.songinfo').innerHTML = `<img src="data/songicon.png" alt="songicon" width="50px" height="50px">` + track;

    // Update the global currentSongIndex to reflect the new track index
    currentSongIndex = index;
};


async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/Songs/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let all = div.getElementsByTagName('a');
    let array = Array.from(all);

    for (let i = 0; i < array.length; i++) {
        let e = array[i];
        if (e.href.includes("/Songs/")) {
            let folder = (e.href.split("/Songs/").slice(-1));
            
            // Try loading metadata asynchronously without affecting other operations
            loadMetadata(folder);  // Moved to a separate function for clarity
            
            // adding playlists (synchronously so this part still works)
            cardContainer.innerHTML += `
                <div class="card flex flexcol" data-folder="${folder}">
                    <img src="data/play.png" alt="Play" width="40px" class="play" />
                    <img src="/Songs/${folder}/cover.jpg" alt="Banner" width="150px" height="150px"/>
                    <h3>Loading...</h3>  <!-- Placeholder until info.json loads -->
                    <p>Loading description...</p>
                </div>`;
        }
    }
    //Adding library name to songs list so that user know which library is opened
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            console.log(item.currentTarget.dataset);
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            
        });
    });

    // loading playlist
   
}

// Separate function to load the info.json and update the DOM
async function loadMetadata(folder) {
    let responce
    try {
        let a = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`);
        responce = await a.json();

        // Find the relevant card in the DOM and update its content
        let card = document.querySelector(`.card[data-folder="${folder}"]`);
        if (card) {
            card.querySelector('h3').textContent = responce.title;
            card.querySelector('p').textContent = responce.description;
        }
        
    } catch (err) {
        console.error(`Failed to load metadata for folder ${folder}:`, err);
    }

}


async function main() {
    var songs = await getSongs(`Songs/${currentFolder}`);
    console.log(currentFolder)
    //attatching event listner to play prevoious and next.
    play.addEventListener('click',()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src="data/pause-player.png"
        }
        else{
            currentSong.pause();
            play.src="data/play-player.png"
        }
    })
    //play pause with  space bar
    document.addEventListener('keydown', function(event) {
        // Check if the key pressed is the Spacebar (key code 32)
        if (event.code === 'Space') {
            if(currentSong.paused){
                currentSong.play();
                play.src="data/pause-player.png"
            }
            else{
                currentSong.pause();
                play.src="data/play-player.png"
            }
        }
    });
    
    //Automatic displaying albums on page;
    displayAlbums()

    //listen for time update event
    currentSong.addEventListener('timeupdate', ()=>{
        document.querySelector('.currenttime').innerHTML=secondsToMinuts(currentSong.currentTime)
    document.querySelector('.totaltime').innerHTML=secondsToMinuts(currentSong.duration);
    document.querySelector(".circle").style.left=((currentSong.currentTime/currentSong.duration)*100)+"%";
    document.querySelector('.played').style.width=((currentSong.currentTime/currentSong.duration)*100+1)+"%"
    let percent=(currentSong.currentTime/currentSong.duration)*100
    if(percent>=100){
        play.src="data/play-player.png"
    }
    })
    //event listener for seekbar
    
    document.querySelector('.seekbar').addEventListener('click',(e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left=percent+"%";
        currentSong.currentTime=((currentSong.duration)*percent)/100;
    })
    

var currentSongIndex = 0;

const playMusic = (track, index) => {
    // Ensure the track is defined before playing
    if (!track) {
        console.error("Track is undefined!");
        return;
    }

    currentSong.src = `/${currentFolder}/` + track + ".mp3";
    currentSong.play();
    play.src = "data/pause-player.png";
    document.querySelector('.songinfo').innerHTML = `<img src="data/songicon.png" alt="songicon" width="50px" height="50px">` + track;

    // Update the global currentSongIndex to reflect the new track index
    currentSongIndex = index;
};


// Modified getSongs function to capture song names and manage their index
async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let responce = await a.text();
    let div = document.createElement('div');
    div.innerHTML = responce;
    let tds = div.getElementsByTagName('a');
    let songs = [];
    for (let index = 0; index < tds.length; index++) {
        const element = tds[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }

    // Show all the songs in the song list
    let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0];
    songUL.innerHTML = '';
    songs.forEach((song, index) => {
        let temp = song;
        songUL.innerHTML += `<li>
                                    <div class="musiclogo">
                                        <img src="data/music-logo.png" alt="music-logo" width="36px" height="36px" />
                                    </div>
                                    <div class="info">
                                        <div class="name">
                                            ${decodeURI(temp.replace(".mp3", '').replaceAll('%2C', ',').split(`/${currentFolder}/`)[1])}
                                        </div>
                                        <div class="artist">Beat Flare</div>
                                    </div>
                                </li>`;
    });

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName('li')).forEach((e, index) => {
        e.addEventListener('click', () => {
            const songName = e.querySelector(".name").innerHTML.trim();
            playMusic(songName, index);  // Pass song name and index
        });
    });

    return songs;
}

// Previous and Next button functionality
previous.addEventListener('click', () => {
    // Check if we're not at the first song
    if (currentSongIndex > 0) {
        currentSongIndex--;
    } else {
        currentSongIndex = songs.length - 1;  // Wrap around to the last song if we're at the start
    }

    // Play the previous song
    const previousSong = decodeURI(songs[currentSongIndex].replace(".mp3", '').replaceAll('%2C', ',').split(`/${currentFolder}/`)[1]);
    playMusic(previousSong, currentSongIndex);
});

next.addEventListener('click', () => {
    // Check if we're not at the last song
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;
    } else {
        currentSongIndex = 0;  // Wrap around to the first song if we're at the end
    }

    // Play the next song
    const nextSong = decodeURI(songs[currentSongIndex].replace(".mp3", '').replaceAll('%2C', ',').split(`/${currentFolder}/`)[1]);
    playMusic(nextSong, currentSongIndex);
});



   //for hamburger
   let flag=0;
   document.querySelector('.hamburger').addEventListener('click',(e)=>{
    if(flag==0){
        document.querySelector('.containerleft').style.left='0';
        flag=1;
        hamburger.src='data/cross-mark.png'
        hamburger.style.width='30px'
    }
    else if(flag==1){
        document.querySelector('.containerleft').style.left='-100%';
        flag=0;
        hamburger.src='data/hamburger.png'
        hamburger.style.width='35px' 
    }
   })
   
   //adding event listner to control volume
   let volumebar=document.querySelector('.volumebar');
   volumebar.addEventListener('click',(e)=>{
        let percentvol = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".vol-circle").style.left=percentvol+"%";
        document.querySelector('.totalvolume').style.width=percentvol+4+"%";
        currentSong.volume=percentvol/100;
   })
   //adding event listner to animate  volume bar.

   let volume_adjust = document.querySelector('.volume');
   volume_adjust.addEventListener('mouseenter',(e)=>{
        document.querySelector('.volumebar').style.transform='scale(1)'
   })
   volume_adjust.addEventListener('mouseleave',(e)=>{
        document.querySelector('.volumebar').style.transform='scale(0)'
   })
   //adding event listner to mute using button.
   document.querySelector('.volume img').addEventListener('click',(e)=>{
    currentSong.volume=0;
   })

   let click=0;
   let volumeimg=document.querySelector('.volume img')
   volumeimg.addEventListener('click',(e)=>{
    if(click==0){
        currentSong.volume=0;
        click=1;
        volumeimg.src='data/mute.png'
        
        document.querySelector(".vol-circle").style.left=0;
        document.querySelector('.totalvolume').style.width=0;
    }
    else if(click==1){
        click=0;
        volumeimg.src='data/volume.png'
        currentSong.volume=1;
        document.querySelector(".vol-circle").style.left=(100)+"%";
        document.querySelector('.totalvolume').style.width=(104)+"%";
    }
   })
   





}
main();
