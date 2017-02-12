'use strict';
/**
 * @file A base class for all log streams
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
  stream: require('stream'),
  util: require('util')
};


/**
 * A base class for all log streams
 *
 * @param {Object} opts Configuration options for the log streams
 * @param {String} opts.type The type of log stream
 * @constructor
 */
function LogStream(opts) {
  if (!opts.type)
    throw 'logstream must specify a type!';

  this._opts = opts;
  LogStream.super_.call(this, this._opts);
}
node.util.inherits(LogStream, node.stream.Writable);


/**
 * The type of log stream
 * @name LogStream#type
 * @type {String}
 */
Object.defineProperty(LogStream.prototype, 'type', {
  get: function () {
    return this._opts.type;
  }
});


/**
 * Overridable _write() method of Writable
 *
 * @param {String|Buffer} chunk The data to write
 * @param {String} encoding The encoding, if `chunk` is a string
 * @param {Function} callback Function to execute after processing the chunk
 */
LogStream.prototype._write = function (chunk, encoding, callback) {
  throw new Error(`Must override _write() in ${this.type} log stream!`);
};


/**
 * Orerridable method to write the log to the stream
 *
 * @param {Object} log The object representation of the log
 * @param {Buffer} line The serialized representation of the log
 * @return {Promise}
 */
LogStream.prototype.log = function (log, line) {
  return new Promise((resolve, reject) => {
    this.write(line, 'buffer', (err) => {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
};


/**
 * Export the class
 * @type {LogStream}
 */
module.exports = LogStream;
