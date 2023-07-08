'use strict'
const fs = require('fs')
const path = require('path')
const fetch = require('./fetch')
const S3_API_URI = process.env.S3_API_URI
const S3_BUCKET = process.env.S3_BUCKET
const getFiles = (dir)=>{
  return new Promise((resolve, reject) =>{
    try{
      fs.readdir(dir, (err, files)=>{
        if(err) reject(err);
        resolve(files)
      })
    }catch(e){
      reject(e)
    }
  })
}
const uploadFile = async(fileName, file)=>{
  try{
    if(!S3_API_URI || !S3_BUCKET || !fileName || !file) throw('Missing object storage info...')
    let body = { Key: fileName, Bucket: S3_BUCKET, Body: file, Convert: 'base64'}
    return await fetch(path.join(S3_API_URI, 'put'), 'POST', body, {'Content-Type': 'application/json'})
  }catch(e){
    throw(e);
  }
}
const readFile = async(file)=>{
  try{
    let data = await fs.readFileSync(path.join(baseDir, 'public', 'portrait', file))
    return data?.toString('base64')
  }catch(e){
    throw(e)
  }
}
const start = async()=>{
  try{
    let files = await getFiles(path.join(baseDir, 'public', 'portrait'))
    if(!files || files?.length === 0) throw('error getting files')
    console.log('attempting to push '+files.length)
    for(let i in files){
      let file = await readFile(files[i])
      if(!file) throw('error reading file')
      let status = await uploadFile(path.join('portrait', files[i]), file)
      if(!status?.ETag) throw('Error uploading file')
    }
    console.log('pushsed '+files.length)
  }catch(e){
    console.log(e)
    setTimeout(start, 5000)
  }
}
start()
