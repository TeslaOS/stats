var lastUpdateHash = '';
var lastFailed = true;

function update() {
	$.get('https://teslaos-stats.theroyalstudent.com/stats', { 'hash': lastUpdateHash } , function(data) {
		lastFailed = false;

		if (data.status == 'ok') {
			$('.lastUpdatedDate').text(Date());
		}

		// if we don't implement this, my server might crash so 
		// save some data already, godamnit

		else {
			lastUpdateHash = data.genericData.hash;

			$('.totalInstalls').text(data.genericData.totalInstalls);
			$('.totalInstallsLast24h').text(data.genericData.totalInstallsLast24h);
			$('.totalUpdatesLast24h').text(data.genericData.totalUpdatesLast24h);

			$('.installsByDevice').html('');
			$('.installsByROM').html('');

			for (var i = 0; i < data.installsByROM.length; i++) {
				$('.installsByROM').append("<tr><td>" + data.installsByROM[i].rom_name + "</td><td>" + data.installsByROM[i].rom_version + "</td><td>" + data.installsByROM[i].rom_tot + "</td></tr>");
			}

			for (var i = 0; i < data.installsByDevice.length; i++) {
				$('.installsByDevice').append("<tr><td>" + data.installsByDevice[i].device_name + "</td><td>" + data.installsByDevice[i].rom_tot + "</td></tr>");
			}

			$('.lastUpdatedDate').text(Date());
		}
	}).fail(function() {
		lastFailed = true;

		// once this happens, you know that it's either your connection or my server which is fucked, so yeah... 
		// be transparent about it.

		if (lastFailed) {
			$('.lastUpdatedDate').text('Failed at ' + Date());
		}
	});
}

$(document).ready(function() {
	setInterval(function() {update();}, 2000);

	$('.updateNow').click(function() {
		update();
	});
});