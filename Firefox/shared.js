//return url without ending filename
function stripFilename(url) {
	if(url.endsWith("/")) {
		return url;
	}
	let filename = url.substring(url.lastIndexOf('/')+1);
	//not checking for a . in the file name - ex: mangakakalot does not use file extensions

	let remainder = url.substring(0, url.length - filename.length);
	if(remainder == "https://" || remainder == "http://") {
		return url;
	}
	return remainder;
}
