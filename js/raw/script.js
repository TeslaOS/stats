var lastFailed = true;
var charts = {
	installByDevice: undefined,
	installByVersion: undefined
};

function initialize() {
	if (configuration['name'] != 'ROM_NAME') {
		$(document).prop('title', configuration['name'] + ' - Statistics');
		$('navbar section.desktop section.intro h2 a.romDetail').text(configuration['name']);
		// $('section.container section.stats-large p.romName').text(configuration['name'] + ' Statistics');
	}
	
	$('navbar section.desktop section.intro h2 a.romDetail').attr('href', (configuration['homepageURL'] != 'HOMEPAGE_URL') ? configuration['homepageURL'] : '/' );
	$('navbar section.desktop section.body p span.updateInterval').text(configuration['updateInterval'] / 1000);

	if (configuration['startDate'] != 'START_DATE_HERE') {
		$('navbar section.desktop section.body p.startInfo span.startDate').text(configuration['startDate']);
	}
	
	else {
		$('navbar section.desktop section.body .startInfo').addClass('hidden');
	}

	if (configuration['updateInterval'] < 1500 || configuration['updateInterval'] == (undefined || false)) {
		// any customizations made to remove this chunk of code and constantly flood the server with HTTP(S) requests
		// will cause the statistics page functionality to be blocked for at least 4 hours.
		// - trackstats admin

		configuration['updateInterval'] = 1500;
	}

}

function doInitialCharting(item, element, text, name, data) {
	Highcharts.setOptions({
		colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548'],
	});

	if (charts[item] == undefined) {
		charts[item] = new Highcharts.Chart({
			chart: {
				renderTo: element,
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				type: 'pie',
				margin: [null, 0, 0, 0],
				spacingTop: 0,
				spacingBottom: 0,
				spacingLeft: 0,
				spacingRight: 0
			},
			title: {
				text: text,
				style: {
					fontFamily: 'Roboto',
					fontWeight: 300
				}
			},
			tooltip: {
				// pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
				pointFormat: '{series.name}: <b>{point.y:.0f} ({point.percentage:.1f}%)</b>'
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					size: '100%',
					dataLabels: {
						enabled: false
					},
					showInLegend: false,
					pointPadding: 0,
					groupPadding: 0,
					borderWidth: 0,
					shadow: false
				}
			},
			series: [{
				name: name,
				colorByPoint: true,
				data: data
			}],
			credits: [{
				enabled: false
			}]
		});
	}

	else {
		charts[item].series[0].setData(data, true); 
	}
}

function update() {
	$.get(configuration['endpointURL'] + '/stats', function(data) {
		$('section.loading').fadeOut(function() { $('section.loaded.hidden').fadeIn(); });

		lastFailed = false;

		if (data.status == 'ok') {
			$('navbar section.desktop section.body p span.lastUpdatedDate').text(Date());
		}

		else {
			$('span.totalSupportedDevices').text(data.installsByDevice.length);
			$('span.totalInstalls').text(data.genericData.totalInstalls);
			$('span.totalNewInstalls').text(data.genericData.totalInstallsLast24h);
			$('span.totalNewUpdates').text(data.genericData.totalUpdatesLast24h);

			var installsByDevice = JSON.parse(JSON.stringify(data.installsByDevice).replace('/{/g', '[').replace('/}/g', ']'));
			var installsByVersion = JSON.parse(JSON.stringify(data.installsByROM).replace('/{/g', '[').replace('/}/g', ']'));
			var installsByBuild = JSON.parse(JSON.stringify(data.installsByBuild).replace('/{/g', '[').replace('/}/g', ']'));

			doInitialCharting('installByDevice', 'installsByDeviceChart', 'Installs by Device', 'Installs', installsByDevice);
			doInitialCharting('installsByVersion', 'installsByVersionChart', 'Installs by Version', 'Installs', installsByVersion);
			doInitialCharting('installsByBuild', 'installsByBuildChart', 'Installs by Build', 'Installs', installsByBuild);

			$('navbar section.desktop section.body p span.lastUpdatedDate').text(Date());
		}
	}).fail(function() {
		lastFailed = true;

		if (lastFailed) {
			$('navbar section.desktop section.body p span.lastUpdatedDate').text('Failed at ' + Date());
		}
	});
}

$(document).ready(function() {
	$('section.content').load('romstats.ajax.html');

	setTimeout(function() {
		initialize();
		update();

		setInterval(function() { update(); }, configuration['updateInterval']);

		$('navbar section.desktop section.body p a.updateNow').click(function() { update(); });
	}, 300);
});


