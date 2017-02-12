'use strict';
/**
 * @file The Inception logging framework
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
  fs: require('fs'),
  path: require('path')
};
const inception = {
  Logger: require('./lib/logger')
};
const _ = require('lodash');


/**
 * Export the interface
 * @type {Object}
 */
const Loggers = exports = module.exports;


/**
 * A list of supported log streams
 * @type {Object}
 */
Loggers.SUPPORTED = (function getSupported() {
  const path = node.path;
  const resolve = path.resolve;
  const basename = path.basename;
  const extname = path.extname;

  const dir = resolve(__dirname, 'lib', 'loggers');
  const supported = {};

  node.fs.readdirSync(dir).forEach((file) => {
    const name = basename(file, extname(file));
    supported[name] = require(resolve(dir, file));
  });

  return supported;
}());


/**
 * Returns whether or not the specified logger is supported
 *
 * @param {String} name The name of the logger
 * @return {Boolean}
 */
Loggers.isSupported = function (name) {
  return (name in Loggers.SUPPORTED);
};


/**
 * Creates a new logger
 *
 * @param {Object} opts Configuration options for the logger
 * @param {String} opts.name A unique name for the process doing the logging
 * @param {Object[]} opts.loggers Configuration for the logger implementations
 * @param {Object} opts.props Properties to log with each log line
 * @return {Logger}
 */
Loggers.create = function (opts) {
  const loggers = [];

  if (_.isNil(opts.name)) {
    throw `must specify a name for the logger!`;
  }

  _.each(opts.loggers, (logger) => {
    if (!inception.loggers.isSupported(logger.type)) {
      throw `unsupported logger "${logger.type}"!`;
    }

    loggers.push(new Loggers.SUPPORTED[logger.type](logger));
  });

  return new inception.Logger({
    loggers: loggers,
    props: opts.props
  });
};
