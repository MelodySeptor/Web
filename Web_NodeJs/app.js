var http = require('http');
var request = require('request');
var cheerio = require ('cheerio');
var stream = require('stream');
var fs = require('fs');
var path = require('path');
var url = require('url');
var validUrl = require('valid-url');
var archiver = require('archiver');
var externalip = require('externalip')
var formidable = require('formidable');
const { parse } = require('querystring');

var semaph = 0
var test = '/sample'
var upload = '/upload'
var fileupload = '/fileupload'
var sendFolder = './share/'
var lastIP = ''
var secretMode = 'blastoise'
var hourToSeconds = 3600

/**
* Put log into file and show it on console.
* @param text String with log.
*/
function logWriter(text){
	var writeText = new Date().toISOString() + text + '\n'

	fs.appendFile('./log.txt', writeText, function(){
		console.log(writeText)
	})
}

//Check if can send mail with new IP or not.
function detectCurrentPublicIPAndDo(){
	var time = new Date()
	externalip(function(err, ip){
		if(ip != lastIP){
			sendMailChangedIp(ip)
			logWriter(' IP changed: ' + ip)
		}
		else{
			logWriter(' IP not changed')
		}
		lastIP = ip
	})
}

function sendMailChangedIp(ip){
	var send = require('gmail-send')({
		user:'torenoseptor@gmail.com',
		pass:'polona123',
		to:'polgn1995@gmail.com',
		subject:'ip',
		text: 'New IP: ' + ip,
	})
	send(function(err, res){
		logWriter(' Mail error')
	})
}

//Do every X seconds an action just one time.
function doEveryX(seconds, whatToDo){
	if(semaph==0){setInterval(whatToDo, seconds*1000); semaph++}
}

function getFile(req, res, queryURL){
	var fileDownload = queryURL.name
	if(fileDownload == secretMode){
		logWriter(req.connection.remoteAddress + ' Secret mode enabled')
		var listFiles = []
		fs.readdir(sendFolder, (err, files) => {
			files.forEach(file => {
				listFiles.push(file)
			})
			var output = ''
			output = output + listFiles.map(function(elem){return elem+' '})
			res.end(output)
		})
	}
	else{
		var zip = archiver('zip')
		logWriter(req.connection.remoteAddress + ' Getting ' + queryURL.name)
		fs.readdir(sendFolder, (err, files) => {
		  	files.forEach(file => {
		    	if(file == fileDownload){
		    		//https://stackoverflow.com/questions/10046039/nodejs-send-file-in-response
				    res.writeHead(200, {
				      'Content-Type': 'application/zip',
				      'Content-disposition': 'attachment; filename=files.zip'
				    });
				    zip.pipe(res)
		    		zip.append(fs.createReadStream(sendFolder + file), {name:file})
		    		zip.finalize()
					logWriter(req.connection.remoteAddress + ' Finished ' + file)
		    	}
		  	});
		})
	}
}

function mainServer(req, res){
//logWriter(req.connection.remoteAddress)
	logWriter(req.connection.remoteAddress + ' connected to ' +req.url)
	if(req.url==test){
		let body = ''
	    var queryReq
	    req.on('data', chunk => {
	        body += chunk.toString()
	    })
	    req.on('end', () => {
	        queryReq=parse(body)
	        //res.end('Getting files . . .')
	        getFile(req, res, queryReq)
	    })
	}
	else if(req.url==upload){
	  	res.writeHead(200, {'Content-Type': 'text/html'});
	  	res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
	  	res.write('<input type="file" name="filetoupload"><br>');
	  	res.write('<input type="submit">');
	  	res.write('</form>');
	  	res.end();
	}
	else if(req.url==fileupload){
	    var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {
	      var oldpath = files.filetoupload.path;
	      var newpath = sendFolder + files.filetoupload.name;
	      fs.rename(oldpath, newpath, function (err) {
	        if (err) throw err;
	        res.write('File uploaded and moved!');
	        res.end();
	      });
	 	});	
	}
	else{
	    res.writeHead(200, {'Content-Type': 'text/html'})
	    fs.createReadStream('./view/index.html').pipe(res)
	}
}
doEveryX(hourToSeconds, detectCurrentPublicIPAndDo)
http.createServer(mainServer).listen(8080);
