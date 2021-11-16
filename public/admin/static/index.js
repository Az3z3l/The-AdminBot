bots = {}
async function botStatus(id, to){
    var response = await fetch("/admin/bots/status", {
        method: 'POST', 
        credentials:"include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${id}&status=${to}`
    });
    z = await (response.json());
    // bots = z
    console.log(z)
    if (z.status == "failed"){
        alert(z.error)
    } else {
        loadTable()
    }
}

async function challengeLevel(){
    lev = document.getElementById("level").value
    var response = await fetch("/admin/hash/level", {
        method: 'POST', 
        credentials:"include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `level=${lev}`
    });
    z = await (response.json());
    // bots = z
    console.log(z)
    if (z.status == "failed"){
        alert(z.error)
    }
}

async function ratelimitLevel(){
    req = document.getElementById("rlimRequests").value
    sec = document.getElementById("rlimSeconds").value
    var response = await fetch("/admin/ratelimit", {
        method: 'POST', 
        credentials:"include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `time=${sec}&limit=${req}`
    });
    z = await (response.json());
    console.log(z)
    if (z.status == "failed"){
        alert(z.error)
    }
}

async function botDelete(id){
    z = window.confirm(`Do you wanna delete bot for ${bots[id]["name"]}`)
    if (!z){
        return
    }
    var response = await fetch("/admin/bots/delete", {
        method: 'POST', 
        credentials:"include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${id}`
    });
    z = await (response.json());
    console.log(z)
    if (z.status == "failed"){
        alert(z.error)
    } else {
        loadTable()
    }
}

async function botList(){
    const response = await fetch("/admin/bots", {
        method: 'GET', 
        credentials:"include",
    });
    z = await (response.json());
    return z
}

async function updateChallengeDiv(){
    const response = await fetch("/admin/challenge/current", {
            method: 'GET', 
            credentials:"include",
        });
    z = await (response.json());
    if(z.currentChallenge === "ratelimit"){
        document.getElementById("currChall").innerHTML = "Currently using <b>Ratelimiting</b>"
        document.getElementById("switchto").value = "Switch to Hash"
        document.getElementById("switchto").onclick = new Function("challegeSwitch('hash')");

    } else {
        document.getElementById("currChall").innerHTML = "Currently using <b>Hash</b>"
        document.getElementById("switchto").value = "Switch to Ratelimiting"
        document.getElementById("switchto").onclick = new Function("challegeSwitch('ratelimit')");

    }
}

async function challegeSwitch(to){
    var response = await fetch("/admin/challenge/switch", {
        method: 'POST', 
        credentials:"include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `to=${to}`
    });
    z = await (response.json());
    console.log(z)
    if (z.status == "failed"){
        alert(z.error)
    } else {
        updateChallengeDiv()
    }
}

async function getHashLevel(){
    const response = await fetch("/challenge", {
        method: 'GET', 
        credentials:"include",
    });
    z = await (response.json());
    hash=z.challenge.length
    document.getElementById("level").value = hash
}

async function getRatelimitLevel(){
    const response = await fetch("/admin/ratelimit", {
        method: 'GET', 
        credentials:"include",
    });
    z = await (response.json());
    document.getElementById("rlimRequests").value = z.ratelimit.split("/")[0]
    document.getElementById("rlimSeconds").value = z.ratelimit.split("/")[1]
}

function init(){
    loadTable();
    updateChallengeDiv()
    getHashLevel()
    getRatelimitLevel()
}

async function loadTable(){
    document.getElementById("oh-my-tableee").innerHTML=`
<table id="tabloo" class="rwd-table">
    <tr>
        <th>Name</th>
        <th>Bot Status</th>
        <th>Runs</th>
        <th>Change Status</th>
        <th>Delete Bot</th>
    </tr>
</table>`
    bots = await botList()
    console.log(bots)
    conte = ""
    for (key in bots){
        stat = (bots[key]["status"] == "private") ? (bots[key]["status"]) : (bots[key]["status"] + " / " + bots[key]["doa"])
        chng = (bots[key]["status"] == "private") ? "public" : "private"
        runs = (bots[key]["path"].split(".")[1] == "py") ? "Firefox" : "Chrome"
        var table = document.getElementById("tabloo");
        var row = table.insertRow(1);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell3 = row.insertCell(3);
        var cell4 = row.insertCell(4);

        cell0.innerHTML = bots[key]["name"];
        cell1.innerHTML = stat;
        cell2.innerHTML = runs;
        cell3.innerHTML = `<button onclick="botStatus('${key}', '${chng}')">make ${chng}</button>`;
        cell4.innerHTML = `<button onclick="botDelete('${key}')">Delete bot</button>`;

    }
}
