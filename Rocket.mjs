import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

class Rocket{
    // own .git folder will be made (dot - current folder)
    constructor(repoPath = '.'){
        this.repoPath = path.join(repoPath,'.rocket');
        this.objectsPath = path.join(this.repoPath,'objects'); //.rocket/objects
        this.headPath = path.join(this.repoPath,'HEAD'); //.rocket/HEAD
        this.indexPath = path.join(this.repoPath,'index'); //.rocket/index
        this.init();
    }   

    async init(){
        await fs.mkdir(this.objectsPath,{recursive:true});
        try{
            await fs.writeFile(this.headPath,'',{flag:'wx'}); // wx: open for writing, fails if file exists
            
            await fs.writeFile(this.indexPath, JSON.stringify([]), {flag:'wx'});
        }catch(error){
            console.log("Already initialized the .rocket folder");
        }
    }

    hashObject(content){  
        return crypto.createHash('sha1').update(content,'utf-8').digest('hex'); 
    }

    async add(fileToBeAdded){
        // file to be added : path/to/file
        const fileData = await fs.readFile(fileToBeAdded,{encoding:'utf-8'}); // read the file
        const fileHash = this.hashObject(fileData); // hash the file
        console.log(fileHash);
        const newFileHashedobjectPath = path.join(this.objectsPath,fileHash); // .rocket/objects/xyz123
        await fs.writeFile(newFileHashedobjectPath,fileData);
        await this.updateStagingArea(filePath,fileHash);
        console.log(`Added ${fileToBeAdded} `);
    }

    async updateStagingArea(filePath,fileHash){
        const index = JSON.parse(await fs.readFile(this.indexPath,{encoding:'utf-8'}));

        index.push({path:filePath,hash:fileHash});
        await fs.writeFile(this.indexPath,JSON.stringify(index));
    }
}

const rocket = new Rocket();
rocket.add('sample.txt');