'use strict';
/**
 * @file The interface to the console
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
  util: require('util')
};
const inception = {
  LogStream: require('../logstream')
};


/**
 * The interface to the console
 *
 * @param {Object} [opts] Configuration options for the log stream
 * @constructor
 */
function Console(opts) {
  opts = opts || {};
  opts.type = 'console';
  Console.super_.call(this, opts);

  this.process.stderr
    .on('error', (err) => this.emit('error', err));
}
node.util.inherits(Console, inception.LogStream);


/**
 * @inheritdoc
 */
Console.prototype._write = function (chunk, encoding, callback) {
  process.stderr.write(chunk, encoding, callback));
};


/**
 * Export the class
 * @type {Console}
 */
module.exports = Console;
