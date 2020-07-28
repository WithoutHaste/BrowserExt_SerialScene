
console.log("test A");

let x = browser.bookmarks.getTree();
x.then(serialScene);
/*

Promise.all([
//	browser.storage.local.get("selected")
	browser.bookmarks.getTree()
]).then(function(results) {
	console.log("success A");
}, function() {
	console.log("error A");
	//no action on errors
});

Promise.all([
	browser.storage.local.get("selected"),
	browser.bookmarks.getTree()
]).then(function(results) {
	console.log("success");
	let selections = results[0].selected;
	let bookmarks = results[1];
	serialScene(selections, bookmarks);
}, function() {
	console.log("error");
	//no action on errors
});
*/

function serialScene(selections, bookmarks) {
	console.log("test");

	console.log(selections);
	
}

