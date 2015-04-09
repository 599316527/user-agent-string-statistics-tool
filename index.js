
var dataFileName;
var optional = {
    device: false,
    engine: false,
    os: false
};

process.argv.forEach(function (val) {
    if (!/^-/.test(val)) dataFileName = val;
    if (val == '-d' || val == '--device') optional.device = true;
    if (val == '-e' || val == '--engine') optional.engine = true;
    if (val == '-o' || val == '--os') optional.os = true;
});

if (!dataFileName) {
    console.log('No csv file specified.');
    process.exit(1);
}

const Detector = require('detector');
const LineByLineReader = require('line-by-line');

var lr = new LineByLineReader(dataFileName);
var result = {};

var _result = {total: 0, version: {}};
if (optional.engine) _result.engine = {};
if (optional.device) _result.device = {};
if (optional.os) _result.os = {};
var _resultTpl = JSON.stringify(_result);

function perLine(line) {
    var ua = line.trim();
    if (!ua) return ;

    var detector = Detector.parse(ua);
    var browser = detector.browser;
    var name, key;
    var ver = browser.version;
    var title = browser.name;

    if (!result[title]) result[title] = JSON.parse(_resultTpl);
    if (!result[title].version[ver]) result[title].version[ver] = 0;
    ++result[title].version[ver];
    ++result[title].total;

    for (key in detector) {
        if (!result[title][key]) continue;
        name = detector[key].name;
        ver = detector[key].version;
        if (!result[title][key][name]) result[title][key][name] = {};
        if (!result[title][key][name][ver]) result[title][key][name][ver] = 0;
        ++result[title][key][name][ver];
    }

}

function done() {
    console.log(JSON.stringify(result));
}


lr.on('error', function (err) {
    console.log(err);
});
lr.on('line', perLine);
lr.on('end', done);



