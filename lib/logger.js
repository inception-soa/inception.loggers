'use strict';
/**
 * @file An implementation of a logging framework
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

/**
 * An implementation of a logger
 *
 * This is one of the few classes in Inception that isn't inheriting from any of
 * the Inception primitive classes.
 *
 * @param {Object} opts Configuration options for the logger
 * @param {LogStream[]} opts.loggers Configuration for the logger implementations
 * @param {Object} opts.props Properties to log with each log line
 * @constructor
 */
function Logger(opts) {
  this._opts = _.clone(opts);
}


/**
 * A list of LogStream implementations to write logs to
 * @type {LogStream[]}
 */
Object.defineProperty(Logger.prototype, 'loggers', {
  get: function () {
    return this._opts.loggers;
  }
});


/**
 * A list of properties to log with each log line
 * @type {Object}
 */
Object.defineProperty(Logger.prototype, 'props', {
  get: function () {
    return this._opts.props;
  }
});


/**
 * Coalesces multiple log objects into a single object ready for serialization
 *
 * @param {...Object|Error|String} args A list of objects to log
 * @return {Object} A coalesced log object
 */
Logger.prototype._reduce = function () {
  return _.reduce(arguments, (log, arg) => {
    if (arg instanceof Error) {
      log.error = arg;
    } else if (typeof arg === 'object') {
      _.extend(log, arg);
    } else {
      log.msg = arg;
    }
  }, {});
};


_.each([
  'emergency',
  'alert',
  'critical',
  'error',
  'warn',
  'notice',
  'info',
  'debug'
], (level) => {
  Logger.prototype[level] = function () {
    const obj = this._reduce(Array.prototype.unshift.call(arguments, {
      ts: Date.now(),
      level: level
    }, this.props));
    const line = `${JSON.serialize(obj)}\n`;
    const promises = _.map(this.loggers, (logger) => logger.log(obj, line));

    return Promise.all(promises);
  };
});


/**
 * Creates a child logger that extends the properties of its parent
 *
 * @param {Object} opts Configuration options for the logger
 * @param {Object[]} opts.loggers Configuration for the logger implementations
 * @param {Object} opts.props Properties to log with each log line
 * @return {Logger}
 */
Logger.prototype.createChild = function (opts) {
  return new this.constructor(_.extend({}, this._opts, opts));
};


/**
 * Export the class
 * @type {Logger}
 */
module.exports = Logger;
