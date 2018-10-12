// TODO make credits popup on mouseover for desktop or click (tap) for iOS
// FIXME Doesn't work on iPad
// TODO make responsive

const timerDisplay = document.getElementById('timerDisplay');
const endChime = new Audio("Electronic_Chime.wav");
// const endChime = new Audio("https://dl.dropboxusercontent.com/s/gdo8a9xtfwey31g/Electronic_Chime.wav");
const timerLabel = document.getElementById('timerLabel');
const taskTime = document.getElementById('taskSession');
const shortBreakTime = document.getElementById('shortBreak');
const longBreakTime = document.getElementById('longBreak');
const checkMarks = document.getElementById('checkMarks');

let pomoCounter = 0;
let countDown;
let timerPaused = false;
let timerRunning = false;

function timer(seconds) {
  clearInterval(countDown);
  const then = Date.now() + seconds * 1000;
  displayTimeLeft(seconds);
  // displayEndTime(then);

  countDown = setInterval( () => {
    const secondsLeft = Math.round((then - Date.now()) / 1000);
    if(secondsLeft < 0) {
      endChime.play();
      clearInterval(countDown);
      return setTimeout(sessionTracker, 500);
    }
    displayTimeLeft(secondsLeft);
  }, 1000);
}

function displayTimeLeft(seconds) {
  const displayMinutes = (Math.floor(seconds / 60)).toString().padStart(2, '0');
  const displaySeconds = (seconds % 60).toString().padStart(2, '0');
  const displayTime = `${displayMinutes}:${displaySeconds.padStart(2, '0')}`;
  document.title = "Pomato: " + displayTime;
  timerDisplay.textContent = displayTime;
}

// Session Tracker - track where we are in the Pomodoro sequence
function sessionTracker() {
  pomoCounter = pomoCounter + 1;
  timerRunning = true;
  let time;
  if(pomoCounter % 2  === 0) checkMarks.textContent += '✔';
  if(pomoCounter < 8) {
    if(pomoCounter % 2  === 0) {
      timer(60 * parseInt(shortBreakTime.textContent));
      timerLabel.textContent = 'Short break';
    } else {
      timer(60 * parseInt(taskTime.textContent));
      timerLabel.textContent = 'Pomodoro';
    }
  } else if(pomoCounter === 8) {
    timer(60 * parseInt(longBreakTime.textContent));
    timerLabel.textContent = 'Long break';
  } else {
    //reset();
  }
}

let holdForReset = 0;
// TODO should not need to pause then reset, just hold to reset

function controlTimer() {
  clearTimeout(holdForReset);

  if (timerRunning) {
    if (timerPaused) {
      [minutes,seconds] = this.textContent.split(':');
      timer(60 * parseInt(minutes) + parseInt(seconds));
      timerPaused = false;
    } else {
      clearInterval(countDown);
      timerPaused = true;
    }
  } else { // timer is not running
    if (timerPaused) {
      timerPaused = false;
    } else {
      // next two lines are needed to make iOS play the sound.
      // without a touch event to play sound initially,
      // iOS won't play sound when timer is done
      if( isMobile.iOS() ) {
        // this might do it. only do what iOS needs if we are on an iOS
        endChime.play();
        endChime.pause();
      }
      sessionTracker();

    }
  }
}

// FIXME error: Uncaught (in promise) DOMException: The play() request was interrupted by a call to pause(). https://goo.gl/LdLk22
/*
Google recommends this fix: https://developers.google.com/web/updates/2017/06/play-request-was-interrupted#fix
// Show loading animation.
var playPromise = video.play();

if (playPromise !== undefined) {
  playPromise.then(_ => {
    // Automatic playback started!
    // Show playing UI.
  })
  .catch(error => {
    // Auto-play was prevented
    // Show paused UI.
  });
}
*/

timerDisplay.addEventListener('mouseup', controlTimer );
timerDisplay.addEventListener('mousedown', function() {
	if(!timerPaused) return false;
	holdForReset = setTimeout( reset, 2000);
});

// if( isMobile.iOS() ) {
//   timerDisplay.addEventListener('touchend', controlTimer );
// 
//   timerDisplay.addEventListener('touchstart', function() {
//     if(!timerPaused) return false;
//     holdForReset = setTimeout( reset, 2000);
//   });

// TODO make credits a tap button pop up for iOS
  // const credits = document.getElementById('credits');
  // credits.addEventListener('touchstart', function() {
  //   credits.classList.toggle('show');
  //   credits.classList.toggle('hide');
  //   alert(credits.classList);
  // });

// } else {
//   timerDisplay.addEventListener('mouseup', controlTimer );
// 
//   timerDisplay.addEventListener('mousedown', function() {
//     if(!timerPaused) return false;
//     holdForReset = setTimeout( reset, 2000);
//   });
// }

// Settings: timer settings
const timeSetters = document.querySelectorAll('.timerSet');
timeSetters.forEach( timeSetBtn => timeSetBtn.addEventListener('click', function(e) {
   const rect = this.getBoundingClientRect();
   const leftThird = Math.round(rect.left + rect.width / 3);
   const rightThird = Math.round(rect.left + rect.width * 2 / 3);
   if (e.clientX < leftThird) {
     this.textContent = this.textContent > 1 ? parseInt(this.textContent, 10) - 1 : 1;
   } else if (e.clientX > rightThird) {
     this.textContent = parseInt(this.textContent, 10) + 1;
   }
   if(this.id === "taskSession") timerDisplay.textContent = this.textContent;
  })
);

function toggleSettings() {
  if (timerRunning) return false;
  if (this.classList.contains('off')) {
    this.classList.replace('off', 'on');
    timerSettings.style.display = 'flex';
  } else {
    this.classList.replace('on', 'off');
    timerSettings.style.display = 'none';
  }
}

// TODO reset should not clear all displays - leave checkmarks in place
// Reset should clear displays
 function reset() {
   clearInterval(countDown);
   countDown = 0;
   pomoCounter = 0;
   //timerPaused = false;
   timerRunning = false;
   // FIXME i can't remember what or why
   checkMarks.textContent = '';
   timerDisplay.textContent = taskTime.textContent;
   timerLabel.textContent = '';
   document.title = "Pomato";
}

const timerSettings = document.getElementById('timeSetWrapper');
document.getElementById('settingsBtn').addEventListener('click', toggleSettings);

const helpFeature = document.getElementById('help');
document.getElementById('help-button').addEventListener('click', function() {
  this.classList.toggle('open');
  helpFeature.classList.toggle('show');
});


const infoDialog = document.getElementById('info');
document.getElementById('get-info-button').addEventListener('click', function() {
  this.classList.toggle('open');
  infoDialog.classList.toggle('show');
});

// would be cool if we could display the time at which
// the full 4-pomo sequence will be complete
// function displayEndTime(timestamp) {
//   const end = new Date(timestamp).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
//   // const hour = end.getHours().toLocaleString();
//   // const minutes = end.getMinutes();
//   endTime.textContent = `Be back at: ${end}`; //${hour}:${minutes}`;
// }
