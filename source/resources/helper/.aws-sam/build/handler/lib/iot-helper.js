/*********************************************************************************************************************
 *  Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author Solution Builders
 */

'use strict';



/**
 * Helper function to interact with AWS IoT for cfn custom resource.
 *
 * @class iotHelper
 */
let iotHelper = (function() {

    let moment = require('moment');
    let AWS = require('aws-sdk');

    /**
     * @class iotHelper
     * @constructor
     */
    let iotHelper = function() {};

    /**
     * Creates an IoT topic rule. Stop gap for missing dynamoDBv2 in CFN.
     * @param {string} settings - Settings for creation of the IoT topic rule.
     * @param {createTopicRule~requestCallback} cb - The callback that handles the response.
     */
    iotHelper.prototype.createTopicRule = function(settings, cb) {

        var params = {
            ruleName: settings.name,
            topicRulePayload: {
                actions: settings.actions,
                sql: settings.sql,
                description: settings.description,
                ruleDisabled: false
            }
        };

        var iot = new AWS.Iot();
        iot.createTopicRule(params, function(err, data) {
            if (err) {
                return cb(err, null);
            }

            return cb(null, data);

        });
    };

    /**
     * Deletes an IoT topic rule. Stop gap for missing dynamoDBv2 in CFN.
     * @param {string} settings - Settings for deletion of the IoT topic rule.
     * @param {deleteTopicRule~requestCallback} cb - The callback that handles the response.
     */
    iotHelper.prototype.deleteTopicRule = function(settings, cb) {

        var params = {
            ruleName: settings.name
        };

        var iot = new AWS.Iot();
        iot.deleteTopicRule(params, function(err, data) {
            if (err) {
                console.log(err);
            }

            return cb(null, data);

        });
    };

    return iotHelper;

})();

module.exports = iotHelper;
