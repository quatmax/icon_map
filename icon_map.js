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
        for (var index = 1; index < allTextLines.length; index++) {
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

function icon_map() {
    tbl = document.createElement('table');
    tbl.classList.add("table");
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
        }
        {
            const td = tr.insertCell();
            var text = document.createTextNode(lineData[2]);
            td.appendChild(text);
        }
        {
            const td = tr.insertCell();
            var img = document.createElement('img');
            img.src = "https://quatmax.github.io/icon_map/bi/" + lineData[2] + ".svg";
            td.appendChild(img);
        }
        {
            const td = tr.insertCell();
            var text = document.createTextNode(lineData[3]);
            td.appendChild(text);
        }
    });
    document.getElementById('root').appendChild(tbl);
}
