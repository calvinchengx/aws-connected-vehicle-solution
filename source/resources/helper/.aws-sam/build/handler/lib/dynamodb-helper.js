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
 * Helper function to interact with dynamodb for data lake cfn custom resource.
 *
 * @class dynamoDBHelper
 */
let dynamoDBHelper = (function() {

    let moment = require("moment");
    let AWS = require("aws-sdk");
    const fs = require("fs");
    let csv = require("fast-csv");
    //let response = require('cfn-response-promise');
    let codes_info = [];

    let creds = new AWS.EnvironmentCredentials("AWS"); // Lambda provided credentials
    const dynamoConfig = {
      credentials: creds,
      region: process.env.AWS_REGION,
    };

    /**
     * @class dynamoDBHelper
     * @constructor
     */
    let dynamoDBHelper = function() {};
    /**
     * Loads POIs into marketing table.
     * @param {string} ddbTable - POI table.
     * @param {loadDtcCodes~requestCallback} cb - The callback that handles the response.
     */
    dynamoDBHelper.prototype.loadPois = function(ddbTable, cb) {
        // const csv = require('fast-csv');
        console.info('DO WE HAVE OUR CSV imported correctly in the first place?')
        //console.log(csv)
        let parser = csv.parse({ headers: false });
        console.log('THIS IS OUR PARSER')
        console.log(parser);
        let fileStream = fs.createReadStream('./marketing-pois.csv');
        fileStream
            .on('readable', function() {
                var data;
                while ((data = fileStream.read()) !== null) {
                    parser.write(data);
                }
            })
            .on('end', function() {
                parser.end();
            });

        parser
            .on('readable', function() {
                var data;
                while ((data = parser.read()) !== null) {
                    console.log(data);
                    codes_info.push({
                        poi_id: data[0],
                        address: data[1],
                        city: data[2],
                        latitude: data[3],
                        longitude: data[4],
                        message: data[5],
                        poi: data[6],
                        radius: data[7],
                        state: data[8]
                    });
                }
            })
            .on('end', function() {
                console.log('Attempting to load POIs to marketing table.');
                loadCodes(codes_info, 0, ddbTable, function(err, data) {
                    if (err) {
                        console.log('Error loading POI marketing table', err);
                    } else {
                        console.log('Successfully loaded POI marketing table.');
                    }
                    cb(null, 'success');
                });
            });
    }
    /**
     * Loads DTC codes into reference table.
     * @param {string} ddbTable - DTC reference table.
     * @param {loadDtcCodes~requestCallback} cb - The callback that handles the response.
     */
    dynamoDBHelper.prototype.loadDtcCodes = function(ddbTable, cb) {
        console.info('loadDtcCodes loadDtcCodes loadDtcCodes')
        let parser = csv.parse({ headers: false });
        let fileStream = fs.createReadStream('./obd-trouble-codes.csv');
        fileStream
            .on('readable', function() {
                var data;
                while ((data = fileStream.read()) !== null) {
                    parser.write(data);
                }
            })
            .on('end', function() {
                parser.end();
            });

        parser
            .on('readable', function() {
                var data;
                while ((data = parser.read()) !== null) {
                    console.log(data);
                    codes_info.push({
                        dtc: data[0],
                        description: data[1],
                        steps: []
                    });
                }
            })
            .on('end', function() {
                console.log('Attempting to load DTC codes to reference table.');
                console.log(ddbTable);
                loadCodes(codes_info, 0, ddbTable, function(err, data) {
                    if (err) {
                        console.log('Error loading DTC reference table', err);
                    } else {
                        console.log('Successfully loaded DTC reference table.');
                    }
                    console.log(cb);
                    cb(null, response.SUCCESS);
                    //response.send(event, context, response.SUCCESS, responseData);
                });
            });

    };

    var loadCodes = function(items, index, ddbTable, cb) {
        if (index < items.length) {
            let params = {
                TableName: ddbTable,
                Item: items[index]
            };

            const docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);
            docClient.put(params, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(['Added DTC', params.Item.dtc].join(': '));
                }

                index++;
                setTimeout(loadCodes, 500, items, index, ddbTable, cb);
            });
        } else {
            return cb(null, 'All codes processed..');
        }

    };

    return dynamoDBHelper;

})();

module.exports = dynamoDBHelper;
