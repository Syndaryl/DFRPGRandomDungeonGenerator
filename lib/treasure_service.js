var remote_available = false;

remote_reaction();

function remote_reaction() {
    if ($('remote_treasure').checked) {
        var service_available = test_treasure_service_connection();

    } else {
        $('remote_treasure_notice').innerText = 'Remote treasure service disabled';
    }
    //$('remote_treasure').checked
    //$('remote_treasure_notice')
}

function test_treasure_service_connection() {

    var request = new XMLHttpRequest();
    request.open('GET', 'http://df-treasure-generator.herokuapp.com/v1/generate/', false);

    request.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                remote_available = true;
            } else {
                // We reached our target server, but it returned an error
                remote_available = false;
            }

            if (remote_available) {
                $('remote_treasure_notice').innerText = 'Remote treasure service enabled';
            } else {
                $('remote_treasure_notice').innerText = 'Remote treasure service unavailable; disabled automatically.';
            }
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        remote_available = false;
        $('remote_treasure_notice').innerText = 'Remote treasure service unavailable; disabled automatically.';
    };

    request.send();

}
