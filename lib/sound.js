'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Sound = Sound;

function Sound(url, gain, onLoad) {
  this.url = url;
  this.gain = gain || 1;
  var thisthis = this;
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    if (Sound.audioContext) {
      Sound.audioContext.decodeAudioData(this.response, function (buffer) {
        thisthis.data = buffer;
        if (onLoad) onLoad(thisthis);
      });
    } else onLoad(thisthis);
  };
  request.send();
}

Sound.prototype.play = function () {
  if (Sound.soundOn && this.data) {
    var source = Sound.audioContext.createBufferSource();
    source.buffer = this.data;
    var gainNode = Sound.audioContext.createGain();
    gainNode.gain.value = this.gain;
    source.connect(gainNode);
    gainNode.connect(Sound.audioContext.destination);
    source.start(0);
  }
};

Sound.soundOn = false;
Sound.audioContext = window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;
if (!Sound.audioContext) console.log('Error getting AudioContext');
