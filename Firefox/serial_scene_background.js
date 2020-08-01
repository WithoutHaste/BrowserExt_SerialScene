
// listen to tab URL changes
browser.tabs.onUpdated.addListener(serial_scene_url_changed);

let lastUrlProcessed = null;

function serial_scene_url_changed(event) {
	browser.tabs.query({active: true, currentWindow: true}).then(preparation);
	
	function preparation(tabs) {
		if(!tabs[0]) return;
		
		const url = tabs[0].url;
		if(!url.startsWith("http")) return;
		if(url == lastUrlProcessed) return;
		
		lastUrlProcessed = url;

		Promise.all([
			browser.storage.local.get("selected"),
			browser.bookmarks.getTree()
		]).then(function(results) {
			let selections = results[0].selected;
			let bookmarks = results[1];
			serial_scene_update_bookmarks(url, selections, bookmarks);
		}, function() {
			//no action on errors
		});
	}
}

function serial_scene_update_bookmarks(url, selections, bookmarks) {
	let urlPrefix = stripFilename(url);
	searchBookmarkTree(bookmarks);
	
	function searchBookmarkTree(bookmarks, pathArray) {
		if(pathArray == null) pathArray = [];

		for(let i=0; i<bookmarks.length; i++)
		{
			searchBookmarkItem(bookmarks[i], pathArray);
		}
	}
	
	function searchBookmarkItem(bookmark, pathArray) {
		if(bookmark.url) {
			searchBookmarkUrl(bookmark);
		}
		else {
			searchBookmarkFolder(bookmark);
		}

		function searchBookmarkUrl(bookmark) {
			if(bookmark.unmodifiable) return;
			if(!bookmark.url.startsWith("http")) return;
			if(bookmark.url == url) return;

			let bookmarkPrefix = stripFilename(bookmark.url);
			
			if(bookmarkPrefix != urlPrefix) return;
			
			let newPathArray = pathArray.slice();
			newPathArray.push(bookmark.id);
			if(!bookmarkIsSelected(newPathArray)) return;
			
			//update bookmark
			browser.bookmarks.update(bookmark.id, {url:url}).then();
		}
		
		function searchBookmarkFolder(bookmarks) {
			let newPathArray = pathArray.slice();
			newPathArray.push(bookmarks.id);

			if(!bookmarkIsSelected(newPathArray)) return;

			searchBookmarkTree(bookmarks.children, newPathArray);
		}
	}
	
	//true for "you are part way through a folder match"
	//true for "full match"
	//true for "you are deeper than the folder match
	function bookmarkIsSelected(pathArray) {
		for(let i=0; i<selections.length; i++)
		{
			if(arraysMatch(pathArray, selections[i])) {
				return true;
			}
		}
		return false;	
	}
	function arraysMatch(a, b) {
		for(let i=0; i<a.length && i<b.length; i++)
		{
			if(a[i] != b[i]) {
				return false;
			}
		}
		return true;
	}
}

//return url without ending filename
function stripFilename(url) {
	let remainder = url;
	
	while(remainder.endsWith("/")) {
		remainder = remainder.substring(0, remainder.length - 1);
	}
	
	let filename = remainder.substring(remainder.lastIndexOf('/')+1);
	remainder = remainder.substring(0, remainder.length - filename.length);
	
	//yyyy/mm/dd blog format
	remainder = remainder.replace(/\d{4}\/\d{1,2}\/\d{1,2}\/.*/, "");
	
	if(remainder == "https://" || remainder == "http://") {
		return url;
	}
	return remainder;
}
