'use strict';
/**
 * @file An implementation of a Syslog-backed LogStream
 *
 * @author Anand Suresh <anandsuresh@gmail.com>
 * @copyright Copyright (C) 2017 Anand Suresh
 * @license Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const node = {
  net: require('net'),
  os: require('os'),
  util: require('util')
};
const inception = {
  LogStream: require('../logstream')
};


/**
 * An implementation of a Syslog-backed LogStream
 *
 * @param {Object} opts Configuration options for the Syslog LogStream
 * @param {String} [opts.host='localhost'] The hostname/IP address of the syslog server
 * @param {String} [opts.port=514] The por of the syslog server
 * @param {String} [opts.facility=LOCAL0] The syslog logging facility to use
 * @param {String} [opts.hostname] The hostname to set in Syslog messages; defaults to the system hostname
 * @constructor
 */
function Syslog(opts) {
  opts = opts || {};
  opts.type = 'syslog';
  opts.host = opts.host || '127.0.0.1';
  opts.port = opts.port || 514;
  opts.facility = opts.facility || Logger.FACILITIES.LOCAL0;
  opts.hostname = opts.hostname || node.os.hostname().split('.')[0];
  Syslog.super_.call(this, opts);

  (function initSocket(err) {
    this._udpSocket = new node.dgram.createSocket('udp4')
      .on('error', (err) => this.emit('error', err));
  }.call(this));
}
node.util.inherits(Syslog, inception.LogStream);


Syslog.LEVELS = {
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warn: 4,
  notice: 5,
  info: 6,
  debug: 7
};


Syslog.FACILITIES = {
  KERN: (0 << 3),
  USER: (1 << 3),
  MAIL: (2 << 3),
  DAEMON: (3 << 3),
  AUTH: (4 << 3),
  SYSLOG: (5 << 3),
  LPR: (6 << 3),
  NEWS: (7 << 3),
  UUCP: (8 << 3),
  AUDIT: (13 << 3),
  CRON: (15 << 3),

  LOCAL0: (16 << 3),
  LOCAL1: (17 << 3),
  LOCAL2: (18 << 3),
  LOCAL3: (19 << 3),
  LOCAL4: (20 << 3),
  LOCAL5: (21 << 3),
  LOCAL6: (22 << 3)
};


/**
 * The hostname/IP address of the Syslog server
 * @name Syslog#host
 * @type {String}
 */
Object.defineProperty(Syslog.prototype, 'host', {
  get: function () {
    return this._opts.host;
  }
});


/**
 * The port of the Syslog server
 * @name Syslog#port
 * @type {String}
 */
Object.defineProperty(Syslog.prototype, 'port', {
  get: function () {
    return this._opts.port;
  }
});


/**
 * The facility to specify in the syslog header
 * @name Syslog#facility
 * @type {String}
 */
Object.defineProperty(Syslog.prototype, 'facility', {
  get: function () {
    return this._opts.facility;
  }
});


/**
 * The hostname to specify in the syslog header
 * @name Syslog#hostname
 * @type {String}
 */
Object.defineProperty(Syslog.prototype, 'hostname', {
  get: function () {
    return this._opts.hostname;
  }
});


/**
 * @inheritdoc
 */
Syslog.prototype._write = function (chunk, encoding, callback) {
  this._udpSocket.send(chunk, 0, chunk.length, this.port, this.host, callback);
};


/**
 * @inheritdoc
 */
Syslog.prototype.log = function (log, line) {
  return new Promise((resolve, reject) => {
    const facility = this.facility + Syslog.LEVELS[log.level];
    const timestamp = new Date(log.ts / 1e6).toISOString();
    const processName = log.name;
    const header = `<${facility}>${timestamp} ${this.hostname} ${processName}`;
    const chunk = Buffer.concat(new Buffer(header), line);

    this.write(chunk, 'buffer', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


/**
 * Export the class
 * @type {Syslog}
 */
module.exports = Syslog;
