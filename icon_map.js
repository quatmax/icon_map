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

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);
    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
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

function createQML(filename, unicode) 
{
    var prefix = ', { "' + filename.replaceAll(".png", "") + ' ", "\\u';
    var postfix = '" }';
    var value = '';
    if (unicode === "")
        value = "f506";
    else
        value = unicode.toLowerCase();

    return prefix + value + postfix;
}

function icon_map() {
    tbl = document.createElement('table');
    thead = document.createElement('thead');

    tbl.classList.add('table');

    tbl.appendChild(thead);

    var header = [
        'Filename'
        , 'Icons'
        , 'Bootstrap'
        , 'Unicode'
        , 'QML'
        , 'Font Awesome'
        , 'Unicode'
        , 'QML'
    ];

    var isBootstrap = true;

    for (let index in header) {
        var text = document.createElement('th');
        text.appendChild(document.createTextNode(header[index]));

        qmlColumn = isBootstrap ? '.bootstrap' : '.fontawesome';

        if (header[index] == 'QML') {
            var btn = document.createElement('button');
            btn.textContent = 'Copy';
            btn.setAttribute('class', 'CopyColumn btn btn-link');
            btn.setAttribute('data-target', qmlColumn);
            text.append(btn);
            isBootstrap = false;
        }

        thead.append(text);
    }

    visitRawLineData("https://docs.google.com/spreadsheets/d/e/2PACX-1vQNViAz8Odapir5C-zl8sIC5D1qWKvWayMJVGNnwK7sSXF56hVBmS7UiKeY4Xv2F2M47_FBbLr--Xnp/pub?gid=0&single=true&output=csv", function (lineData) {
        const tr = tbl.insertRow();
        {
            const td = tr.insertCell();
            var text = document.createTextNode(lineData[0]);
            td.appendChild(text);
        }
        {
            const td = tr.insertCell();
            var img = document.createElement('img');
            img.src = "https://quatmax.github.io/icon_map/png/" + lineData[0];
            td.appendChild(img);

            var img = document.createElement('img');
            img.src = "https://quatmax.github.io/icon_map/bi/" + lineData[2] + ".svg";
            img.style.height = '32px';
            img.style.width = '32px';
            td.appendChild(img);

            var li = document.createElement('li');
            li.className = "fa-solid fa-xl fa-" + lineData[4];
            td.appendChild(li);
        }
        {
            const td = tr.insertCell();
            var text = document.createTextNode(lineData[2]);
            td.appendChild(text);
        }
        {
            const td = tr.insertCell();
            var text = document.createTextNode(lineData[3]);
            td.appendChild(text);
        }
        {
            const td = tr.insertCell();
            td.className = "bootstrap";
            text = document.createTextNode( createQML( lineData[0], lineData[3] ) );
            td.appendChild(text);
        }
        {
            const td = tr.insertCell();
            var text = document.createTextNode(lineData[4]);
            td.appendChild(text);
        }
        {
            const td = tr.insertCell();
            var text = document.createTextNode(lineData[5]);
            td.appendChild(text);
        }
        {

            const td = tr.insertCell();
            td.className = "fontawesome";
            text = document.createTextNode( createQML( lineData[0], lineData[5] ) );
            td.appendChild(text);
        }
    });
    document.getElementById('root').appendChild(tbl);
}
