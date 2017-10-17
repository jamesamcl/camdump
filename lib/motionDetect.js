
// child process for motion detection

var decode = require('im-decode')
var fs = require('fs')
var path = require('path')
var Motion = require('motion-detect').Motion

var camStates = {}

var n = 0

function camState(camNum) {

	if(camStates[camNum])
		return camStates[camNum]

	var motion = new Motion()

	camStates[camNum] = {
		motion: motion
	}

	return camStates[camNum]

}

process.on('message', (msg) => {

	var { cameraConfig, camNum, tmpFilename } = msg

	var state = camState(camNum)

	fs.readFile(tmpFilename, (err, buf) => {

		decode(buf, (err, rgbaArray) => {

			var hasMotion = state.motion.detect(rgbaArray)
			
			if(hasMotion) {

				var uploadFilename = path.dirname(tmpFilename) + '/' + path.basename(tmpFilename, '.jpeg') + '_upload' + (n ++) + '.jpeg'

				fs.writeFile(uploadFilename, buf, (err) => {

					process.send({
						camNum: camNum,
						uploadFilename: uploadFilename
					})

				})

			}

		})
	})
})
