'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');

var titleRegex = /\{\{title:([^\}]+)\}\}/;

function embrace(originalString, options, callback) {
    fs.readFile(options.layout, {encoding: 'utf-8'}, function(err, data) {
        if (err) {
            callback(err, data);
            return;
        }

        var title = originalString.match(titleRegex);
        if (!title) {
            callback({'message': 'No title found in document.'}, null);
            return;
        }

        title = title[1];
        originalString = originalString
            .replace(titleRegex, '')
            .replace(/<p>([\s\S]*?)<\/p>/g, '<div class="paragraph">$1</div>') // bootstrapify :)
            .replace(/<table>/g, '<table class="table table-striped">')
            .replace(/<th>/g, '<th style="text-align: center">')
            .replace(/\{\{hint:(.*?):(.*?)\}\}/g, '<abbr title="$2">$1</abbr>')
        ;
        data = data
            .replace('{{pageTitle}}', title)
            .replace('{{content}}', originalString)
        ;

        callback(null, data);
    });
}

module.exports = function (options) {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-embrace', 'Streaming not supported'));
            return;
        }

        embrace(file.contents.toString(), options, function (err, data) {
            if (err) {
                cb(new gutil.PluginError('gulp-embrace', err, {fileName: file.path}));
                return;
            }

            file.contents = new Buffer(data);
            cb(null, file);
        });
    });
};
