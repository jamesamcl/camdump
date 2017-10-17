
var { spawn } = require('child_process')
var path = require('path')
var fs = require('fs')

function dumpRTMP(cameraConfig, camNum, tmpFilename) {

	try {
		fs.unlinkSync(tmpFilename)
	} catch(e) {
	}

	const rtmpCommand = [
		'rtmpdump',
		'--host', cameraConfig.rtmp_host,
		'--port', cameraConfig.rtmp_port || 80,
		'--playpath', cameraConfig.rtmp_playpath,
		'--quiet',
		'--live'
	].join(' ')

	const convertCommand = [
		'ffmpeg',
		'-i', 'pipe:',
		'-f', 'image2',
		'-r', '1',
		'-updatefirst', '1',
		tmpFilename
	].join(' ')

	const wholeCommand = [
		rtmpCommand,
		'|',
		convertCommand
	].join(' ')

	var dumpProcess = spawn('/bin/sh', [
		'-c',
		wholeCommand
	], {
	})

	console.log('--- RTMP: executing:')
	console.log(wholeCommand)

	//dumpProcess.stderr.pipe(process.stderr)

	dumpProcess.on('exit', (code, signal) => {

		console.log('--- Camera ' + camNum + ' RTMP dump died with code ' + code + '; restarting...')

		setTimeout(() => {
			dumpRTMP(cameraConfig, camNum, tmpFilename)
		}, 5000)

	})





}

module.exports = dumpRTMP


