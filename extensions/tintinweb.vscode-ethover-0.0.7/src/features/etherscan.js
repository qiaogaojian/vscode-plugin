'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */

const http = require('https');

class EtherScanIoConnector {

    constructor(apikey, apiurl) {
        this.apiurl = apiurl || "https://api.etherscan.io/api";
        this.apikey = apikey;
    }

    sourceCodeForAddress(address) {
        return this.etherscanRequest("module=contract&action=getsourcecode&address=" + address);
    }

    byteCodeForAddress(address) {
        return this.etherscanRequest("module=proxy&action=eth_getCode&tag=latest&address=" + address);
    }

    balanceForAddress(address) {
        return this.etherscanRequest("module=account&action=balance&address=" + address + "&tag=latest");
    }

    etherscanRequest(cmd) {
        return new Promise((resolve, reject) => {
            http.get(`${this.apiurl}?apikey=${this.apikey}&${cmd}`, (res) => {
                const { statusCode } = res;
                const contentType = res.headers['content-type'];

                let error;
                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
                }
                if (error) {
                    console.error(error.message);
                    // Consume response data to free up memory
                    res.resume();
                    return;
                }

                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        if (parsedData.result) {
                            resolve(parsedData.result);
                        } else {
                            reject(parsedData);
                        }
                    } catch (e) {
                        console.error(e.message);
                        reject(e);
                    }
                });
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
                reject(e);
            });
        });
    }
}

class EtherScanIo extends EtherScanIoConnector {

    constructor(apikey, apiurl) {
        super(apikey, apiurl);
        this.apikey = apikey || 'YourApiKeyToken';
        this.api = require('etherscan-api').init(this.apikey);
    }

    getVerifiedSource(address) {
        return new Promise((resolve, reject) => {

            return this.sourceCodeForAddress(address).then(results => {
                if (!results || !Array.isArray(results)) {
                    return reject(new Error(`etherscan.io did not return a result. Please try again later.`));
                }

                results.forEach(result => {
                    let sourceCode = result.SourceCode;

                    if (!sourceCode) {
                        return reject(new Error(`${address} has not been verified on etherscan.io yet. Source code unavailable. Try decompiling instead.`));
                    }


                    let header = `/**
* Generated by vscode-solidity-auditor, fetched from etherscan.io
* 
* Name: ${result.ContractName} (${address})
* 
* CompilerVersion: ${result.CompilerVersion}
* ConstructorArguments: 
*  ${result.ConstructorArguments}
* 
* Settings:
*  - Optimizer: ${result.OptimizationUsed} (${result.Runs.runs})
* 
* */
`;
                    //etherscan.io api may return a json object in SourceCode if multiple files were submitted. let's try to decode it.
                    try {
                        sourceCode = sourceCode.trim();
                        if (sourceCode.startsWith("{{") && sourceCode.endsWith("}}")) {
                            sourceCode = sourceCode.substring(1, sourceCode.length - 1);
                        }
                        let sourceStruct = JSON.parse(sourceCode);
                        let libs = "";
                        if (sourceStruct.settings && sourceStruct.settings.libraries && sourceStruct.settings.libraries[""]) {
                            libs = `/**                                   
* 
* Libraries:
*  - ${Object.keys(sourceStruct.settings.libraries[""]).map(function (k) { return `${k}: ${sourceStruct.settings.libraries[""][k]}`;}).join("\n *  - ")}
* 
* */

`;
                        }
                        let sourceFiles = sourceStruct.sources || sourceStruct;
                        sourceCode = Object.keys(sourceFiles).reduce((result, current) => {
                            return result + `// File: ${current}
    
    ${sourceFiles[current].content}
    
    `;
                        }, libs);
                    } catch (e) {
                        //not json; print results
                    }

                    resolve(header + sourceCode);
                });
            });

        });
    }

}


module.exports = {
    EtherScanIo
};