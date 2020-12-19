import _ from 'lodash';
import Emitter from './Emitter';

/**
 * Manage all media devices
 */
class MediaDevice extends Emitter {
  /**
   * Start media devices and send stream
   */
  /*  var front = false;
      document.getElementById('flip-button').onclick = function() { front = !front; };
 
        var constraints = { video: { facingMode: (front? "user" : "environment") } }; */

        
  start() {
    const constraints = {

      video: {
        facingMode: 'user',
        height: { min: 360, ideal: 720, max: 1080 }
      },
      audio: true
    };

    // Старые браузеры могут не реализовывать свойство mediaDevices,
    //поэтому вначале присваеваем свойству ссылку на пустой объект

    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    // Некоторые браузеры частично реализуют свойство mediaDevices, поэтому
    //мы не можем присвоить ссылку на объект свойству getUserMedia, поскольку
    //это переопределит существующие свойства. Здесь, просто добавим свойство
    //getUserMedia , если оно отсутствует.

    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function (constraints) {

        // Сначала, если доступно, получим устаревшее getUserMedia

        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        //Некоторые браузеры не реализуют его, тогда вернем отмененный промис
        // с ошибкой для поддержания последовательности интерфейса

        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Иначе, обернем промисом устаревший navigator.getUserMedia

        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(function (stream) {
        var video = document.querySelector('video');
        // Устаревшие браузеры могут не иметь свойство srcObject
        if ("srcObject" in video) {
          video.srcObject = stream;
        } else {
          // Не используем в новых браузерах
          video.src = window.URL.createObjectURL(stream);
        }
        video.onloadedmetadata = function (e) {
          video.play();
        };
      })
      .catch(function (err) {
        console.log(err.name + ": " + err.message);
      });




    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.emit('stream', stream);
      })
      .catch((err) => {
        if (err instanceof DOMException) {
          alert('Cannot open webcam and/or microphone');
        } else {
          console.log(err);
        }
      });

    return this;
  }

  /**
   * Turn on/off a device
   * @param {String} type - Type of the device
   * @param {Boolean} [on] - State of the device
   */
  toggle(type, on) {
    const len = arguments.length;
    if (this.stream) {
      this.stream[`get${type}Tracks`]().forEach((track) => {
        const state = len === 2 ? on : !track.enabled;
        _.set(track, 'enabled', state);
      });
    }
    return this;
  }

  /**
   * Stop all media track of devices
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    return this;
  }
}

export default MediaDevice;
