const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

/**
 * Makes sure that the build folder is deleted, before every compilation
 * @returns {*} - Path where the compiled sources should be saved.
 */
function compilingPreperations(id) {
    const buildPath = path.resolve(process.env.PROJECT_ROOT + '/artifacts/' + id);
    try {
        fs.removeSync(buildPath);
    }catch{}
    
    return buildPath;
}

/**
 * Returns and Object describing what to compile and what need to be returned.
 */
function createConfiguration(id, filename) {
    return {
        language: 'Solidity',
        sources: {
            [filename] : {
                content: fs.readFileSync(path.resolve(process.env.PROJECT_ROOT + '/contracts/' + id + '/' + filename), 'utf8')
            }
        },
        settings: {
            outputSelection: { // return everything
                '*': {
                    '*': ['*']
                }
            }
        }
    };
}

/**
 * Compiles the sources, defined in the config object with solc-js.
 * @param config - Configuration object.
 * @returns {any} - Object with compiled sources and errors object.
 */
 function compileSources(config) {
    try {
        return JSON.parse(solc.compile(JSON.stringify(config), {import: getImports} ));
    } catch (e) {
       console.log(e);
    }
}

/**
 * Searches for dependencies in the Solidity files (import statements). All import Solidity files
 * need to be declared here.
 * @param dependency
 * @returns {*}
 */
function getImports(dependency) {
    try {

        return {contents: fs.readFileSync(path.resolve(process.env.PROJECT_ROOT + '/node_modules/' + dependency), 'utf8')};

        // if (dependency == 'DynamicNFT.sol'){
        //     return {contents: fs.readFileSync(path.resolve(process.env.PROJECT_ROOT + '/contracts/DynamicNFT.sol'), 'utf8')};
        // }else{
           
        // }
    }
    catch {
        return {error: 'File not found'}
    }    
}

/**
 * Shows when there were errors during compilation.
 * @param compiledSources
 */
 function errorHandling(compiledSources) {
    if (!compiledSources) {
        console.error('>>>>>>>>>>>>>>>>>>>>>>>> ERRORS <<<<<<<<<<<<<<<<<<<<<<<<\n', 'NO OUTPUT');
    } else if (compiledSources.errors) { // something went wrong.
        console.error('>>>>>>>>>>>>>>>>>>>>>>>> ERRORS <<<<<<<<<<<<<<<<<<<<<<<<\n');
        compiledSources.errors.map(error => console.log(error.formattedMessage));
    }
}

/**
 * Writes the contracts from the compiled sources into JSON files, which you will later be able to
 * use in combination with web3.
 * @param compiled - Object containing the compiled contracts.
 * @param buildPath - Path of the build folder.
 */
 function writeOutput(compiled, buildPath, filename) {
    fs.ensureDirSync(buildPath);

    console.log(buildPath)
   
    for (let baseName in compiled.contracts[filename]) {
       
        //const contractName = contractFileName.replace('.sol', '');
        //const baseName = path.basename(filename).replace('.sol', '')
        //console.log(filename, contractName)
        //console.log(compiled.contracts[filename], contractFileName)
        fs.outputJsonSync(
            path.resolve(buildPath, baseName + '.json'),
            {
                contractName: baseName,
                sourceName: filename,
                abi:  compiled.contracts[filename][baseName].abi,
                bytecode:  compiled.contracts[filename][baseName].evm.bytecode.object,
                linkReferences: compiled.contracts[filename][baseName].evm.bytecode.linkReferences,
                deployedLinkReferences: compiled.contracts[filename][baseName].evm.bytecode.deployedLinkReferences
            }           
        );
    }
}


export {
    compilingPreperations,
    createConfiguration,
    compileSources,
    errorHandling,
    writeOutput
}
