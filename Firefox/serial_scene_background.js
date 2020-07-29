
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
			
			let urlRemainder = stripFilename(bookmark.url);
			if(urlRemainder != stripFilename(url)) return;
			
			let newPathArray = pathArray.slice();
			newPathArray.push(urlRemainder);
			if(!bookmarkIsSelected(newPathArray)) return;
			
			//update bookmark
			browser.bookmarks.update(bookmark.id, {url:url}).then();
		}
		
		function searchBookmarkFolder(bookmarks) {
			let newPathArray = pathArray.slice();
			newPathArray.push(bookmarks.title);

			if(!bookmarkIsSelected(newPathArray)) return;

			searchBookmarkTree(bookmarks.children, newPathArray);
		}
	}
	
	//return url without ending filename
	function stripFilename(url) {
		if(url.endsWith("/")) {
			return url;
		}
		let filename = url.substring(url.lastIndexOf('/')+1);
		if(filename.indexOf(".") == -1) {
			return url;
		}
		let remainder = url.substring(0, url.length - filename.length);
		if(remainder == "https://" || remainder == "http://") {
			return url;
		}
		return remainder;
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
