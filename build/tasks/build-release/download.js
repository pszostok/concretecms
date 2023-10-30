/* jshint unused:vars, undef:true, node:true */

const download = require('download');

module.exports = function(grunt, config, parameters, done) {
	var zipUrl = parameters.releaseSourceZip || 'https://github.com/concretecms/concretecms/archive/refs/tags/9.2.1.zip';
	var workFolder = parameters.releaseWorkFolder || './release';
	function endForError(e) {
		process.stderr.write(e.message || e);
		done(false);
	}
	try {
		var fs = require('fs'),
			path = require('path'),
			download = require('download'),
			c5fs = require('../../libraries/fs'),
			shell = require('shelljs'),
			exec = require('child_process').exec;

		if(c5fs.isDirectory(workFolder)) {
			process.stdout.write('Removing working folder... ');
			shell.rm('-rf', workFolder);
			if(c5fs.isDirectory(workFolder)) {
				throw new Error('Unable to remove ' + workFolder);
			}
			process.stdout.write('done.\n');
		}
		fs.mkdirSync(workFolder);

		process.stdout.write('Downloading archive... ');

		(async () => {
			try {
				await download(zipUrl, workFolder, {
					filename: "source.zip",
				})
			} catch (e) {
				endForError(err);
				return;
			}

			process.stdout.write('done.\n');
			process.stdout.write('Extracting archive... ');
			exec(
				'unzip -q source.zip',
				{
					cwd: workFolder
				},
				function(error, stdout, stderr) {
					if(error) {
						endForError(stderr || error);
						return;
					}
					process.stdout.write('done.\n');
					process.stdout.write('Deleting archive... ');
					shell.rm('-f', path.join(workFolder, 'source.zip'));
					process.stdout.write('done.\n');
					var extractedFolder = null;
					fs.readdirSync(workFolder).forEach(function(item) {
						if(item.indexOf('.') !== 0) {
							if(extractedFolder === null) {
								extractedFolder = item;
							}
							else {
								throw new Error('Multiple items in the root of the extract archive!');
							}
						}
					});
					if(extractedFolder === null) {
						throw new Error('No items extracted!');
					}
					fs.renameSync(path.join(workFolder, extractedFolder), path.join(workFolder, 'source'));
					done();
				}
			);
		})();


		;
	}
	catch(e) {
		endForError(e);
		return;
	}
};
