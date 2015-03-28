'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');

function bootstrapify(input) {
    return input.toString()
        .replace(/<p>([\s\S]*?)<\/p>/g, '<div class="paragraph">$1</div>')
        .replace(/<table>/g, '<table class="table table-striped">')
        .replace(/<th>/g, '<th style="text-align: center">')
    ;
}

/*
 TODO:
 - Додебажить парсер
 - Допереформатировать статьи
 */

function parseHelpers(input, options) {
    var current, tmpStack;
    var pieces = input.split(/\{\{|\}\}/);
    var stack = [];
    var output = [];

    var debugInfo = {
        tags: {}
    };
    function openTag(title) {
        debugInfo.tags[title] = debugInfo.tags[title] ? debugInfo.tags[title] + 1 : 1;
    }
    function closeTag(title) {
        debugInfo.tags[title] = debugInfo.tags[title] ? debugInfo.tags[title] - 1 : 0;
    }
    function getUnclosedTags(info) {
        var unclosedTags = [];
        for (var i in info) {
            if (info[i]) unclosedTags.push('Unclosed tag: ' + i);
        }
        return unclosedTags;
    }

    function selectedOutput() {
        return stack.length > 0 ? stack : output;
    }
    var title = '';
    for (var i = 0; i < pieces.length; i++) {
        tmpStack = [];
        var pieceName = pieces[i].split(/\s+/)[0];
        switch (pieceName) {
            case 'title':
                openTag('title');
                stack.push(pieces[i].toString());
                break;
            case '/title':
                closeTag('title');
                while ((current = stack.pop()) != 'title' && current !== undefined) {
                    title = current.toString() + title;
                }
                break;
            case 'warning':
                openTag('warning');
                stack.push(pieces[i].toString());
                break;
            case '/warning':
                closeTag('warning');
                while ((current = stack.pop()) != 'warning' && current !== undefined) {
                    tmpStack.push(current.toString());
                }
                selectedOutput().push('<div class="paragraph alert alert-success">' + tmpStack.reverse().join('') + '</div>');
                break;
            case 'hint':
                openTag('hint');
                stack.push(pieces[i]);
                break;
            case '/hint':
                closeTag('hint');
                while ((current = stack.pop()).split(/\s+/)[0] != 'hint' && current !== undefined) {
                    tmpStack.push(current.toString());
                }
                selectedOutput().push('<abbr title="' + current.split(/\s+/).slice(1) + '">' + tmpStack.reverse().join('') + '</abbr>');
                break;
            case 'image':
                selectedOutput().push('<img src="' + options.imgPath + pieces[i].split(/\s+/)[1] + '" alt="" />');
                break;
            case 'imageblock':
                selectedOutput().push('<div class="illustration"><img src="' + options.imgPath + pieces[i].split(/\s+/)[1] + '" width="' + pieces[i].split(/\s+/)[2] + '" alt="" /></div>');
                break;
            case 'tile':
                var params = pieces[i].split(/\s+/);
                var classes = ['tile-icon'];
                var tilePic = 'tiles';
                var tileName = null;
                for (var j = 0; j < params.length; j++) {
                    switch(params[j]) {
                        case 'tile':
                            break;
                        case 'rotated':
                            classes.push('tile-iconrotated');
                            tilePic += 'rotated';
                            break;
                        case 'stacked-upper':
                            classes.push('tile-iconstacked-upper'); // TODO: сейчас всегда сначала должен идти тайл upper, а после него lower!
                            break;
                        case 'stacked-lower':
                            classes.push('tile-iconstacked-lower');
                            break;
                        default:
                            tileName = params[j];
                    }
                }
                classes.push('tile-icon' + (tilePic == 'tilesrotated' ? 'rotated' : '') + '-' + tileName);
                selectedOutput().push('<span class="' + classes.join(' ') + '"><span class="wrap"><img src="' + options.pathToTileImages + '/' + tilePic + '.png"></span></span>');
                break;
            case 'pon': // TODO all, для ускорения набора рук
                break;
            case 'chi':
                break;
            case 'kan':
                break;
            case 'pair':
                break;
            case 'hand':
                openTag('hand');
                stack.push(pieces[i]);
                break;
            case '/hand':
                closeTag('hand');
                var openedParts = [];
                while ((current = stack.pop()) !== undefined) {
                    if (current == 'hand') {
                        break;
                    }
                    if (current.toString().indexOf('opened::') === 0) {
                        openedParts.push(current.toString().replace('opened::', ''));
                    } else {
                        tmpStack.push(current.toString());
                    }
                }

                selectedOutput().push(
                    '<div class="hand"><div class="closed-part">' +
                        tmpStack.reverse().join('') +
                    '</div>' +
                        openedParts.reverse().join('') +
                    '</div>'
                );
                break;
            case 'opened':
                openTag('opened');
                stack.push(pieces[i]);
                break;
            case '/opened':
                closeTag('opened');
                while ((current = stack.pop()) != 'opened' && current !== undefined) {
                    tmpStack.push(current.toString());
                }
                selectedOutput().push('opened::' + tmpStack.reverse().join('')); // костыль какой-то :/
                break;
            default:
                selectedOutput().push(pieces[i]);
        }
    }

    return {
        output: output.join(''),
        title: title,
        parseError: !!stack.length,
        details: getUnclosedTags(debugInfo.tags)
    }
}

function embrace(originalString, options, callback) {
    fs.readFile(options.layout, {encoding: 'utf-8'}, function(err, data) {
        if (err) {
            callback(err, data);
            return;
        }

        var parsed = parseHelpers(originalString, options);
        if (parsed.parseError) {
            callback({'message': 'Failed to parse document helpers: \n' + parsed.details.join('\n')}, null);
            return;
        }

        data = data
            .replace('{{pageTitle}}', parsed.title)
            .replace('{{content}}', bootstrapify(parsed.output))
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
                console.error('Failed to parse file ' + file.path + ': ' + err.message);
                return;
            }

            file.contents = new Buffer(data);
            cb(null, file);
        });
    });
};
