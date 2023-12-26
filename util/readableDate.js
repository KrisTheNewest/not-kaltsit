// this horribleness stays because it works
// getting a parseable and human readable date with a timezone offset is a pain
// (swedish locale coincidentally uses the iso format but it might be changed any time)
function readableDate() {
	// create a STRING with a timezone offset AND THEN create a date OBJECT
	// gives us a DATE OBJECT with a timezone offset
	const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai", }));
	// js will parse dates if months/years/days are recognizable (ie it has to start with a full year/include a full month etc...)
	const fullYear = date.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric", })
	const dateSansZone = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
	// this is a human readable, js parseable date with a timezone offset
	const full = fullYear + " " + dateSansZone + " " + "+0800";
	return full;
}

module.exports = readableDate;
