var lastFailed = true;
var charts = {
	installByDevice: undefined,
	installByVersion: undefined
};

var things;

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
	$.get(configuration['endpointURL'] + '/stats', function(response) {
		response = JSON.parse(response);
		
		$('section.loading').fadeOut(function() { $('section.stats').fadeIn(); });

		if ($('section.stats section.switch input').prop('checked') == false) {
			$('section.stats section.tables').fadeOut(150, function() {
				$('section.stats section.charts').fadeIn(150);
			});
		}

		else {
			$('section.stats section.charts').fadeOut(150, function() {
				$('section.stats section.tables').fadeIn(150);
			});
		}

		lastFailed = false;

		if (response.installsByDevice.length) {
			$('section.stats section.notAvailable').fadeOut();
			$('section.stats section.figures-text').fadeIn();
			$('section.stats section.switch').fadeIn();

			$('section.stats section.figures-text p.distinctDevices').children().text(response.installsByDevice.length);
			$('section.stats section.figures-text p.totalInstalls').children().text(response.genericData.totalInstalls);
			$('section.stats section.figures-text p.totalInstallsLastDay').children().text(response.genericData.totalInstallsLast24h);
			$('section.stats section.figures-text p.totalUpdatesLastDay').children().text(response.genericData.totalUpdatesLast24h);

			var installsByDevice = JSON.parse(JSON.stringify(response.installsByDevice).replace('/{/g', '[').replace('/}/g', ']'));
			var installsByVersion = JSON.parse(JSON.stringify(response.installsByROM).replace('/{/g', '[').replace('/}/g', ']'));
			var installsByBuild = JSON.parse(JSON.stringify(response.installsByBuild).replace('/{/g', '[').replace('/}/g', ']'));

			doInitialCharting('installByDevice', 'installsByDeviceChart', 'Installs by Device', 'Installs', installsByDevice);
			doInitialCharting('installsByVersion', 'installsByVersionChart', 'Installs by Version', 'Installs', installsByVersion);
			doInitialCharting('installsByBuild', 'installsByBuildChart', 'Installs by Build', 'Installs', installsByBuild);

			$('section.stats section.tables table tr.data').remove(); // remove all old data

			installsByDevice.forEach(function(detail, index) { $('section.stats section.tables table.installsByDevice').append('<tr class="data"><td>' + detail[0] + '</td><td>' + detail[1] + '</td></tr>'); });
			installsByVersion.forEach(function(detail, index) { $('section.stats section.tables table.installsByVersion').append('<tr class="data"><td>' + detail[0] + '</td><td>' + detail[1] + '</td></tr>'); });
			installsByBuild.forEach(function(detail, index) { $('section.stats section.tables table.installsByBuild').append('<tr class="data"><td>' + detail[0] + '</td><td>' + detail[1] + '</td></tr>'); });
		}

		else {
			$('section.stats section.figures-text').fadeOut();
			$('section.stats section.charts').fadeOut();
			$('section.stats section.switch').fadeOut();
			$('section.stats section.tables').fadeOut();
			$('section.notAvailable').fadeIn();
		}

		$('navbar section.desktop section.body p span.lastUpdatedDate').text(Date());
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


