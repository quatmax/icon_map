// Return array of string values, or NULL if CSV string not well formed.
function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;

    var a = []; // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function (m0, m1, m2, m3) {

            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));

            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });

    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
}

function visitRawFile(filename, visitor) {
    var dataFile = new XMLHttpRequest();
    dataFile.open("GET", filename, true);
    dataFile.onreadystatechange = function () {
        if (dataFile.readyState === 4) {
            if (dataFile.status === 200 || dataFile.status == 0) {
                visitor(dataFile.responseText.split(/\r\n|\n/));
            }
        }
    };
    dataFile.send();
}

function visitRawLineData(file, visitLine, onFinished) {
    visitRawFile(file, function (allTextLines) {
        for (var index = 0; index < allTextLines.length; index++) {
            var line = allTextLines[index].replaceAll("'", "");
            if (line.trim().length == 0) {
                continue;
            }
            visitLine(CSVtoArray(line));
        }
        if (onFinished != undefined) {
            onFinished();
        }
    });
}

function createQML(filename, unicode) {
    var prefix = ', { "' + filename.replaceAll(".png", "") + ' ", "\\u';
    var postfix = '" }';
    var value = '';
    if (unicode === "")
        value = "f506";
    else
        value = unicode.toLowerCase();

    return prefix + value + postfix;
}

function onClickCopy(text) {
    navigator.clipboard.writeText(text);
}

function insertTextCell(tr, label) {
    const td = tr.insertCell();
    var text = document.createTextNode(label);
    td.appendChild(text);
}

function insertImageCell(td, src) {
    var img = document.createElement('img');
    img.src = src;
    img.style.height = '32px';
    img.style.width = '32px';
    td.appendChild(img);
}

function copyButton(header, onClick) {
    var copy = document.createElement('button');
    copy.textContent = "Copy " + header;
    copy.setAttribute('class', 'btn btn-link');
    copy.onclick = onClick;
    return copy;
}

function icon_map() {
    tbl = document.createElement('table');
    thead = document.createElement('thead');

    tbl.classList.add('table');
    tbl.appendChild(thead);

    var headers = [
        'Filename'
        , 'Icons'
        , 'Bootstrap'
        , 'Unicode'
        , 'QMLBootstrap'
        , 'Font Awesome'
        , 'Unicode'
        , 'QMLFontAwesome'
    ];

    var bootstrapString = "";
    var fontawesomeString = "";

    for (let index in headers) {
        var header = headers[index];
        var text = document.createElement('th');
        if (header == 'QMLBootstrap') {
            text.appendChild(copyButton(header, function () { onClickCopy(bootstrapString) }));
        }
        else if (header == 'QMLFontAwesome') {
            text.appendChild(copyButton(header, function () { onClickCopy(fontawesomeString) }));
        }
        else {
            text.appendChild(document.createTextNode(header));
        }
        thead.append(text);
    }

    visitRawLineData("https://docs.google.com/spreadsheets/d/e/2PACX-1vQNViAz8Odapir5C-zl8sIC5D1qWKvWayMJVGNnwK7sSXF56hVBmS7UiKeY4Xv2F2M47_FBbLr--Xnp/pub?gid=0&single=true&output=csv", function (lineData) {
        const tr = tbl.insertRow();

        insertTextCell(tr, lineData[0]);
        const td = tr.insertCell();
        insertImageCell(td, "https://quatmax.github.io/icon_map/png/" + lineData[0]);
        insertImageCell(td, "https://quatmax.github.io/icon_map/bi/" + lineData[2] + ".svg");

        var li = document.createElement('li');
        li.className = "fa-solid fa-xl fa-" + lineData[4];
        td.appendChild(li);

        insertTextCell(tr, lineData[2]);
        insertTextCell(tr, lineData[3]);
        var b = createQML(lineData[0], lineData[3]);
        bootstrapString += b + "\n";
        insertTextCell(tr, b);
        insertTextCell(tr, lineData[4]);
        insertTextCell(tr, lineData[5]);
        var f = createQML(lineData[0], lineData[5]);
        fontawesomeString += f + "\n";
        insertTextCell(tr, f);
    });
    document.getElementById('root').appendChild(tbl);
}
