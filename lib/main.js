
var config = require(__dirname + '/../config.json')
var { spawn, fork } = require('child_process')
var fs = require('fs')
var dumpRTMP = require('./dumpRTMP')

var motionDetectProcess = fork(__dirname + '/motionDetect')

motionDetectProcess.on('message', (msg) => {
	
	var { camNum, uploadFilename } = msg

	console.log('**** upload ' + uploadFilename + ' for cam ' + camNum)


	spawn('/bin/sh', [
		'-c',
		config.uploader + ' ' + uploadFilename
	])


})

config.cameras.forEach((cameraConfig, camNum) => {

	const tmpFilename = config.tempDir + '/cam' + camNum + '.jpeg'

	if(cameraConfig.type === 'rtmp') {
		dumpRTMP(cameraConfig, camNum, tmpFilename)
	}

	fs.watchFile(tmpFilename, {
		persistent: true,
		interval: 400
	}, (curr, prev) => {

		motionDetectProcess.send({
			cameraConfig: cameraConfig,
			camNum: camNum,
			tmpFilename: tmpFilename
		})

	})
})

